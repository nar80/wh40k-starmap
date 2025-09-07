import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { koronusSystems, koronusHyperlanes } from '../data/koronusSystems'
import { useGameStore } from './gameStore'

export const useMapStore = defineStore('map', () => {
  const savedMaps = ref({})
  const currentMapName = ref('default')
  const hasUnsavedChanges = ref(false)
  const favoriteMapNames = ref([])
  
  // Load saved maps from localStorage on init
  const loadedMaps = localStorage.getItem('savedMaps')
  if (loadedMaps) {
    savedMaps.value = JSON.parse(loadedMaps)
  }
  
  const loadedCurrentMap = localStorage.getItem('currentMapName')
  if (loadedCurrentMap) {
    currentMapName.value = loadedCurrentMap
  }
  
  // Load favorite maps
  const loadedFavorites = localStorage.getItem('favoriteMapNames')
  if (loadedFavorites) {
    favoriteMapNames.value = JSON.parse(loadedFavorites)
  }
  
  const saveMap = (name, systems, hyperlanes, systemPlanets = null, startSystem = null, discoveredSystems = null) => {
    const mapData = {
      name,
      systems: JSON.parse(JSON.stringify(systems)),
      hyperlanes: JSON.parse(JSON.stringify(hyperlanes)),
      startSystem: startSystem || 'port-wander', // Standard-Startsystem
      savedAt: new Date().toISOString()
    }
    
    // Include planet data if provided
    if (systemPlanets) {
      mapData.systemPlanets = JSON.parse(JSON.stringify(systemPlanets))
    }
    
    // Include discovered systems if provided (for predefined campaign starts)
    if (discoveredSystems && discoveredSystems.length > 0) {
      mapData.discoveredSystems = JSON.parse(JSON.stringify(discoveredSystems))
    }
    
    savedMaps.value[name] = mapData
    
    currentMapName.value = name
    hasUnsavedChanges.value = false
    
    localStorage.setItem('savedMaps', JSON.stringify(savedMaps.value))
    localStorage.setItem('currentMapName', name)
    localStorage.setItem('lastUsedMap', name)
    
    Notify.create({
      type: 'positive',
      message: `Karte "${name}" gespeichert`,
      position: 'top'
    })
  }
  
  const loadMap = (name) => {
    const map = savedMaps.value[name]
    if (!map) {
      Notify.create({
        type: 'negative',
        message: `Karte "${name}" nicht gefunden`,
        position: 'top'
      })
      return null
    }
    
    currentMapName.value = name
    hasUnsavedChanges.value = false
    localStorage.setItem('currentMapName', name)
    localStorage.setItem('lastUsedMap', name)
    
    Notify.create({
      type: 'positive',
      message: `Karte "${name}" geladen`,
      position: 'top'
    })
    
    return {
      systems: JSON.parse(JSON.stringify(map.systems)),
      hyperlanes: JSON.parse(JSON.stringify(map.hyperlanes)),
      startSystem: map.startSystem || 'port-wander',
      systemPlanets: map.systemPlanets ? JSON.parse(JSON.stringify(map.systemPlanets)) : null,
      discoveredSystems: map.discoveredSystems ? JSON.parse(JSON.stringify(map.discoveredSystems)) : null
    }
  }
  
  const deleteMap = (name) => {
    if (name === 'default') {
      Notify.create({
        type: 'negative',
        message: 'Die Standard-Karte kann nicht gelöscht werden',
        position: 'top'
      })
      return
    }
    
    delete savedMaps.value[name]
    localStorage.setItem('savedMaps', JSON.stringify(savedMaps.value))
    
    if (currentMapName.value === name) {
      currentMapName.value = 'default'
      localStorage.setItem('currentMapName', 'default')
    }
    
    Notify.create({
      type: 'warning',
      message: `Karte "${name}" gelöscht`,
      position: 'top'
    })
  }
  
  const exportMap = (name) => {
    const map = savedMaps.value[name] || {
      name: 'default',
      systems: koronusSystems,
      hyperlanes: koronusHyperlanes
    }
    
    const dataStr = JSON.stringify(map, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `wh40k-map-${name}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    Notify.create({
      type: 'positive',
      message: `Karte "${name}" exportiert`,
      position: 'top'
    })
  }
  
  const importMap = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const map = JSON.parse(event.target.result)
          
          if (!map.systems || !map.hyperlanes) {
            throw new Error('Ungültiges Kartenformat')
          }
          
          const name = map.name || file.name.replace('.json', '')
          savedMaps.value[name] = {
            ...map,
            name,
            savedAt: new Date().toISOString()
          }
          
          localStorage.setItem('savedMaps', JSON.stringify(savedMaps.value))
          
          Notify.create({
            type: 'positive',
            message: `Karte "${name}" importiert`,
            position: 'top'
          })
          
          resolve(name)
        } catch (error) {
          Notify.create({
            type: 'negative',
            message: 'Fehler beim Importieren der Karte',
            position: 'top'
          })
          reject(error)
        }
      }
      
      reader.readAsText(file)
    })
  }
  
  const getMapList = () => {
    return Object.keys(savedMaps.value).map(name => ({
      name,
      savedAt: savedMaps.value[name].savedAt
    }))
  }
  
  const markAsChanged = () => {
    hasUnsavedChanges.value = true
    // Auto-save to localStorage when changes are made
    if (currentMapName.value && currentMapName.value !== 'default') {
      autoSave()
    }
  }
  
  const autoSave = () => {
    const gameStore = useGameStore()
    savedMaps.value[currentMapName.value] = {
      name: currentMapName.value,
      systems: JSON.parse(JSON.stringify(gameStore.systems)),
      hyperlanes: JSON.parse(JSON.stringify(gameStore.hyperlanes)),
      systemPlanets: gameStore.systemPlanets ? JSON.parse(JSON.stringify(gameStore.systemPlanets)) : {},
      startSystem: gameStore.getStartSystem ? gameStore.getStartSystem() : 'port-wander',
      discoveredSystems: gameStore.discoveredSystems ? JSON.parse(JSON.stringify(gameStore.discoveredSystems)) : [],
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('savedMaps', JSON.stringify(savedMaps.value))
    hasUnsavedChanges.value = false
  }
  
  const getDefaultMap = () => {
    return {
      systems: JSON.parse(JSON.stringify(koronusSystems)),
      hyperlanes: JSON.parse(JSON.stringify(koronusHyperlanes))
    }
  }
  
  const getLastUsedMap = () => {
    const lastUsed = localStorage.getItem('lastUsedMap')
    if (lastUsed && savedMaps.value[lastUsed]) {
      return loadMap(lastUsed)
    }
    return getDefaultMap()
  }
  
  const toggleFavorite = (mapName) => {
    const index = favoriteMapNames.value.indexOf(mapName)
    if (index > -1) {
      favoriteMapNames.value.splice(index, 1)
    } else {
      // Maximum 3 favorites
      if (favoriteMapNames.value.length >= 3) {
        favoriteMapNames.value.shift() // Remove oldest favorite
      }
      favoriteMapNames.value.push(mapName)
    }
    localStorage.setItem('favoriteMapNames', JSON.stringify(favoriteMapNames.value))
  }
  
  const isFavorite = (mapName) => {
    return favoriteMapNames.value.includes(mapName)
  }
  
  const getFavorites = () => {
    return favoriteMapNames.value.map(name => {
      if (name === 'default') {
        return { name: 'default', displayName: 'Standard Koronus' }
      }
      return { 
        name, 
        displayName: name,
        savedAt: savedMaps.value[name]?.savedAt
      }
    })
  }
  
  return {
    savedMaps,
    currentMapName,
    hasUnsavedChanges,
    favoriteMapNames,
    saveMap,
    loadMap,
    deleteMap,
    exportMap,
    importMap,
    getMapList,
    markAsChanged,
    getDefaultMap,
    getLastUsedMap,
    toggleFavorite,
    isFavorite,
    getFavorites
  }
})