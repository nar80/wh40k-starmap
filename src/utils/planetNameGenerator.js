// Planetennamen-Generator für Warhammer 40k Koronus Expanse
// Generiert passende Namen im Imperial Gothic Stil

// Erkennt generische Namen
export function isGenericName(name) {
  if (!name) return false
  
  const genericPatterns = [
    'gas giant', 'ice world', 'rocky world', 'dead world', 'burning world',
    'snow world', 'ash world', 'ocean world', 'jungle world', 'desert world',
    'continental world', 'arid world', 'lava world', 'shattered world',
    'planetoid', 'asteroid', 'space dust', 'hulk', 'unknown ships',
    'enemies of humanity', 'savannah world', 'toxic world', 'mining world',
    'tomb world', 'mined world', 'destroyed ship', 'unidentified voidship',
    'artificial object', 'mysterious object', 'unknown anomaly', 'space battle',
    'drukhari ships', 'asuryani vessel', 'chartist vessel', 'refugee ship',
    'dying star', 'dead stars', 'warp gate', 'anomaly'
  ]
  
  const nameLower = name.toLowerCase().trim()
  return genericPatterns.some(pattern => 
    nameLower === pattern || 
    nameLower.startsWith(pattern) ||
    nameLower.includes('world') && !nameLower.includes("'") // "X World" ohne Apostroph ist generisch
  )
}

// Präfixe für Planetennamen (Imperial Gothic Stil)
const prefixes = [
  'Mordus', 'Ferrus', 'Corvus', 'Aquilus', 'Sanguinus', 'Mortis', 'Noctis',
  'Tempestus', 'Gladius', 'Bellus', 'Fortis', 'Magnus', 'Sanctus', 'Durus',
  'Aeternus', 'Obscurus', 'Primus', 'Secundus', 'Tertius', 'Quartus',
  'Solaris', 'Lunaris', 'Stellaris', 'Nebulus', 'Vortus', 'Terminus',
  'Extremis', 'Ulterius', 'Infernus', 'Supernus', 'Medius', 'Proximus',
  'Ultimus', 'Novus', 'Antiquus', 'Vastus', 'Profundus', 'Altus',
  'Gelidus', 'Calidus', 'Siccus', 'Humidus', 'Tenebris', 'Luminis',
  'Ferox', 'Cruor', 'Dolor', 'Mors', 'Vita', 'Spes', 'Fides', 'Honor'
]

// Suffixe für Planetennamen
const suffixes = [
  'Prime', 'Secundus', 'Tertius', 'Minoris', 'Majoris', 'Rex', 'Corona',
  'Reach', 'Gate', 'Hold', 'Rest', 'Fall', 'Rise', 'Dawn', 'Dusk',
  'Haven', 'Bane', 'Throne', 'Crown', 'Scepter', 'Bastion', 'Citadel'
]

// Spezielle Namen nach Typ
const typeSpecificNames = {
  ice: [
    'Cryotheum', 'Glacialis', 'Hibernus', 'Frigidia', 'Crystalis', 'Boreas',
    'Khione', 'Stygia', 'Algidus', 'Pruina', 'Nix Aeterna', 'Gelu Mortis'
  ],
  desert: [
    'Aridus', 'Siccara', 'Dusthaven', 'Solscorch', 'Dunecrest', 'Hashara',
    'Xerxes', 'Salamis', 'Pyrrhia', 'Ardentia', 'Silicus', 'Harena'
  ],
  ocean: [
    'Aquarius', 'Pelagius', 'Thalassia', 'Neptus', 'Hydrus', 'Marina',
    'Abyssia', 'Profundis', 'Cerulean', 'Sapphira', 'Ondine', 'Tritonis'
  ],
  jungle: [
    'Verdantis', 'Sylvanis', 'Viridiax', 'Folium', 'Canopus', 'Frondis',
    'Luxuria', 'Selvana', 'Emeraldia', 'Viridian', 'Feralis', 'Botanicus'
  ],
  lava: [
    'Ignis', 'Pyroclast', 'Vulcanis', 'Magmus', 'Infernis', 'Crematus',
    'Sulphuria', 'Obsidius', 'Scorchus', 'Moltenus', 'Lavacrum', 'Caldera'
  ],
  gas: [
    'Stratos', 'Nephele', 'Ventus', 'Aeolus', 'Cumulus', 'Tempestas',
    'Jovius', 'Saturnis', 'Titanus', 'Colossus', 'Gigantus', 'Atmosphera'
  ],
  dead: [
    'Mortuum', 'Nihilus', 'Vacuum', 'Silentium', 'Sepulchrum', 'Ossarium',
    'Desolatus', 'Vastitas', 'Ruina', 'Perditus', 'Oblivion', 'Extinctus'
  ],
  toxic: [
    'Venenum', 'Toxicus', 'Miasma', 'Putridus', 'Corrosivus', 'Pestilens',
    'Morbidus', 'Contagius', 'Acidus', 'Noxius', 'Virulens', 'Fetidus'
  ],
  mining: [
    'Excavatus', 'Mineralis', 'Metallicus', 'Aurum', 'Ferrum', 'Adamantis',
    'Extractus', 'Fodina', 'Carbonis', 'Prometheum', 'Industria', 'Laboris'
  ]
}

// Xenos und andere Namensstile
const xenosNames = [
  'Yth\'oghra', 'Xar\'theta', 'Qel\'nara', 'Zeph\'iri', 'Kor\'sarro', 'Vel\'shan',
  'Mor\'dian', 'Syl\'veth', 'Tyr\'anox', 'Dra\'khari', 'Ul\'thane', 'Cra\'yeth'
]

// Zahlen für Systeme mit mehreren ähnlichen Planeten
const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

// Generiert einen Namen basierend auf Typ und Kontext
export function generatePlanetName(planet, systemName, existingNames = []) {
  // Prüfe ob der Name bereits gut ist
  if (planet.name && !isGenericName(planet.name)) {
    return planet.name
  }
  
  let baseName = ''
  const type = (planet.type || '').toLowerCase()
  
  // Spezialbehandlung für bestimmte Objekte
  if (type.includes('station') || planet.name?.includes('Station')) {
    baseName = generateStationName(systemName)
  } else if (type.includes('ship') || type.includes('hulk') || type.includes('vessel')) {
    baseName = generateShipName(type)
  } else if (type.includes('anomaly') || type === 'anomaly') {
    baseName = generateAnomalyName()
  } else if (type.includes('asteroid') || type.includes('planetoid')) {
    baseName = generateAsteroidName(systemName)
  } else {
    // Normale Planeten
    baseName = generatePlanetaryName(type, systemName)
  }
  
  // Stelle sicher dass der Name unique ist
  if (existingNames.includes(baseName)) {
    // Füge Numeral hinzu
    for (let i = 0; i < numerals.length; i++) {
      const numberedName = `${baseName} ${numerals[i]}`
      if (!existingNames.includes(numberedName)) {
        return numberedName
      }
    }
  }
  
  return baseName
}

function generatePlanetaryName(type, systemName) {
  const rand = Math.random()
  
  // 30% Chance: Verwende systemName als Basis
  if (rand < 0.3 && systemName && !isGenericName(systemName)) {
    const suffix = getSuffixForType(type)
    return `${systemName} ${suffix}`
  }
  
  // 30% Chance: Typ-spezifische Namen
  if (rand < 0.6) {
    const names = getTypeSpecificNames(type)
    if (names.length > 0) {
      return names[Math.floor(Math.random() * names.length)]
    }
  }
  
  // 20% Chance: Xenos Namen für nicht-imperiale Welten
  if (rand < 0.8 && (type.includes('xenos') || type.includes('alien'))) {
    return xenosNames[Math.floor(Math.random() * xenosNames.length)]
  }
  
  // Rest: Kombiniere Präfix + Suffix
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  return `${prefix} ${suffix}`
}

function getTypeSpecificNames(type) {
  if (type.includes('ice') || type.includes('frozen') || type.includes('snow')) {
    return typeSpecificNames.ice
  }
  if (type.includes('desert') || type.includes('arid') || type.includes('sand')) {
    return typeSpecificNames.desert
  }
  if (type.includes('ocean') || type.includes('water')) {
    return typeSpecificNames.ocean
  }
  if (type.includes('jungle') || type.includes('tropical') || type.includes('forest')) {
    return typeSpecificNames.jungle
  }
  if (type.includes('lava') || type.includes('burning') || type.includes('volcanic')) {
    return typeSpecificNames.lava
  }
  if (type.includes('gas')) {
    return typeSpecificNames.gas
  }
  if (type.includes('dead') || type.includes('tomb')) {
    return typeSpecificNames.dead
  }
  if (type.includes('toxic') || type.includes('poison')) {
    return typeSpecificNames.toxic
  }
  if (type.includes('mining') || type.includes('mined')) {
    return typeSpecificNames.mining
  }
  return []
}

function getSuffixForType(type) {
  const suffixMap = {
    ice: ['Frigia', 'Glacialis', 'Hibernia'],
    desert: ['Dustborn', 'Siccara', 'Arida'],
    ocean: ['Aquaria', 'Thalassa', 'Marina'],
    jungle: ['Verdant', 'Sylvanis', 'Canopia'],
    gas: ['Magnus', 'Gigantus', 'Stratos'],
    dead: ['Mortis', 'Nihilus', 'Sepulchra']
  }
  
  for (const [key, values] of Object.entries(suffixMap)) {
    if (type.includes(key)) {
      return values[Math.floor(Math.random() * values.length)]
    }
  }
  
  return suffixes[Math.floor(Math.random() * suffixes.length)]
}

function generateStationName(systemName) {
  const stationPrefixes = [
    'Orbital Platform', 'Void Station', 'Star Fort', 'Haven Station',
    'Waystation', 'Trading Post', 'Outpost', 'Refinery Station',
    'Dock', 'Port', 'Anchorage', 'Berth'
  ]
  
  const stationNames = [
    'Aquila\'s Rest', 'Emperor\'s Watch', 'Silent Vigil', 'Iron Bastille',
    'Adamantine Gate', 'Stellar Crown', 'Void\'s Edge', 'Merchant\'s Hope',
    'Pilgrim\'s End', 'Watchpost Epsilon', 'Bastion Alpha', 'Haven Secundus'
  ]
  
  if (Math.random() < 0.5 && systemName && !isGenericName(systemName)) {
    const prefix = stationPrefixes[Math.floor(Math.random() * stationPrefixes.length)]
    return `${systemName} ${prefix}`
  }
  
  return stationNames[Math.floor(Math.random() * stationNames.length)]
}

function generateShipName(type) {
  const shipNames = [
    'Righteous Fury', 'Emperor\'s Wrath', 'Silent Death', 'Void Stalker',
    'Iron Resolve', 'Eternal Vigilance', 'Storm\'s Edge', 'Last Light',
    'Broken Chain', 'Lost Hope', 'Wanderer\'s Doom', 'Stellar Phoenix',
    'Ghost of Retribution', 'Forgotten Promise', 'Shattered Dream',
    'Crimson Oath', 'Black Vengeance', 'Golden Throne', 'Silver Tear'
  ]
  
  if (type.includes('hulk')) {
    return `Hulk of ${shipNames[Math.floor(Math.random() * shipNames.length)]}`
  } else if (type.includes('destroyed')) {
    return `Wreck of ${shipNames[Math.floor(Math.random() * shipNames.length)]}`
  }
  
  return shipNames[Math.floor(Math.random() * shipNames.length)]
}

function generateAnomalyName() {
  const anomalyNames = [
    'The Screaming Vortex', 'Warp Echo Alpha', 'Temporal Distortion',
    'The God-Emperor\'s Tear', 'Void Scar', 'Reality Breach',
    'The Whispering Dark', 'Stellar Paradox', 'Quantum Maze',
    'The Bleeding Eye', 'Chaos Rift', 'The Silent Scream',
    'Probability Storm', 'The Impossible Star', 'Dimensional Fold'
  ]
  
  return anomalyNames[Math.floor(Math.random() * anomalyNames.length)]
}

function generateAsteroidName(systemName) {
  const asteroidNames = [
    'The Scattered Bones', 'Debris Field', 'The Graveyard', 'Rocky Shoals',
    'The Broken Belt', 'Mineral Fields', 'The Dust Ring', 'Stone Garden',
    'The Shattered Remnants', 'Ore Fields', 'The Drifting Stones'
  ]
  
  if (Math.random() < 0.3 && systemName && !isGenericName(systemName)) {
    return `${systemName} Belt`
  }
  
  return asteroidNames[Math.floor(Math.random() * asteroidNames.length)]
}

// Funktion zum Umbenennen aller generischen Namen in einem System
export function renameGenericPlanets(planets, systemName) {
  const existingNames = []
  
  return planets.map(planet => {
    if (isGenericName(planet.name)) {
      const newName = generatePlanetName(planet, systemName, existingNames)
      existingNames.push(newName)
      return {
        ...planet,
        name: newName,
        originalGenericName: planet.name // Behalte den alten Namen als Referenz
      }
    }
    existingNames.push(planet.name)
    return planet
  })
}

// Export default
export default {
  isGenericName,
  generatePlanetName,
  renameGenericPlanets
}