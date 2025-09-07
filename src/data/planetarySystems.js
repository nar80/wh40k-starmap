export const planetarySystems = {
  'port-wander': {
    star: { name: 'Port Wander', type: 'Gelber Zwerg', radius: 50 },
    planets: [
      { 
        name: 'Port Wander Station', 
        type: 'Raumstation', 
        orbitRadius: 150, 
        size: 20,
        description: 'Massive imperiale Raumstation und Tor zur Koronus-Weite',
        color: 0xaaaaaa
      },
      { 
        name: 'Rubyss I', 
        type: 'Felsplanet', 
        orbitRadius: 250, 
        size: 15,
        description: 'Öder Felsplanet ohne Atmosphäre',
        color: 0x888888
      }
    ]
  },
  'footfall': {
    star: { name: 'Footfall', type: 'Oranger Zwerg', radius: 45 },
    planets: [
      { 
        name: 'Footfall Station', 
        type: 'Raumstation', 
        orbitRadius: 120, 
        size: 25,
        description: 'Gesetzlose Handelsstation - Letzte Bastion vor der Weite',
        color: 0x999999
      },
      { 
        name: 'Der Schrottplatz', 
        type: 'Asteroidenfeld', 
        orbitRadius: 200, 
        size: 30,
        description: 'Riesiges Feld aus Schiffswracks',
        color: 0x666666
      },
      { 
        name: 'Kalthart', 
        type: 'Eiswelt', 
        orbitRadius: 350, 
        size: 20,
        description: 'Gefrorene Welt mit wertvollen Mineralien',
        color: 0xaaccff
      }
    ]
  },
  'damaris': {
    star: { name: 'Damaris', type: 'Gelber Zwerg', radius: 50 },
    planets: [
      { 
        name: 'Damaris Prime', 
        type: 'Agrarwelt', 
        orbitRadius: 180, 
        size: 25,
        description: 'Fruchtbare imperiale Agrarwelt',
        color: 0x44aa44,
        moons: [
          { name: 'Festung', size: 8, angle: 0, description: 'Orbitalverteidigung' }
        ]
      },
      { 
        name: 'Damaris II', 
        type: 'Wüstenwelt', 
        orbitRadius: 280, 
        size: 20,
        description: 'Heiße Wüstenwelt mit Promethium-Vorkommen',
        color: 0xccaa66
      },
      { 
        name: 'Damaris III', 
        type: 'Gasgigant', 
        orbitRadius: 400, 
        size: 40,
        description: 'Großer Gasgigant mit Helium-3 Gewinnung',
        color: 0x8866cc,
        moons: [
          { name: 'Station Alpha', size: 5, angle: 0, description: 'Gasabbau-Station' },
          { name: 'Station Beta', size: 5, angle: 180, description: 'Raffinerie' }
        ]
      }
    ]
  },
  'zayth': {
    star: { name: 'Zayth', type: 'Blauer Riese', radius: 60 },
    planets: [
      { 
        name: 'Zayth', 
        type: 'Xenos-Welt', 
        orbitRadius: 250, 
        size: 30,
        description: 'Geheimnisvolle Xenos-Welt mit alten Ruinen',
        color: 0x44ffaa
      },
      { 
        name: 'Die Träne', 
        type: 'Kristallwelt', 
        orbitRadius: 150, 
        size: 15,
        description: 'Planet aus reinem Kristall',
        color: 0xccffff
      }
    ]
  },
  'sacris': {
    star: { name: 'Sacris', type: 'Weißer Zwerg', radius: 30 },
    planets: [
      { 
        name: 'Sacris', 
        type: 'Todeswelt', 
        orbitRadius: 200, 
        size: 25,
        description: 'Verfluchte Welt voller Gefahren',
        color: 0x660066
      },
      { 
        name: 'Der Beobachter', 
        type: 'Künstlicher Satellit', 
        orbitRadius: 300, 
        size: 10,
        description: 'Uralte Xenos-Konstruktion unbekannten Zwecks',
        color: 0xffaa00
      }
    ]
  }
}

// Default system for those not defined
export const defaultPlanetarySystem = {
  star: { name: 'Unbekannter Stern', type: 'Gelber Zwerg', radius: 40 },
  planets: [
    { 
      name: 'Unbekannte Welt', 
      type: 'Unerforscht', 
      orbitRadius: 200, 
      size: 20,
      description: 'Diese Welt wurde noch nicht kartografiert',
      color: 0x666666
    }
  ]
}