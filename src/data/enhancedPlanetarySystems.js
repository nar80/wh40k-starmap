// Enhanced Planetary Systems mit detaillierten Daten und Flavor-Texten
// Für WH40K Rogue Trader Koronus Expanse

export const enhancedPlanetarySystemTemplate = {
  star: {
    name: String,
    type: String, // 'Gelber Zwerg', 'Roter Riese', 'Blauer Riese', 'Weißer Zwerg', 'Neutronenstern', 'Schwarzes Loch'
    radius: Number,
    flavorText: String // Atmosphärische Beschreibung des Sterns
  },
  planets: [
    {
      // Basis-Daten (bereits vorhanden)
      name: String,
      type: String, // 'Sand', 'Ice', 'Gas', 'Arid', 'Burning', 'Shattered', 'Dead', etc.
      orbitRadius: Number,
      size: Number,
      color: Number, // Hex color
      
      // Erweiterte Daten
      isHabitable: Boolean, // Ob der Planet bewohnbar ist
      hasColony: Boolean, // Ob eine Kolonie/Stadt existiert
      
      // Bevölkerungsdaten (nur wenn hasColony = true)
      population: {
        size: Number, // in Millionen
        type: String, // 'Imperial', 'Xenos', 'Mixed', 'Primitive'
        loyality: String, // 'Loyal', 'Neutral', 'Rebellious', 'Unknown'
        settlements: [
          {
            name: String,
            type: String, // 'Hive City', 'Colony', 'Outpost', 'Mining Station', 'Research Facility'
            size: String // 'Mega', 'Large', 'Medium', 'Small', 'Tiny'
          }
        ]
      },
      
      // Ressourcen
      resources: [
        {
          type: String, // 'Promethium', 'Adamantine', 'Plasteel', 'Rare Minerals', etc.
          amount: Number, // 1-10 Skala
          quality: String // 'Poor', 'Standard', 'Good', 'Excellent', 'Legendary'
        }
      ],
      
      // Points of Interest
      pointsOfInterest: [
        {
          name: String,
          type: String, // 'Ruins', 'Station', 'Wreck', 'Anomaly', 'Monument'
          faction: String, // 'Imperial', 'Xenos', 'Chaos', 'Unknown'
          danger: Number, // 1-5 Gefährdungsstufe
          description: String
        }
      ],
      
      // Umweltbedingungen
      environment: {
        atmosphere: String, // 'Breathable', 'Toxic', 'Thin', 'None', 'Corrosive'
        temperature: String, // 'Frozen', 'Cold', 'Temperate', 'Hot', 'Burning'
        gravity: String, // 'Low', 'Standard', 'High', 'Crushing'
        weather: String, // 'Stable', 'Storms', 'Acid Rain', 'Radiation Storms'
        specialConditions: [String] // ['Tectonic Activity', 'Warp Storms', 'Psychic Phenomena']
      },
      
      // Flavor Text - Atmosphärische Beschreibung
      flavorText: String, // Detaillierte, stimmungsvolle Beschreibung
      
      // Gameplay-relevante Daten
      explored: Boolean, // Wurde der Planet erkundet?
      claimedBy: String, // Welche Fraktion beansprucht den Planeten?
      
      // Monde (falls vorhanden)
      moons: [
        {
          name: String,
          size: Number,
          angle: Number,
          description: String,
          hasOutpost: Boolean
        }
      ],
      
      // Ereignisse/Anomalien
      anomalies: [
        {
          type: String, // 'Ship', 'Space Hulk', 'Warp Anomaly', 'Xenos Artifact'
          name: String,
          danger: Number,
          description: String
        }
      ]
    }
  ]
}

// Beispiel-Implementierung für Port Wander mit allen neuen Features
export const enhancedPlanetarySystems = {
  'port-wander': {
    star: { 
      name: 'Rubyss', 
      type: 'Gelber Zwerg', 
      radius: 50,
      flavorText: 'Der alte Stern Rubyss brennt mit einem müden gelben Licht, das die massiven Strukturen von Port Wander in lange Schatten taucht. Seine Sonnenwinde sind unberechenbar, durchsetzt mit seltsamen Partikeln aus dem nahen Maw.'
    },
    planets: [
      { 
        name: 'Port Wander Station', 
        type: 'Raumstation', 
        orbitRadius: 150, 
        size: 20,
        color: 0xaaaaaa,
        isHabitable: true,
        hasColony: true,
        population: {
          size: 1.5,
          type: 'Imperial',
          loyality: 'Loyal',
          settlements: [
            {
              name: 'Port Wander Central',
              type: 'Orbital Station',
              size: 'Mega'
            },
            {
              name: 'The Void Docks',
              type: 'Docking Complex',
              size: 'Large'
            }
          ]
        },
        resources: [
          {
            type: 'Trade Goods',
            amount: 10,
            quality: 'Excellent'
          }
        ],
        pointsOfInterest: [
          {
            name: 'The Administratum Spire',
            type: 'Imperial Facility',
            faction: 'Imperial',
            danger: 1,
            description: 'Das Herz der imperialen Autorität in der Koronus-Weite'
          },
          {
            name: 'The Bountiful Beast',
            type: 'Trade Hall',
            faction: 'Independent',
            danger: 2,
            description: 'Berüchtigter Handelsposten für fragwürdige Waren'
          }
        ],
        environment: {
          atmosphere: 'Artificial',
          temperature: 'Controlled',
          gravity: 'Artificial Standard',
          weather: 'None',
          specialConditions: ['Void Exposure Risk', 'Overcrowded']
        },
        flavorText: 'Port Wander thront wie ein stählerner Titan am Rande des Maw, jener unheimlichen Warp-Anomalie, die den einzigen stabilen Durchgang in die Koronus-Weite bietet. Die Station ist ein Schmelztiegel der Menschheit - hier treffen fromme Pilger auf skrupellose Händler, während Rogue Trader ihre Expeditionen in die ungezähmte Weite planen. Die labyrinthischen Korridore der Station bergen tausend Geheimnisse, und in den Schatten der unteren Decks gedeihen Kulte und Verschwörungen.',
        explored: true,
        claimedBy: 'Imperium'
      },
      { 
        name: 'Rubyss II', 
        type: 'Felsplanet', 
        orbitRadius: 250, 
        size: 15,
        color: 0x888888,
        isHabitable: false,
        hasColony: false,
        resources: [
          {
            type: 'Common Minerals',
            amount: 3,
            quality: 'Poor'
          }
        ],
        environment: {
          atmosphere: 'None',
          temperature: 'Cold',
          gravity: 'Low',
          weather: 'None',
          specialConditions: ['Meteor Impact Craters']
        },
        flavorText: 'Rubyss II ist eine tote Welt aus grauem Gestein und Staub, übersät mit den Narben unzähliger Meteoriteneinschläge. Manche behaupten, in den tiefsten Kratern lägen die Überreste prä-imperialer Bergbauoperationen, doch niemand hat je den Beweis dafür gefunden - oder ist zurückgekehrt, um davon zu berichten.',
        explored: true,
        claimedBy: 'Unclaimed'
      },
      {
        name: 'The Ghost Fields',
        type: 'Asteroidenfeld',
        orbitRadius: 350,
        size: 30,
        color: 0x666666,
        isHabitable: false,
        hasColony: false,
        pointsOfInterest: [
          {
            name: 'Derelict Explorator Ship',
            type: 'Wreck',
            faction: 'Adeptus Mechanicus',
            danger: 3,
            description: 'Ein uraltes Forschungsschiff, dessen Notsignale noch immer schwach durch die Leere hallen'
          }
        ],
        environment: {
          atmosphere: 'None',
          temperature: 'Frozen',
          gravity: 'Microgravity',
          weather: 'None',
          specialConditions: ['Navigation Hazard', 'Debris Field']
        },
        flavorText: 'Die Ghost Fields sind ein tückisches Labyrinth aus treibenden Felsen und vergessenen Wracks. Hier, in der ewigen Stille zwischen den Asteroiden, treiben die Überreste gescheiterter Expeditionen wie mahnende Grabsteine. Piraten nutzen die chaotischen Sensorsignaturen als Versteck, während Schatzsucher nach den legendären Archeotech-Caches suchen, die hier verborgen sein sollen.',
        explored: false,
        claimedBy: 'Contested'
      }
    ]
  },
  
  'footfall': {
    star: { 
      name: 'Furibundus Prime', 
      type: 'Oranger Zwerg', 
      radius: 45,
      flavorText: 'Furibundus Prime brennt mit einem zornigen orangen Licht, das die gesetzlose Station Footfall in ein ewiges Zwielicht taucht. Der Stern ist alt und unberechenbar, seine Sonneneruptionen können ohne Vorwarnung Kommunikationssysteme lahmlegen.'
    },
    planets: [
      { 
        name: 'Footfall Station', 
        type: 'Raumstation', 
        orbitRadius: 120, 
        size: 25,
        color: 0x999999,
        isHabitable: true,
        hasColony: true,
        population: {
          size: 0.8,
          type: 'Mixed',
          loyality: 'Neutral',
          settlements: [
            {
              name: 'The Liege\'s Court',
              type: 'Central Hub',
              size: 'Large'
            },
            {
              name: 'The Black Market Bazaar',
              type: 'Trade District',
              size: 'Medium'
            },
            {
              name: 'The Foundling Docks',
              type: 'Docking Complex',
              size: 'Large'
            }
          ]
        },
        resources: [
          {
            type: 'Black Market Goods',
            amount: 8,
            quality: 'Good'
          },
          {
            type: 'Information',
            amount: 9,
            quality: 'Excellent'
          }
        ],
        pointsOfInterest: [
          {
            name: 'The Liege of Footfall\'s Palace',
            type: 'Government Building',
            faction: 'Independent',
            danger: 2,
            description: 'Der selbsternannte Herrscher von Footfall regiert aus diesem befestigten Komplex'
          },
          {
            name: 'The Kasballica Mission',
            type: 'Criminal Headquarters',
            faction: 'Criminal Syndicate',
            danger: 4,
            description: 'Das Hauptquartier der berüchtigten Kasballica-Verbrecherfamilie'
          },
          {
            name: 'The Macrostatue of the God-Emperor',
            type: 'Monument',
            faction: 'Imperial',
            danger: 1,
            description: 'Eine gewaltige, halb vollendete Statue des Imperators, um die sich Pilger scharen'
          }
        ],
        environment: {
          atmosphere: 'Artificial',
          temperature: 'Controlled',
          gravity: 'Artificial Standard',
          weather: 'None',
          specialConditions: ['Lawless Zone', 'Gang Warfare', 'Xenos Presence']
        },
        flavorText: 'Footfall ist der letzte Hafen der Zivilisation vor der ungezähmten Weite - ein Ort, wo das Gesetz des Imperators nur ein entferntes Echo ist. Hier regiert das Recht des Stärkeren, und in den verwinkelten Korridoren der Station blühen Verbrechen, Verrat und verbotener Handel. Xenos wandeln unbehelligt neben Menschen, während in den Schatten dunklere Pakte geschlossen werden. Für viele Rogue Trader ist Footfall sowohl Ausgangspunkt ihrer Expeditionen als auch der Ort, an dem Träume sterben.',
        explored: true,
        claimedBy: 'Independent'
      },
      { 
        name: 'Der Schrottplatz', 
        type: 'Asteroidenfeld', 
        orbitRadius: 200, 
        size: 30,
        color: 0x666666,
        isHabitable: false,
        hasColony: false,
        resources: [
          {
            type: 'Salvage',
            amount: 6,
            quality: 'Standard'
          },
          {
            type: 'Scrap Metal',
            amount: 8,
            quality: 'Poor'
          }
        ],
        pointsOfInterest: [
          {
            name: 'The Processional of the Damned',
            type: 'Wreck Field',
            faction: 'Unknown',
            danger: 3,
            description: 'Ein Friedhof aus Tausenden von Schiffswracks, manche Jahrtausende alt'
          },
          {
            name: 'Scavenger Haven',
            type: 'Hidden Base',
            faction: 'Pirates',
            danger: 4,
            description: 'Eine versteckte Basis von Wrackplünderern und Piraten'
          }
        ],
        environment: {
          atmosphere: 'None',
          temperature: 'Cold',
          gravity: 'Microgravity',
          weather: 'None',
          specialConditions: ['Navigation Hazard', 'Salvage Operations', 'Pirate Activity']
        },
        flavorText: 'Der Schrottplatz ist ein gewaltiger Friedhof der Raumfahrt, wo die Skelette unzähliger Schiffe in einem ewigen, lautlosen Tanz treiben. Manche dieser Wracks sind Jahrtausende alt, ihre Geheimnisse längst in der Dunkelheit verloren. Verzweifelte Schatzsucher und Piraten durchkämmen die Trümmer nach wertvollen Archeotech, doch viele verschwinden spurlos zwischen den treibenden Hulks. Manchmal, so flüstern die Veteranen, erwachen die alten Schiffe zu unheiligem Leben.',
        explored: false,
        claimedBy: 'Unclaimed'
      },
      { 
        name: 'Kalthart', 
        type: 'Eiswelt', 
        orbitRadius: 350, 
        size: 20,
        color: 0xaaccff,
        isHabitable: false,
        hasColony: true,
        population: {
          size: 0.02,
          type: 'Imperial',
          loyality: 'Neutral',
          settlements: [
            {
              name: 'Eisfeste Alpha',
              type: 'Mining Station',
              size: 'Small'
            }
          ]
        },
        resources: [
          {
            type: 'Rare Ice Crystals',
            amount: 5,
            quality: 'Good'
          },
          {
            type: 'Promethium',
            amount: 4,
            quality: 'Standard'
          }
        ],
        environment: {
          atmosphere: 'Thin',
          temperature: 'Frozen',
          gravity: 'Standard',
          weather: 'Blizzards',
          specialConditions: ['Cryovolcanic Activity', 'Aurora Phenomena']
        },
        flavorText: 'Kalthart ist eine Welt ewigen Winters, wo Stickstoff-Schneestürme mit Geschwindigkeiten von über 400 km/h über die gefrorene Oberfläche fegen. Unter dem kilometerdicken Eis verbergen sich Ozeane aus flüssigem Methan, in denen seltsame Cryovulkane ausbrechen und Fontänen aus gefrorenem Ammoniak in die dünne Atmosphäre speien. Die wenigen Bergleute, die hier ausharren, schwören, dass sie manchmal Lichter unter dem Eis sehen - Lichter, die sich bewegen.',
        explored: true,
        claimedBy: 'Independent'
      }
    ]
  }
}

// Funktion zum Generieren von Basis-Planetendaten aus den Import-Daten
export function generatePlanetFromImportData(importData) {
  const planet = {
    name: importData.name || 'Unbekannte Welt',
    type: importData.type || 'Unknown',
    orbitRadius: Math.random() * 300 + 100,
    size: Math.random() * 20 + 10,
    color: generateColorFromType(importData.type),
    isHabitable: false,
    hasColony: false,
    explored: false,
    claimedBy: 'Unclaimed',
    environment: generateEnvironmentFromType(importData.type),
    flavorText: '' // Wird später generiert
  }
  
  // Ressourcen hinzufügen falls vorhanden
  if (importData.resource) {
    planet.resources = [{
      type: importData.resource.type,
      amount: importData.resource.amount,
      quality: determineQuality(importData.resource.amount)
    }]
  }
  
  // Points of Interest hinzufügen falls vorhanden
  if (importData.pointOfInterest) {
    planet.pointsOfInterest = [{
      name: importData.pointOfInterest,
      type: determinePoIType(importData.pointOfInterest),
      faction: 'Unknown',
      danger: 3,
      description: importData.description || ''
    }]
  }
  
  return planet
}

// Hilfsfunktionen
function generateColorFromType(type) {
  const colorMap = {
    'Sand': 0xccaa66,
    'Ice': 0xaaccff,
    'Gas': 0x8866cc,
    'Arid': 0xcc8844,
    'Burning': 0xff6644,
    'Shattered': 0x666666,
    'Dead': 0x444444,
    'Forest': 0x44aa44,
    'Ocean': 0x4488cc,
    'Volcanic': 0xff4444,
    'Toxic': 0x66ff44
  }
  return colorMap[type] || 0x888888
}

function generateEnvironmentFromType(type) {
  const envMap = {
    'Sand': {
      atmosphere: 'Thin',
      temperature: 'Hot',
      gravity: 'Standard',
      weather: 'Dust Storms',
      specialConditions: ['Sand Storms', 'Extreme Temperature Variance']
    },
    'Ice': {
      atmosphere: 'Thin',
      temperature: 'Frozen',
      gravity: 'Standard',
      weather: 'Blizzards',
      specialConditions: ['Ice Storms', 'Cryovolcanic Activity']
    },
    'Gas': {
      atmosphere: 'Crushing',
      temperature: 'Variable',
      gravity: 'High',
      weather: 'Eternal Storms',
      specialConditions: ['Metallic Hydrogen Rain', 'Electromagnetic Storms']
    },
    'Burning': {
      atmosphere: 'Toxic',
      temperature: 'Burning',
      gravity: 'Standard',
      weather: 'Fire Storms',
      specialConditions: ['Lava Flows', 'Toxic Atmosphere']
    },
    'Dead': {
      atmosphere: 'None',
      temperature: 'Cold',
      gravity: 'Low',
      weather: 'None',
      specialConditions: ['Ancient Ruins', 'Mysterious Silence']
    }
  }
  return envMap[type] || {
    atmosphere: 'Unknown',
    temperature: 'Variable',
    gravity: 'Standard',
    weather: 'Unknown',
    specialConditions: []
  }
}

function determineQuality(amount) {
  if (amount >= 9) return 'Legendary'
  if (amount >= 7) return 'Excellent'
  if (amount >= 5) return 'Good'
  if (amount >= 3) return 'Standard'
  return 'Poor'
}

function determinePoIType(poi) {
  const lowerPoi = poi.toLowerCase()
  if (lowerPoi.includes('ruin')) return 'Ruins'
  if (lowerPoi.includes('station')) return 'Station'
  if (lowerPoi.includes('ship') || lowerPoi.includes('wreck')) return 'Wreck'
  if (lowerPoi.includes('anomaly')) return 'Anomaly'
  return 'Unknown'
}

// Export default für einfachen Import
export default enhancedPlanetarySystems