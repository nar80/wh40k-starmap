import { defineStore } from 'pinia'
import { ref, computed, watch, watchEffect } from 'vue'
import { Notify } from 'quasar'
import { koronusSystems, koronusHyperlanes } from '../data/koronusSystems'
import { useMapStore } from './mapStore'

export const useGameStore = defineStore('game', () => {
  const mapStore = useMapStore()
  
  // Initialize with last used map or default
  const initialMap = mapStore.getLastUsedMap()
  const systems = ref(initialMap.systems)
  const hyperlanes = ref(initialMap.hyperlanes)
  
  // Get start system from map or find a valid fallback
  let mapStartSystem = initialMap.startSystem
  
  // If no start system defined, try common defaults
  if (!mapStartSystem) {
    // Try common starting systems
    const fallbackSystems = ['furibundus', 'port-wander', 'footfall']
    for (const sysId of fallbackSystems) {
      if (systems.value.find(s => s.id === sysId)) {
        mapStartSystem = sysId
        break
      }
    }
    
    // If still no system found, use the first system
    if (!mapStartSystem && systems.value.length > 0) {
      mapStartSystem = systems.value[0].id
    }
  }
  
  // Load system planets if available (will be initialized later with proper priority)
  
  // Calculate distances for hyperlanes that don't have them
  const calculateHyperlaneDistances = () => {
    hyperlanes.value.forEach(lane => {
      if (!lane.distance) {
        const fromSys = systems.value.find(s => s.id === lane.from)
        const toSys = systems.value.find(s => s.id === lane.to)
        
        if (fromSys && toSys) {
          const dx = toSys.x - fromSys.x
          const dy = toSys.y - fromSys.y
          const pixelDistance = Math.sqrt(dx * dx + dy * dy)
          // Convert pixel distance to game distance (1-5 scale)
          lane.distance = Math.min(5, Math.max(1, Math.round(pixelDistance / 200)))
        } else {
          lane.distance = 3 // default
        }
      }
    })
  }
  
  // Calculate distances on init
  calculateHyperlaneDistances()
  
  // Load saved game state from localStorage if available
  const savedPlayerShip = localStorage.getItem('playerShip')
  const savedDiscoveredSystems = localStorage.getItem('discoveredSystems')
  
  // Parse saved ship or create default
  let shipData = null
  if (savedPlayerShip) {
    try {
      shipData = JSON.parse(savedPlayerShip)
      console.log('Loaded ship position from localStorage:', shipData.currentSystem)
    } catch (e) {
      console.error('Failed to parse saved ship data:', e)
    }
  }
  
  const playerShip = ref(shipData || {
    id: 'player_ship',
    name: 'Spes Imperatoris',
    currentSystem: mapStartSystem, // Verwende Startsystem aus der Karte
    path: [],
    configuration: null
  })
  
  const discoveredSystems = ref(savedDiscoveredSystems ? JSON.parse(savedDiscoveredSystems) : [mapStartSystem, 'footfall']) // Startsystem ist immer entdeckt
  const selectedSystem = ref(null)
  const turnNumber = ref(1)
  const fogOfWarEnabled = ref(true)
  const editMode = ref(false)
  const starlaneMode = ref(false)
  
  // Player Mode - disables travel and edit functions
  const isPlayerMode = ref(localStorage.getItem('playerMode') === 'true')
  
  // Current campaign (main or side)
  const currentCampaign = ref(localStorage.getItem('currentCampaign') || 'main')
  
  // Remote data sync
  const remoteDataUrl = ref(localStorage.getItem('remoteDataUrl') || '')
  const lastSyncTime = ref(localStorage.getItem('lastSyncTime') || null)
  
  // Auto-save game state to localStorage with debouncing
  let saveTimeout = null
  watch(playerShip, (newVal) => {
    // Debounce saves to reduce CPU load
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      localStorage.setItem('playerShip', JSON.stringify(newVal))
    }, 1000) // Save after 1 second of no changes
  }, { deep: true })
  
  let discoveredSaveTimeout = null
  watch(discoveredSystems, (newVal) => {
    // Debounce saves to reduce CPU load
    clearTimeout(discoveredSaveTimeout)
    discoveredSaveTimeout = setTimeout(() => {
      localStorage.setItem('discoveredSystems', JSON.stringify(newVal))
    }, 1000) // Save after 1 second of no changes
  }, { deep: true })
  
  // System importance (0-3 stars)
  const systemImportance = ref({})
  
  // NPCs per system
  const systemNPCs = ref({})
  
  // System notes
  const systemNotes = ref({})
  
  // Planetary systems data (planets, resources, points of interest)
  // Initialize with priority: localStorage > map data > empty object
  let initialPlanets = {}
  
  // First check localStorage
  const storedPlanets = localStorage.getItem('systemPlanets')
  if (storedPlanets) {
    try {
      initialPlanets = JSON.parse(storedPlanets)
      console.log('Loaded systemPlanets from localStorage:', Object.keys(initialPlanets).length, 'systems')
    } catch (e) {
      console.error('Error parsing stored systemPlanets:', e)
    }
  }
  
  // If no localStorage data but map has planets, use those
  if (Object.keys(initialPlanets).length === 0 && initialMap.systemPlanets) {
    initialPlanets = initialMap.systemPlanets
    console.log('Loaded systemPlanets from map:', Object.keys(initialPlanets).length, 'systems')
    // Save to localStorage for persistence
    localStorage.setItem('systemPlanets', JSON.stringify(initialPlanets))
  }
  
  const systemPlanets = ref(initialPlanets)
  
  // Debug helper
  window.debugSystemPlanets = () => {
    console.log('Current systemPlanets:', systemPlanets.value)
    console.log('localStorage systemPlanets:', localStorage.getItem('systemPlanets'))
  }
  
  // Ship status (hull, crew, morale)
  const shipStatus = ref(null)
  
  const isSystemDiscovered = (systemId) => {
    if (!fogOfWarEnabled.value) return true
    return discoveredSystems.value.includes(systemId)
  }
  
  const toggleFogOfWar = () => {
    fogOfWarEnabled.value = !fogOfWarEnabled.value
  }
  
  const toggleEditMode = () => {
    editMode.value = !editMode.value
    if (editMode.value) {
      Notify.create({
        type: 'info',
        message: 'Edit-Modus aktiviert',
        position: 'top'
      })
    } else {
      // Disable starlane mode when exiting edit mode
      starlaneMode.value = false
      Notify.create({
        type: 'info', 
        message: 'Edit-Modus deaktiviert',
        position: 'top'
      })
    }
  }
  
  const toggleStarlaneMode = () => {
    starlaneMode.value = !starlaneMode.value
  }
  
  const setSystemImportance = (systemId, importance) => {
    if (importance === 0) {
      delete systemImportance.value[systemId]
    } else {
      systemImportance.value[systemId] = Math.min(3, Math.max(0, importance))
    }
    // Save to localStorage
    localStorage.setItem('systemImportance', JSON.stringify(systemImportance.value))
  }
  
  const getSystemImportance = (systemId) => {
    return systemImportance.value[systemId] || 0
  }
  
  // Load importance from localStorage on init
  const loadedImportance = localStorage.getItem('systemImportance')
  if (loadedImportance) {
    systemImportance.value = JSON.parse(loadedImportance)
  }
  
  // NPC Management
  const addNPC = (systemId, npc) => {
    if (!systemNPCs.value[systemId]) {
      systemNPCs.value[systemId] = []
    }
    const newNPC = {
      id: Date.now(),
      name: npc.name,
      role: npc.role || '',
      faction: npc.faction || '',
      status: npc.status || 'neutral', // friend, neutral, enemy
      notes: npc.notes || ''
    }
    systemNPCs.value[systemId].push(newNPC)
    saveNPCsToLocalStorage()
    return newNPC
  }
  
  const updateNPC = (systemId, npcId, updates) => {
    if (!systemNPCs.value[systemId]) return
    
    const npc = systemNPCs.value[systemId].find(n => n.id === npcId)
    if (npc) {
      Object.assign(npc, updates)
      saveNPCsToLocalStorage()
    }
  }
  
  const removeNPC = (systemId, npcId) => {
    if (!systemNPCs.value[systemId]) return
    
    systemNPCs.value[systemId] = systemNPCs.value[systemId].filter(n => n.id !== npcId)
    saveNPCsToLocalStorage()
  }
  
  const getSystemNPCs = (systemId) => {
    return systemNPCs.value[systemId] || []
  }
  
  const saveNPCsToLocalStorage = () => {
    localStorage.setItem('systemNPCs', JSON.stringify(systemNPCs.value))
  }
  
  // Load NPCs from localStorage on init
  const loadedNPCs = localStorage.getItem('systemNPCs')
  if (loadedNPCs) {
    systemNPCs.value = JSON.parse(loadedNPCs)
  }
  
  // System Notes Management
  const setSystemNotes = (systemId, notes) => {
    if (!notes || notes.trim() === '') {
      delete systemNotes.value[systemId]
    } else {
      systemNotes.value[systemId] = notes
    }
    // Also save to old localStorage format for compatibility
    localStorage.setItem(`system-notes-${systemId}`, notes || '')
    // Save to new consolidated format
    localStorage.setItem('systemNotes', JSON.stringify(systemNotes.value))
  }
  
  const getSystemNotes = (systemId) => {
    return systemNotes.value[systemId] || ''
  }
  
  // Load all system notes from localStorage on init
  const loadSystemNotesFromLocalStorage = () => {
    // First try to load from consolidated format
    const loadedNotes = localStorage.getItem('systemNotes')
    if (loadedNotes) {
      systemNotes.value = JSON.parse(loadedNotes)
    } else {
      // Migrate from old format (individual keys per system)
      const allKeys = Object.keys(localStorage)
      const notesKeys = allKeys.filter(key => key.startsWith('system-notes-'))
      notesKeys.forEach(key => {
        const systemId = key.replace('system-notes-', '')
        const notes = localStorage.getItem(key)
        if (notes) {
          systemNotes.value[systemId] = notes
        }
      })
      // Save in new format
      if (Object.keys(systemNotes.value).length > 0) {
        localStorage.setItem('systemNotes', JSON.stringify(systemNotes.value))
      }
    }
  }
  
  loadSystemNotesFromLocalStorage()
  
  // Planetary System Management
  const setSystemPlanets = (systemId, planets) => {
    systemPlanets.value[systemId] = planets
    saveSystemPlanetsToLocalStorage()
  }
  
  const getSystemPlanets = (systemId) => {
    return systemPlanets.value[systemId] || []
  }
  
  const updateSystemPlanet = (systemId, planetIndex, updates) => {
    if (!systemPlanets.value[systemId]) return
    if (systemPlanets.value[systemId][planetIndex]) {
      Object.assign(systemPlanets.value[systemId][planetIndex], updates)
      saveSystemPlanetsToLocalStorage()
    }
  }

  // Prüft ob alle Planeten eines Systems erkundet wurden
  const isSystemFullyExplored = (systemId) => {
    const planets = systemPlanets.value[systemId]
    if (!planets || planets.length === 0) return false
    return planets.every(planet => planet.explored === true)
  }

  // Setzt den Erkundungsstatus eines Planeten
  const setPlanetExplored = (systemId, planetName, explored) => {
    const planets = systemPlanets.value[systemId]
    if (!planets) return
    const planetIndex = planets.findIndex(p => p.name === planetName)
    if (planetIndex !== -1) {
      // Create new array to trigger reactivity
      const updatedPlanets = [...planets]
      updatedPlanets[planetIndex] = { ...updatedPlanets[planetIndex], explored }
      systemPlanets.value[systemId] = updatedPlanets
      saveSystemPlanetsToLocalStorage()
    }
  }

  const saveSystemPlanetsToLocalStorage = () => {
    console.log('Saving systemPlanets to localStorage:', Object.keys(systemPlanets.value).length, 'systems')
    localStorage.setItem('systemPlanets', JSON.stringify(systemPlanets.value))
  }
  
  // Planets are already loaded during initialization above
  
  // Import system details from parsed data
  const importSystemDetails = (parsedSystems) => {
    let matchedCount = 0
    let unmatchedSystems = []
    
    Object.entries(parsedSystems).forEach(([systemName, data]) => {
      // Clean system name for better matching
      const cleanName = systemName.replace(/\s*Star System\s*$/i, '').trim()
      
      // Try to find matching system by name - check various formats
      const system = systems.value.find(s => {
        const sysNameLower = s.name.toLowerCase()
        const searchNameLower = cleanName.toLowerCase()
        
        // Direct match
        if (sysNameLower === searchNameLower) return true
        
        // Check if one contains the other
        if (sysNameLower.includes(searchNameLower) || searchNameLower.includes(sysNameLower)) return true
        
        // Check without special characters
        const sysNameClean = sysNameLower.replace(/[^a-z0-9]/g, '')
        const searchNameClean = searchNameLower.replace(/[^a-z0-9]/g, '')
        if (sysNameClean === searchNameClean) return true
        
        return false
      })
      
      if (system) {
        // Beim Import IMMER überschreiben (wie vom User gewünscht)
        setSystemPlanets(system.id, data.planets)
        matchedCount++
      } else {
        unmatchedSystems.push(cleanName)
        console.log('Could not find system:', cleanName)
      }
    })
    
    const message = unmatchedSystems.length > 0 
      ? `${matchedCount} von ${Object.keys(parsedSystems).length} Systemen importiert. Nicht gefunden: ${unmatchedSystems.join(', ')}`
      : `${matchedCount} Systeme erfolgreich importiert`
    
    Notify.create({
      type: unmatchedSystems.length > 0 ? 'warning' : 'positive',
      message: message,
      position: 'top',
      timeout: unmatchedSystems.length > 0 ? 5000 : 2500
    })
  }
  
  const selectSystem = (systemId) => {
    selectedSystem.value = systems.value.find(s => s.id === systemId)
  }
  
  const getConnectedSystems = (systemId) => {
    const connected = []
    hyperlanes.value.forEach(lane => {
      if (lane.from === systemId) {
        connected.push(lane.to)
      } else if (lane.to === systemId) {
        connected.push(lane.from)
      }
    })
    return connected
  }
  
  const moveShip = (targetSystemId) => {
    const connected = getConnectedSystems(playerShip.value.currentSystem)
    
    if (!connected.includes(targetSystemId)) {
      Notify.create({
        type: 'negative',
        message: 'Kein direkter Hyperraum-Korridor zu diesem System!'
      })
      return false
    }
    
    playerShip.value.currentSystem = targetSystemId
    
    if (!discoveredSystems.value.includes(targetSystemId)) {
      discoveredSystems.value.push(targetSystemId)
      Notify.create({
        type: 'positive',
        message: `System ${systems.value.find(s => s.id === targetSystemId).name} entdeckt!`
      })
    }
    
    const nearbySystemIds = getConnectedSystems(targetSystemId)
    nearbySystemIds.forEach(id => {
      if (!discoveredSystems.value.includes(id)) {
        const system = systems.value.find(s => s.id === id)
        if (system) {
          Notify.create({
            type: 'info',
            message: `Unbekanntes System in der Nähe entdeckt`
          })
        }
      }
    })
    
    turnNumber.value++
    return true
  }
  
  
  const saveToFile = () => {
    // Stelle sicher, dass die aktuelle Schiffskonfiguration im playerShip enthalten ist
    if (!playerShip.value.configuration) {
      const savedConfig = localStorage.getItem('playerShipConfiguration')
      if (savedConfig) {
        try {
          playerShip.value.configuration = JSON.parse(savedConfig)
        } catch (e) {
          console.error('Failed to load ship configuration for save:', e)
        }
      }
    }
    
    const gameState = {
      systems: systems.value,
      hyperlanes: hyperlanes.value,
      playerShip: playerShip.value,
      discoveredSystems: discoveredSystems.value,
      turnNumber: turnNumber.value
    }
    
    const dataStr = JSON.stringify(gameState, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `wh40k-save-turn${turnNumber.value}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    Notify.create({
      type: 'positive',
      message: 'Spielstand gespeichert'
    })
  }
  
  const loadFromFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const gameState = JSON.parse(event.target.result)
          
          // Speichere die aktuelle Schiffskonfiguration bevor wir sie überschreiben
          const currentShipConfig = localStorage.getItem('playerShipConfiguration')
          let preserveConfig = null
          if (currentShipConfig) {
            try {
              preserveConfig = JSON.parse(currentShipConfig)
            } catch (e) {
              console.error('Failed to parse current ship configuration:', e)
            }
          }
          
          systems.value = gameState.systems || systems.value
          hyperlanes.value = gameState.hyperlanes || hyperlanes.value
          playerShip.value = gameState.playerShip || playerShip.value
          discoveredSystems.value = gameState.discoveredSystems || discoveredSystems.value
          turnNumber.value = gameState.turnNumber || turnNumber.value
          
          // Spielstand hat IMMER Vorrang
          if (gameState.playerShip?.configuration) {
            // Verwende Konfiguration aus dem Spielstand
            console.log('Loading ship configuration from save game')
            // configuration ist bereits in playerShip.value durch Zeile 376
            
            // Aktualisiere auch localStorage mit der Spielstand-Config
            localStorage.setItem('playerShipConfiguration', JSON.stringify(gameState.playerShip.configuration))
          } else if (preserveConfig) {
            // Kein Config im Spielstand, aber aktuelle vorhanden - behalte sie
            playerShip.value.configuration = preserveConfig
            console.log('No ship configuration in save game, keeping current')
          } else {
            console.log('No ship configuration available')
          }
          
          Notify.create({
            type: 'positive',
            message: 'Spielstand geladen'
          })
        } catch (error) {
          Notify.create({
            type: 'negative',
            message: 'Fehler beim Laden der Datei'
          })
        }
      }
      
      reader.readAsText(file)
    }
    
    input.click()
  }
  
  // Set start system for the map
  const currentStartSystem = ref(mapStartSystem)
  const setStartSystem = (systemId) => {
    currentStartSystem.value = systemId
    // Save to localStorage as backup
    localStorage.setItem('currentStartSystem', systemId)
    // This will be saved with the map when saveMap is called
  }
  
  const getStartSystem = () => currentStartSystem.value
  
  // Check if we have a saved start system in localStorage (backup)
  const savedStartSystem = localStorage.getItem('currentStartSystem')
  if (savedStartSystem && systems.value.find(s => s.id === savedStartSystem)) {
    currentStartSystem.value = savedStartSystem
    // Don't reset ship position on reload - only use saved position from localStorage
  }
  
  // Ship configuration management
  const saveShipConfiguration = (config) => {
    playerShip.value.configuration = config
    localStorage.setItem('playerShipConfiguration', JSON.stringify(config))
  }
  
  const loadShipConfiguration = () => {
    const saved = localStorage.getItem('playerShipConfiguration')
    if (saved) {
      try {
        playerShip.value.configuration = JSON.parse(saved)
        return playerShip.value.configuration
      } catch (e) {
        console.error('Failed to load ship configuration:', e)
      }
    }
    return null
  }
  
  const getShipConfiguration = () => playerShip.value.configuration
  
  // Player Mode Functions
  const setPlayerMode = (enabled) => {
    isPlayerMode.value = enabled
    localStorage.setItem('playerMode', enabled.toString())
    if (enabled) {
      // Disable edit mode when entering player mode
      editMode.value = false
      starlaneMode.value = false
    }
  }
  
  // Campaign Management
  const setCampaign = (campaign) => {
    const wasChanged = currentCampaign.value !== campaign
    currentCampaign.value = campaign
    localStorage.setItem('currentCampaign', campaign)
    // Load campaign-specific save, only sync if campaign actually changed
    loadCampaignData(campaign, wasChanged)
  }
  
  // Sync with remote data (GitHub Gist or other source)
  const syncWithRemote = async (options = { updateExistingNPCs: false }) => {
    if (!remoteDataUrl.value) {
      console.warn('No remote data URL configured')
      return false
    }
    
    try {
      console.log('Syncing from URL:', remoteDataUrl.value)
      
      // Check if we need authentication (for private Gists)
      const token = localStorage.getItem('githubToken')
      const fetchOptions = {}
      if (token && remoteDataUrl.value.includes('api.github.com')) {
        fetchOptions.headers = {
          'Authorization': `token ${token}`
        }
      }
      
      const response = await fetch(remoteDataUrl.value, fetchOptions)
      if (!response.ok) throw new Error('Failed to fetch remote data')
      
      const responseData = await response.json()
      
      // Determine if this is a Gist API response or direct JSON
      let remoteData = null
      
      if (responseData.files) {
        // This is a Gist API response - extract campaign file
        const campaignFile = Object.keys(responseData.files).find(
          filename => filename.includes('campaign')
        )
        
        if (campaignFile && responseData.files[campaignFile].content) {
          console.log('Found campaign file in Gist API response:', campaignFile)
          remoteData = JSON.parse(responseData.files[campaignFile].content)
        } else {
          throw new Error('No campaign file found in Gist')
        }
      } else {
        // Direct JSON response (raw URL or direct JSON file)
        console.log('Using direct JSON response')
        remoteData = responseData
      }
      
      console.log('Remote data received:', {
        systems: remoteData.systems?.length || 0,
        hyperlanes: remoteData.hyperlanes?.length || 0,
        discoveredSystems: remoteData.discoveredSystems?.length || 0
      })
      
      // Save ALL local notes - they are never touched by sync
      const localNotes = { ...systemNotes.value }
      
      // Save local NPCs for intelligent merge
      const localNPCs = { ...systemNPCs.value }
      
      // Update game state from remote
      if (remoteData.systems) systems.value = remoteData.systems
      if (remoteData.hyperlanes) hyperlanes.value = remoteData.hyperlanes
      if (remoteData.systemPlanets) systemPlanets.value = remoteData.systemPlanets
      if (remoteData.discoveredSystems) discoveredSystems.value = remoteData.discoveredSystems
      
      // Update full ship data including configuration
      if (remoteData.playerShip) {
        playerShip.value = remoteData.playerShip
      }
      
      // Update system importance (Sterne-Bewertungen)
      if (remoteData.systemImportance) {
        systemImportance.value = remoteData.systemImportance
      }
      
      // Intelligent NPC merge
      if (remoteData.systemNPCs) {
        const mergedNPCs = {}
        
        // For each system
        const allSystemIds = new Set([
          ...Object.keys(remoteData.systemNPCs || {}),
          ...Object.keys(localNPCs || {})
        ])
        
        allSystemIds.forEach(systemId => {
          mergedNPCs[systemId] = []
          const remoteNPCsForSystem = remoteData.systemNPCs[systemId] || []
          const localNPCsForSystem = localNPCs[systemId] || []
          
          // Add all remote NPCs
          mergedNPCs[systemId].push(...remoteNPCsForSystem)
          
          // Add local NPCs that don't exist in remote (by name)
          const remoteNPCNames = remoteNPCsForSystem.map(npc => npc.name.toLowerCase())
          localNPCsForSystem.forEach(localNPC => {
            const exists = remoteNPCNames.includes(localNPC.name.toLowerCase())
            
            if (!exists) {
              // This is a player-created NPC, keep it
              mergedNPCs[systemId].push(localNPC)
            } else if (options.updateExistingNPCs) {
              // Replace local version with remote version (optional)
              const index = mergedNPCs[systemId].findIndex(
                npc => npc.name.toLowerCase() === localNPC.name.toLowerCase()
              )
              if (index !== -1) {
                mergedNPCs[systemId][index] = remoteNPCsForSystem.find(
                  npc => npc.name.toLowerCase() === localNPC.name.toLowerCase()
                )
              }
            }
          })
        })
        
        systemNPCs.value = mergedNPCs
      }
      
      // Update turn number
      if (remoteData.turnNumber) {
        turnNumber.value = remoteData.turnNumber
      }
      
      // Restore ALL local notes - they are completely independent
      systemNotes.value = localNotes
      
      lastSyncTime.value = new Date().toISOString()
      localStorage.setItem('lastSyncTime', lastSyncTime.value)
      
      // Trigger map redraw after sync
      window.dispatchEvent(new Event('mapDataChanged'))
      
      // Save synced data to localStorage so it persists
      localStorage.setItem('systems', JSON.stringify(systems.value))
      localStorage.setItem('hyperlanes', JSON.stringify(hyperlanes.value))
      localStorage.setItem('systemPlanets', JSON.stringify(systemPlanets.value))
      localStorage.setItem('discoveredSystems', JSON.stringify(discoveredSystems.value))
      localStorage.setItem('playerShip', JSON.stringify(playerShip.value))
      
      Notify.create({
        type: 'positive',
        message: 'Kampagnendaten erfolgreich synchronisiert',
        caption: `${systems.value.length} Systeme geladen`,
        position: 'top'
      })
      
      return true
    } catch (error) {
      console.error('Sync failed:', error)
      Notify.create({
        type: 'negative',
        message: 'Synchronisation fehlgeschlagen: ' + error.message,
        position: 'top'
      })
      return false
    }
  }
  
  // Export ship configuration for players
  const exportShipData = () => {
    const shipData = {
      configuration: playerShip.value.configuration,
      customComponents: localStorage.getItem('customShipComponents') ? 
        JSON.parse(localStorage.getItem('customShipComponents')) : [],
      exportDate: new Date().toISOString(),
      playerNotes: Object.entries(systemNotes.value)
        .filter(([_, note]) => note && note.startsWith('PLAYER:'))
        .reduce((acc, [key, note]) => ({ ...acc, [key]: note }), {})
    }
    
    return shipData
  }
  
  // Import ship configuration from players
  const importShipData = (shipData) => {
    if (!shipData || !shipData.configuration) {
      throw new Error('Invalid ship data')
    }
    
    // Only import if not in player mode (only GM can import)
    if (isPlayerMode.value) {
      throw new Error('Ship import not allowed in player mode')
    }
    
    playerShip.value.configuration = shipData.configuration
    saveShipConfiguration()
    
    if (shipData.customComponents) {
      localStorage.setItem('customShipComponents', JSON.stringify(shipData.customComponents))
    }
    
    // Merge player notes (prefix with IMPORTED:)
    if (shipData.playerNotes) {
      Object.entries(shipData.playerNotes).forEach(([systemId, note]) => {
        const existingNote = systemNotes.value[systemId] || ''
        systemNotes.value[systemId] = existingNote + '\n[IMPORTED]: ' + note
      })
    }
    
    Notify.create({
      type: 'positive',
      message: 'Schiffsdaten erfolgreich importiert',
      position: 'top'
    })
  }
  
  // Load campaign-specific data
  const loadCampaignData = async (campaign, shouldSync = false) => {
    const campaignKey = `campaign_${campaign}`
    const savedData = localStorage.getItem(campaignKey)
    
    if (savedData) {
      const data = JSON.parse(savedData)
      systems.value = data.systems || systems.value
      hyperlanes.value = data.hyperlanes || hyperlanes.value
      systemPlanets.value = data.systemPlanets || systemPlanets.value
      discoveredSystems.value = data.discoveredSystems || discoveredSystems.value
      playerShip.value = data.playerShip || playerShip.value
    }
    
    // Only sync if explicitly requested (when switching campaigns, not on browser reload)
    if (shouldSync && remoteDataUrl.value) {
      await syncWithRemote()
    }
  }
  
  // Don't auto-sync when player mode is enabled - manual sync only
  // This gives users control over when to sync data
  
  // Load ship configuration on init
  loadShipConfiguration()
  
  return {
    systems,
    hyperlanes,
    playerShip,
    discoveredSystems,
    selectedSystem,
    turnNumber,
    fogOfWarEnabled,
    editMode,
    starlaneMode,
    systemImportance,
    systemNPCs,
    systemNotes,
    systemPlanets,
    shipStatus,
    isSystemDiscovered,
    toggleFogOfWar,
    toggleEditMode,
    toggleStarlaneMode,
    selectSystem,
    getConnectedSystems,
    moveShip,
    saveToFile,
    loadFromFile,
    setSystemImportance,
    getSystemImportance,
    addNPC,
    updateNPC,
    removeNPC,
    getSystemNPCs,
    setSystemNotes,
    getSystemNotes,
    setSystemPlanets,
    getSystemPlanets,
    updateSystemPlanet,
    isSystemFullyExplored,
    setPlanetExplored,
    importSystemDetails,
    setStartSystem,
    getStartSystem,
    saveShipConfiguration,
    loadShipConfiguration,
    getShipConfiguration,
    // Player mode and sync
    isPlayerMode,
    currentCampaign,
    remoteDataUrl,
    lastSyncTime,
    setPlayerMode,
    setCampaign,
    syncWithRemote,
    exportShipData,
    importShipData,
    loadCampaignData
  }
})