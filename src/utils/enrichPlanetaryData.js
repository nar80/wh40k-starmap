// Skript zum Anreichern der Planetendaten mit Flavor-Texten und erweiterten Informationen

// Planet-Typ zu Bewohnbarkeit Mapping
const habitabilityMap = {
  'Continental': true,
  'Tropical': true,
  'Ocean': true,
  'Savannah': true,
  'Boreal': true,
  'Desert': false, // Kann bewohnt sein, aber schwierig
  'Sand': false,
  'Arid': false,
  'Steppes': true,
  'Ice': false,
  'Snow': false,
  'Frozen': false,
  'Burning': false,
  'Lava': false,
  'Volcanic': false,
  'Ash': false,
  'Dead': false,
  'Tomb': false,
  'Rocky': false,
  'Shattered': false,
  'Cracked': false,
  'Gas Giant': false,
  'Gas': false,
  'Planetoid': false,
  'Mining': true, // Bergbauwelten haben oft Kolonien
  'Station': true,
  'Ship': false,
  'Anomaly': false
}

// Generiere Umweltdaten basierend auf Planetentyp
function generateEnvironment(type) {
  const environments = {
    'Continental': {
      atmosphere: 'Breathable',
      temperature: 'Temperate',
      gravity: 'Standard',
      weather: 'Variable',
      specialConditions: ['Seasonal Changes', 'Diverse Biomes']
    },
    'Tropical': {
      atmosphere: 'Breathable',
      temperature: 'Hot',
      gravity: 'Standard',
      weather: 'Monsoons',
      specialConditions: ['High Humidity', 'Dense Vegetation', 'Exotic Diseases']
    },
    'Ocean': {
      atmosphere: 'Breathable',
      temperature: 'Temperate',
      gravity: 'Standard',
      weather: 'Storms',
      specialConditions: ['Global Ocean', 'Tidal Forces', 'Aquatic Life']
    },
    'Desert': {
      atmosphere: 'Thin',
      temperature: 'Hot',
      gravity: 'Standard',
      weather: 'Dust Storms',
      specialConditions: ['Water Scarcity', 'Extreme Temperature Variance', 'Sand Storms']
    },
    'Ice': {
      atmosphere: 'Thin',
      temperature: 'Frozen',
      gravity: 'Standard',
      weather: 'Blizzards',
      specialConditions: ['Cryovolcanic Activity', 'Ice Storms', 'Subsurface Oceans']
    },
    'Burning': {
      atmosphere: 'Toxic',
      temperature: 'Burning',
      gravity: 'Standard',
      weather: 'Fire Storms',
      specialConditions: ['Volcanic Activity', 'Toxic Atmosphere', 'Extreme Heat']
    },
    'Lava': {
      atmosphere: 'Toxic',
      temperature: 'Burning',
      gravity: 'High',
      weather: 'Ash Storms',
      specialConditions: ['Lava Flows', 'Tectonic Instability', 'Sulfuric Atmosphere']
    },
    'Dead': {
      atmosphere: 'None',
      temperature: 'Variable',
      gravity: 'Low',
      weather: 'None',
      specialConditions: ['No Atmosphere', 'Ancient Ruins', 'Mysterious Silence']
    },
    'Gas Giant': {
      atmosphere: 'Crushing',
      temperature: 'Variable',
      gravity: 'Crushing',
      weather: 'Eternal Storms',
      specialConditions: ['Metallic Hydrogen Rain', 'Electromagnetic Storms', 'Floating Platforms']
    },
    'Ash': {
      atmosphere: 'Toxic',
      temperature: 'Cold',
      gravity: 'Standard',
      weather: 'Ash Storms',
      specialConditions: ['Nuclear Winter', 'Ruins of Civilization', 'Radiation']
    },
    'Tomb': {
      atmosphere: 'None',
      temperature: 'Cold',
      gravity: 'Standard',
      weather: 'None',
      specialConditions: ['Necron Presence', 'Gauss Fields', 'Living Metal']
    },
    'Station': {
      atmosphere: 'Artificial',
      temperature: 'Controlled',
      gravity: 'Artificial',
      weather: 'None',
      specialConditions: ['Life Support Required', 'Void Exposure Risk']
    }
  }
  
  return environments[type] || {
    atmosphere: 'Unknown',
    temperature: 'Variable',
    gravity: 'Standard',
    weather: 'Unknown',
    specialConditions: []
  }
}

// Generiere Flavor-Texte für verschiedene Planetentypen
const flavorTextGenerators = {
  'Ice': (planet) => {
    const variations = [
      `${planet.name} ist eine Welt ewigen Winters, wo Stickstoffschnee die Landschaft in ein kristallines Grab verwandelt hat. Die wenigen, die es wagen, diese gefrorene Hölle zu betreten, berichten von seltsamen Lichtern unter dem Eis - vielleicht nur Reflexionen, vielleicht etwas Älteres.`,
      `Auf ${planet.name} erreichen die Temperaturen Werte, bei denen selbst die Atmosphäre zu Schnee gefriert. Cryovulkane speien Fontänen aus flüssigem Methan in den schwarzen Himmel, während tief unter der Oberfläche uralte Maschinen ihren ewigen Schlaf träumen.`,
      `Die Eiswüsten von ${planet.name} erstrecken sich endlos unter einem fahlen Himmel. Hier, wo selbst die Zeit zu gefrieren scheint, liegen die Überreste längst vergessener Expeditionen, konserviert in ewigem Eis wie mahnende Denkmäler menschlicher Hybris.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Desert': (planet) => {
    const variations = [
      `Die endlosen Dünen von ${planet.name} bergen mehr als nur Sand. Unter der sengenden Sonne dieser Welt liegen die Überreste uralter Zivilisationen begraben, ihre Geheimnisse vom ewigen Wind der Wüste bewacht.`,
      `${planet.name} ist eine Welt der Extreme - brennende Tage, in denen das Gestein schmilzt, gefolgt von Nächten so kalt, dass die Luft selbst zu Eis wird. Nur die Härtesten überleben in dieser gnadenlosen Umgebung.`,
      `Auf ${planet.name} formt der Wind Dünen zu wandernden Bergen, die ganze Täler verschlingen. Die wenigen Wasserquellen sind umkämpfter als Promethium, und in den tiefsten Wüstentälern sollen Dinge hausen, die älter sind als das Imperium selbst.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Burning': (planet) => {
    const variations = [
      `${planet.name} brennt in ewigem Feuer. Vulkane speien unablässig Lava, während die Atmosphäre selbst aus brennenden Gasen besteht. Nur in gepanzerten Habitaten können Menschen hier existieren, ständig bedroht von der Hölle, die sie umgibt.`,
      `Die Oberfläche von ${planet.name} ist ein Inferno aus geschmolzenem Gestein und giftigen Dämpfen. Pyroclastische Stürme fegen mit Überschallgeschwindigkeit über die Landschaft und verwandeln alles in Asche und Glas.`,
      `Auf ${planet.name} regnet es flüssiges Metall, während Feuerstürme über Kontinente aus Obsidian rasen. Diese Welt scheint direkt aus den Albträumen eines Dämons entsprungen zu sein.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Gas Giant': (planet) => {
    const variations = [
      `In den wirbelnden Wolkenschichten von ${planet.name} toben Stürme größer als Planeten. Blitze aus metallischem Wasserstoff erhellen die ewige Dunkelheit, während in den tieferen Schichten Drücke herrschen, die Diamanten zu Staub zermalmen.`,
      `${planet.name} ist ein gewaltiger Ball aus komprimiertem Gas, in dessen Atmosphäre ewige Zyklone tanzen. Orbitale Raffinerien ernten Helium-3 aus den oberen Schichten, während die Tiefen Geheimnisse bergen, die kein Mensch je erblicken wird.`,
      `Die Atmosphäre von ${planet.name} ist ein psychedelisches Kaleidoskop aus wirbelnden Farben und elektromagnetischen Stürmen. Manche behaupten, in den Mustern Nachrichten zu erkennen - Botschaften von etwas, das in den crushing depths lebt.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Dead': (planet) => {
    const variations = [
      `${planet.name} ist eine Grabwelt, wo die Stille so vollkommen ist, dass sie in den Ohren schmerzt. Hier starb einst alles Leben, und nur die leeren Hüllen von Städten und die Knochen ihrer Bewohner zeugen von vergangener Größe.`,
      `Auf ${planet.name} herrscht eine unnatürliche Stille. Keine Atmosphäre trägt Geräusche, kein Wind bewegt den jahrtausendealten Staub. Die perfekt erhaltenen Ruinen deuten auf ein plötzliches Ende hin - als ob die Zeit selbst hier angehalten hätte.`,
      `${planet.name} trägt die Narben eines längst vergessenen Krieges. Verglaste Krater durchziehen die Oberfläche, und in den Ruinen der Städte finden sich nur Schatten, in Wände gebrannt von Waffen, die das Imperium nicht mehr kennt.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Continental': (planet) => {
    const variations = [
      `${planet.name} ist eine Welt der Vielfalt, wo weite Ozeane auf massive Kontinente treffen. Hier gedeiht das Leben in tausend Formen, von dichten Wäldern bis zu weiten Steppen, eine Oase der Möglichkeiten in der Dunkelheit des Void.`,
      `Die gemäßigten Zonen von ${planet.name} erinnern an die legendäre Terra vor dem Zeitalter des Zwists. Hier könnte die Menschheit gedeihen, wäre da nicht der ständige Schatten von Bedrohungen aus dem Warp und von Xenos-Invasoren.`,
      `Auf ${planet.name} wechseln sich Jahreszeiten in einem ewigen Zyklus ab, der das Leben formt und nährt. Doch unter der idyllischen Oberfläche lauern oft Geheimnisse - vergrabene Archeotech oder schlummernde Bedrohungen aus vergangenen Äonen.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Ocean': (planet) => {
    const variations = [
      `${planet.name} ist eine Wasserwelt, wo endlose Ozeane den gesamten Planeten bedecken. In den Tiefen, wo das Sonnenlicht nie hindringt, existieren Ökosysteme von fremder Schönheit und tödlicher Gefahr.`,
      `Die globalen Ozeane von ${planet.name} bergen Geheimnisse älter als das Imperium. Gewaltige Stürme peitschen Wellen hoch wie Hab-Blocks, während in der Tiefe Leviathane lauern, die ganze Schiffe verschlingen können.`,
      `Auf ${planet.name} ragen nur wenige Inselketten aus dem endlosen Meer. Die Bewohner haben gelernt, mit dem Ozean zu leben, doch sie wissen auch von den Dingen, die in mondlosen Nächten aus den Tiefen aufsteigen.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Tropical': (planet) => {
    const variations = [
      `${planet.name} ist ein dampfender Dschungelplanet, wo das Leben in explosiver Vielfalt wuchert. Fleischfressende Pflanzen konkurrieren mit giftigen Raubtieren um Beute, während in den Baumkronen Zivilisationen existieren könnten, die noch nie den Boden berührt haben.`,
      `Die feuchte Hitze von ${planet.name} ist wie eine physische Wand. Hier wächst und stirbt alles in rasender Geschwindigkeit, und die Grenze zwischen Pflanze und Tier verschwimmt in einem ewigen Kampf ums Überleben.`,
      `In den Regenwäldern von ${planet.name} ist jeder Schritt ein Kampf gegen die überwuchernde Natur. Parasiten, Krankheiten und Raubtiere machen diese grüne Hölle zu einem der gefährlichsten Orte der Galaxis - und zu einem der ressourcenreichsten.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Ash': (planet) => {
    const variations = [
      `${planet.name} ist in ewige Asche gehüllt, Überbleibsel einer Katastrophe, die alles Leben auslöschte. Der Himmel ist permanent verdunkelt, und saurer Regen ätzt Muster in die Ruinen einer einst stolzen Zivilisation.`,
      `Auf ${planet.name} fällt ständig Asche wie grauer Schnee. Die Luft ist giftig, durchsetzt mit Partikeln, die die Lungen zerfressen. In den Ruinen der Städte hausen nur noch Mutanten und schlimmere Dinge.`,
      `Die Aschewüsten von ${planet.name} erzählen eine Geschichte des Untergangs. Hier endete eine Welt in Feuer und Dunkelheit, und nun wandeln nur noch Plünderer und Archeotech-Jäger durch die toten Städte.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Tomb': (planet) => {
    const variations = [
      `${planet.name} ist eine Necron-Grabwelt, wo unter der toten Oberfläche Legionen von mechanischen Kriegern ihren äonenlangen Schlaf träumen. Gauss-Energie flackert in den Tiefen, und manchmal erwachen die Wächter, um Eindringlinge zu vernichten.`,
      `Die Oberfläche von ${planet.name} ist übersät mit Pylonen aus lebendem Metall. Hier schläft eine Dynastie der Necrons, und wehe dem Narren, der sie weckt. Die Luft selbst scheint mit einer unheiligen Energie geladen zu sein.`,
      `Auf ${planet.name} sind die Gesetze der Physik nur Vorschläge. Necron-Technologie durchdringt den Planeten bis zum Kern, und in den Katakomben aus schwarzem Stein warten Schrecken, die älter sind als die Menschheit selbst.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Station': (planet) => {
    const variations = [
      `${planet.name} ist eine massive Raumstation, ein Triumph imperialer Ingenieurskunst oder das Relikt einer vergessenen Ära. In ihren Korridoren herrscht das Gesetz des Stärkeren, während die Leere des Weltraums nur eine dünne Hüllenpanzerung entfernt lauert.`,
      `Die labyrinthischen Gänge von ${planet.name} beherbergen Tausende von Seelen. Hier vermischen sich alle Schichten der Gesellschaft - von Adligen bis zu Mutanten in den Unterdecks, alle gefangen in dieser metallenen Welt.`,
      `${planet.name} treibt durchs All wie eine stählerne Insel im Ozean der Sterne. Generationen haben hier gelebt und sind gestorben, ohne je einen Planeten zu betreten, ihr ganzes Universum begrenzt von Schotten und Korridoren.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  'Shattered': (planet) => {
    const variations = [
      `${planet.name} ist eine zerbrochene Welt, zerrissen von einer unvorstellbaren Katastrophe. Kontinentale Fragmente treiben in einem lockeren Orbit, verbunden nur durch Schwerkraft und gemeinsames Schicksal.`,
      `Die Überreste von ${planet.name} sind ein Mahnmal kosmischer Zerstörung. Zwischen den treibenden Felsbrocken finden sich noch immer Ruinen und Artefakte - stumme Zeugen einer Zivilisation, die zu mächtig wurde.`,
      `Auf den Fragmenten von ${planet.name} herrschen bizarre Gravitationsverhältnisse. Manche Brocken haben noch Atmosphärentaschen, in denen mutiertes Leben einen Weg gefunden hat zu überleben.`
    ]
    return variations[Math.floor(Math.random() * variations.length)]
  },
  
  // Fallback für unbekannte Typen
  'default': (planet) => {
    return `${planet.name} ist eine Welt voller Mysterien, deren wahre Natur sich den Kartographen des Imperiums noch nicht vollständig erschlossen hat. Weitere Erkundungen sind erforderlich, um die Geheimnisse dieser Welt zu enthüllen.`
  }
}

// Hauptfunktion zum Anreichern der Planetendaten
export function enrichPlanetData(planet) {
  const enrichedPlanet = { ...planet }
  
  // Bestimme Bewohnbarkeit
  enrichedPlanet.isHabitable = habitabilityMap[planet.type] || false
  
  // Prüfe ob Kolonie vorhanden (basierend auf Points of Interest oder Beschreibung)
  const hasColonyIndicators = [
    'colony', 'settlement', 'city', 'hive', 'station', 'base', 'outpost',
    'estate', 'palace', 'monastery', 'manufactorum'
  ]
  
  const description = (planet.description || '').toLowerCase()
  const poi = (planet.pointOfInterest || '').toLowerCase()
  
  enrichedPlanet.hasColony = hasColonyIndicators.some(indicator => 
    description.includes(indicator) || poi.includes(indicator)
  ) || planet.type === 'Station'
  
  // Füge Umweltdaten hinzu
  enrichedPlanet.environment = generateEnvironment(planet.type)
  
  // Generiere Flavor-Text wenn nicht vorhanden
  if (!enrichedPlanet.flavorText) {
    const generator = flavorTextGenerators[planet.type] || flavorTextGenerators['default']
    enrichedPlanet.flavorText = generator(planet)
  }
  
  // Konvertiere Ressourcen in erweitertes Format
  if (planet.resource) {
    if (typeof planet.resource === 'string') {
      enrichedPlanet.resources = [{
        type: planet.resource,
        amount: 5,
        quality: 'Standard'
      }]
    } else if (planet.resource.type) {
      enrichedPlanet.resources = [{
        type: planet.resource.type,
        amount: planet.resource.amount || 5,
        quality: determineQuality(planet.resource.amount)
      }]
    }
  }
  
  // Konvertiere Points of Interest
  if (planet.pointOfInterest && typeof planet.pointOfInterest === 'string') {
    enrichedPlanet.pointsOfInterest = [{
      name: planet.pointOfInterest,
      type: categorizePoI(planet.pointOfInterest),
      faction: 'Unknown',
      danger: 3,
      description: planet.description || ''
    }]
  }
  
  // Füge Bevölkerungsdaten hinzu wenn Kolonie vorhanden
  if (enrichedPlanet.hasColony) {
    enrichedPlanet.population = generatePopulation(planet)
  }
  
  // Setze explored Status
  enrichedPlanet.explored = false // Standard ist unerforscht
  
  return enrichedPlanet
}

// Hilfsfunktionen
function determineQuality(amount) {
  if (typeof amount === 'string') return 'Standard'
  if (amount >= 9) return 'Legendary'
  if (amount >= 7) return 'Excellent'
  if (amount >= 5) return 'Good'
  if (amount >= 3) return 'Standard'
  return 'Poor'
}

function categorizePoI(poi) {
  const poiLower = poi.toLowerCase()
  if (poiLower.includes('ruin')) return 'Ruins'
  if (poiLower.includes('station') || poiLower.includes('base')) return 'Station'
  if (poiLower.includes('ship') || poiLower.includes('wreck')) return 'Wreck'
  if (poiLower.includes('anomaly')) return 'Anomaly'
  if (poiLower.includes('cache')) return 'Cache'
  if (poiLower.includes('settlement') || poiLower.includes('colony')) return 'Settlement'
  return 'Unknown'
}

function generatePopulation(planet) {
  const basePopulation = {
    size: 0.1, // Standard klein
    type: 'Imperial',
    loyality: 'Unknown',
    settlements: []
  }
  
  // Bestimme Populationsgröße basierend auf Typ
  if (planet.type === 'Continental' || planet.type === 'Tropical') {
    basePopulation.size = Math.random() * 100 + 10 // 10-110 Millionen
  } else if (planet.type === 'Station') {
    basePopulation.size = Math.random() * 2 + 0.5 // 0.5-2.5 Millionen
  } else if (planet.type === 'Mining') {
    basePopulation.size = Math.random() * 5 + 1 // 1-6 Millionen
  }
  
  // Füge Siedlungen hinzu basierend auf Points of Interest
  if (planet.pointOfInterest) {
    const poiLower = planet.pointOfInterest.toLowerCase()
    if (poiLower.includes('hive')) {
      basePopulation.settlements.push({
        name: planet.pointOfInterest,
        type: 'Hive City',
        size: 'Mega'
      })
      basePopulation.size *= 10 // Hive Cities sind riesig
    } else if (poiLower.includes('colony')) {
      basePopulation.settlements.push({
        name: planet.pointOfInterest,
        type: 'Colony',
        size: 'Medium'
      })
    } else if (poiLower.includes('base') || poiLower.includes('outpost')) {
      basePopulation.settlements.push({
        name: planet.pointOfInterest,
        type: 'Outpost',
        size: 'Small'
      })
    }
  }
  
  return basePopulation
}

// Funktion zum Anreichern aller Systeme
export function enrichAllSystems(systemPlanets) {
  const enrichedSystems = {}
  
  for (const [systemId, planets] of Object.entries(systemPlanets)) {
    enrichedSystems[systemId] = planets.map(planet => enrichPlanetData(planet))
  }
  
  return enrichedSystems
}

// Export für direkte Verwendung
export default {
  enrichPlanetData,
  enrichAllSystems,
  generateEnvironment,
  flavorTextGenerators
}