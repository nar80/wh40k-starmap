<template>
  <q-card class="q-pa-md">
    <div class="text-h6 q-mb-md">System-Details importieren</div>
    
    <q-input
      v-model="detailsText"
      filled
      type="textarea"
      label="System-Details einfügen"
      hint="Kopiere die System-Tabellen hier rein"
      :rows="10"
      class="q-mb-md"
    />
    
    <div class="row q-gutter-sm">
      <q-btn 
        label="Importieren" 
        color="primary" 
        @click="importDetails"
        :disable="!detailsText.trim()"
      />
      <q-btn 
        label="Aus Datei laden" 
        color="secondary" 
        @click="loadFromFile"
      />
      <q-btn 
        label="Leeren" 
        flat
        @click="detailsText = ''"
      />
    </div>
    
    <div v-if="parsedSystems.length > 0" class="q-mt-md">
      <div class="text-subtitle2 q-mb-sm">Erkannte Systeme: {{ parsedSystems.length }}</div>
      <q-list dense bordered separator class="rounded-borders">
        <q-item v-for="system in parsedSystems" :key="system.name">
          <q-item-section>
            <q-item-label>{{ system.name }}</q-item-label>
            <q-item-label caption>{{ system.planets.length }} Objekte</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon 
              :name="system.matched ? 'check_circle' : 'warning'"
              :color="system.matched ? 'positive' : 'warning'"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { parseSystemDetails } from '../utils/systemDetailsParser'
import { useQuasar } from 'quasar'

const gameStore = useGameStore()
const $q = useQuasar()

const detailsText = ref('')
const parsedSystems = ref([])

const importDetails = () => {
  if (!detailsText.value.trim()) return
  
  try {
    const parsed = parseSystemDetails(detailsText.value)
    
    // Check which systems match
    parsedSystems.value = Object.entries(parsed).map(([name, data]) => {
      const matched = gameStore.systems.find(s => 
        s.name.toLowerCase() === name.toLowerCase() ||
        s.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.name.toLowerCase())
      )
      
      return {
        name,
        planets: data.planets,
        matched: !!matched
      }
    })
    
    // Import the data
    gameStore.importSystemDetails(parsed)
    
    $q.notify({
      type: 'positive',
      message: `${parsedSystems.value.filter(s => s.matched).length} Systeme erfolgreich importiert`,
      position: 'top'
    })
    
  } catch (error) {
    console.error('Import error:', error)
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Parsen der Daten',
      position: 'top'
    })
  }
}

const loadFromFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt'
  
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      detailsText.value = e.target.result
      importDetails()
    }
    reader.readAsText(file)
  }
  
  input.click()
}
</script>