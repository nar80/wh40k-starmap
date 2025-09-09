<template>
  <div class="ship-controls-container">
    <q-card class="ship-controls-card">
      <q-card-section>
        <div class="text-h6 text-white text-shadow">Schiffskontrollen</div>
      </q-card-section>
      
      <q-card-section class="content-section">
        <div class="text-h5 q-mb-sm text-white text-shadow">{{ gameStore.playerShip.name }}</div>
        
        <div class="q-mb-md">
          <div class="text-subtitle2 text-white">Aktuelles System:</div>
          <div class="text-body1 text-yellow text-bold text-shadow">
            {{ currentSystemName }}
          </div>
        </div>
        
        <!-- Travel Time Counter -->
        <q-card flat class="bg-black-transparent q-mb-md">
          <q-card-section class="q-pa-xs">
            <div class="row items-center q-gutter-xs">
              <q-icon name="schedule" color="cyan" size="sm" />
              <div class="text-caption text-cyan">Zeit im All</div>
              <q-space />
              <q-btn 
                size="xs" 
                flat 
                dense 
                icon="restart_alt" 
                @click="resetTravelTime" 
                color="grey"
              >
                <q-tooltip>Zeit zurücksetzen</q-tooltip>
              </q-btn>
            </div>
            <div class="text-h6 text-white text-center q-mt-xs">
              {{ travelTimeDisplay }}
            </div>
          </q-card-section>
        </q-card>
      
      <q-separator dark class="q-my-md" />
      
      <div class="text-subtitle2 q-mb-sm text-white">Erreichbare Systeme:</div>
      <q-list dense>
        <q-item 
          v-for="systemId in reachableSystems" 
          :key="systemId"
          clickable
          @click="selectAndTravel(systemId)"
          class="system-item q-mb-xs rounded-borders"
        >
          <q-item-section>
            <q-item-label>
              {{ getSystemName(systemId) }}
              <q-badge 
                v-if="!gameStore.isSystemDiscovered(systemId)" 
                color="grey" 
                label="Unerforscht"
                class="q-ml-sm"
              />
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      
      <q-separator dark class="q-my-md" />
      
      <!-- Schiffsstatus Panel - kompakter und nach unten verschoben -->
      <q-card flat class="bg-black-transparent q-mb-md">
        <q-card-section class="q-pa-xs">
          <div class="text-caption text-amber q-mb-xs">Schiffsstatus</div>
          
          <div class="row q-gutter-sm">
            <!-- Hull Points -->
            <div class="col">
              <div class="row items-center q-gutter-xs">
                <q-icon name="shield" color="red" size="xs" />
                <div class="text-caption text-grey-5">Hülle</div>
              </div>
              <q-linear-progress 
                :value="shipStatus.hullPoints / maxHullPoints" 
                :color="getHullColor"
                size="18px"
                rounded
                class="q-mt-xs hull-progress"
              >
                <div class="absolute-full flex flex-center">
                  <div class="text-white text-caption text-bold">{{ shipStatus.hullPoints }}/{{ maxHullPoints }}</div>
                </div>
              </q-linear-progress>
            </div>
            
            <!-- Crew Strength -->
            <div class="col">
              <div class="row items-center q-gutter-xs">
                <q-icon name="groups" color="orange" size="xs" />
                <div class="text-caption text-grey-5">Crew</div>
              </div>
              <q-linear-progress 
                :value="shipStatus.crewStrength / maxCrewStrength" 
                :color="getCrewColor"
                size="18px"
                rounded
                class="q-mt-xs crew-progress"
              >
                <div class="absolute-full flex flex-center">
                  <div class="text-white text-caption text-bold">{{ shipStatus.crewStrength }}/{{ maxCrewStrength }}%</div>
                </div>
              </q-linear-progress>
            </div>
            
            <!-- Morale -->
            <div class="col">
              <div class="row items-center q-gutter-xs">
                <q-icon name="mood" color="purple" size="xs" />
                <div class="text-caption text-grey-5">Moral</div>
              </div>
              <q-linear-progress 
                :value="shipStatus.morale / maxMorale" 
                :color="getMoraleColor"
                size="18px"
                rounded
                class="q-mt-xs morale-progress"
              >
                <div class="absolute-full flex flex-center">
                  <div class="text-white text-caption text-bold">{{ shipStatus.morale }}/{{ maxMorale }}%</div>
                </div>
              </q-linear-progress>
            </div>
          </div>
          
          <!-- Individual controls per stat -->
          <div class="row q-mt-sm q-gutter-xs">
            <div class="col">
              <q-btn-group flat>
                <q-btn size="xs" flat dense icon="remove" @click="adjustHull(-stepSize)" color="red" />
                <q-btn size="xs" flat dense icon="add" @click="adjustHull(stepSize)" color="green" />
              </q-btn-group>
            </div>
            <div class="col">
              <q-btn-group flat>
                <q-btn size="xs" flat dense icon="remove" @click="adjustCrew(-stepSize)" color="red" />
                <q-btn size="xs" flat dense icon="add" @click="adjustCrew(stepSize)" color="green" />
              </q-btn-group>
            </div>
            <div class="col">
              <q-btn-group flat>
                <q-btn size="xs" flat dense icon="remove" @click="adjustMorale(-stepSize)" color="red" />
                <q-btn size="xs" flat dense icon="add" @click="adjustMorale(stepSize)" color="green" />
              </q-btn-group>
            </div>
          </div>
          <div class="row q-mt-xs items-center">
            <q-btn-toggle
              v-model="stepSize"
              size="xs"
              flat
              dense
              toggle-color="amber"
              :options="[
                {label: '1%', value: 1},
                {label: '5%', value: 5}
              ]"
              class="q-mr-sm"
            />
            <q-space />
            <q-btn size="xs" flat dense label="Reset" @click="resetStatus" color="grey" />
          </div>
        </q-card-section>
      </q-card>
      
      <q-separator dark class="q-my-md" />
      
      <div class="text-caption text-white">
        Runde: {{ gameStore.turnNumber }}
      </div>
      
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { calculateShipStats, hullTypes } from '../data/shipComponents'

const gameStore = useGameStore()
const stepSize = ref(1) // Toggle between 1 and 5

// Travel time tracking
const totalTravelDays = ref(parseInt(localStorage.getItem('totalTravelDays') || '0'))

// Berechne Schiffsstats aus Konfiguration
const shipConfiguration = computed(() => {
  const config = gameStore.getShipConfiguration()
  // console.log('Ship Configuration:', config)
  if (config) {
  }
  return config
})

const shipStats = computed(() => {
  if (!shipConfiguration.value) {
    return null
  }
  
  // Verwende die gespeicherten berechneten Stats wenn vorhanden
  if (shipConfiguration.value.calculatedStats) {
    return shipConfiguration.value.calculatedStats
  }
  
  // Fallback: Berechne Stats wenn keine gespeichert sind (alte Konfigurationen)
  
  // Finde den Hull basierend auf hullId
  let hull = shipConfiguration.value.hull
  if (!hull && shipConfiguration.value.hullId) {
    hull = hullTypes[shipConfiguration.value.hullId]
  }
  
  if (!hull) {
    return null
  }
  
  // Sammle alle Komponenten
  const allComponents = []
  if (shipConfiguration.value.components) {
    const comps = shipConfiguration.value.components
    // Essential components
    if (comps.plasmaDrive) allComponents.push(comps.plasmaDrive)
    if (comps.warpDrive) allComponents.push(comps.warpDrive)
    if (comps.gellerField) allComponents.push(comps.gellerField)
    if (comps.voidShield) allComponents.push(comps.voidShield)
    if (comps.bridge) allComponents.push(comps.bridge)
    if (comps.lifeSupport) allComponents.push(comps.lifeSupport)
    if (comps.crewQuarters) allComponents.push(comps.crewQuarters)
    if (comps.augurArray) allComponents.push(comps.augurArray)
    
    // Weapons
    if (comps.weapons && Array.isArray(comps.weapons)) {
      allComponents.push(...comps.weapons)
    }
    
    // Other supplemental components
    if (comps.cargo && Array.isArray(comps.cargo)) {
      allComponents.push(...comps.cargo)
    }
    if (comps.special && Array.isArray(comps.special)) {
      allComponents.push(...comps.special)
    }
  }
  
  return calculateShipStats(hull, allComponents)
})

// Berechne modifizierte Maximalwerte
const maxHullPoints = computed(() => {
  if (!shipStats.value) {
    return 35 // Standardwert
  }
  const totalHull = shipStats.value.hullIntegrity || 35
  return totalHull
})

const maxCrewStrength = computed(() => {
  // Basis ist 100%, wird durch Crew-Modifikatoren beeinflusst (z.B. Todeskult -8)
  if (!shipStats.value) return 100
  const bonus = shipStats.value.crew || 0
  return 100 + bonus
})

const maxMorale = computed(() => {
  // Basis ist 100%, wird durch Moral-Boni modifiziert
  if (!shipStats.value) return 100
  const bonus = shipStats.value.morale || 0
  // console.log('Morale: base = 100, bonus =', bonus, 'total =', 100 + bonus)
  return 100 + bonus
})

// Ship Status Management mit dynamischen Maximalwerten
const shipStatus = reactive({
  hullPoints: 30,
  crewStrength: 100,
  morale: 100
})

// Passe aktuelle Werte an, wenn Maximalwerte sich ändern
watch(maxCrewStrength, (newMax) => {
  if (shipStatus.crewStrength > newMax) {
    shipStatus.crewStrength = newMax
  }
})

watch(maxMorale, (newMax) => {
  if (shipStatus.morale > newMax) {
    shipStatus.morale = newMax
  }
})

watch(maxHullPoints, (newMax) => {
  if (shipStatus.hullPoints > newMax) {
    shipStatus.hullPoints = newMax
  }
})

// Load saved status from localStorage or gameStore
const loadShipStatus = () => {
  // Prefer gameStore shipStatus if available
  if (gameStore.shipStatus) {
    shipStatus.hullPoints = gameStore.shipStatus.hullPoints || maxHullPoints.value
    shipStatus.crewStrength = gameStore.shipStatus.crewStrength || 100
    shipStatus.morale = gameStore.shipStatus.morale || 100
  } else {
    // Fallback to localStorage
    const saved = localStorage.getItem('shipStatus')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // Setze nur aktuelle Werte, nicht die Maximalwerte
        shipStatus.hullPoints = data.hullPoints || maxHullPoints.value
        shipStatus.crewStrength = data.crewStrength || 100
        shipStatus.morale = data.morale || 100
      } catch (e) {
        console.error('Failed to load ship status:', e)
      }
    } else {
      // Initialisiere mit Maximalwerten
      shipStatus.hullPoints = maxHullPoints.value
      shipStatus.crewStrength = maxCrewStrength.value
      shipStatus.morale = maxMorale.value
    }
  }
  
  // Sync with gameStore
  gameStore.shipStatus = { ...shipStatus }
}

onMounted(() => {
  loadShipStatus()
})

// Listen for game state loaded event
const handleGameStateLoaded = () => {
  loadShipStatus()
}

window.addEventListener('gameStateLoaded', handleGameStateLoaded)

// Travel time calculations
const travelTimeDisplay = computed(() => {
  const days = totalTravelDays.value
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  const remainingDays = days % 30
  
  const parts = []
  if (years > 0) parts.push(`${years} Jahr${years !== 1 ? 'e' : ''}`)
  if (months > 0) parts.push(`${months} Monat${months !== 1 ? 'e' : ''}`)
  if (remainingDays > 0 || parts.length === 0) {
    parts.push(`${remainingDays} Tag${remainingDays !== 1 ? 'e' : ''}`)
  }
  
  return parts.join(', ')
})

const resetTravelTime = () => {
  totalTravelDays.value = 0
  localStorage.setItem('totalTravelDays', '0')
}

// Listen for travel events from TravelCalculator
const handleTravelCompleted = (event) => {
  if (event.detail && event.detail.days) {
    totalTravelDays.value += event.detail.days
    localStorage.setItem('totalTravelDays', totalTravelDays.value.toString())
  }
}

// Listen for travel time loaded from savegame
const handleTravelTimeLoaded = () => {
  const saved = localStorage.getItem('totalTravelDays')
  if (saved) {
    totalTravelDays.value = parseInt(saved)
  }
}

window.addEventListener('travelCompleted', handleTravelCompleted)
window.addEventListener('travelTimeLoaded', handleTravelTimeLoaded)

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('gameStateLoaded', handleGameStateLoaded)
  window.removeEventListener('travelCompleted', handleTravelCompleted)
  window.removeEventListener('travelTimeLoaded', handleTravelTimeLoaded)
})

// Save status whenever it changes
watch(shipStatus, (newStatus) => {
  localStorage.setItem('shipStatus', JSON.stringify(newStatus))
  // Also update in gameStore for savegame
  gameStore.shipStatus = { ...newStatus }
}, { deep: true })

// Save travel time whenever it changes
watch(totalTravelDays, (newValue) => {
  localStorage.setItem('totalTravelDays', newValue.toString())
})

// Status adjustment functions
const adjustHull = (amount) => {
  shipStatus.hullPoints = Math.max(0, Math.min(maxHullPoints.value, shipStatus.hullPoints + amount))
}

const adjustCrew = (amount) => {
  shipStatus.crewStrength = Math.max(0, Math.min(maxCrewStrength.value, shipStatus.crewStrength + amount))
}

const adjustMorale = (amount) => {
  shipStatus.morale = Math.max(0, Math.min(maxMorale.value, shipStatus.morale + amount))
}

// adjustAll removed - using individual controls now

const resetStatus = () => {
  shipStatus.hullPoints = maxHullPoints.value
  shipStatus.crewStrength = maxCrewStrength.value
  shipStatus.morale = maxMorale.value
}

// Color getters for progress bars
const getHullColor = computed(() => {
  const ratio = shipStatus.hullPoints / maxHullPoints.value
  if (ratio > 0.6) return 'green'
  if (ratio > 0.3) return 'orange'
  return 'red'
})

const getCrewColor = computed(() => {
  const ratio = (shipStatus.crewStrength / maxCrewStrength.value) * 100
  if (ratio > 70) return 'green'
  if (ratio > 40) return 'orange'
  return 'red'
})

const getMoraleColor = computed(() => {
  const ratio = (shipStatus.morale / maxMorale.value) * 100
  if (ratio > 70) return 'green'
  if (ratio > 40) return 'orange'
  return 'red'
})

const currentSystemName = computed(() => {
  const system = gameStore.systems.find(s => s.id === gameStore.playerShip.currentSystem)
  return system ? system.name : 'Unbekannt'
})

const reachableSystems = computed(() => {
  return gameStore.getConnectedSystems(gameStore.playerShip.currentSystem)
})

const getSystemName = (systemId) => {
  const system = gameStore.systems.find(s => s.id === systemId)
  if (!system) return 'Unbekannt'
  return gameStore.isSystemDiscovered(systemId) ? system.name : 'Unbekanntes System'
}

const selectAndTravel = (systemId) => {
  // In player mode, only allow selecting systems, no travel
  if (gameStore.isPlayerMode) {
    gameStore.selectSystem(systemId)
    return
  }
  
  // Only select the system, don't travel automatically
  gameStore.selectSystem(systemId)
  // Travel happens via the "Hierher reisen" button in SystemDetails
}
</script>

<style scoped>
.ship-controls-container {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: #1a1a1a;
}

.ship-controls-card {
  background: rgba(30, 30, 30, 0.9);
  position: relative;
  color: white;
  min-height: 100%;
  margin: 0;
  border: none;
  box-shadow: none;
}

.ship-controls-card .q-card-section {
  position: relative;
  z-index: 1;
}

.content-section {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
  min-height: 100%;
  padding-bottom: 20px;
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
}

.system-item {
  background: rgba(30, 30, 30, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.system-item:hover {
  background: rgba(50, 50, 50, 0.8) !important;
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.q-separator {
  background: rgba(255, 255, 255, 0.2) !important;
}

.bg-black-transparent {
  background-color: rgba(0, 0, 0, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hull-progress {
  background: rgba(255, 0, 0, 0.2) !important;
}

.crew-progress {
  background: rgba(255, 165, 0, 0.2) !important;
}

.morale-progress {
  background: rgba(128, 0, 128, 0.2) !important;
}

.q-linear-progress__track {
  opacity: 1 !important;
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}
</style>