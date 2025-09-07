#!/usr/bin/env node

// Standalone-Skript zum Anreichern der Kartendaten mit erweiterten Planetendaten
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { enrichAllSystems } from './src/utils/enrichPlanetaryData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Lade die Export-Datei
const inputFile = path.join(__dirname, 'saves/maps/map_Koronus Weite_2025-08-31T05-54-27.json')
const outputFile = path.join(__dirname, 'saves/maps/map_Koronus Weite_ENRICHED_' + new Date().toISOString().replace(/:/g, '-').split('.')[0] + '.json')

console.log('Lade Kartendaten von:', inputFile)

try {
  // Lade die Originaldaten
  const mapData = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
  
  console.log(`Gefunden: ${Object.keys(mapData.systemPlanets).length} Systeme mit Planetendaten`)
  
  // Reichere die Planetendaten an
  console.log('Reichere Planetendaten an...')
  const enrichedPlanets = enrichAllSystems(mapData.systemPlanets)
  
  // Erstelle neue Kartendaten mit angereicherten Planeten
  const enrichedMapData = {
    ...mapData,
    systemPlanets: enrichedPlanets,
    enrichedAt: new Date().toISOString(),
    originalFile: inputFile
  }
  
  // Speichere die angereicherte Version
  fs.writeFileSync(outputFile, JSON.stringify(enrichedMapData, null, 2))
  
  console.log('✓ Angereicherte Karte gespeichert als:', outputFile)
  
  // Statistiken
  let totalPlanets = 0
  let planetsWithFlavor = 0
  let habitablePlanets = 0
  let colonizedPlanets = 0
  
  for (const planets of Object.values(enrichedPlanets)) {
    for (const planet of planets) {
      totalPlanets++
      if (planet.flavorText) planetsWithFlavor++
      if (planet.isHabitable) habitablePlanets++
      if (planet.hasColony) colonizedPlanets++
    }
  }
  
  console.log('\nStatistiken:')
  console.log(`- Gesamt Planeten: ${totalPlanets}`)
  console.log(`- Mit Flavor-Text: ${planetsWithFlavor}`)
  console.log(`- Bewohnbar: ${habitablePlanets}`)
  console.log(`- Mit Kolonien: ${colonizedPlanets}`)
  
} catch (error) {
  console.error('Fehler beim Verarbeiten der Kartendaten:', error)
  process.exit(1)
}