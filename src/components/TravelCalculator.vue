<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 400px; max-width: 600px">
      <!-- Warp Encounter Dialog -->
      <WarpEncounterDialog 
        v-model="showEncounter"
        :weeks-of-travel="weeks"
        :route-danger="travelData?.danger"
        :current-ship-h-p="30"
        :max-ship-h-p="35"
        :current-crew-strength="100"
        :current-morale="100"
        @apply-effects="handleWarpEffects"
      />
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="sailing" class="q-mr-sm" />
          Warp-Reise Kalkulator
        </div>
      </q-card-section>

      <q-card-section v-if="travelData">
        <div class="text-subtitle1 q-mb-md">
          <strong>Von:</strong> {{ fromSystem?.name || 'Unbekannt' }}<br>
          <strong>Nach:</strong> {{ toSystem?.name || 'Unbekannt' }}
        </div>

        <q-separator class="q-my-md" />

        <div class="row q-gutter-sm q-mb-md">
          <div class="col">
            <q-badge :color="dangerColor" class="q-pa-sm">
              Gefahr: {{ dangerLabel }}
            </q-badge>
          </div>
          <div class="col">
            <q-badge color="grey" class="q-pa-sm">
              Distanz: {{ travelData.lightYears || (travelData.distance * 10) }} Lichtjahre
            </q-badge>
          </div>
        </div>

        <div class="bg-grey-2 q-pa-md rounded-borders q-mb-md">
          <div class="text-h6 text-center q-mb-sm">
            Basis-Reisezeit
          </div>
          <div class="text-h4 text-center text-primary">
            {{ baseTime }} Tage
          </div>
          <div class="text-caption text-center text-grey-7">
            (Bei normalem Navigatorwurf)
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="text-subtitle2 q-mb-sm">Navigator-Erfolgsgrade:</div>
        <q-btn-toggle
          v-model="navigatorResult"
          toggle-color="primary"
          :options="navigatorOptions"
          spread
          class="q-mb-md"
        />

        <div class="bg-blue-1 q-pa-md rounded-borders">
          <div class="text-subtitle1 text-center q-mb-sm">
            Tatsächliche Reisezeit
          </div>
          <div class="text-h3 text-center text-primary">
            {{ actualTime }} Tage
          </div>
          <div v-if="weeks > 0" class="text-center text-grey-7">
            ({{ weeks }} Wochen, {{ remainingDays }} Tage)
          </div>
        </div>

        <q-banner v-if="weeks > 0" class="bg-warning text-white q-mt-md">
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          Bei {{ weeks }} Wochen Reise: {{ weeks }}x auf Zufallsbegegnungen würfeln!
          <template v-slot:action>
            <q-btn 
              flat 
              label="Würfeln" 
              @click="showEncounter = true"
              icon="casino"
            />
          </template>
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Schließen" color="primary" v-close-popup />
        <q-btn 
          flat 
          label="Reise beginnen" 
          color="positive" 
          @click="startTravel"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import WarpEncounterDialog from './WarpEncounterDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  fromSystemId: String,
  toSystemId: String
})

const emit = defineEmits(['update:modelValue', 'travel'])

const gameStore = useGameStore()
const navigatorResult = ref(0) // Default: normal success
const showEncounter = ref(false)

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const fromSystem = computed(() => {
  return gameStore.systems.find(s => s.id === props.fromSystemId)
})

const toSystem = computed(() => {
  return gameStore.systems.find(s => s.id === props.toSystemId)
})

const travelData = computed(() => {
  if (!props.fromSystemId || !props.toSystemId) return null
  
  // Find the hyperlane between the two systems
  const lane = gameStore.hyperlanes.find(h => 
    (h.from === props.fromSystemId && h.to === props.toSystemId) ||
    (h.from === props.toSystemId && h.to === props.fromSystemId)
  )
  
  if (!lane) return null
  
  // Calculate distance if not set
  if (!lane.distance || !lane.lightYears) {
    const from = fromSystem.value
    const to = toSystem.value
    if (from && to) {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const pixelDistance = Math.sqrt(dx * dx + dy * dy)
      // Convert pixel distance to game distance (1-5 scale für Spielmechanik)
      if (!lane.distance) {
        lane.distance = Math.min(5, Math.max(1, Math.round(pixelDistance / 200)))
      }
      // Berechne präzise Distanz in Lichtjahren wenn nicht vorhanden
      if (!lane.lightYears) {
        // Verwende einen Seed basierend auf den System-IDs für konsistente Werte
        const seed = (props.fromSystemId + props.toSystemId).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        const variation = (seed % 100) / 100 * 0.4 - 0.2  // -0.2 bis +0.2 Variation
        const baseDistance = pixelDistance / 20
        lane.lightYears = Math.round((baseDistance + baseDistance * variation) * 10) / 10
      }
    }
  }
  
  return lane
})

const dangerColor = computed(() => {
  if (!travelData.value) return 'grey'
  switch(travelData.value.danger) {
    case 'green': return 'positive'
    case 'yellow': return 'warning'
    case 'orange': return 'orange'
    case 'red': return 'negative'
    default: return 'grey'
  }
})

const dangerLabel = computed(() => {
  if (!travelData.value) return 'Unbekannt'
  switch(travelData.value.danger) {
    case 'green': return 'Sichere Route'
    case 'yellow': return 'Normale Gefahr'
    case 'orange': return 'Unsichere Route'
    case 'red': return 'Gefährliche Route'
    default: return 'Unbekannt'
  }
})

const baseTime = computed(() => {
  if (!travelData.value) return 0
  
  // Get actual distance in light years
  const lightYears = travelData.value.lightYears || (travelData.value.distance * 10)
  
  // Base time calculation: roughly 1 day per 2 light years
  // This gives us: 10 LY = 5 days, 20 LY = 10 days, 50 LY = 25 days, etc.
  let time = Math.round(lightYears / 2)
  
  // Minimum 5 days travel time (Warp-Reisen sind nie trivial)
  if (time < 5) time = 5
  
  // Modify by danger level - dangerous routes are faster but riskier!
  switch(travelData.value.danger) {
    case 'green': time = Math.round(time * 1.25); break  // Safe but slower (+25%)
    case 'yellow': break // normal speed
    case 'orange': time = Math.round(time * 0.9); break  // Unsafe but faster (-10%)
    case 'red': time = Math.round(time * 0.8); break  // Fast but dangerous! (-20%)
  }
  
  return time
})

const navigatorOptions = [
  { label: '3+ Erfolge', value: 3 },
  { label: '2 Erfolge', value: 2 },
  { label: '1 Erfolg', value: 1 },
  { label: 'Normal', value: 0 },
  { label: 'Fehlschlag', value: -1 },
  { label: '1 Misserfolg', value: -2 },
  { label: '2+ Misserfolge', value: -3 }
]

const actualTime = computed(() => {
  let multiplier = 1
  
  switch(navigatorResult.value) {
    case 3: multiplier = 0.25; break  // 1/4 time
    case 2: multiplier = 0.5; break   // 1/2 time
    case 1: multiplier = 0.75; break  // 3/4 time
    case 0: multiplier = 1; break     // normal
    case -1: multiplier = 2; break    // double
    case -2: multiplier = 3; break    // triple
    case -3: multiplier = 4; break    // quadruple
  }
  
  return Math.round(baseTime.value * multiplier)
})

const weeks = computed(() => Math.floor(actualTime.value / 7))
const remainingDays = computed(() => actualTime.value % 7)

const startTravel = () => {
  emit('travel', {
    from: props.fromSystemId,
    to: props.toSystemId,
    days: actualTime.value,
    weeks: weeks.value
  })
}

const handleWarpEffects = (effects) => {
  // Handle the effects from warp travel
  console.log('Warp travel effects:', effects)
  // TODO: Store these effects somewhere (gameStore, localStorage, etc.)
  // For now, just log them
  
  // You could emit these to the parent or store them:
  // gameStore.applyWarpEffects(effects)
}
</script>