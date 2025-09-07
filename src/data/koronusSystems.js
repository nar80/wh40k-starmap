export const koronusSystems = [
  // Gateway Systems (Far Left)
  { 
    id: 'port-wander', 
    name: 'Port Wander', 
    x: -700, 
    y: -50, 
    faction: 'Imperium', 
    starType: 'Gelber Zwerg', 
    worldType: 'space_station', 
    description: 'Tor zur Koronus-Weite',
    flavorText: 'Eine massive Raumstation thront wie ein stählerner Wächter am Rande des Maw, dem einzigen bekannten stabilen Warppfad in die Koronus-Weite. Hier versammeln sich Abenteurer, Händler und Schurken gleichermaßen, alle hungrig nach den unermesslichen Reichtümern, die jenseits der imperialen Grenzen warten.'
  },
  { id: 'furibundus', name: 'Furibundus', x: -600, y: 150, faction: 'Unabhängig', starType: 'Roter Zwerg', worldType: 'death_world', description: 'Todwelt am Eingang' },
  
  // Central Hub
  { 
    id: 'footfall', 
    name: 'Footfall', 
    x: -450, 
    y: -30, 
    faction: 'Unabhängig', 
    starType: 'Oranger Zwerg', 
    worldType: 'trade_station', 
    description: 'Letzte Station vor der Weite',
    flavorText: 'Ein gesetzloser Hafen wo das Wort des Imperators nur ein Flüstern ist. Schmuggler, Piraten und Rogue Trader feilschen hier um Xenos-Artefakte und verbotenes Wissen, während in den Schatten der Station dunklere Geschäfte abgewickelt werden.'
  },
  { id: 'lucians-hollow', name: "Lucian's Hollow", x: -380, y: -100, faction: 'Unabhängig', starType: 'Blauer Zwerg', worldType: 'ice_world', description: 'Gefrorene Welt' },
  
  // Winterscale's Realm (Upper Center)
  { id: 'burnscour', name: 'Burnscour', x: -250, y: -200, faction: "Winterscale's Realm", starType: 'Roter Riese', worldType: 'scorched_world', description: 'Verbrannte Welt' },
  { id: 'jerazol', name: 'Jerazol', x: -150, y: -250, faction: "Winterscale's Realm", starType: 'Gelber Zwerg', worldType: 'trade_world', description: 'Handelsposten von Winterscale' },
  { id: 'lost-hope', name: 'Lost Hope', x: -50, y: -280, faction: "Winterscale's Realm", starType: 'Roter Zwerg', worldType: 'lost_colony', description: 'Vergessene Kolonie' },
  { id: 'solace-encarmine', name: 'Solace Encarmine', x: -320, y: -150, faction: "Winterscale's Realm", starType: 'Weißer Zwerg', worldType: 'fortress_world', description: 'Winterscales Festung' },
  
  // The Foundling Worlds (Lower Center)
  { id: 'damaris', name: 'Damaris', x: -300, y: 200, faction: 'Imperium', starType: 'Gelber Zwerg', worldType: 'fortress_world', description: 'Umkämpfte Festungswelt' },
  { id: 'magoros', name: 'Magoros', x: -400, y: 180, faction: 'Unabhängig', starType: 'Gelber Zwerg', worldType: 'agri_world', description: 'Agrarwelt' },
  { id: 'vaporius', name: 'Vaporius', x: -350, y: 250, faction: 'Unabhängig', starType: 'Roter Zwerg', worldType: 'gas_giant', description: 'Gasgigant' },
  { id: 'grace', name: 'Grace', x: -250, y: 150, faction: 'Unabhängig', starType: 'Oranger Zwerg', worldType: 'paradise_world', description: 'Paradieswelt' },
  
  // Central Expanse Systems
  { id: 'the-hermitage', name: 'The Hermitage', x: -100, y: -50, faction: 'Unbekannt', starType: 'Weißer Zwerg', worldType: 'derelict_station', description: 'Verlassene Station',
    flavorText: 'Eine geisterhafte Station treibt im kalten Licht eines sterbenden Sterns. Niemand weiß, wer sie erbaut hat oder warum sie verlassen wurde, doch manchmal flackern noch Lichter in ihren leeren Korridoren.'
  },
  { id: 'zayth', name: 'Zayth', x: 50, y: -200, faction: 'Xenos', starType: 'Blauer Riese', worldType: 'xenos_world', description: 'Xenos-Welt' },
  { id: 'valcetti-pallace', name: "Valcetti's Pallace", x: -200, y: 50, faction: 'Unabhängig', starType: 'Gelber Zwerg', worldType: 'trade_world', description: 'Handelspalast' },
  
  // Eastern Reaches
  { id: 'naduesh', name: 'Naduesh', x: 150, y: -120, faction: 'Xenos', starType: 'Roter Überriese', worldType: 'ork_world', description: 'Ork-Welt' },
  { id: 'unbeholden-heart', name: 'Unbeholden Heart', x: 250, y: -80, faction: 'Unbekannt', starType: 'Neutronenstern', worldType: 'void_anomaly', description: 'Zentrum der Unbeholden Reaches' },
  { id: 'illisk', name: 'Illisk', x: 200, y: 0, faction: 'Unbekannt', starType: 'Neutronenstern', worldType: 'death_world', description: 'Todeszone' },
  { id: 'concanid', name: 'Concanid', x: 350, y: -50, faction: 'Xenos', starType: 'Roter Zwerg', worldType: 'xenos_ruins', description: 'Xenos-Ruinen' },
  
  // Far Eastern Systems
  { id: 'iniquity', name: 'Iniquity', x: 450, y: -150, faction: 'Chaos', starType: 'Schwarzes Loch', worldType: 'chaos_world', description: 'Chaos-befallenes System',
    flavorText: 'Das Schwarze Loch im Herzen dieses Systems verschlingt nicht nur Licht, sondern auch die Seelen der Verdammten. Warpstürme tanzen um den Ereignishorizont, während dämonische Stimmen aus der Leere flüstern.'
  },
  { id: 'processional-of-the-damned', name: 'Processional of the Damned', x: 500, y: -200, faction: 'Chaos', starType: 'Pulsar', worldType: 'void_anomaly', description: 'Navigations-Gefahr' },
  
  // Accursed Demense (Southeast)
  { id: 'sacris', name: 'Sacris', x: 100, y: 150, faction: 'Unbekannt', starType: 'Weißer Zwerg', worldType: 'cursed_world', description: 'Verfluchte Welt' },
  { id: 'dross', name: 'Dross', x: 180, y: 200, faction: 'Unbekannt', starType: 'Brauner Zwerg', worldType: 'mining_world', description: 'Minenwelt' },
  { id: 'kurse', name: 'Kurse', x: 250, y: 180, faction: 'Chaos', starType: 'Roter Riese', worldType: 'daemon_world', description: 'Dämonenwelt' },
  
  // The Heathen Stars (Far Northeast)
  { id: 'agusia', name: 'Agusia', x: 600, y: -250, faction: 'Xenos', starType: 'Blauer Überriese', worldType: 'eldar_world', description: 'Eldar-Maiden-Welt' },
  { id: 'vayok', name: 'Vayok', x: 650, y: -180, faction: 'Xenos', starType: 'Gelber Zwerg', worldType: 'kroot_world', description: 'Kroot-Sphäre' },
  
  // Northwestern Systems
  { id: 'cinerus-maleficum', name: 'Cinerus Maleficum', x: -500, y: -250, faction: 'Unbekannt', starType: 'Schwarzes Loch', worldType: 'void_anomaly', description: 'Schwarzes Loch' },
  { id: 'the-rifts-of-hecaton', name: 'The Rifts of Hecaton', x: -550, y: -180, faction: 'Unbekannt', starType: 'Warp-Anomalie', worldType: 'warp_storm', description: 'Warp-Stürme' },
  
  // Additional Central Systems
  { id: 'omicron-71-52', name: 'Omicron 71-52', x: 0, y: 50, faction: 'Unbekannt', starType: 'Roter Zwerg', worldType: 'mining_world', description: 'Verlassene Minenwelt' },
  { id: 'vexis', name: 'Vexis', x: -50, y: 100, faction: 'Unabhängig', starType: 'Gelber Zwerg', worldType: 'trade_world', description: 'Handelswelt' }
]

export const koronusHyperlanes = [
  // Main Gateway Routes
  { from: 'port-wander', to: 'footfall', distance: 3, danger: 'green' },
  { from: 'port-wander', to: 'furibundus', distance: 3, danger: 'yellow' },
  { from: 'furibundus', to: 'footfall', distance: 4, danger: 'red' },
  
  // From Footfall Hub
  { from: 'footfall', to: 'lucians-hollow', distance: 2, danger: 'green' },
  { from: 'footfall', to: 'solace-encarmine', distance: 3, danger: 'yellow' },
  { from: 'footfall', to: 'valcetti-pallace', distance: 3, danger: 'green' },
  { from: 'footfall', to: 'damaris', distance: 4, danger: 'yellow' },
  
  // Winterscale's Realm Network
  { from: 'solace-encarmine', to: 'burnscour', distance: 2, danger: 'green' },
  { from: 'burnscour', to: 'jerazol', distance: 2, danger: 'green' },
  { from: 'jerazol', to: 'lost-hope', distance: 3, danger: 'yellow' },
  { from: 'lost-hope', to: 'zayth', distance: 3, danger: 'red' },
  { from: 'lucians-hollow', to: 'burnscour', distance: 3, danger: 'yellow' },
  
  // Foundling Worlds Circuit
  { from: 'damaris', to: 'magoros', distance: 2, danger: 'green' },
  { from: 'magoros', to: 'vaporius', distance: 2, danger: 'green' },
  { from: 'damaris', to: 'grace', distance: 2, danger: 'green' },
  { from: 'grace', to: 'valcetti-pallace', distance: 2, danger: 'yellow' },
  { from: 'vaporius', to: 'furibundus', distance: 3, danger: 'yellow' },
  
  // Central Expanse Paths
  { from: 'valcetti-pallace', to: 'the-hermitage', distance: 3, danger: 'yellow' },
  { from: 'the-hermitage', to: 'omicron-71-52', distance: 2, danger: 'yellow' },
  { from: 'omicron-71-52', to: 'vexis', distance: 2, danger: 'green' },
  { from: 'vexis', to: 'grace', distance: 3, danger: 'green' },
  
  // Eastern Reaches (Dangerous)
  { from: 'the-hermitage', to: 'naduesh', distance: 4, danger: 'red' },
  { from: 'zayth', to: 'naduesh', distance: 3, danger: 'red' },
  { from: 'naduesh', to: 'unbeholden-heart', distance: 3, danger: 'red' },
  { from: 'unbeholden-heart', to: 'illisk', distance: 2, danger: 'yellow' },
  { from: 'illisk', to: 'concanid', distance: 3, danger: 'red' },
  { from: 'unbeholden-heart', to: 'concanid', distance: 3, danger: 'red' },
  
  // Far Eastern Systems
  { from: 'concanid', to: 'iniquity', distance: 4, danger: 'red' },
  { from: 'iniquity', to: 'processional-of-the-damned', distance: 2, danger: 'red' },
  
  // Accursed Demense
  { from: 'vexis', to: 'sacris', distance: 3, danger: 'yellow' },
  { from: 'sacris', to: 'dross', distance: 2, danger: 'yellow' },
  { from: 'dross', to: 'kurse', distance: 3, danger: 'red' },
  { from: 'illisk', to: 'sacris', distance: 3, danger: 'red' },
  
  // Heathen Stars (Extremely Dangerous)
  { from: 'processional-of-the-damned', to: 'agusia', distance: 4, danger: 'red' },
  { from: 'agusia', to: 'vayok', distance: 3, danger: 'red' },
  
  // Northwestern Anomalies
  { from: 'solace-encarmine', to: 'cinerus-maleficum', distance: 4, danger: 'red' },
  { from: 'cinerus-maleficum', to: 'the-rifts-of-hecaton', distance: 2, danger: 'red' },
  { from: 'burnscour', to: 'the-rifts-of-hecaton', distance: 4, danger: 'red' }
]