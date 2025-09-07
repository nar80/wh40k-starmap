<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isNewStarlane ? 'Neue Hyperlane' : 'Hyperlane bearbeiten' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <strong>Von:</strong> {{ fromSystemName }}<br>
          <strong>Nach:</strong> {{ toSystemName }}
        </div>
        
        <q-separator class="q-my-md" />
        
        <div class="text-subtitle2 q-mb-sm">Gefahrenstufe:</div>
        <q-btn-toggle
          v-model="laneData.danger"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          :options="[
            { label: 'Sicher (Grün)', value: 'green', color: 'green' },
            { label: 'Normal (Gelb)', value: 'yellow', color: 'yellow-8' },
            { label: 'Unsicher (Orange)', value: 'orange', color: 'orange' },
            { label: 'Gefährlich (Rot)', value: 'red', color: 'red' }
          ]"
        />
        
        <div class="q-mt-md text-caption">
          <q-icon name="info" color="primary" />
          <span class="q-ml-sm">
            <strong>Grün:</strong> +25% Reisezeit, sichere Route<br>
            <strong>Gelb:</strong> Standard Reisezeit<br>
            <strong>Orange:</strong> -20% Reisezeit, unsichere Route<br>
            <strong>Rot:</strong> -40% Reisezeit, gefährliche Route
          </span>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Abbrechen" v-close-popup />
        <q-btn 
          flat 
          label="Löschen" 
          color="negative" 
          v-if="!isNewStarlane"
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
  fromSystemId: String,
  toSystemId: String,
  existingLane: Object
})

const emit = defineEmits(['update:modelValue', 'laneSaved', 'laneDeleted'])

const gameStore = useGameStore()
const mapStore = useMapStore()
const $q = useQuasar()

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isNewStarlane = computed(() => !props.existingLane)

const fromSystemName = computed(() => {
  const system = gameStore.systems.find(s => s.id === props.fromSystemId)
  return system ? system.name : 'Unbekannt'
})

const toSystemName = computed(() => {
  const system = gameStore.systems.find(s => s.id === props.toSystemId)
  return system ? system.name : 'Unbekannt'
})

const laneData = ref({
  danger: 'yellow'
})

watch([() => props.existingLane], ([lane]) => {
  if (lane) {
    laneData.value.danger = lane.danger || 'yellow'
  } else {
    laneData.value.danger = 'yellow'
  }
}, { immediate: true })

const onSubmit = () => {
  if (isNewStarlane.value) {
    // Calculate distance for new hyperlane
    const fromSys = gameStore.systems.find(s => s.id === props.fromSystemId)
    const toSys = gameStore.systems.find(s => s.id === props.toSystemId)
    let distance = 3 // default
    
    if (fromSys && toSys) {
      const dx = toSys.x - fromSys.x
      const dy = toSys.y - fromSys.y
      const pixelDistance = Math.sqrt(dx * dx + dy * dy)
      // Convert pixel distance to game distance (1-5 scale)
      distance = Math.min(5, Math.max(1, Math.round(pixelDistance / 200)))
    }
    
    // Add new hyperlane
    const newLane = {
      from: props.fromSystemId,
      to: props.toSystemId,
      danger: laneData.value.danger,
      distance: distance
    }
    gameStore.hyperlanes.push(newLane)
  } else {
    // Update existing hyperlane
    const index = gameStore.hyperlanes.findIndex(lane => 
      (lane.from === props.fromSystemId && lane.to === props.toSystemId) ||
      (lane.from === props.toSystemId && lane.to === props.fromSystemId)
    )
    if (index !== -1) {
      gameStore.hyperlanes[index].danger = laneData.value.danger
    }
  }
  
  // Mark map as changed
  mapStore.markAsChanged()
  
  emit('laneSaved')
  showDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: isNewStarlane.value ? 'Hyperlane hinzugefügt' : 'Hyperlane aktualisiert'
  })
}

const onDelete = () => {
  $q.dialog({
    title: 'Hyperlane löschen',
    message: 'Möchten Sie diese Hyperlane wirklich löschen?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    const index = gameStore.hyperlanes.findIndex(lane => 
      (lane.from === props.fromSystemId && lane.to === props.toSystemId) ||
      (lane.from === props.toSystemId && lane.to === props.fromSystemId)
    )
    if (index !== -1) {
      gameStore.hyperlanes.splice(index, 1)
    }
    
    // Mark map as changed
    mapStore.markAsChanged()
    
    emit('laneDeleted')
    showDialog.value = false
    
    $q.notify({
      type: 'warning',
      message: 'Hyperlane gelöscht'
    })
  })
}
</script>