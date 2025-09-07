<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="rocket_launch" />
          WH40k Sternenkarte
          <span v-if="gameStore.isPlayerMode" class="text-subtitle2 q-ml-md">
            ({{ gameStore.currentCampaign === 'main' ? 'Hauptkampagne' : 'Nebenkampagne' }})
          </span>
          <span v-else-if="mapStore.currentMapName" class="text-subtitle2 q-ml-md">
            ({{ mapStore.currentMapName === 'default' ? 'Standard Koronus' : mapStore.currentMapName }})
          </span>
        </q-toolbar-title>
        
        <q-btn 
          v-if="!gameStore.isPlayerMode"
          flat 
          round 
          dense 
          :icon="gameStore.fogOfWarEnabled ? 'visibility_off' : 'visibility'"
          @click="toggleFog"
        >
          <q-tooltip>Fog of War {{ gameStore.fogOfWarEnabled ? 'ausschalten' : 'einschalten' }}</q-tooltip>
        </q-btn>
        <q-separator dark vertical class="q-mx-sm" v-if="!gameStore.isPlayerMode" />
        <q-btn 
          flat 
          round 
          dense 
          icon="save_as"
          color="green"
          @click="saveMap"
          v-if="gameStore.editMode"
        >
          <q-tooltip>Karte speichern</q-tooltip>
        </q-btn>
        <q-btn 
          flat 
          round 
          dense 
          icon="folder_open"
          color="yellow"
          @click="loadMap"
          v-if="gameStore.editMode"
        >
          <q-tooltip>Karte laden</q-tooltip>
        </q-btn>
        <q-separator dark vertical class="q-mx-sm" v-if="gameStore.editMode" />
        <q-btn 
          v-if="!gameStore.isPlayerMode"
          flat 
          round 
          dense 
          :icon="gameStore.editMode ? 'edit_off' : 'edit'"
          :color="gameStore.editMode ? 'warning' : 'white'"
          @click="toggleEditMode"
        >
          <q-tooltip>Edit-Modus {{ gameStore.editMode ? 'ausschalten' : 'einschalten' }}</q-tooltip>
        </q-btn>
        <q-separator dark vertical class="q-mx-sm" />
        <!-- Campaign Selector for Players -->
        <q-btn-toggle
          v-if="gameStore.isPlayerMode"
          v-model="gameStore.currentCampaign"
          toggle-color="black"
          text-color="grey-5"
          :options="[
            {label: 'Haupt', value: 'main'},
            {label: 'Neben', value: 'side'}
          ]"
          @update:model-value="switchPlayerCampaign"
          flat
          size="sm"
          class="q-mr-sm"
          style="border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;"
        />
        <!-- Sync Button for Players -->
        <q-btn 
          v-if="gameStore.isPlayerMode"
          flat 
          round 
          dense 
          icon="sync"
          color="amber"
          @click="syncData"
          :loading="syncing"
        >
          <q-tooltip>Neue Daten vom Spielleiter laden. </q-tooltip>
        </q-btn>
        <!-- Player Mode Settings -->
        <q-btn 
          flat 
          round 
          dense 
          icon="settings"
          :color="gameStore.isPlayerMode ? 'amber' : 'white'"
          @click="showPlayerSettings = true"
        >
          <q-tooltip>{{ gameStore.isPlayerMode ? 'Spieler-Modus aktiv' : 'Einstellungen' }}</q-tooltip>
        </q-btn>
        <q-separator dark vertical class="q-mx-sm" />
        <!-- Favorite Map Quick Access -->
        <div class="q-gutter-xs q-mr-sm">
          <span v-if="mapStore.getFavorites().length > 0" class="text-caption q-mr-xs" style="color: #888;">FAV:</span>
          <q-btn
            v-for="(fav, index) in mapStore.getFavorites()"
            :key="fav.name"
            flat
            round
            dense
            :icon="'star'"
            :label="`${index + 1}`"
            :color="mapStore.currentMapName === fav.name ? 'yellow' : 'grey-6'"
            @click="quickLoadMap(fav.name)"
            size="sm"
            class="q-px-xs"
          >
            <q-tooltip>{{ fav.displayName }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="mapStore.getFavorites().length === 0"
            flat
            dense
            icon="star_border"
            label="Keine Favoriten"
            color="grey-6"
            size="sm"
            disabled
          >
            <q-tooltip>Markieren Sie Karten als Favoriten im Edit-Modus</q-tooltip>
          </q-btn>
        </div>
        <!-- Save/Load only for GM -->
        <template v-if="!gameStore.isPlayerMode">
          <q-separator dark vertical class="q-mx-sm" />
          <q-btn flat round dense icon="save" @click="saveGame">
            <q-tooltip>Spielstand speichern</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="folder_open" @click="loadGame">
            <q-tooltip>Spielstand laden</q-tooltip>
          </q-btn>
          <q-separator dark vertical class="q-mx-sm" />
          <q-btn flat round dense icon="backup" color="green" @click="createBackup">
            <q-tooltip>Backup erstellen</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="restore" color="orange" @click="restoreBackup">
            <q-tooltip>Backup wiederherstellen</q-tooltip>
          </q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-page-container style="overflow: hidden;">
      <router-view />
    </q-page-container>
    
    <!-- Player Mode Settings Dialog -->
    <PlayerModeSettings v-model="showPlayerSettings" />
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { useMapStore } from './stores/mapStore'
import PlayerModeSettings from './components/PlayerModeSettings.vue'
import { useQuasar } from 'quasar'
import { saveGameToFile, loadJsonFile, createFullBackup, restoreFromBackup } from './utils/fileManager'
import { initializeEnvironment } from './config/environment'

const gameStore = useGameStore()
const mapStore = useMapStore()
const $q = useQuasar()

const showPlayerSettings = ref(false)
const syncing = ref(false)

// Calculate time since last sync
const timeSinceSync = computed(() => {
  if (!gameStore.lastSyncTime) return ''
  
  const lastSync = new Date(gameStore.lastSyncTime)
  const now = new Date()
  const diffMinutes = Math.floor((now - lastSync) / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)}h`
  } else {
    return `${Math.floor(diffMinutes / 1440)}d`
  }
})

// Switch campaign for players
const switchPlayerCampaign = async (campaign) => {
  // Update the campaign
  gameStore.setCampaign(campaign)
  
  // Get URLs from environment or use defaults
  const gistUrls = {
    main: import.meta.env.VITE_GIST_URL_MAIN || 'https://api.github.com/gists/392231ea5b2f0f3d8abdf06fdbd75bd3',
    side: import.meta.env.VITE_GIST_URL_SIDE || 'https://api.github.com/gists/2c5f0c244be82b00acc8090c2cbffc6e'
  }
  
  gameStore.remoteDataUrl = gistUrls[campaign]
  localStorage.setItem('remoteDataUrl', gistUrls[campaign])
  
  // Automatically sync the new campaign data
  syncing.value = true
  const success = await gameStore.syncWithRemote({ updateExistingNPCs: false })
  syncing.value = false
  
  if (success) {
    $q.notify({
      type: 'positive',
      message: `Gewechselt zu ${campaign === 'main' ? 'Hauptkampagne' : 'Nebenkampagne'}`,
      position: 'top'
    })
  }
}

// Manual sync function
const syncData = async () => {
  // Ask user about NPC update preference
  $q.dialog({
    title: 'Daten synchronisieren',
    message: 'Wie sollen NPCs behandelt werden?',
    options: {
      type: 'radio',
      model: 'merge',
      items: [
        { label: 'NPCs zusammenführen (empfohlen)', value: 'merge' },
        { label: 'Vorhandene NPCs überschreiben', value: 'overwrite' }
      ]
    },
    cancel: true
  }).onOk(async (option) => {
    syncing.value = true
    const success = await gameStore.syncWithRemote({ 
      updateExistingNPCs: option === 'overwrite' 
    })
    syncing.value = false
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Daten erfolgreich aktualisiert',
        caption: option === 'overwrite' ? 
          'NPCs wurden überschrieben' : 
          'NPCs wurden zusammengeführt',
        position: 'top'
      })
    }
  })
}

// Initialize environment configuration on mount
onMounted(async () => {
  await initializeEnvironment(gameStore)
})

const saveGame = async () => {
  // Ensure ship configuration is included
  if (!gameStore.playerShip.configuration) {
    const config = gameStore.loadShipConfiguration()
    if (config) {
      gameStore.playerShip.configuration = config
    }
  }
  
  const gameState = {
    // Map reference - which map this save belongs to
    mapName: mapStore.currentMapName,
    mapVersion: new Date().toISOString(), // To check if map has been updated
    
    // Complete ship state including configuration
    playerShip: {
      ...gameStore.playerShip,
      configuration: gameStore.playerShip.configuration || gameStore.getShipConfiguration()
    },
    
    // Game progress
    discoveredSystems: gameStore.discoveredSystems,
    turnNumber: gameStore.turnNumber,
    
    // Ship status (hull, crew, morale)
    shipStatus: gameStore.shipStatus,
    
    // Total travel time
    totalTravelDays: parseInt(localStorage.getItem('totalTravelDays') || '0'),
    
    // System data (NPCs, notes, importance)
    systemImportance: gameStore.systemImportance,
    systemNPCs: gameStore.systemNPCs,
    systemNotes: gameStore.systemNotes, // Include system notes
    systemPlanets: gameStore.systemPlanets, // Include discovered planet data
    
    // Meta information
    savedAt: new Date().toISOString(),
    gameVersion: '1.0.0'
  }
  
  await saveGameToFile(gameState, gameStore.turnNumber)
}

const loadGame = async () => {
  try {
    const { data } = await loadJsonFile('.json')
    
    // Check if save belongs to a specific map
    if (data.mapName) {
      // Check if we have this map
      const mapExists = data.mapName === 'default' || mapStore.savedMaps[data.mapName]
      
      if (!mapExists) {
        $q.notify({
          type: 'warning',
          message: `Warnung: Die Karte "${data.mapName}" für diesen Spielstand wurde nicht gefunden. Lade trotzdem...`,
          position: 'top',
          timeout: 5000
        })
      } else if (mapStore.currentMapName !== data.mapName) {
        // Ask if we should switch to the correct map
        await new Promise((resolve) => {
          $q.dialog({
            title: 'Andere Karte laden?',
            message: `Dieser Spielstand gehört zur Karte "${data.mapName}". Möchten Sie zu dieser Karte wechseln?`,
            ok: { label: 'Ja, Karte wechseln' },
            cancel: { label: 'Nein, aktuelle Karte behalten' }
          }).onOk(() => {
            // Load the correct map first
            if (data.mapName === 'default') {
              const defaultMap = mapStore.getDefaultMap()
              gameStore.systems = defaultMap.systems
              gameStore.hyperlanes = defaultMap.hyperlanes
              mapStore.currentMapName = 'default'
            } else {
              const loadedMap = mapStore.loadMap(data.mapName)
              if (loadedMap) {
                gameStore.systems = loadedMap.systems
                gameStore.hyperlanes = loadedMap.hyperlanes
                if (loadedMap.systemPlanets) {
                  gameStore.systemPlanets = loadedMap.systemPlanets
                }
              }
            }
            resolve()
          }).onCancel(() => {
            resolve()
          })
        })
      }
    } else {
      // Old savegame format - load systems/hyperlanes if present
      if (data.systems) gameStore.systems = data.systems
      if (data.hyperlanes) gameStore.hyperlanes = data.hyperlanes
    }
    
    // Load game state
    if (data.playerShip) {
      gameStore.playerShip = data.playerShip
      // Save ship configuration if included
      if (data.playerShip.configuration) {
        gameStore.saveShipConfiguration(data.playerShip.configuration)
      }
    }
    
    if (data.discoveredSystems) gameStore.discoveredSystems = data.discoveredSystems
    if (data.turnNumber) gameStore.turnNumber = data.turnNumber
    
    // Load ship status
    if (data.shipStatus) {
      gameStore.shipStatus = data.shipStatus
      localStorage.setItem('shipStatus', JSON.stringify(data.shipStatus))
    }
    
    // Load travel time
    if (data.totalTravelDays !== undefined) {
      localStorage.setItem('totalTravelDays', data.totalTravelDays.toString())
      // Trigger event to update ShipControls
      window.dispatchEvent(new Event('travelTimeLoaded'))
    }
    
    // Load system data - need to properly update reactive refs
    if (data.systemImportance) {
      // Clear existing and copy new data to maintain reactivity
      Object.keys(gameStore.systemImportance).forEach(key => delete gameStore.systemImportance[key])
      Object.assign(gameStore.systemImportance, data.systemImportance)
      localStorage.setItem('systemImportance', JSON.stringify(data.systemImportance))
    }
    if (data.systemNPCs) {
      // Clear existing and copy new data to maintain reactivity
      Object.keys(gameStore.systemNPCs).forEach(key => delete gameStore.systemNPCs[key])
      Object.assign(gameStore.systemNPCs, data.systemNPCs)
      localStorage.setItem('systemNPCs', JSON.stringify(data.systemNPCs))
    }
    if (data.systemNotes) {
      // Clear existing and copy new data to maintain reactivity
      Object.keys(gameStore.systemNotes).forEach(key => delete gameStore.systemNotes[key])
      Object.assign(gameStore.systemNotes, data.systemNotes)
      localStorage.setItem('systemNotes', JSON.stringify(data.systemNotes))
      // Also update old format for compatibility
      Object.entries(data.systemNotes).forEach(([systemId, notes]) => {
        localStorage.setItem(`system-notes-${systemId}`, notes)
      })
    }
    if (data.systemPlanets) {
      // Clear existing and copy new data to maintain reactivity
      Object.keys(gameStore.systemPlanets).forEach(key => delete gameStore.systemPlanets[key])
      Object.assign(gameStore.systemPlanets, data.systemPlanets)
      localStorage.setItem('systemPlanets', JSON.stringify(data.systemPlanets))
    }
    
    // Clear localStorage and save new state
    localStorage.setItem('playerShip', JSON.stringify(gameStore.playerShip))
    localStorage.setItem('discoveredSystems', JSON.stringify(gameStore.discoveredSystems))
    
    // Trigger events to update all components
    window.dispatchEvent(new Event('mapDataChanged'))
    window.dispatchEvent(new Event('gameStateLoaded'))
    
    $q.notify({
      type: 'positive',
      message: `Spielstand geladen (Karte: ${data.mapName || 'Unbekannt'})`,
      position: 'top'
    })
  } catch (err) {
    console.error('Load cancelled or failed:', err)
  }
}

const createBackup = async () => {
  await createFullBackup(gameStore, mapStore)
}

const restoreBackup = async () => {
  await restoreFromBackup(gameStore, mapStore)
}

const toggleFog = () => {
  gameStore.toggleFogOfWar()
  window.dispatchEvent(new Event('fogOfWarToggled'))
}

const toggleEditMode = () => {
  gameStore.toggleEditMode()
  window.dispatchEvent(new Event('editModeToggled'))
}

const quickLoadMap = (mapName) => {
  if (mapName === 'default') {
    const defaultMap = mapStore.getDefaultMap()
    gameStore.systems = defaultMap.systems
    gameStore.hyperlanes = defaultMap.hyperlanes
    mapStore.currentMapName = 'default'
    // Reset to default start
    gameStore.playerShip.currentSystem = 'port-wander'
    gameStore.discoveredSystems = ['port-wander', 'footfall']
  } else {
    const loadedMap = mapStore.loadMap(mapName)
    if (loadedMap) {
      gameStore.systems = loadedMap.systems
      gameStore.hyperlanes = loadedMap.hyperlanes
      if (loadedMap.systemPlanets) {
        gameStore.systemPlanets = loadedMap.systemPlanets
        localStorage.setItem('systemPlanets', JSON.stringify(loadedMap.systemPlanets))
      }
      if (loadedMap.startSystem) {
        gameStore.setStartSystem(loadedMap.startSystem)
        gameStore.playerShip.currentSystem = loadedMap.startSystem
      }
      // Load discovered systems or default to start system
      if (loadedMap.discoveredSystems && loadedMap.discoveredSystems.length > 0) {
        gameStore.discoveredSystems = loadedMap.discoveredSystems
      } else {
        const startSys = loadedMap.startSystem || 'port-wander'
        gameStore.discoveredSystems = [startSys]
      }
    }
  }
  
  window.dispatchEvent(new Event('mapDataChanged'))
  
  $q.notify({
    type: 'positive',
    message: `Karte "${mapName === 'default' ? 'Standard Koronus' : mapName}" geladen`,
    position: 'top'
  })
}

const saveMap = () => {
  $q.dialog({
    title: 'Karte speichern',
    message: 'Name für die Karte:',
    prompt: {
      model: mapStore.currentMapName || 'Meine Karte',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk((name) => {
    mapStore.saveMap(name, gameStore.systems, gameStore.hyperlanes, gameStore.systemPlanets, gameStore.getStartSystem(), gameStore.discoveredSystems)
  })
}

const loadMap = () => {
  const mapList = mapStore.getMapList()
  
  // Add default map option with favorite indicator
  const options = [
    { 
      label: `Standard Koronus Expanse ${mapStore.isFavorite('default') ? '⭐' : ''}`, 
      value: 'default' 
    },
    ...mapList.map(m => ({
      label: `${m.name} (${new Date(m.savedAt).toLocaleString('de-DE')}) ${mapStore.isFavorite(m.name) ? '⭐' : ''}`,
      value: m.name
    }))
  ]
  
  if (options.length === 1) {
    $q.notify({
      type: 'info',
      message: 'Keine gespeicherten Karten vorhanden',
      position: 'top'
    })
    return
  }
  
  $q.dialog({
    title: 'Karte laden',
    message: 'Wählen Sie eine Karte (Klicken Sie auf ⭐ um Favoriten zu setzen):',
    options: {
      type: 'radio',
      model: mapStore.currentMapName,
      items: options
    },
    cancel: true,
    persistent: true
  }).onOk((selectedMap) => {
    if (selectedMap === 'default') {
      const defaultMap = mapStore.getDefaultMap()
      gameStore.systems = defaultMap.systems
      gameStore.hyperlanes = defaultMap.hyperlanes
      mapStore.currentMapName = 'default'
    } else {
      const loadedMap = mapStore.loadMap(selectedMap)
      if (loadedMap) {
        gameStore.systems = loadedMap.systems
        gameStore.hyperlanes = loadedMap.hyperlanes
        
        // Load start system if defined
        if (loadedMap.startSystem) {
          gameStore.setStartSystem(loadedMap.startSystem)
          gameStore.playerShip.currentSystem = loadedMap.startSystem
          // Make sure start system is discovered
          if (!gameStore.discoveredSystems.includes(loadedMap.startSystem)) {
            gameStore.discoveredSystems.push(loadedMap.startSystem)
          }
        }
        
        // Load planet data if available
        if (loadedMap.systemPlanets) {
          gameStore.systemPlanets = loadedMap.systemPlanets
        }
      }
    }
    // Trigger map redraw
    window.dispatchEvent(new Event('mapDataChanged'))
  })
}
</script>