<template>
  <q-card class="bg-grey-9 text-white q-ma-md">
    <q-card-section>
      <div class="text-h6">System-Details</div>
    </q-card-section>
    
    <!-- Travel Calculator Dialog -->
    <TravelCalculator 
      v-model="showTravelCalculator"
      :from-system-id="gameStore.playerShip.currentSystem"
      :to-system-id="gameStore.selectedSystem?.id"
      @travel="handleTravel"
    />
    
    <q-card-section v-if="gameStore.selectedSystem">
      <!-- Show limited info for undiscovered systems -->
      <template v-if="!gameStore.isSystemDiscovered(gameStore.selectedSystem.id)">
        <div class="text-h5 q-mb-sm">Unbekanntes System</div>
        <div class="text-subtitle2 text-grey q-mb-sm">
          Nicht erkundet
        </div>
        <div class="text-body2 text-grey-5">
          Dieses System wurde noch nicht erkundet. Reisen Sie dorthin, um mehr zu erfahren.
        </div>
        
        <q-separator dark class="q-my-md" />
        
        <div v-if="canTravelToSelected">
          <q-btn 
            color="primary" 
            label="System erkunden" 
            @click="openTravelCalculator"
            icon="explore"
            class="full-width q-mt-sm"
          />
        </div>
        <div v-else>
          <q-badge color="negative">Nicht erreichbar</q-badge>
          <div class="text-caption q-mt-xs">
            Kein direkter Hyperraum-Korridor
          </div>
        </div>
      </template>
      
      <!-- Show full info for discovered systems -->
      <template v-else>
        <div class="text-h5 q-mb-sm">{{ gameStore.selectedSystem.name }}</div>
        <div class="text-subtitle2 text-orange q-mb-sm">
          {{ gameStore.selectedSystem.faction }}
        </div>
        <div class="text-body2">
          {{ gameStore.selectedSystem.description }}
        </div>
        
        <q-separator dark class="q-my-md" />
        
        <div v-if="gameStore.selectedSystem.id === gameStore.playerShip.currentSystem">
          <q-badge color="positive">Aktuelle Position</q-badge>
        </div>
        <div v-else-if="!gameStore.isPlayerMode && canTravelToSelected">
          <q-btn 
            color="primary" 
            label="Hierher reisen" 
            @click="openTravelCalculator"
            icon="rocket"
            class="full-width q-mt-sm"
          />
        </div>
        <div v-else-if="!gameStore.isPlayerMode">
          <q-badge color="negative">Nicht erreichbar</q-badge>
          <div class="text-caption q-mt-xs">
            Kein direkter Hyperraum-Korridor
          </div>
        </div>
      </template>
    </q-card-section>
    
    <q-card-section v-else>
      <div class="text-body2 text-grey-5">
        Klicke auf ein entdecktes System für Details
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import TravelCalculator from './TravelCalculator.vue'

const gameStore = useGameStore()
const showTravelCalculator = ref(false)

const canTravelToSelected = computed(() => {
  if (!gameStore.selectedSystem) return false
  if (gameStore.selectedSystem.id === gameStore.playerShip.currentSystem) return false
  
  const connected = gameStore.getConnectedSystems(gameStore.playerShip.currentSystem)
  return connected.includes(gameStore.selectedSystem.id)
})

const openTravelCalculator = () => {
  showTravelCalculator.value = true
}

const handleTravel = (travelData) => {
  // Actually move the ship
  if (gameStore.selectedSystem) {
    gameStore.moveShip(gameStore.selectedSystem.id)
    
    // Dispatch event for travel time tracking
    window.dispatchEvent(new CustomEvent('travelCompleted', {
      detail: {
        days: travelData.days,
        weeks: travelData.weeks,
        from: travelData.from,
        to: travelData.to
      }
    }))
    
    // Could show a notification here about travel time
    console.log(`Reise dauert ${travelData.days} Tage (${travelData.weeks} Wochen)`)
    
    // Close the calculator dialog
    showTravelCalculator.value = false
  }
}

// Force update when game state is loaded
const handleGameStateLoaded = () => {
  // Trigger reactivity by reassigning selected system if it exists
  if (gameStore.selectedSystem) {
    const currentId = gameStore.selectedSystem.id
    gameStore.selectedSystem = null
    setTimeout(() => {
      const system = gameStore.systems.find(s => s.id === currentId)
      if (system) {
        gameStore.selectedSystem = system
      }
    }, 0)
  }
}

onMounted(() => {
  window.addEventListener('gameStateLoaded', handleGameStateLoaded)
})

onUnmounted(() => {
  window.removeEventListener('gameStateLoaded', handleGameStateLoaded)
})
</script>