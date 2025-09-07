<template>
  <q-page class="row" style="overflow: hidden; height: calc(100vh - 50px);">
    <div :class="gameStore.editMode ? 'col-12' : 'col-10'" style="height: 100%; overflow: hidden;">
      <StarMap ref="starMapRef" />
    </div>
    <div v-if="!gameStore.editMode" class="col-2" style="padding: 0; height: 100%; display: flex; flex-direction: column;">
      <SystemDetails style="flex: 0 0 auto;" />
      <ShipControls style="flex: 1 1 auto; overflow-y: auto;" />
    </div>
    <EditToolsPanel 
      :starlane-mode="gameStore.starlaneMode"
      @toggle-starlane-mode="toggleStarlaneMode"
      @new-map="createNewMap"
      @save-map="saveMap"
      @load-map="loadMap"
      @export-map="exportMap"
      @import-map="importMap"
      @import-system-details="showSystemDetailsImporter"
    />
    
    <!-- System Details Importer Dialog -->
    <q-dialog v-model="showImporter">
      <SystemDetailsImporter />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import StarMap from '../components/StarMap.vue'
import SystemDetails from '../components/SystemDetails.vue'
import ShipControls from '../components/ShipControls.vue'
import EditToolsPanel from '../components/EditToolsPanel.vue'
import SystemDetailsImporter from '../components/SystemDetailsImporter.vue'
import { useGameStore } from '../stores/gameStore'
import { useMapStore } from '../stores/mapStore'
import { useQuasar } from 'quasar'
import { saveMapToFile, loadJsonFile } from '../utils/fileManager'

const gameStore = useGameStore()
const mapStore = useMapStore()
const $q = useQuasar()
const starMapRef = ref(null)
const showImporter = ref(false)

const toggleStarlaneMode = () => {
  gameStore.toggleStarlaneMode()
  window.dispatchEvent(new Event('toggleStarlaneMode'))
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
  
  const options = [
    { label: 'Standard Koronus Expanse', value: 'default' },
    ...mapList.map(m => ({
      label: `${m.name} (${new Date(m.savedAt).toLocaleString('de-DE')})`,
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
    message: 'Wählen Sie eine Karte:',
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
      // Clear planet data when loading default map
      gameStore.systemPlanets = {}
      localStorage.removeItem('systemPlanets')
    } else {
      const loadedMap = mapStore.loadMap(selectedMap)
      if (loadedMap) {
        gameStore.systems = loadedMap.systems
        gameStore.hyperlanes = loadedMap.hyperlanes
        
        // Load start system if defined
        if (loadedMap.startSystem) {
          gameStore.setStartSystem(loadedMap.startSystem)
          gameStore.playerShip.currentSystem = loadedMap.startSystem
        }
        
        // Load discovered systems or default to just start system
        if (loadedMap.discoveredSystems && loadedMap.discoveredSystems.length > 0) {
          gameStore.discoveredSystems = loadedMap.discoveredSystems
        } else {
          // Default: only start system is discovered
          const startSys = loadedMap.startSystem || 'port-wander'
          gameStore.discoveredSystems = [startSys]
        }
        
        // Load or clear planet data
        if (loadedMap.systemPlanets) {
          gameStore.systemPlanets = loadedMap.systemPlanets
          localStorage.setItem('systemPlanets', JSON.stringify(loadedMap.systemPlanets))
        } else {
          gameStore.systemPlanets = {}
          localStorage.removeItem('systemPlanets')
        }
      }
    }
    window.dispatchEvent(new Event('mapDataChanged'))
  })
}

const exportMap = async () => {
  // Bereinige Planetendaten vor dem Export
  const cleanedPlanets = {}
  for (const [systemId, planets] of Object.entries(gameStore.systemPlanets)) {
    if (planets && planets.length > 0) {
      cleanedPlanets[systemId] = planets.map(planet => {
        // Bereinige doppelte Ressourcen-Struktur
        let resources = []
        
        // Sammle alle Ressourcen aus beiden Feldern
        const resourceSet = new Set() // Verwende Set um Duplikate zu vermeiden
        
        // Aus resources Array
        if (planet.resources && planet.resources.length > 0) {
          planet.resources.forEach(r => {
            if (typeof r === 'object' && r.type) {
              resourceSet.add(r.type)
            } else if (typeof r === 'string') {
              resourceSet.add(r)
            }
          })
        }
        
        // Aus altem resource Feld
        if (planet.resource) {
          if (typeof planet.resource === 'object' && planet.resource.type) {
            resourceSet.add(planet.resource.type)
          } else if (typeof planet.resource === 'string') {
            resourceSet.add(planet.resource)
          }
        }
        
        // Konvertiere Set zurück zu Array
        resources = Array.from(resourceSet)
        
        // Bereinigtes Planet-Objekt
        const cleanPlanet = {
          name: planet.name,
          category: planet.category || 'Planet',  // Füge Kategorie hinzu wenn fehlt
          type: planet.type || 'Unbekannt',
          description: planet.description || null,
          isHabitable: planet.isHabitable || false,
          hasColony: planet.hasColony || false,
          environment: planet.environment || {
            atmosphere: 'Unknown',
            temperature: 'Variable',
            gravity: 'Standard',
            weather: 'Unknown',
            specialConditions: []
          },
          flavorText: planet.flavorText || null,
          explored: planet.explored || false
        }
        
        // Nur hinzufügen wenn nicht leer
        if (resources.length > 0) {
          cleanPlanet.resources = resources
        }
        
        if (planet.pointsOfInterest && planet.pointsOfInterest.length > 0) {
          cleanPlanet.pointsOfInterest = planet.pointsOfInterest
        } else if (planet.pointOfInterest) {
          // Konvertiere altes pointOfInterest zu Array
          cleanPlanet.pointsOfInterest = [{ name: planet.pointOfInterest, danger: 0 }]
        }
        
        if (planet.population) {
          cleanPlanet.population = planet.population
        }
        
        if (planet.moons) {
          cleanPlanet.moons = planet.moons
        }
        
        // Entferne alte/doppelte Felder
        delete cleanPlanet.resource
        delete cleanPlanet.pointOfInterest
        
        return cleanPlanet
      })
    }
  }
  
  const mapData = {
    name: mapStore.currentMapName || 'koronus-map',
    systems: gameStore.systems,
    hyperlanes: gameStore.hyperlanes,
    systemPlanets: cleanedPlanets,  // Export bereinigte Planetendaten
    startSystem: gameStore.getStartSystem(),  // Export start system
    discoveredSystems: gameStore.discoveredSystems,  // Export discovered systems
    savedAt: new Date().toISOString()
  }
  
  await saveMapToFile(mapData, mapStore.currentMapName || 'koronus-map')
}

const importMap = async () => {
  try {
    const { data } = await loadJsonFile('.json')
    
    if (!data.systems || !data.hyperlanes) {
      $q.notify({
        type: 'negative',
        message: 'Ungültiges Kartenformat',
        position: 'top'
      })
      return
    }
    
    // Ask for name
    $q.dialog({
      title: 'Karte importieren',
      message: 'Name für die importierte Karte:',
      prompt: {
        model: data.name || 'Importierte Karte',
        type: 'text'
      },
      cancel: true,
      persistent: true
    }).onOk((name) => {
      // Load the map data
      gameStore.systems = data.systems
      gameStore.hyperlanes = data.hyperlanes
      
      // Load planet data if present, otherwise clear it
      if (data.systemPlanets) {
        gameStore.systemPlanets = data.systemPlanets
        localStorage.setItem('systemPlanets', JSON.stringify(data.systemPlanets))
      } else {
        // Clear planet data if not in imported map (older export)
        gameStore.systemPlanets = {}
        localStorage.removeItem('systemPlanets')
      }
      
      // Load start system and reset ship position
      if (data.startSystem) {
        gameStore.setStartSystem(data.startSystem)
        gameStore.playerShip.currentSystem = data.startSystem
      }
      
      // Load discovered systems or default to just start system
      if (data.discoveredSystems && data.discoveredSystems.length > 0) {
        gameStore.discoveredSystems = data.discoveredSystems
      } else {
        // Default: only start system is discovered
        gameStore.discoveredSystems = [data.startSystem || 'port-wander']
      }
      
      // Save to map store with all data
      mapStore.saveMap(name, data.systems, data.hyperlanes, data.systemPlanets, data.startSystem, data.discoveredSystems)
      mapStore.currentMapName = name
      
      // Trigger redraw
      window.dispatchEvent(new Event('mapDataChanged'))
      
      $q.notify({
        type: 'positive',
        message: `Karte "${name}" erfolgreich importiert`,
        position: 'top'
      })
    })
  } catch (err) {
    console.error('Import cancelled or failed:', err)
  }
}

const showSystemDetailsImporter = () => {
  showImporter.value = true
}

const createNewMap = () => {
  $q.dialog({
    title: 'Neue Karte erstellen',
    message: 'Name für die neue Karte:',
    prompt: {
      model: 'Neue Karte',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk((name) => {
    // Create empty map with just a start system
    const newSystems = [
      {
        id: 'start-system',
        name: 'Start System',
        x: 0,
        y: 0,
        type: 'Frontier',
        faction: 'Unclaimed',
        starType: 'Gelber Zwerg'
      }
    ]
    const newHyperlanes = []
    
    // Save the new map
    mapStore.saveMap(name, newSystems, newHyperlanes, {}, 'start-system')
    
    // Load the new map
    gameStore.systems = newSystems
    gameStore.hyperlanes = newHyperlanes
    gameStore.systemPlanets = {}
    gameStore.setStartSystem('start-system')
    
    // Reset game state for new map
    gameStore.playerShip.currentSystem = 'start-system'
    gameStore.discoveredSystems = ['start-system']
    
    // Trigger redraw
    window.dispatchEvent(new Event('mapDataChanged'))
    
    $q.notify({
      type: 'positive',
      message: `Neue Karte "${name}" erstellt`,
      position: 'top'
    })
  })
}

// Event listeners are no longer needed since starlane mode is now managed in the store
</script>