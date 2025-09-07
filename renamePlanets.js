#!/usr/bin/env node

// Skript zum Umbenennen generischer Planetennamen
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { renameGenericPlanets, isGenericName } from './src/utils/planetNameGenerator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Verwende die angereicherte Datei als Basis
const inputFile = path.join(__dirname, 'saves/maps/map_Koronus Weite_ENRICHED_2025-08-31T06-19-31.json')
const outputFile = path.join(__dirname, 'saves/maps/map_Koronus Weite_FINAL_' + new Date().toISOString().replace(/:/g, '-').split('.')[0] + '.json')

console.log('Lade angereicherte Kartendaten von:', inputFile)

try {
  // Lade die Daten
  const mapData = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  
  console.log(`Gefunden: ${Object.keys(mapData.systemPlanets).length} Systeme mit Planetendaten`)
  
  // Statistiken
  let totalPlanets = 0
  let renamedPlanets = 0
  
  // Benenne generische Planeten um
  console.log('\nBenenne generische Planetennamen um...')
  const renamedSystemPlanets = {}
  
  for (const [systemId, planets] of Object.entries(mapData.systemPlanets)) {
    // Finde den Systemnamen
    const system = mapData.systems.find(s => s.id === systemId)
    const systemName = system?.name || systemId
    
    console.log(`\nSystem: ${systemName}`)
    
    const renamedPlanetsList = renameGenericPlanets(planets, systemName)
    
    // Zeige Umbenennungen
    for (let i = 0; i < planets.length; i++) {
      totalPlanets++
      if (planets[i].name !== renamedPlanetsList[i].name) {
        console.log(`  - "${planets[i].name}" → "${renamedPlanetsList[i].name}"`)
        renamedPlanets++
        
        // Update Flavor-Text mit neuem Namen
        if (renamedPlanetsList[i].flavorText) {
          renamedPlanetsList[i].flavorText = renamedPlanetsList[i].flavorText.replace(
            planets[i].name,
            renamedPlanetsList[i].name
          )
        }
      }
    }
    
    renamedSystemPlanets[systemId] = renamedPlanetsList
  }
  
  // Erstelle finale Kartendaten
  const finalMapData = {
    ...mapData,
    systemPlanets: renamedSystemPlanets,
    renamedAt: new Date().toISOString()
  }
  
  // Speichere die finale Version
  fs.writeFileSync(outputFile, JSON.stringify(finalMapData, null, 2))
  
  console.log('\n' + '='.repeat(50))
  console.log('✓ Finale Karte gespeichert als:', outputFile)
  console.log('\nStatistiken:')
  console.log(`- Gesamt Planeten: ${totalPlanets}`)
  console.log(`- Umbenannte Planeten: ${renamedPlanets}`)
  console.log(`- Erfolgsquote: ${((renamedPlanets/totalPlanets)*100).toFixed(1)}%`)
  
} catch (error) {
  console.error('Fehler beim Verarbeiten der Kartendaten:', error)
  process.exit(1)
}