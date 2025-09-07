<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isNewSystem ? 'Neues System' : 'System bearbeiten' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="systemData.name"
            label="System Name"
            filled
            :rules="[val => !!val || 'Name ist erforderlich']"
          />
          
          <q-select
            v-model="systemData.type"
            :options="systemTypes"
            label="System Typ"
            filled
          />
          
          <q-select
            v-model="systemData.faction"
            :options="factions"
            label="Fraktion"
            filled
            clearable
          />
          
          <q-select
            v-model="systemData.starType"
            :options="starTypes"
            label="Sternentyp"
            filled
          />
          
          <div class="row q-gutter-sm" v-if="!isNewSystem">
            <q-input
              v-model.number="systemData.x"
              label="X Position"
              type="number"
              filled
              class="col"
            />
            <q-input
              v-model.number="systemData.y"
              label="Y Position"
              type="number"
              filled
              class="col"
            />
          </div>
          
          <q-input
            v-model="systemData.description"
            label="Beschreibung"
            filled
            type="textarea"
            rows="3"
          />
          
          <q-input
            v-model="systemData.flavorText"
            label="Flavor Text (Atmosphärisch)"
            filled
            type="textarea"
            rows="2"
            hint="Wird kursiv dargestellt"
          />
          
          <div class="row items-center">
            <div class="col-auto q-mr-md">Wichtigkeit:</div>
            <q-rating
              v-model="systemData.importance"
              :max="3"
              size="2em"
              color="yellow"
              icon="star_border"
              icon-selected="star"
            />
          </div>
          
          <q-checkbox
            v-model="systemData.discovered"
            label="System ist entdeckt"
          />
          
          <q-checkbox
            v-model="systemData.isStartSystem"
            label="Startsystem für Spielerschiff"
            color="primary"
          >
            <q-tooltip>
              Das Spielerschiff startet in diesem System
            </q-tooltip>
          </q-checkbox>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          flat 
          label="Planetensystem" 
          color="secondary" 
          icon="public"
          v-if="!isNewSystem"
          @click="$emit('show-planetary-system')"
          v-close-popup
        />
        <q-btn flat label="Abbrechen" v-close-popup />
        <q-btn 
          flat 
          label="Löschen" 
          color="negative" 
          v-if="!isNewSystem"
          @click="onDelete"
        />
        <q-btn 
          flat 
          label="Speichern" 
          color="primary" 
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useMapStore } from '../stores/mapStore'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  system: Object,
  newSystemPosition: Object
})

const emit = defineEmits(['update:modelValue', 'systemSaved', 'systemDeleted', 'show-planetary-system'])

const gameStore = useGameStore()
const mapStore = useMapStore()
const $q = useQuasar()

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isNewSystem = computed(() => !props.system)

const systemTypes = [
  'Zivilisierte Welt',
  'Agrarwelt',
  'Todwelt',
  'Fabrikwelt',
  'Grenzwelt',
  'Makropole',
  'Kriegswelt',
  'Paradieswelt',
  'Schmelztiegel',
  'Feudalwelt',
  'Verbotene Welt',
  'Xenos-Welt',
  'Warpstörung',
  'Raumstation'
]

const factions = [
  'Imperium',
  'Chaos',
  'Orks',
  'Eldar',
  'Dark Eldar',
  'Tau',
  'Necrons',
  'Tyraniden',
  'Neutral',
  'Unbekannt'
]

const starTypes = [
  'Gelber Zwerg',
  'Roter Zwerg',
  'Blauer Riese',
  'Roter Überriese',
  'Weißer Zwerg',
  'Oranger Zwerg',
  'Blauer Zwerg'
]

const systemData = ref({
  id: '',
  name: '',
  type: 'Grenzwelt',
  faction: 'Unbekannt',
  starType: 'Gelber Zwerg',
  x: 0,
  y: 0,
  description: '',
  flavorText: '',
  importance: 0,
  discovered: false,
  isStartSystem: false
})

watch([() => props.system, () => props.newSystemPosition], ([newSystem, newPosition]) => {
  if (newSystem) {
    systemData.value = {
      id: newSystem.id,
      name: newSystem.name,
      type: newSystem.type || 'Grenzwelt',
      faction: newSystem.faction || 'Unbekannt',
      starType: newSystem.starType || 'Gelber Zwerg',
      x: newSystem.x,
      y: newSystem.y,
      description: newSystem.description || '',
      flavorText: newSystem.flavorText || '',
      importance: gameStore.getSystemImportance(newSystem.id),
      discovered: gameStore.isSystemDiscovered(newSystem.id),
      isStartSystem: gameStore.getStartSystem() === newSystem.id
    }
  } else if (newPosition) {
    systemData.value = {
      id: `system-${Date.now()}`,
      name: '',
      type: 'Grenzwelt',
      faction: 'Unbekannt',
      starType: 'Gelber Zwerg',
      x: newPosition.x,
      y: newPosition.y,
      description: '',
      flavorText: '',
      importance: 0,
      discovered: false,
      isStartSystem: false
    }
  }
}, { immediate: true, deep: true })

const onSubmit = () => {
  if (!systemData.value.name) {
    $q.notify({
      type: 'negative',
      message: 'Bitte geben Sie einen System-Namen ein'
    })
    return
  }
  
  const systemToSave = {
    id: systemData.value.id,
    name: systemData.value.name,
    type: systemData.value.type,
    faction: systemData.value.faction,
    starType: systemData.value.starType,
    x: systemData.value.x,
    y: systemData.value.y,
    description: systemData.value.description,
    flavorText: systemData.value.flavorText
  }
  
  if (isNewSystem.value) {
    // Add new system
    gameStore.systems.push(systemToSave)
    
    if (systemData.value.discovered) {
      gameStore.discoveredSystems.push(systemToSave.id)
    }
  } else {
    // Update existing system
    const index = gameStore.systems.findIndex(s => s.id === systemToSave.id)
    if (index !== -1) {
      gameStore.systems[index] = systemToSave
    }
    
    // Update discovered status
    const isDiscovered = gameStore.discoveredSystems.includes(systemToSave.id)
    if (systemData.value.discovered && !isDiscovered) {
      gameStore.discoveredSystems.push(systemToSave.id)
    } else if (!systemData.value.discovered && isDiscovered) {
      const idx = gameStore.discoveredSystems.indexOf(systemToSave.id)
      if (idx !== -1) {
        gameStore.discoveredSystems.splice(idx, 1)
      }
    }
  }
  
  // Update importance
  gameStore.setSystemImportance(systemToSave.id, systemData.value.importance)
  
  // Update start system if needed
  if (systemData.value.isStartSystem) {
    // Save start system preference (will be persisted when map is saved)
    if (gameStore.setStartSystem) {
      gameStore.setStartSystem(systemToSave.id)
      
      // Only move ship if we're setting a new start system
      // Don't move it just because we're editing the current start system
      if (gameStore.getStartSystem() !== systemToSave.id) {
        gameStore.playerShip.currentSystem = systemToSave.id
        // Make sure start system is discovered
        if (!gameStore.discoveredSystems.includes(systemToSave.id)) {
          gameStore.discoveredSystems.push(systemToSave.id)
        }
      }
    }
    
    $q.notify({
      type: 'info',
      message: `${systemToSave.name} ist jetzt das Startsystem`,
      position: 'top'
    })
  } else if (!systemData.value.isStartSystem && gameStore.getStartSystem() === systemToSave.id) {
    // If unchecking the start system checkbox for the current start system
    // Reset to default start system
    gameStore.setStartSystem('furibundus')
    
    $q.notify({
      type: 'warning',
      message: `Startsystem zurückgesetzt auf Furibundus`,
      position: 'top'
    })
  }
  
  // Mark map as changed
  mapStore.markAsChanged()
  
  emit('systemSaved', systemToSave)
  showDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: isNewSystem.value ? 'System hinzugefügt' : 'System aktualisiert'
  })
}

const onDelete = () => {
  $q.dialog({
    title: 'System löschen',
    message: `Möchten Sie das System "${systemData.value.name}" wirklich löschen?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    const index = gameStore.systems.findIndex(s => s.id === systemData.value.id)
    if (index !== -1) {
      gameStore.systems.splice(index, 1)
    }
    
    // Remove from discovered systems
    const discIdx = gameStore.discoveredSystems.indexOf(systemData.value.id)
    if (discIdx !== -1) {
      gameStore.discoveredSystems.splice(discIdx, 1)
    }
    
    // Remove all hyperlanes connected to this system
    gameStore.hyperlanes = gameStore.hyperlanes.filter(
      lane => lane.from !== systemData.value.id && lane.to !== systemData.value.id
    )
    
    // Mark map as changed
    mapStore.markAsChanged()
    
    emit('systemDeleted', systemData.value.id)
    showDialog.value = false
    
    $q.notify({
      type: 'warning',
      message: 'System gelöscht'
    })
  })
}
</script>