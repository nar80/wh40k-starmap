import { Notify } from 'quasar'

/**
 * File Manager für Import/Export Operationen
 * Nutzt File System Access API wenn verfügbar (Chrome/Edge)
 * Fallback auf klassischen Download für andere Browser
 */

// Check if File System Access API is available (Chrome/Edge)
const hasFileSystemAccess = 'showSaveFilePicker' in window

// Detect browser
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
const isEdge = /Edg/.test(navigator.userAgent)
const supportsFilePicker = isChrome || isEdge

/**
 * Speichert eine Karte als JSON Datei
 */
export async function saveMapToFile(mapData, suggestedName = 'map') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const fileName = `map_${suggestedName}_${timestamp}.json`
  const jsonContent = JSON.stringify(mapData, null, 2)
  
  if (hasFileSystemAccess) {
    try {
      // Moderne File System API (Chrome/Edge)
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'JSON Map Files',
          accept: { 'application/json': ['.json'] }
        }],
        startIn: 'downloads'
      })
      
      const writable = await handle.createWritable()
      await writable.write(jsonContent)
      await writable.close()
      
      Notify.create({
        type: 'positive',
        message: `Karte gespeichert als ${fileName}`,
        position: 'top'
      })
      
      return true
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled
        return false
      }
      console.error('Save error:', err)
      // Fallback to download
    }
  }
  
  // Fallback: Traditional download
  downloadFile(jsonContent, fileName, 'application/json')
  return true
}

/**
 * Speichert einen Spielstand als JSON Datei
 */
export async function saveGameToFile(gameData, turnNumber = 1) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const fileName = `game_turn${turnNumber}_${timestamp}.json`
  const jsonContent = JSON.stringify(gameData, null, 2)
  
  if (hasFileSystemAccess) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'JSON Game Save Files',
          accept: { 'application/json': ['.json'] }
        }],
        startIn: 'downloads'
      })
      
      const writable = await handle.createWritable()
      await writable.write(jsonContent)
      await writable.close()
      
      Notify.create({
        type: 'positive',
        message: `Spielstand gespeichert als ${fileName}`,
        position: 'top'
      })
      
      return true
    } catch (err) {
      if (err.name === 'AbortError') {
        return false
      }
      console.error('Save error:', err)
    }
  }
  
  // Fallback
  downloadFile(jsonContent, fileName, 'application/json')
  return true
}

/**
 * Lädt eine JSON Datei
 */
export async function loadJsonFile(acceptTypes = '.json') {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = acceptTypes
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }
      
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        Notify.create({
          type: 'positive',
          message: `Datei ${file.name} geladen`,
          position: 'top'
        })
        
        resolve({
          data,
          fileName: file.name
        })
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: 'Fehler beim Laden der Datei',
          position: 'top'
        })
        reject(error)
      }
    }
    
    input.click()
  })
}

/**
 * Fallback Download-Funktion
 */
function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100)
  
  Notify.create({
    type: 'positive',
    message: `Datei ${fileName} wurde heruntergeladen`,
    position: 'top',
    timeout: 3000
  })
}

/**
 * Erstellt ein Backup aller Daten
 */
export async function createFullBackup(gameStore, mapStore) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    currentMap: {
      name: mapStore.currentMapName,
      systems: gameStore.systems,
      hyperlanes: gameStore.hyperlanes
    },
    savedMaps: mapStore.savedMaps,
    gameState: {
      playerShip: gameStore.playerShip,
      discoveredSystems: gameStore.discoveredSystems,
      turnNumber: gameStore.turnNumber,
      systemImportance: gameStore.systemImportance,
      systemNPCs: gameStore.systemNPCs
    }
  }
  
  const fileName = `wh40k_backup_${timestamp}.json`
  const jsonContent = JSON.stringify(backup, null, 2)
  
  // Try to use File System API if available
  if (supportsFilePicker && hasFileSystemAccess) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'Backup JSON Files',
          accept: { 'application/json': ['.json'] }
        }],
        startIn: 'downloads'
      })
      
      const writable = await handle.createWritable()
      await writable.write(jsonContent)
      await writable.close()
      
      Notify.create({
        type: 'positive',
        message: `Backup gespeichert als ${fileName}`,
        position: 'top'
      })
      
      return true
    } catch (err) {
      if (err.name === 'AbortError') {
        return false
      }
      // Fallback to download
    }
  }
  
  // Fallback for Firefox/Safari
  downloadFile(jsonContent, fileName, 'application/json')
  
  Notify.create({
    type: 'positive',
    message: 'Vollständiges Backup erstellt',
    position: 'top',
    timeout: 3000
  })
}

/**
 * Stellt Daten aus einem Backup wieder her
 */
export async function restoreFromBackup(gameStore, mapStore) {
  try {
    const { data } = await loadJsonFile('.json')
    
    if (!data.version || !data.currentMap) {
      throw new Error('Ungültiges Backup-Format')
    }
    
    // Restore map data
    gameStore.systems = data.currentMap.systems
    gameStore.hyperlanes = data.currentMap.hyperlanes
    mapStore.currentMapName = data.currentMap.name
    
    // Restore saved maps
    if (data.savedMaps) {
      Object.assign(mapStore.savedMaps, data.savedMaps)
      localStorage.setItem('savedMaps', JSON.stringify(mapStore.savedMaps))
    }
    
    // Restore game state
    if (data.gameState) {
      Object.assign(gameStore.playerShip, data.gameState.playerShip)
      gameStore.discoveredSystems = data.gameState.discoveredSystems
      gameStore.turnNumber = data.gameState.turnNumber
      
      if (data.gameState.systemImportance) {
        Object.assign(gameStore.systemImportance, data.gameState.systemImportance)
        localStorage.setItem('systemImportance', JSON.stringify(gameStore.systemImportance))
      }
      
      if (data.gameState.systemNPCs) {
        Object.assign(gameStore.systemNPCs, data.gameState.systemNPCs)
        localStorage.setItem('systemNPCs', JSON.stringify(gameStore.systemNPCs))
      }
    }
    
    // Trigger UI update
    window.dispatchEvent(new Event('mapDataChanged'))
    
    Notify.create({
      type: 'positive',
      message: 'Backup erfolgreich wiederhergestellt',
      position: 'top'
    })
    
    return true
  } catch (error) {
    console.error('Restore error:', error)
    Notify.create({
      type: 'negative',
      message: 'Fehler beim Wiederherstellen des Backups',
      position: 'top'
    })
    return false
  }
}