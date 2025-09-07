/**
 * WH40K ROGUE TRADER SCHIFFSKOMPONENTEN-SYSTEM
 * ===========================================
 * 
 * VERFÜGBARE BONI UND STATS
 * -------------------------
 * 
 * 1. DIREKTE STATS (werden auf Schiffswerte addiert):
 *    - speed: Geschwindigkeit des Schiffs
 *    - maneuverability: Manövrierfähigkeit
 *    - detection: Ortung/Sensorreichweite  
 *    - armor: Panzerungswert
 *    - hullIntegrity: Hüllenintegrität (Lebenspunkte)
 *    - turretRating: Geschützturm-Bewertung
 *    - shields: Anzahl der Deflektorschilde
 *    - morale: Moral der Besatzung
 * 
 * 2. SKILL-BONI (Modifikatoren für Würfelwürfe):
 *    Format: "+X auf [Fertigkeit]"
 *    Beispiele:
 *    - "+10 auf Befehligen"
 *    - "+5 auf Pilot und Navigation"  
 *    - "+10 auf BF für Schiffswaffen"
 *    - "+20 auf Überfallkommando-Aktionen"
 *    - "+10 auf Tech-Gebrauch für Reparaturen"
 * 
 * 3. WAFFEN-SCHADEN-BONI:
 *    - macrobatteries: Zusätzlicher Schaden für Makrobatterien
 *    - lances: Zusätzlicher Schaden für Lanzenwaffen
 *    - torpedoes: Zusätzlicher Schaden für Torpedos
 * 
 * 4. PROJEKT-BONI (für Unternehmungen):
 *    Format: "[Name]: +X Erfolgspunkte bei [Projekttyp]"
 *    Beispiele:
 *    - "+50 Erfolgspunkte bei Handelsprojekten"
 *    - "+100 Erfolgspunkte bei Erforschungsprojekten"
 *    - "+25 Erfolgspunkte bei militärischen Projekten"
 * 
 * 5. SITUATIVE BONI (spezielle Bedingungen):
 *    - Präzise Treffer-Auswahl
 *    - Verdoppelte Vorratsdauer
 *    - Reduzierte Besatzungsverluste
 *    - Verbesserte kritische Treffer-Resistenz
 * 
 * 6. RISIKEN/NACHTEILE:
 *    - Explosionsgefahr bei Munitorium
 *    - Moralverluste bei bestimmten Komponenten
 *    - Reduzierte Stats als Ausgleich für andere Boni
 * 
 * KOMPONENTEN-STRUKTUR
 * --------------------
 * Jede Komponente hat folgende Eigenschaften:
 * {
 *   id: 'eindeutigeID',                // Eindeutige Kennung
 *   name: 'Anzeigename',                // Name für UI
 *   type: 'komponentenTyp',            // Kategorie (bridge, weapon, etc.)
 *   power: X,                           // Benötigte Energie
 *   space: X,                           // Benötigter Raum im Rumpf
 *   sp: X,                              // Schiffspunkte-Kosten
 *   shipTypes: ['type1', 'type2'],     // Erlaubte Schiffstypen ('all' = alle)
 *   
 *   // NEUE BONUS-STRUKTUR (bevorzugt):
 *   bonuses: {
 *     stats: {                        // Direkte Stat-Modifikationen
 *       detection: 5,
 *       morale: 2
 *     },
 *     skills: [                       // Fertigkeits-Boni (Array von Strings)
 *       'Beschreibung: +10 auf Fertigkeit'
 *     ],
 *     weaponDamage: {                 // Waffen-Schaden-Boni
 *       macrobatteries: 1
 *     },
 *     projects: [                     // Projekt-Boni (Array von Strings)
 *       'Name: +50 Erfolgspunkte bei Projekttyp'
 *     ],
 *     situational: [                  // Situative Boni (Array von Strings)
 *       'Spezialeffekt unter bestimmten Bedingungen'
 *     ],
 *     risks: [                        // Risiken/Nachteile (Array von Strings)
 *       'Gefahr: Negativer Effekt'
 *     ]
 *   },
 *   
 *   // ALTE STRUKTUR (Legacy-Support):
 *   special: ['Text mit Effekten'],    // Wird automatisch geparst
 *   description: 'Beschreibungstext'   // Für UI-Anzeige
 * }
 * 
 * BEISPIEL FÜR NEUE KOMPONENTE
 * ----------------------------
 * {
 *   id: 'advancedSensors',
 *   name: 'Fortgeschrittene Sensoren',
 *   type: 'augurArray',
 *   power: 5,
 *   space: 1,
 *   sp: 3,
 *   shipTypes: ['all'],
 *   bonuses: {
 *     stats: {
 *       detection: 15        // +15 auf Ortung
 *     },
 *     skills: [
 *       'Weitreichend: +10 auf Sensorscans'
 *     ],
 *     projects: [
 *       'Tiefenscans: +75 Erfolgspunkte bei Erforschungsprojekten'
 *     ],
 *     situational: [
 *       'Kann versteckte Objekte aufspüren'
 *     ]
 *   },
 *   description: 'Hochmoderne Sensoren mit erweiterter Reichweite.'
 * }
 * 
 * HINWEISE ZUM BEARBEITEN
 * -----------------------
 * 1. Verwende die NEUE bonuses-Struktur für neue Komponenten
 * 2. Die special-Array Struktur wird aus Legacy-Gründen unterstützt
 * 3. Stats werden automatisch addiert (z.B. mehrere +Moral Boni stapeln sich)
 * 4. Skill-Boni mit gleichem Namen werden addiert (+5 und +10 auf BF = +15)
 * 5. shipTypes: ['all'] bedeutet für alle Schiffstypen verfügbar
 * 6. shipTypes kann sein: transport, raider, frigate, lightCruiser, cruiser
 * 7. Externe Komponenten (space: 0) benötigen keinen Platz im Rumpf
 * 8. Negative Werte sind erlaubt (z.B. maneuverability: -2)
 */

// Schiffsklassen-Daten
export const hullTypes = {
  // Transporter
  jerichoClass: {
    id: 'jerichoClass',
    name: 'Pilgerschiff der Jerichoklasse',
    type: 'transport',
    speed: 3,
    maneuverability: -10,
    detection: 5,
    armor: 12,
    hullIntegrity: 50,
    turretRating: 1,
    space: 45,
    power: 0, // Wird durch Antrieb generiert
    sp: 20,
    weaponCapacity: { prow: 1, port: 1, starboard: 1 },
    special: ['Frachtschiff'],
    dimensions: '2,25 km Länge, ca. 0,3 km querab',
    mass: 'ca. 9 Megatonnen',
    crew: 'ca. 20.000 Mitglieder',
    acceleration: '1,6 g',
    description: 'Gewaltige umgebaute Raffinerieschiffe mit riesigen Treibstofftanks, die zu Passagierquartieren umgebaut wurden. Die meisten sind mit einer Handvoll Waffen ausgestattet, um Piraten abzuhalten.',
    image: '/images/ships/jerichoClass.jpg'
  },
  jerichoClass: {
    id: 'romanClass',
    name: 'Schmugler der Romenklasse',
    type: 'transport',
    speed: 8,
    maneuverability: 15,
    detection: 5,
    armor: 10,
    hullIntegrity: 30,
    turretRating: 1,
    space: 40,
    power: 0, // Wird durch Antrieb generiert
    sp: 20,
    weaponCapacity: { prow: 1, top: 1 },
    special: ['Frachtschiff'],
    dimensions: '650m Länge, ca. 100m quer',
    mass: 'ca. 2 Megatonnen',
    crew: 'ca. 500 Mitglieder',
    acceleration: '4,6 g',
    description: 'Spezial Schiff von Grigori Romen niemand weiß wo dieses seltsame Gefährt her kommt oder ob es möge der Imperator uns schützen noch mehr davon gibt',
    image: '/images/ships/romanClass.jpg'
  },
  vagabundClass: {
    id: 'vagabundClass',
    name: 'Handelsschiff der Vagabundenklasse',
    type: 'transport',
    speed: 4,
    maneuverability: -5,
    detection: 10,
    armor: 13,
    hullIntegrity: 40,
    turretRating: 1,
    space: 40,
    power: 0,
    sp: 20,
    weaponCapacity: { prow: 1, dorsal: 1 },
    special: ['Frachtschiff'],
    dimensions: '2 km Länge, ca. 0,4 km querab',
    mass: 'ca. 8 Megatonnen',
    crew: 'ca. 18.000 Mitglieder',
    acceleration: '2,1 g',
    description: 'Kleine, vielseitige Handelsschiffe, die bei Freihändlern wegen ihrer Verlässlichkeit bekannt sind und auch die eine oder andere Breitseite aufbieten können.',
    image: '/images/ships/vagabundClass.jpg'
  },
  
  // Zerstörer
  hazerothClass: {
    id: 'hazerothClass',
    name: 'Freibeuter der Hazerothklasse',
    type: 'raider',
    speed: 10,
    maneuverability: 23,
    detection: 12,
    armor: 14,
    hullIntegrity: 32,
    turretRating: 1,
    space: 35,
    power: 0,
    sp: 30,
    weaponCapacity: { prow: 1, dorsal: 1 },
    dimensions: '1,5 km Länge, ca. 0,25 km querab',
    mass: 'ca. 5 Megatonnen',
    crew: 'ca. 22.000 Mitglieder',
    acceleration: '5,6 g',
    description: 'Schnelle Freibeuter, die Frachtraum und Panzerung für verbesserten Antrieb und verstärkte innere Struktur opfern. Ideal zum Fliehen vor stärkeren Gegnern.',
    image: '/images/ships/hazerothClass.jpg'
  },
  iconoclastClass: {
    id: 'iconoclastClass',
    name: 'Handelszerstörer der Verheererklasse',
    type: 'raider',
    speed: 9,
    maneuverability: 25,
    detection: 10,
    armor: 16,
    hullIntegrity: 30,
    turretRating: 1,
    space: 40,
    power: 0,
    sp: 35,
    weaponCapacity: { prow: 1, dorsal: 1 },
    dimensions: '1,6 km Länge, ca. 0,4 km querab',
    mass: 'ca. 6 Megatonnen',
    crew: 'ca. 24.000 Mitglieder',
    acceleration: '5 g',
    description: 'Schwere Zerstörer mit schnellem Antrieb und großem Frachtraum. Die Waffenbatterien können es mit den meisten Fregatten aufnehmen, aber die Rüstung ist vergleichsweise schlecht.',
    image: '/images/ships/iconoclastClass.jpg'
  },
  
  // Fregatten
  swordClass: {
    id: 'swordClass',
    name: 'Fregatte der Schwertklasse',
    type: 'frigate',
    speed: 8,
    maneuverability: 20,
    detection: 15,
    armor: 18,
    hullIntegrity: 35,
    turretRating: 2,
    space: 40,
    power: 0,
    sp: 40,
    weaponCapacity: { prow: 2, dorsal: 2 },
    dimensions: '1,6 km Länge, ca. 0,3 km querab',
    mass: 'ca. 6 Megatonnen',
    crew: 'ca. 26.000 Mitglieder',
    acceleration: '4,5 g',
    description: 'Das Arbeitspferd der Imperialen Flotte. Diese schnellen und wendigen Schiffe dienen als Eskorte und eignen sich hervorragend für Patrouillen und Aufklärung.',
    image: '/images/ships/swordClass.jpg'
  },
  tempestClass: {
    id: 'tempestClass',
    name: 'Fregatte der Feuersturmklasse',
    type: 'frigate',
    speed: 8,
    maneuverability: 18,
    detection: 12,
    armor: 19,
    hullIntegrity: 36,
    turretRating: 1,
    space: 42,
    power: 0,
    sp: 40,
    weaponCapacity: { dorsal: 2 },
    dimensions: '1,5 km Länge, ca. 0,4 km querab',
    mass: 'ca. 6,1 Megatonnen',
    crew: 'ca. 30.500 Mitglieder',
    acceleration: '4,7 g',
    description: 'Spezialisiertes Schiff, das Langstreckenfeuerkraft für massive Salven auf kürzeste Distanz opfert. Verfügt über dreifach gepanzerten Bug und ist oft mit Raumsoldaten ausgestattet.',
    image: '/images/ships/tempestClass.jpg'
  },
  
  // Leichte Kreuzer
  dauntlessClass: {
    id: 'dauntlessClass',
    name: 'Leichter Kreuzer der Bravourklasse',
    type: 'lightCruiser',
    speed: 7,
    maneuverability: 15,
    detection: 20,
    armor: 19,
    hullIntegrity: 60,
    turretRating: 1,
    space: 60,
    power: 0,
    sp: 55,
    weaponCapacity: { prow: 1, port: 1, starboard: 1 },
    dimensions: '4,5 km Länge, ca. 0,5 km querab',
    mass: 'ca. 20 Megatonnen',
    crew: 'ca. 65.000 Mitglieder',
    acceleration: '4,3 g',
    description: 'Leichte Kundschafterkreuzer sind die Augen und Ohren der Flotte. Sie führen genügend Treibstoff und Vorräte für Patrouillen, die Monate oder Jahre dauern, mit sich und haben genügend Feuerkraft, um kleinere Schiffe zu vernichten. Die Bravourklasse kombiniert die Manövrierfähigkeit einer Fregatte mit brutaler nach vorne gerichteter Lanzenbewaffnung.',
    image: '/images/ships/dauntlessClass.jpg'
  },
  
  // Kreuzer
  lunarClass: {
    id: 'lunarClass',
    name: 'Kreuzer der Mondklasse',
    type: 'cruiser',
    speed: 5,
    maneuverability: 10,
    detection: 10,
    armor: 20,
    hullIntegrity: 70,
    turretRating: 2,
    space: 75,
    power: 0,
    sp: 60,
    weaponCapacity: { prow: 1, port: 2, starboard: 2 },
    dimensions: '5 km Länge, ca. 0,8 km querab',
    mass: 'ca. 28 Megatonnen',
    crew: 'ca. 95.000 Mitglieder',
    acceleration: '2,5 g',
    description: 'Das Rückgrat der Imperialen Flotte. Mit ausgewogener Bewaffnung und robuster Konstruktion sind diese vielseitigen Kreuzer für jeden Kampf gerüstet.',
    image: '/images/ships/lunarClass.jpg'
  },
  //Groß Kreuzer
  exorcistClass: {
    id: 'exorcistClass',
    name: 'Groß Kreuzer der Exorzist Klasse',
    type: 'grandCruiser',
    speed: 4,
    maneuverability: 4,
    detection: 9,
    armor: 20,
    hullIntegrity: 85,
    turretRating: 3,
    space: 80,
    power: 0,
    sp: 71,
    weaponCapacity: { prow: 1, port: 3, starboard: 3 },
    dimensions: '7.3 km Länge, ca. 1,1 km querab',
    mass: 'ca. 37 Megatonnen',
    crew: 'ca. 112.000 Mitglieder',
    acceleration: '1,99 g',
    description: 'Das Rückgrat der Imperialen Flotte. Mit ausgewogener Bewaffnung und robuster Konstruktion sind diese vielseitigen Kreuzer für jeden Kampf gerüstet.',
    image: '/images/ships/exorcistClass.jpg'
  },
  //Schlacht Kreuzer
  exorcitClass: {
    id: 'armageddonClass',
    name: 'Schlacht Kreuzer der Armageddon Klasse',
    type: 'battleCruiser',
    speed: 5,
    maneuverability: 10,
    detection: 10,
    armor: 20,
    hullIntegrity: 70,
    turretRating: 2,
    space: 73,
    power: 0,
    sp: 63,
    weaponCapacity: { prow: 1, port: 2, starboard: 2, dorsal: 1 },
    dimensions: '5 km Länge, ca. 0,8 km querab',
    mass: 'ca. 30 Megatonnen',
    crew: 'ca. 98.500 Mitglieder',
    acceleration: '2,5 g',
    description: 'Das Rückgrat der Imperialen Flotte. Mit ausgewogener Bewaffnung und robuster Konstruktion sind diese vielseitigen Kreuzer für jeden Kampf gerüstet.',
    image: '/images/ships/armageddonClass.jpg'
  },
}

// Essentielle Komponenten
export const essentialComponents = {
  // Plasmaantriebe
  plasmaDrives: [
    // Archäotechnik-Antriebe
    {
      id: 'modifiedDriveT1Jovian',
      name: 'Modifizierter Antrieb Klasse 1 (Jovian)',
      type: 'plasmaDrive',
      power: 35,
      space: 4,
      sp: 3,
      shipTypes: ['transport'],
      isArchaeotech: true,
      bonuses: {
        stats: {
          speed: 1
        },
        situational: [
          'Ultraheißer Plasmakern: Weniger Raum bei höherer Leistung',
          'Weckt das Interesse der Adepten des Mars'
        ]
      },
      description: 'Archäotechnik: Antrieb mit exotischen Materialien in den Brennkammern. Ultraheißer Plasmakern: Weniger Raum bei höherer Leistung Weckt das Interesse der Adepten des Mars'
    },
    {
      id: 'modifiedDriveT2Jovian',
      name: 'Modifizierter Antrieb Klasse 2 (Jovian)',
      type: 'plasmaDrive',
      power: 45,
      space: 6,
      sp: 3,
      shipTypes: ['destroyer', 'frigate'],
      isArchaeotech: true,
      bonuses: {
        stats: {
          speed: 1
        },
        situational: []
      },
      description: 'Archäotechnik: Antrieb mit exotischen Materialien in den Brennkammern. Ultraheißer Plasmakern: Weniger Raum bei höherer Leistung Weckt das Interesse der Adepten des Mars'
    },
    {
      id: 'modifiedDriveT3Jovian',
      name: 'Modifizierter Antrieb Klasse 3 (Jovian)',
      type: 'plasmaDrive',
      power: 60,
      space: 8,
      sp: 3,
      shipTypes: ['lightCruiser'],
      isArchaeotech: true,
      bonuses: {
        stats: {
          speed: 1
        },
        situational: []
      },
      description: 'Archäotechnik: Antrieb mit exotischen Materialien in den Brennkammern. Ultraheißer Plasmakern: Weniger Raum bei höherer Leistung, Weckt das Interesse der Adepten des Mars'
    },
    {
      id: 'modifiedDriveT4Jovian',
      name: 'Modifizierter Antrieb Klasse 4 (Jovian)',
      type: 'plasmaDrive',
      power: 75,
      space: 10,
      sp: 3,
      shipTypes: ['cruiser'],
      isArchaeotech: true,
      bonuses: {
        stats: {
          speed: 1
        },
        situational: []
      },
       description: 'Archäotechnik: Antrieb mit exotischen Materialien in den Brennkammern. Ultraheißer Plasmakern: Weniger Raum bei höherer Leistung, Weckt das Interesse der Adepten des Mars'
    },
    
    
    // Standard Antriebe
    {
      id: 'jovianClass1',
      name: 'Antrieb Klasse 1 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 40,
      space: 12,
      sp: 0,
      shipTypes: ['transport'],
      description: 'Standard-Plasmaantrieb für Transportschiffe.'
    },
    {
      id: 'jovianClass2',
      name: 'Antrieb Klasse 2 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 45,
      space: 10,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
      description: 'Effizienter Plasmaantrieb für mittlere Schiffe.'
    },
    {
      id: 'jovianClass3',
      name: 'Antrieb Klasse 3 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 60,
      space: 12,
      sp: 0,
      shipTypes: ['lightCruiser'],
      description: 'Kraftvoller Plasmaantrieb für leichte Kreuzer.'
    },
    {
      id: 'jovianClass4',
      name: 'Antrieb Klasse 4 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 75,
      space: 14,
      sp: 0,
      shipTypes: ['cruiser'],
      description: 'Massiver Plasmaantrieb für schwere Kreuzer.'
    },
    {
      id: 'jovianClass8a',
      name: 'Antrieb Klasse 8.1 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 44,
      space: 11,
      sp: 1,
      shipTypes: ['frigate'],
      special :['Zuverlässige Konstruktion: Sollte diese Komponente beschädigt, drucklos oder von einem Kritischen Treffer (einschließlich einer 4 oder 6 auf der Tabelle) getroffen werden, würfeln Sie einen W10. Bei einer 4 oder höher wird der Effekt ignoriert.'],
      description: 'Die „Klasse 8“-Antriebe, die in den Werften des Jupiter hergestellt werden, basieren auf einem unvollständigen STC (Standard Template Construct), das vor weniger als einem Jahrtausend entdeckt wurde.  Obwohl sie kühler laufen als andere Jupiter-Antriebe, sind sie wesentlich robuster und können verheerende Schäden ohne Leistungsverlust absorbieren'
    },
    {
      id: 'jovianClass8b',
      name: 'Antrieb Klasse 8.2 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 59,
      space: 13,
      sp: 1,
      shipTypes: ['lightCruiser'],
      special :['Zuverlässige Konstruktion: Sollte diese Komponente beschädigt, drucklos oder von einem Kritischen Treffer (einschließlich einer 4 oder 6 auf der Tabelle) getroffen werden, würfeln Sie einen W10. Bei einer 4 oder höher wird der Effekt ignoriert.'],
      description: 'Die „Klasse 8“-Antriebe, die in den Werften des Jupiter hergestellt werden, basieren auf einem unvollständigen STC (Standard Template Construct), das vor weniger als einem Jahrtausend entdeckt wurde.  Obwohl sie kühler laufen als andere Jupiter-Antriebe, sind sie wesentlich robuster und können verheerende Schäden ohne Leistungsverlust absorbieren'
    },
    {
      id: 'jovianClass8c',
      name: 'Antrieb Klasse 8.3 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 74,
      space: 15,
      sp: 1,
      shipTypes: ['cruiser'],
      special :['Zuverlässige Konstruktion: Sollte diese Komponente beschädigt, drucklos oder von einem Kritischen Treffer (einschließlich einer 4 oder 6 auf der Tabelle) getroffen werden, würfeln Sie einen W10. Bei einer 4 oder höher wird der Effekt ignoriert.'],
      description: 'Die „Klasse 8“-Antriebe, die in den Werften des Jupiter hergestellt werden, basieren auf einem unvollständigen STC (Standard Template Construct), das vor weniger als einem Jahrtausend entdeckt wurde.  Obwohl sie kühler laufen als andere Jupiter-Antriebe, sind sie wesentlich robuster und können verheerende Schäden ohne Leistungsverlust absorbieren'
    },
    {
      id: 'jovianClass8d',
      name: 'Antrieb Klasse 8.4 (Jovian-Schema)',
      type: 'plasmaDrive',
      power: 93,
      space: 20,
      sp: 1,
      shipTypes: ['grandCruiser'],
      special :['Zuverlässige Konstruktion: Sollte diese Komponente beschädigt, drucklos oder von einem Kritischen Treffer (einschließlich einer 4 oder 6 auf der Tabelle) getroffen werden, würfeln Sie einen W10. Bei einer 4 oder höher wird der Effekt ignoriert.'],
      description: 'Die „Klasse 8“-Antriebe, die in den Werften des Jupiter hergestellt werden, basieren auf einem unvollständigen STC (Standard Template Construct), das vor weniger als einem Jahrtausend entdeckt wurde.  Obwohl sie kühler laufen als andere Jupiter-Antriebe, sind sie wesentlich robuster und können verheerende Schäden ohne Leistungsverlust absorbieren'
    },
    {
      id: 'saturineClassA',
      name: 'Antrieb  4A “Ultra” (Saturine-Schema)',
      type: 'plasmaDrive',
      power: 90,
      space: 14,
      sp: 1,
      shipTypes: ['battleCruiser'],
      description: 'Die vorhandenen Stromerzeugungssysteme der meisten Kreuzer waren jedoch einfach nicht in der Lage, die immensen Anforderungen solcher aufgerüsteter Systeme zu unterstützen. Aus diesem Grund schufen die Adepten des Mars raffiniert neu gestaltete Plasma-Antriebe, die in die engen Grenzen der bestehenden Kreuzer-Rümpfe eingebaut werden konnten. Diese Triebwerke werden heute von vielen Tech-Priestern als der Höhepunkt menschlicher technologischer Errungenschaften verehrt.',
    },
    {
      id: 'saturineClassB',
      name: 'Antrieb  5 (Saturine-Schema)',
      type: 'plasmaDrive',
      power: 95,
      space: 18,
      sp: 1,
      shipTypes: ['grandCruiser'],
      description: 'Die vorhandenen Stromerzeugungssysteme der meisten Kreuzer waren jedoch einfach nicht in der Lage, die immensen Anforderungen solcher aufgerüsteter Systeme zu unterstützen. Aus diesem Grund schufen die Adepten des Mars raffiniert neu gestaltete Plasma-Antriebe, die in die engen Grenzen der bestehenden Kreuzer-Rümpfe eingebaut werden konnten. Diese Triebwerke werden heute von vielen Tech-Priestern als der Höhepunkt menschlicher technologischer Errungenschaften verehrt.',
    },
  ],
  
  // Warpantriebe
  warpDrives: [
    {
      id: 'strelov1',
      name: 'Strelov-Warpantrieb Typ 1',
      type: 'warpDrive',
      power: 10,
      space: 10,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
      description: 'Zuverlässiger Warpantrieb für kleinere Schiffe.'
    },
    {
      id: 'strelov2',
      name: 'Strelov-Warpantrieb Typ 2',
      type: 'warpDrive',
      power: 12,
      space: 12,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
      description: 'Leistungsstarker Warpantrieb für große Schiffe.'
    },
    {
      id: 'miloslavHb',
      name: 'Miloslav H-616.b',
      type: 'warpDrive',
      power: 12,
      space: 10,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
      special:['Haste of the Damned: Reduziert die Dauer aller Warp-Reisen um die Hälfte. Allerdings muss alle drei Tage (statt alle fünf Tage) auf der Tabelle für Warp-Reise-Begegnungen (S. 186, Rogue Trader) gewürfelt werden.'],
      description: 'Der Warp-Antrieb H-616.b, der als zwielichtig, aber nicht ganz ketzerisch gilt, ist ein solches Beispiel. Obwohl er Warp-Reisen erheblich verkürzen kann, ist er weniger sicher als neuere Modelle. Er zieht häufiger feindliche Warp-Wesen an und erzeugt disharmonische Warp-Strömungen, die das gesamte Schiff in Gefahr bringen können.'
    },
    {
      id: 'miloslavGb',
      name: 'Miloslav G-616.b',
      type: 'warpDrive',
      power: 12,
      space: 12,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
      special:['Haste of the Damned: Reduziert die Dauer aller Warp-Reisen um die Hälfte. Allerdings muss alle drei Tage (statt alle fünf Tage) auf der Tabelle für Warp-Reise-Begegnungen (S. 186, Rogue Trader) gewürfelt werden.'],
     description: 'Der Warp-Antrieb H-616.b, der als zwielichtig, aber nicht ganz ketzerisch gilt, ist ein solches Beispiel. Obwohl er Warp-Reisen erheblich verkürzen kann, ist er weniger sicher als neuere Modelle. Er zieht häufiger feindliche Warp-Wesen an und erzeugt disharmonische Warp-Strömungen, die das gesamte Schiff in Gefahr bringen können.'
    }
  ],
  
  // Gellerfelder
  gellerFields: [
    {
      id: 'standard',
      name: 'Gellerfeld',
      type: 'gellerField',
      power: 1,
      space: 0,
      sp: 0,
      shipTypes: ['all'],
      description: 'Standard-Gellerfeld zum Schutz vor den Schäden des Warp.'
    },
    {
      id: 'warpsbane',
      name: 'Warpbannrumpf',
      type: 'gellerField',
      power: 1,
      space: 0,
      sp: 2,
      shipTypes: ['all'],
      bonuses: {
        skills: ['Glaubensschild: +10 auf Navigation im Warp']
      },
      description: 'Verstärktes Gellerfeld mit geweihten Schutzsiegeln.'
    },
    {
      id: 'gellarBelecane',
      name: 'Gellar Field 90.r (Belecane-Schema)',
      type: 'gellerField',
      power: 1,
      space: 0,
      sp: 0,
      shipTypes: ['all'],
      bonuses: {
        skills: ['Tainted Field: +10 auf Navigation im Warp']
      },
       special:['Tainted Field: Jede Navigationsprobe, um das Schiff durch den Warp zu steuern, erhält einen Bonus von +10. Allerdings wird das Ergebnis aller Würfe auf der Tabelle für Warp-Reise-Begegnungen (S. 186, Rogue Trader) um 20 reduziert, um das erhöhte Risiko von Warp-Vorfällen widerzuspiegeln, wenn dieser Gellar-Feld-Typ genutzt wird.'],
      description: 'Die Schmiedewelt Belecane im Calixis-Sektor ist bekannt für die Herstellung von Schutzschilden, wie zum Beispiel Void-Schilden, Stasisfeldern und Gellarfeldern. Der Gellar-Feld-Typ 90.r war ein experimenteller Warp-Antrieb, der verbesserte Manövrierfähigkeit im Warp ermöglichte, wodurch das Schiff sich wie ein Raubfisch durch den Raum bewegen konnte. Leider neigte dieser Antrieb bei längerem Gebrauch zu einem unerklärlichen "Flackern", das es dämonischen Wesen ermöglichte, während der Warp-Reise in das Schiff einzudringen. Daher wird er heute nur noch selten verwendet.'
    }
  ],
  
  // Deflektorschilde
  voidShields: [
    // Xenotech
    {
      id: 'eldarHolofield',
      name: 'Eldar Holofeld',
      type: 'voidShield',
      power: 3,
      space: 2,
      sp: 3,
      shipTypes: ['all'],
      isXenotech: true,
      bonuses: {
        situational: [
          'Visuelle Verschleierung: -20 auf alle Angriffe gegen dieses Schiff',
          'Ersetzt Deflektorschilde vollständig'
        ],
        risks: ['Ketzerische Xenos-Technologie: Inquisition wird aufmerksam']
      },
      description: 'Xenotech: Eldar-Technologie, die das Schiff in schimmernden Trugbildern verschleiert.'
    },
    // Standard Schilde
    {
      id: 'single',
      name: 'Einfacher Deflektorschild',
      type: 'voidShield',
      power: 5,
      space: 1,
      sp: 0,
      shipTypes: ['all'],
      shields: 1,
      description: 'Grundlegender Deflektorschild mit einer Schicht.'
    },
    {
      id: 'multi',
      name: 'Gestaffelter Deflektorschild',
      type: 'voidShield',
      power: 7,
      space: 1,
      sp: 1,
      shipTypes: ['cruiser'],
      shields: 2,
      description: 'Fortschrittlicher Deflektorschild mit zwei Schichten.'
    },
    {
      id: 'triple',
      name: 'Gestaffelter Deflektorschild Array',
      type: 'voidShield',
      power: 9,
      space: 3,
      sp: 0,
      shipTypes: ['grandCruiser'],
      shields: 3,
      description: 'Fortschrittlicher Deflektorschild mit drei Schichten.'
    },
    {
      id: 'voidVoss',
      name: 'Voss “Glimmer” Deflektorschild',
      type: 'voidShield',
      power: 3,
      space: 1,
      sp: 0,
      shipTypes: ['all'],
      shields: 1,
       bonuses: {
        risks: ['Flackerndes Deflektorschild: Wenn dieses Schild einen Treffer negiert werfen einen W10 bei 1-3 wird der Treffer nicht negiert ']
      },
      description: 'Void-Schilde gelten als eine der ältesten und robustesten Verteidigungstechnologien der Menschheit. Ihr einziger Nachteil ist der enorme Energieverbrauch. Vor über sechstausend Jahren versuchte die Schmiedewelt Voss, diesen Verbrauch zu senken, indem sie das Phasenmuster der Schilde reduzierte. Das machte sie zwar energieeffizienter, aber auch weniger effektiv. Obwohl diese Schilde heute nicht mehr hergestellt werden, sind sie in relativ sicheren Regionen, in denen nur geringer Widerstand erwartet wird, noch immer im Einsatz.'
    },
    {
      id: 'voidVossHeavy',
      name: 'Gestaffelter Voss “Glimmer” Deflektorschild',
      type: 'voidShield',
      power: 5,
      space: 1,
      sp: 0,
      shipTypes: ['cruiser'],
      shields: 1,
       bonuses: {
        risks: ['Flackerndes Deflektorschild: Wenn dieses Schild einen Treffer negiert werfen einen W10 bei 1-3 wird der Treffer nicht negiert ']
      },
      description: 'Void-Schilde gelten als eine der ältesten und robustesten Verteidigungstechnologien der Menschheit. Ihr einziger Nachteil ist der enorme Energieverbrauch. Vor über sechstausend Jahren versuchte die Schmiedewelt Voss, diesen Verbrauch zu senken, indem sie das Phasenmuster der Schilde reduzierte. Das machte sie zwar energieeffizienter, aber auch weniger effektiv. Obwohl diese Schilde heute nicht mehr hergestellt werden, sind sie in relativ sicheren Regionen, in denen nur geringer Widerstand erwartet wird, noch immer im Einsatz.'
    }
  ],
  
  // Brücken
  bridges: [
    // Archäotechnik
    {
      id: 'ancientBridge',
      name: 'Antike Brücke',
      type: 'bridge',
      power: 2,
      space: 1,
      sp: 2,
      shipTypes: ['all'],
      isArchaeotech: true,
      bonuses: {
        stats: {
          maneuverability: 5
        },
        skills: [
          'Die Augen sind überall: +10 auf Befehligen',
          'Die Augen sind überall: +10 auf soziale Interaktion'
        ],
        situational: []
      },
      description: 'Archäotechnik: Eine Brücke aus dem Dunklen Zeitalter mit Hololith-Technologie. Hololith-Kartentank: Bringt Unvergleichliche Kontrolle über das Schiff'
    },
    // Standard Brücken
    {
      id: 'combat',
      name: 'Kampfbrücke',
      type: 'bridge',
      power: 1,
      space: 1,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
      bonuses: {
        skills: ['Schadenskontrolle: +10 auf Tech-Gebrauch für Reparaturen']
      },
      description: 'Standard-Kampfbrücke mit verbesserter Schadenskontrolle.'
    },
    {
      id: 'combatHeavy',
      name: 'Kampfbrücke (Schwer)',
      type: 'bridge',
      power: 2,
      space: 2,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
      bonuses: {
        skills: ['Schadenskontrolle: +10 auf Tech-Gebrauch für Reparaturen']
      },
      description: 'Schwere Kampfbrücke mit verbesserter Schadenskontrolle.'
    },
    {
      id: 'command',
      name: 'Kommandobrücke',
      type: 'bridge',
      power: 2,
      space: 1,
      sp: 1,
      shipTypes: ['transport', 'raider', 'frigate'],
      bonuses: {
        skills: [
          'Verbesserte Cogitatorrelays: +5 auf Befehligen',
          'Verbesserte Cogitatorrelays: +5 auf BF für Schiffswaffen'
        ],
        risks: ['Anfällig: Bei kritischem Treffer auf 3+ energielos']
      },
      description: 'Fortschrittliche Kommandobrücke mit verbesserten Cogitatorrelays.'
    },
    {
      id: 'commandHeavy',
      name: 'Kommandobrücke (Schwer)',
      type: 'bridge',
      power: 3,
      space: 2,
      sp: 1,
      shipTypes: ['lightCruiser', 'cruiser'],
      bonuses: {
        skills: [
          'Verbesserte Cogitatorrelays: +5 auf Befehligen',
          'Verbesserte Cogitatorrelays: +5 auf BF für Schiffswaffen'
        ]
      },
      description: 'Schwere Kommandobrücke mit verbesserten Cogitatorrelays.'
    },
    {
      id: 'commerce',
      name: 'Handelsbrücke',
      type: 'bridge',
      power: 1,
      space: 1,
      sp: 0,
      shipTypes: ['transport'],
      bonuses: {
        projects: ['Gut organisiert: +50 Erfolgspunkte bei Handelsprojekten mit dem Raumschiff']
      },
      description: 'Für Handelsoperationen optimierte Brücke.'
    },
    {
      id: 'armored',
      name: 'Gepanzerte Kampfbrücke',
      type: 'bridge',
      power: 2,  // Korrigiert für Fregatten
      space: 2,
      sp: 1,
      shipTypes: ['raider', 'frigate'],
      bonuses: {
        skills: [
          'Verbesserter Kartentisch: +5 auf Pilot',
          'Verbesserter Kartentisch: +5 auf Navigation',
          'Verbesserte Feuerleitstelle: +10 auf BF für Schiffswaffen'
        ],
        situational: ['Verstärkte Panzerung: 4+ rettet vor kritischen Treffern']
      },
      description: 'Schwer gepanzerte Brücke mit verbesserter Navigation und Feuerleitstelle.'
    },
    {
      id: 'armoredHeavy',
      name: 'Gepanzerte Kampfbrücke',
      type: 'bridge',
      power: 3,  // Korrigiert für Kreuzer
      space: 2,
      sp: 1,
      shipTypes: ['lightCruiser', 'cruiser'],
      bonuses: {
        skills: [
          'Verbesserter Kartentisch: +5 auf Pilot',
          'Verbesserter Kartentisch: +5 auf Navigation',
          'Verbesserte Feuerleitstelle: +10 auf BF für Schiffswaffen'
        ],
        situational: ['Verstärkte Panzerung: 4+ rettet vor kritischen Treffern']
      },
      description: 'Schwer gepanzerte Brücke mit verbesserter Navigation und Feuerleitstelle.'
    },
    {
      id: 'shipmaster',
      name: 'Schiffsmeisterbrücke',
      type: 'bridge',
      power: 4,
      space: 3,
      sp: 2,
      shipTypes: ['lightCruiser', 'cruiser'],
      bonuses: {
        skills: [
          'Verbesserter Kartentisch: +5 auf Pilot',
          'Verbesserter Kartentisch: +5 auf Navigation',
          'Verbesserte Feuerleitstelle: +10 auf BF für Waffen'
        ]
      },
      description: 'Luxuriöse Brücke für erfahrene Schiffsmeister.'
    },
    {
      id: 'shipfleet',
      name: 'Flotten Befehls Brücke',
      type: 'bridge',
      power: 4,
      space: 4,
      sp: 1,
      shipTypes: ['grandCruiser', 'battleCruiser'],
      bonuses: {
        skills: [
          'Flotten Kommando: +10 Befehligen für alle Brücken Offiziere',
          'Flotten Kommando: +5 Pilot für dieses Schiff und jedes Verbündete',
          'Flotten Kommando: +5 Navigation für dieses Schiff und jedes Verbündete',
        ]
      },
      description: 'Diese Brücke wurde entworfen, um nicht nur ein einzelnes Schiff, sondern eine ganze Flotte zu befehligen. Verbesserten Vox-Systeme, autokogitative Holoprojektoren und Trophäen vergangener Siege füllen den gesamten verfügbaren Raum.'
    },
    {
      id: 'hunterBridge',
      name: 'Jäger Befehls Brücke',
      type: 'bridge',
      power: 2,
      space: 2,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
      bonuses: {
        situational: [
          'Flight Command: +5 Kommando mit Angriffsschiffen.',
          'Flight Command: Proben, um neue Staffeln vorzubereiten, gelten als automatisch bestanden.'
        ],
        projects:['Flight Control: Alle Handelsziele, die Boden-zu-Orbit-Operationen oder den Einsatz von Kleinschiffen betreffen, bringen +25 Erfolgspunkte ein.']
      },
      description: 'Diese Brücke ist speziell für die Koordination mehrerer Staffeln von Angriffsschiffen konzipiert. Sie bietet ständig aktualisierte Anzeigen, Planungssysteme und Vox-Netzwerke, um die gleichzeitige Steuerung mehrerer Angriffsflügel zu ermöglichen.'
    },
    {
      id: 'ivasionBridge',
      name: 'Invasions Brücke',
      type: 'bridge',
      power: 4,
      space: 3,
      sp: 0,
      shipTypes: ['cruiser'],
      bonuses: {
        situational: [
          'Verbesserte Bombardierung: +10 Ballistische Fertigkeit gegen planetare Ziele.',
          'Verbesserte Bombardierung: Bodentruppen, die über Funk mit dem Schiff in Verbindung stehen, gelten als mit einem Multikompass ausgestattet',
        ],
      },
      description: 'Diese Brücke, deren Design von den planetenzerstörer Schwadronen des Imperiums inspiriert wurde, ist auf die Unterstützung von Planeteninvasionen spezialisiert. Sie ermöglicht präzise Bombardierungen von Bodenzielen.'
    }
  ],
  
  // Lebenserhaltungssysteme
  lifeSustainers: [
    // Archäotechnik
    {
      id: 'ancientLifeSustainer',
      name: 'Antikes Lebenserhaltungssystem',
      type: 'lifeSustainer',
      power: 3,
      space: 1,
      sp: 4,
      shipTypes: ['all'],
      isArchaeotech: true,
      bonuses: {
        stats: { morale: 2 },
        situational: [
          'Reduziert nicht-kampfbedingte Mannschaftsverluste um 1'
        ]
      },
      description: 'Archäotechnik: Perfekte Atmosphäre aus vergessenen Zeiten mit komplexem Reinigungssystem.'
    },
    // Standard Lebenserhaltung
    {
      id: 'm1r',
      name: 'Lebenserhaltungssystem Typ 1.r',
      type: 'lifeSustainer',
      power: 3,
      space: 2,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
      bonuses: {
          shipTraits: ['Schale Luft: Moralverlust +1']
      },
      description: 'Das Lebenserhaltungssystem wurde für Verläßlichkeit und Robustheit und nicht auf Komfort ausgelegt. Es trägt nur wenig dazu bei, den Gestank, den Öl und die Entladungen des Warpantriebs erzeugen, aus der Luft zu filtern.'
    },
    {
      id: 'm1rHeavy',
      name: 'Lebenserhaltungssystem Typ 1.r (Schwer)',
      type: 'lifeSustainer',
      power: 4,
      space: 3,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
        bonuses: {
          shipTraits: ['Schale Luft: Moralverlust +1']
      },
       description: 'Das Lebenserhaltungssystem wurde für Verläßlichkeit und Robustheit und nicht auf Komfort ausgelegt. Es trägt nur wenig dazu bei, den Gestank, den Öl und die Entladungen des Warpantriebs erzeugen, aus der Luft zu filtern.'
    },
    {
      id: 'vitae',
      name: 'Lebenserhaltungssystem (Vitae-Schema)',
      type: 'lifeSustainer',
      power: 4,
      space: 2,
      sp: 1,
      shipTypes: ['transport', 'raider', 'frigate'],
      description:' Dieses Lebenserhaltungssystem folgt dem STK und ist im Calixis-Sektor weitverbreitet'
    },
    {
      id: 'clemency',
      name: 'Lebenserhaltungssystem (Clemency-Schema)',
      type: 'lifeSustainer',
      power: 4,
      space: 4,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
      bonuses: {
         shipTraits: ['Verluste bei der Besatzungsgröße und der Moral, die durch Druckabfall verursacht werden, werden um 4 reduziert, auf ein Minimum von 0.'],
         stats: { morale: 1 },
      },
      description:'Clemency-Schema Lebenserhaltungssystem Dieses Lebenserhaltungssystem erweitert die herkömmlichen Wasserfilter und Luftreiniger um Tausende von Notfall-Sauerstofftanks und Vakuum-Anzügen. Diese sind in drucksensitiven Schließfächern in regelmäßigen Abständen über das gesamte Schiff verteilt. Diese umfassenden Redundanzen, zusammen mit den zusätzlichen Druckschotten, minimieren die Auswirkungen von Lecks in der Schiffshülle. So kann die Besatzung schnell reagieren und die Schäden beheben, bevor zu viele im Vakuum verloren gehen.'
    },
    {
      id: 'clemencyHeavy',
      name: 'Lebenserhaltungssystem (Clemency-Schema)',
      type: 'lifeSustainer',
      power: 5,
      space: 5,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
      bonuses: {
         shipTraits: ['Verluste bei der Besatzungsgröße und der Moral, die durch Druckabfall verursacht werden, werden um 4 reduziert, auf ein Minimum von 0.'],
         stats: { morale: 1 },
      },
        description:'Clemency-Schema Lebenserhaltungssystem Dieses Lebenserhaltungssystem erweitert die herkömmlichen Wasserfilter und Luftreiniger um Tausende von Notfall-Sauerstofftanks und Vakuum-Anzügen. Diese sind in drucksensitiven Schließfächern in regelmäßigen Abständen über das gesamte Schiff verteilt. Diese umfassenden Redundanzen, zusammen mit den zusätzlichen Druckschotten, minimieren die Auswirkungen von Lecks in der Schiffshülle. So kann die Besatzung schnell reagieren und die Schäden beheben, bevor zu viele im Vakuum verloren gehen.'
    },
    {
      id: 'vitaeHeavy',
      name: 'Lebenserhaltungssystem (Vitae-Schema) (Schwer)',
      type: 'lifeSustainer',
      power: 5,
      space: 3,
      sp: 1,
      shipTypes: ['lightCruiser', 'cruiser'],
      description:' Dieses Lebenserhaltungssystem folgt dem STK und ist im Calixis-Sektor weitverbreitet'
    }
  ],
  
  // Mannschaftsquartiere
  crewQuarters: [
    {
      id: 'pressed',
      name: 'Zwangsarbeiterquartiere',
      type: 'crewQuarters',
      power: 1,
      space: 2,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
         bonuses: {
         stats: { morale: -2 }  // Beengt
      },
      description:' Der Meister dieses Fahrzeugs schert sich offenbar nicht darum, die beengten und heruntergekommenen Quartiere, mit denen das Raumschiff noch aus seinen Tagen als Flottenschiff ausgestattet ist, zu verbessern.'
    },
    {
      id: 'pressedHeavy',
      name: 'Zwangsarbeiterquartiere (Schwer)',
      type: 'crewQuarters',
      power: 2,
      space: 3,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
       bonuses: {
         stats: { morale: -2 }  // Beengt
      },
      description:' Der Meister dieses Fahrzeugs schert sich offenbar nicht darum, die beengten und heruntergekommenen Quartiere, mit denen das Raumschiff noch aus seinen Tagen als Flottenschiff ausgestattet ist, zu verbessern.'
    },
    {
      id: 'voidsmen',
      name: 'Raumfahrerquartiere',
      type: 'crewQuarters',
      power: 1,
      space: 3,
      sp: 1,
      shipTypes: ['transport', 'raider', 'frigate'],
      description:'Herkömmliche Quartiere für die Mannschaft eines Raumschiffs auf langen Reisen.'
    },
    {
      id: 'voidsmenHeavy',
      name: 'Raumfahrerquartiere (Schwer)',
      type: 'crewQuarters',
      power: 2,
      space: 4,
      sp: 1,
      shipTypes: ['lightCruiser', 'cruiser'],
      description:'Herkömmliche Quartiere für die Mannschaft eines Raumschiffs auf langen Reisen.'
    },
    {
      id: 'ratt',
      name: 'Bilgenratten-Quartiere',
      type: 'crewQuarters',
      power: 1,
      space: 2,
      sp: 0,
      shipTypes: ['transport', 'raider', 'frigate'],
        bonuses: {
         stats: { morale: -3 }, 
         shipTraits : ['Leben im Elend: Verluste der Besatzungszahl durch Druckabfall um 2 reduziert']
      },
      description:'Die meisten Mannschaftsdienstgrade schlafen in der Nähe ihrer Posten. Einige Kapitäne bestehen jedoch darauf, dass ihre Besatzung Hängematten und Feldbetten benutzt, um im Inneren des Schiffes zu schlafen, wo sie besser vor den verwundbaren Decks, die an die kalte Leere angrenzen, geschützt sind. Dies reduziert die Verluste unter der Besatzung im Falle von Rumpfdurchbrüchen etwas, aber die elenden, von Ratten befallenen Bedingungen sind bei der Mannschaft unbeliebt.'
    },
    {
      id: 'rattHeavy',
      name: 'Bilgenratten-Quartiere',
      type: 'crewQuarters',
      power: 2,
      space: 3,
      sp: 0,
      shipTypes: ['lightCruiser', 'cruiser'],
        bonuses: {
         stats: { morale: -3 }, 
         shipTraits : ['Leben im Elend: Verluste der Besatzungszahl durch Druckabfall um 2 reduziert']
      },
      description:'Die meisten Mannschaftsdienstgrade schlafen in der Nähe ihrer Posten. Einige Kapitäne bestehen jedoch darauf, dass ihre Besatzung Hängematten und Feldbetten benutzt, um im Inneren des Schiffes zu schlafen, wo sie besser vor den verwundbaren Decks, die an die kalte Leere angrenzen, geschützt sind. Dies reduziert die Verluste unter der Besatzung im Falle von Rumpfdurchbrüchen etwas, aber die elenden, von Ratten befallenen Bedingungen sind bei der Mannschaft unbeliebt.'
    }
  ],
  
  // Sensoren
  augurArrays: [
    // Archäotechnik
    {
      id: 'autoStabilizedLogis',
      name: 'Autostabilisiertes Logis-Zielerfassungssystem',
      type: 'augurArray',
      power: 5,
      space: 0,
      sp: 2,
      shipTypes: ['all'],
      isArchaeotech: true,
      bonuses: {
        stats: {
          detection: 5
        },
        skills: [
          'Zielmatrix: +5 auf BF für Schiffswaffen'
        ],
        situational: []
      },
      description: 'Archäotechnik: Beinahe ketzerisch intelligente Cogitator-Schaltkreise aus dem Dunklen Zeitalter.'
    },
    // Standard Sensoren
    {
      id: 'm100',
      name: 'Sensorsystem Typ 100',
      type: 'augurArray',
      power: 3,
      space: 0,
      sp: 0,
      shipTypes: ['all'],
      bonuses: {},
      description: 'Das normale Sensorsystem der Imperialen Flotte.'
    },
    {
      id: 'm201b',
      name: 'Sensorsystem Typ 201b',
      type: 'augurArray',
      power: 4,
      space: 0,
      sp: 0,
      shipTypes: ['all'],
      bonuses: {
        stats: { detection: 5 }  // Empfindlich
      },
      description: 'Eine modifizierte Version des normalen Sensorsystems mit verstärktem Breitbandspektrum.'
    },
    {
      id: 'r50',
      name: 'Sensorstaffel R-50',
      type: 'augurArray',
      power: 5,
      space: 0,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        stats: { detection: -2 },
        skills: ['Stellare Ortung: +5 auf Manöverwürfe gegen stellare Phänomene'],
        projects: ['Fernabtastung: +50 Erfolgspunkte bei Erforschungsprojekten mit dem Raumschiff']
      },
      description: 'Für Navigation optimierte Sensoren mit eingeschränktem herkömmlichen Funktionsumfang.'
    },
    {
      id: 'bg15',
      name: 'Sensorsystem Bg-15(Angriffsscanner)',
      type: 'augurArray',
      power: 5,
      space: 0,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        situational: ['Einschlag!: +5 ballistischen Waffen gegen planetare Ziele.'],
        projects: ['Ziele markieren: +50 Erfolgspunkte bei Militärischenprojekten.']
      },
      description: 'Optimiert zur Unterstützung von planetaren Invasionen, sind diese Scanner dafür ausgelegt, die Energiequellen von sowohl planetaren als auch orbitalen Anlagen zu lokalisieren, um sie besser unter Beschuss nehmen zu können.'
    },
    {
      id: 'x470',
      name: 'Sensorsystem X-470 Ultimo Array',
      type: 'augurArray',
      power: 6,
      space: 0,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        stats: { detection: 10 },
        situational: ['Aktives Scannen: +15 beim aktiven Scannen'],
        risks: ['Signal Feuer: Gegner erhalten +5 BF beim Schießen auf das Schiff']
      },
      description: 'Optimiert zur Unterstützung von planetaren Invasionen, sind diese Scanner dafür ausgelegt, die Energiequellen von sowohl planetaren als auch orbitalen Anlagen zu lokalisieren, um sie besser unter Beschuss nehmen zu können.'
    },
    {
      id: 'longRange',
      name: 'Langstreckensensorsystem',
      type: 'augurArray',
      power: 6,
      space: 1,
      sp: 2,
      shipTypes: ['all'],
      bonuses: {
        stats: { detection: 10 },  // Auge des Omnissiah
      },
      special: [
        'Auge des Omnissiah: +10 auf Ortung',
      ],
      description: 'Eines der besten Sensorsysteme des Adeptus Mechanicus, normalerweise nur für ihre eigenen Schiffe und Kundschafter.'
    }
  ]
}

// Zusatzkomponenten (Waffen, Fracht, etc.)
export const supplementalComponents = {
  // Waffen
  weapons: [
    // Makrobatterien
    {
      id: 'thunderstrike',
      name: 'Donnerschlag-Makrokanonen',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 2,
      space: 2,
      sp: 1,
      damage: '1W10+1',
      critValue: 6,
      range: 6,
      strength: 3,
      shipTypes: ['all'],
      description: 'Leichte Makrokanonen mit hoher Feuerrate.'
    },
    {
      id: 'marsMacrocannons',
      name: 'Makrokanonen (Mars-Schema)',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 4,
      space: 2,
      sp: 1,
      damage: '1W10+2',
      critValue: 5,
      range: 6,
      strength: 4,
      shipTypes: ['all'],
      description: 'Standardisierte Mars-Makrokanonen mit verbesserter Durchschlagskraft.'
    },
    {
      id: 'marsBroadside',
      name: 'Breitseitenmakrokanonen (Mars-Schema)',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 4,
      space: 5,
      sp: 3,
      damage: '1W10+2',
      critValue: 5,
      range: 5,
      strength: 6,
      shipTypes: ['lightCruiser', 'cruiser'],
      bonuses: {
        situational: ['Nur für Breitseite montierbar']
      },
      description: 'Schwere Breitseitenbatterien für Kreuzer.'
    },
    {
      id: 'sunfuryLaser',
      name: 'Sonnenfeuer-Laserbatterie',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 6,
      space: 4,
      sp: 1,
      damage: '1W10+2',
      critValue: 4,
      range: 9,
      strength: 4,
      shipTypes: ['all'],
      description: 'Energiewaffen mit hoher Reichweite und Präzision.'
    },
    {
      id: 'ryzaPlasma',
      name: 'Plasmabatterie (Ryza-Schema)',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 8,
      space: 4,
      sp: 3,
      damage: '1W10+4',
      critValue: 4,
      range: 5,
      strength: 5,
      shipTypes: ['all'],
      description: 'Hochenergie-Plasmawaffen mit verheerender Wirkung.'
    },
     {
      id: 'hecutorPlasmaBattery',
      name: 'Plasmabatterie(Hecutor-Schema)',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 8,
      space: 3,
      sp: 2,
      damage: '1W10+2',
      critValue: 4,
      range: 11,
      strength: 3,
      shipTypes: ['lightCruiser', 'cruiser'],
       special:['Verdampfung: Wenn diese Waffenkomponente auf der Tabelle für kritische Treffer eine 1 oder 2 würfelt, wirkt sie sich auf zwei Komponenten anstatt auf eine aus.'
      ],
      description: 'Die Hecutor-Muster-Plasmabatterie ist eine uralte Variante von Plasma-Makrowaffen, die die Energie des Plasma-"Blasts" neu bündelt und in ein komprimiertes photonisches Paket konzentriert, das über extrem große Entfernungen abgefeuert werden kann.'
    },
    // neu - Hecutor-pattern Plasma Broadside
    {
      id: 'hecutorPlasmaBroadside',
      name: 'Plasma Broadside(Hecutor-Schema)',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 12,
      space: 5,
      sp: 2,
      damage: '1W10+2',
      critValue: 4,
      range: 11,
      strength: 5,
      shipTypes: ['battlecruiser', 'grandCruiser'],
      special:['Verdampfung: Wenn diese Waffenkomponente auf der Tabelle für kritische Treffer eine 1 oder 2 würfelt, wirkt sie sich auf zwei Komponenten anstatt auf eine aus.'
      ],
      description: 'Schwere Hecutor-Plasmabreitseite für Großkampfschiffe.'
    },
    // neu - Bombardment Cannons
    {
      id: 'bombardmentCannons',
      name: 'Bombardment-Kanonen(Stygies-Schema)',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 5,
      space: 5,
      sp: 3,
      damage: '1W10+6',
      critValue: 2,
      range: 4,
      strength: 3,
      shipTypes: ['lightCruiser', 'cruiser'],
       bonuses: {
        situational: ['+20 auf alle Einschüchterungs-Proben gegen Charaktere auf Planetenoberflächen.'],
        projects:['+50 Errungenschaftspunkte bei der Arbeit an militärischen Ziel gegen einen Planeten.'],
      },
      special:['Bei einem Einsatz als Teil eines planetaren Bombardements verdoppeln Bombardement-Kanonen die betroffene Fläche, verursachen zusätzlich 20 Schaden an großen Einheiten und zusätzlich 10 Schaden an Einzelpersonen und Fahrzeugen.'

      ],
      description: 'Wie der Name schon andeutet, sind diese verheerenden Waffen darauf ausgelegt, planetare Verteidigungsanlagen in Schutt und Asche zu legen und militärische Landungen zu unterstützen. Meistens nutzen sie Linearbeschleuniger, um massierte Salven von schweren Magmabomben-Sprengköpfen abzufeuern. Obwohl ihre Reichweite relativ gering ist, können sie auch im Kampf zwischen Schiffen eingesetzt werden. Oft reicht schon das Gerücht, dass ein Schiff im Orbit sie an Bord hat, um eine schnelle Kapitulation zu erzwingen.'
    },
    // neu - Disruption Macrocannons
    {
      id: 'disruptionMacrocannons',
      name: 'Disruption Makrokanonen',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 4,
      space: 2,
      sp: 2,
      damage: '1W10+1',
      critValue: null,
      range: 5,
      strength: 3,
      shipTypes: ['all'],
      special:['Kurzschluss im Fluss: Störungswaffen beeinträchtigen die Schaltkreise und Kabel, die für die Energieübertragung erforderlich sind. Für alle fünf Schadenspunkte, die über die Vakuumschilde des Ziels hinausgehen, wird eine zufällige Komponente auf dem Zielschiff stromlos. Der Schaden dieser Waffe wird nicht durch Panzerung beeinflusst.',
               'Ionen-Explosion: Diese Waffen verursachen niemals kritische Treffer und fügen auch der Rumpfintegrität (Hull Integrity) keinen Schaden zu. Diese Waffen können nur mit anderen Störungs-Makrokanonen zu einer Salve kombiniert werden'
              ],
      description: 'Diese Variante einer Makrokanone verschießt eine "Granate" aus hochgeladenen, ionisierten Deuteriumatomen. Diese Partikel verursachen nur minimalen physischen Schaden an ihren Zielen. Stattdessen sollen sie die Energieübertragungssysteme im gesamten Zielschiff überlasten und abschalten. Diese Waffen sind besonders nützlich für Schiffe, die ihre Beute intakt erobern müssen.'
    },
    // neu - Disruption Macrocannon Broadside
    {
      id: 'disruptionMacrocannonBroadside',
      name: 'Disruption Makrokanonen Broadside',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 6,
      space: 5,
      sp: 2,
      damage: '1W10+1',
      critValue: null,
      range: 5,
      strength: 6,
      shipTypes: ['lightCruiser', 'cruiser'],
      special:['Kurzschluss im Fluss: Störungswaffen beeinträchtigen die Schaltkreise und Kabel, die für die Energieübertragung erforderlich sind. Für alle fünf Schadenspunkte, die über die Vakuumschilde des Ziels hinausgehen, wird eine zufällige Komponente auf dem Zielschiff stromlos. Der Schaden dieser Waffe wird nicht durch Panzerung beeinflusst.',
               'Ionen-Explosion: Diese Waffen verursachen niemals kritische Treffer und fügen auch der Rumpfintegrität (Hull Integrity) keinen Schaden zu. Diese Waffen können nur mit anderen Störungs-Makrokanonen zu einer Salve kombiniert werden'
              ],
      description: 'Große Version der Disruption Macrocannons muss in einem Port oder Starboard Slot montiert werden.'
    },
    // neu - Stygies-pattern Macrocannons
    {
      id: 'stygiesMacrocannons',
      name: 'Makrokanonen(Stygies-Schema)',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 4,
      space: 3,
      sp: 1,
      damage: '1W10+2',
      critValue: 5,
      range: 5,
      strength: 3,
      shipTypes: ['all'],
      special: ['Panzerbrechende Munition: Bei der Berechnung des Schadens einer Salve, die Schüsse aus einer Stygies-Muster-Makrokanone enthält und nicht von den Vakuumschilden absorbiert wurde, reduziere die Panzerung des Schiffs um 3. Diese Reduzierung ist nicht permanent und gilt nur für die Berechnung des Schadens dieser einen Salve.'],
      description: 'Diese Variante der Makrokanone ist darauf ausgelegt, schwerere Geschosse abzufeuern als das Mars-Muster. Die alternativen Granaten enthalten einen Adamantium-Kern, der selbst die schwerste Panzerung durchschlägt.'
    },
    // Lanzen
    {
      id: 'starbreakerLance',
      name: 'Sternenbrecher-Lanzenwaffe',
      type: 'weapon',
      weaponType: 'lance',
      power: 6,
      space: 4,
      sp: 1,
      damage: '1W10+2',
      critValue: 3,
      range: 6,
      strength: 1,
      shipTypes: ['all'],
      description: 'Energielanzen die Schilde durchdringen.'
    },
    {
      id: 'titanforgeLance',
      name: 'Titanschmiede-Lanzenwaffe',
      type: 'weapon',
      weaponType: 'lance',
      power: 9,
      space: 4,
      sp: 2,
      damage: '1W10+4',
      critValue: 3,
      range: 6,
      strength: 1,
      shipTypes: ['destroyer', 'frigate', 'lightCruiser', 'cruiser'],
      description: 'Schwere Energielanzen aus den Schmieden der Titanenwerften.'
    },
    {
      id: 'titanforgeLanceBattery',
      name: 'Titanschmiede-Lanzenbatterie',
      type: 'weapon',
      weaponType: 'lance',
      power: 13,
      space: 6,
      sp: 4,
      damage: '1W10+4',
      critValue: 3,
      range: 6,
      strength: 2,
      shipTypes: ['cruiser'],
      description: 'Doppelte Lanzenbatterie für schwere Kreuzer.'
    },
    // neu - Godsbanne Lance
    {
      id: 'godsbanneLance',
      name: 'Godsbanne Lance',
      type: 'weapon',
      weaponType: 'lance',
      power: 9,
      space: 4,
      sp: 3,
      damage: '1W10+2',
      critValue: 3,
      range: 12,
      strength: 1,
      shipTypes: ['battlecruiser', 'grandCruiser'],
      description: 'Mächtige Godsbanne-Energielanze für Großkampfschiffe.'
    },
    // neu - Godsbanne Lance Battery
    {
      id: 'godsbanneLanceBattery',
      name: 'Godsbanne Lance Battery',
      type: 'weapon',
      weaponType: 'lance',
      power: 13,
      space: 6,
      sp: 3,
      damage: '1W10+2',
      critValue: 3,
      range: 12,
      strength: 2,
      shipTypes: ['battlecruiser', 'grandCruiser'],
      description: 'Godsbanne-Lanzenbatterie mit erhöhter Reichweite.'
    },
    // neu - Las-burner
    {
      id: 'lasBurner',
      name: 'Las-burner',
      type: 'weapon',
      weaponType: 'lance',
      power: 7,
      space: 3,
      sp: 2,
      damage: '1W5+1',
      critValue: 3,
      range: 3,
      strength: 2,
      shipTypes: ['all'],
       bonuses: {
        situational: ['Vielseitig: +5 auf die vergleichende Befehlsprobe, die zur Entscheidung von Entermanövern durchgeführt wird.']
      },
      special: ['Kleine Waffe: Las-brenner können bei Schiffen der Fregatten- oder kleineren Größe in den Waffenkapazitätsschlitzen am Rücken (Dorsal) oder Kiel (Keel) installiert werden.'
      ],
      description: 'Las-brenner sind eine verkleinerte Version echter Lanzenwaffen, die gebündelte, energiereiche Laserstrahlen nutzen, um die Panzerung eines Schiffes zu durchschneiden. Obwohl diese Waffen deutlich weniger Schaden anrichten, sind ihre Geschütztürme ebenfalls kleiner, was es auch kleineren Schiffen ermöglicht, sie zu tragen. Ihre relativ geringe Größe erlaubt es aber auch, sie bei Entermanövern einzusetzen, um die äußere Adamantium-Hülle aufzuschneiden und den Bordtruppen Zugang zu den lebenswichtigen Bereichen des Gegners zu verschaffen.'
    },
    // neu - Mezoa Lance Weapon
    {
      id: 'mezoaLance',
      name: 'Mezoa Lance Weapon',
      type: 'weapon',
      weaponType: 'lance',
      power: 9,
      space: 4,
      sp: 3,
      damage: '1W10+4',
      critValue: 4,
      range: 4,
      strength: 1,
      shipTypes: ['all'],
      description: 'Hochschaden-Lanze mit kurzer Reichweite aus den Mezoa-Schmieden.'
    },
    // neu - Mezoa Lance Battery
    {
      id: 'mezoaLanceBattery',
      name: 'Mezoa Lance Battery',
      type: 'weapon',
      weaponType: 'lance',
      power: 13,
      space: 6,
      sp: 3,
      damage: '1W10+5',
      critValue: 4,
      range: 4,
      strength: 2,
      shipTypes: ['lightCruiser', 'cruiser'],
      description: 'Doppelte Mezoa-Lanzenbatterie mit extremer Durchschlagskraft.'
    },
    // neu - Voidsunder Lance Battery
    {
      id: 'voidsunderLanceBattery',
      name: 'Voidsunder Lance Battery',
      type: 'weapon',
      weaponType: 'lance',
      power: 15,
      space: 8,
      sp: 3,
      damage: '1W10+4',
      critValue: 3,
      range: 6,
      strength: 1,
      shipTypes: ['lightCruiser', 'cruiser'],
      description: 'Schwere Voidsunder-Lanzenbatterie die den Raum selbst zerreißt.'
    },
    // Torpedos
    {
      id: 'fortisTorpedoTubes',
      name: 'Fortis-pattern Torpedo Tubes',
      type: 'weapon',
      weaponType: 'torpedo',
      power: 2,
      space: 8,
      sp: 3,
      damage: 'Siehe Torpedos',
      critValue: null,
      range: 'Unbegrenzt',
      strength: 6,
      shipTypes: ['lightCruiser', 'cruiser'],
      description: 'Robuste Fortis-Schema Torpedoröhren mit höherer Ladekapazität.'
    },
    // neu - Gryphonne-pattern Torpedo Tubes
    {
      id: 'gryphonneTorpedoTubes',
      name: 'Gryphonne-pattern Torpedo Tubes',
      type: 'weapon',
      weaponType: 'torpedo',
      power: 2,
      space: 6,
      sp: 1,
      damage: 'Siehe Torpedos',
      critValue: null,
      range: 'Unbegrenzt',
      strength: 4,
      shipTypes: ['raider', 'frigate', 'lightCruiser', 'cruiser'],
      description: 'Effiziente Gryphonne-Torpedoröhren für kleinere Schiffe.'
    },
    // neu - Mars-pattern Torpedo Tubes
    {
      id: 'marsTorpedoTubes',
      name: 'Mars-pattern Torpedo Tubes',
      type: 'weapon',
      weaponType: 'torpedo',
      power: 2,
      space: 8,
      sp: 2,
      damage: 'Siehe Torpedos',
      critValue: null,
      range: 'Unbegrenzt',
      strength: 6,
      shipTypes: ['lightCruiser', 'cruiser'],
      description: 'Standard Mars-Schema Torpedoröhren mit bewährter Technologie.'
    },
    // neu - Voss-pattern Torpedo Tubes
    {
      id: 'vossTorpedoTubes',
      name: 'Voss-pattern Torpedo Tubes',
      type: 'weapon',
      weaponType: 'torpedo',
      power: 1,
      space: 5,
      sp: 1,
      damage: 'Siehe Torpedos',
      critValue: null,
      range: 'Unbegrenzt',
      strength: 2,
      shipTypes: ['all'],
      description: 'Kompakte Voss-Schema Torpedoröhren für alle Schiffsklassen.'
    },
    
    // neu - Nova Cannons
    {
      id: 'marsNovaCannon',
      name: 'Mars-pattern Nova Cannon',
      type: 'weapon',
      weaponType: 'novaCannon',
      power: 3,
      space: 7,
      sp: 3,
      damage: '2W5+4',
      critValue: 3,
      range: '6-40',
      strength: 3,
      shipTypes: ['cruiser'],
      bonuses: {
        situational: ['Flächenschaden in großem Radius', 'Minimum Reichweite: 6 VE']
      },
      description: 'Gewaltige Mars-Schema Nova-Kanone für Flächenbombardierung.'
    },
    // neu - Ryza-pattern Nova Cannon
    {
      id: 'ryzaNovaCannon',
      name: 'Ryza-pattern Nova Cannon',
      type: 'weapon',
      weaponType: 'novaCannon',
      power: 4,
      space: 7,
      sp: 4,
      damage: '2W5+5',
      critValue: 4,
      range: '6-36',
      strength: 4,
      shipTypes: ['cruiser'],
      bonuses: {
        situational: ['Flächenschaden in großem Radius', 'Minimum Reichweite: 6 VE']
      },
      description: 'Verbesserte Ryza-Schema Nova-Kanone mit erhöhter Sprengkraft.'
    },
    
    // neu - Landing Bays
    {
      id: 'holdLandingBay',
      name: 'Hold Landing Bay',
      type: 'weapon',
      weaponType: 'landingBay',
      power: 0,
      space: 1,
      sp: 0,
      damage: null,
      critValue: null,
      range: null,
      strength: 2,
      shipTypes: ['transport'],
      special:['Behelfsmäßig: Diese Umbauten sind für die in den behelfsmäßigen Buchten gestarteten und gelandeten Schiffe nicht ideal. Angriffsschiffe, die von einer Hold Landing Bay starten, verringern ihre Bewegung in der Startrunde um –2 VU (Vehicle Units). Schiffe, die versuchen, in einer Hold Landing Bay zu landen, müssen eine gewöhnliche Flug- (Piloting)+Manövrierbarkeits-Probe (+10) bestehen, um sicher zu landen (Staffeln sollten eine Probe pro Staffel ablegen). Erfolg bedeutet, dass sie sicher landen. Drei oder weniger Misserfolgsgrade bedeuten, dass sie abgedriftet sind, um einen weiteren Versuch zu unternehmen. Ein Misserfolg von vier oder mehr Graden zeigt an, dass das Schiff in die Bucht gestürzt ist (oder ein Schiff pro Misserfolgsgrad, im Falle von Staffeln). Die Komponente gilt sofort als beschädigt (Damaged). Außerhalb des Kampfes können Schiffe sich mehr Zeit für die Landung nehmen. In diesem Fall gibt es keine Probe, aber die Landung dauert eine halbe Stunde pro Staffel.',
               'Nachrüstung: Diese Komponente kann nur als Ersatz für einen integralen Hauptladeraum (Main Cargo Hold) auf einem Transporter installiert werden (weshalb sie keine Platzanforderung hat, da sie den Platz einnimmt, der normalerweise für den Hauptladeraum reserviert ist). Es kann nur eine Hold Landing Bay auf einem Raumschiff ausgerüstet werden. Sie belegt keinen Waffenkapazitätsslot.',
               'Strukturelle Auswirkungen: Die Installation der Hold Landing Bay erfordert das Schneiden massiver Löcher in die Außenhülle des Transportschiffs. Die Rumpfintegrität (Hull Integrity) des Schiffs wird permanent um 5 reduziert, wenn diese Komponente hinzugefügt wird. Zusätzlich erleidet das Schiff einen Malus von –5 auf seine Manövrierbarkeit.'
      ],
      description: 'Improvisierte Landebuchten in umgebauten Frachträumen.'
    },
    // neu - Jovian-pattern Escort Bay
    {
      id: 'jovianEscortBay',
      name: 'Jovian-pattern Escort Bay',
      type: 'weapon',
      weaponType: 'landingBay',
      power: 1,
      space: 4,
      sp: 1,
      damage: null,
      critValue: null,
      range: null,
      strength: 1,
      shipTypes: ['lightCruiser', 'cruiser'],
      description: 'Kompakte Eskorten-Hangars für Jäger und Aufklärer.'
    },
    // neu - Jovian-pattern Landing Bay
    {
      id: 'jovianLandingBay',
      name: 'Jovian-pattern Landing Bay',
      type: 'weapon',
      weaponType: 'landingBay',
      power: 1,
      space: 6,
      sp: 2,
      damage: null,
      critValue: null,
      range: null,
      strength: 2,
      shipTypes: ['cruiser'],
      description: 'Standard Jovian-Landebuchten für Jäger und Bomber.'
    },
    // neu - Lathe-pattern Landing Bay
    {
      id: 'latheLandingBay',
      name: 'Lathe-pattern Landing Bay',
      type: 'weapon',
      weaponType: 'landingBay',
      power: 1,
      space: 5,
      sp: 2,
      damage: null,
      critValue: null,
      range: null,
      strength: 2,
      shipTypes: ['cruiser'],
      special: ['Energiefeld: Die Sicherheitsschleusen dieser Bucht müssen während der strategischen Runde geöffnet sein, wenn Kleinflugzeuge landen oder starten. Wenn diese Komponente jemals die Energie verliert, während die Schleusen geöffnet sind, wird diese Komponente drucklos (Depressurised).'],
      description: 'Lathe-Muster-Landebuchten zeichnen sich durch eine riesige Öffnung aus, die einen ungehinderten Blick in die Leere des Weltraums bietet. Nur das gelegentliche Knistern eines Energiefelds stört die Sicht auf das gähnende Schwarz. Bevor ein Schiff, das mit dieser Komponente ausgestattet ist, in den Warp-Raum eintritt, müssen die riesigen Sicherheitsschleusen geschlossen werden, um diese Öffnung vor jedem Blick auf den Warp-Raum abzuschotten'
    },
    
    // Xenotech-Waffen
    {
      id: 'splinterCannonBattery',
      name: 'Splitterkanonenbatterie',
      type: 'weapon',
      weaponType: 'macrobattery',
      power: 0,
      space: 3,
      sp: 2,
      damage: '1W10+2',
      critValue: 3,
      range: 6,
      strength: 4,
      shipTypes: ['all'],
      isXenotech: true,
      bonuses: {
        situational: [],
        risks: ['Bei Zerstörung(Splitterkanonenbatterie): +2W5 Schaden ohne Rüstungsschutz']
      },
        special: ['Jeder Versuch zur Analyse endet in Katastrophe',
          'Ketzerische Xenos-Technologie',
          'Unbekannte Energiequelle: Kann nie energielos werden'],
      description: 'Mysteriöse Xenos-Waffen unbekannter Herkunft, die weder Energie noch Munition zu benötigen scheinen.'
    }
  ],
  
  // Frachträume und Passagierunterkünfte
  cargo: [
    {
      id: 'cargoBay',
      name: 'Fracht- und Ladebucht',
      type: 'cargo',
      power: 1,
      space: 2,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
       stats: { maneuverability: -1 },
       projects: ['Verborgene Räume: +50 Erfolgspunkte bei Handels- oder kriminellen Projekten mit dem Raumschiff']
      },
      description: 'Standard-Frachtbucht für Transportschiffe.'
    },
    {
      id: 'distributedCargo',
      name: 'Verteilte Frachträume',
      type: 'cargo',
      power: 2,
      space: 5,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        shipTraits: ['Flexibler Laderaum: Kann verschiedene Frachtypen aufnehmen'],
        projects: ['Lagerräume: +100 Erfolgspunkte bei Handelsprojekten mit dem Raumschiff']
      },
      description: 'Frachträume wurden überall im Schiff integriert, um ihre Auswirkungen auf die Flugfähigkeiten des Schiffes so gering wie möglich zu halten.'
    },
    {
      id: 'mainCargo',
      name: 'Hauptfrachtraum',
      type: 'cargo',
      power: 2,
      space: 4,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        shipTraits: ['Großer zentraler Frachtraum: Ideal für Massengüter'],
        projects: ['Sicher eingelagert: +125 Erfolgspunkte bei Handelsprojekten mit dem Raumschiff']
      },
      description: 'Ein einzelner großer Frachtraum im Schiffsrumpf.'
    },
    {
      id: 'luxuryPassenger',
      name: 'Luxuspassagierquartiere',
      type: 'cargo',
      power: 1,
      space: 5,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        stats: { morale: -3 },  // Klassenunterschiede senken die Moral der Crew
        projects: ['Zahlende Kundschaft: +100 Erfolgspunkte bei Glaubens-, Handels- oder kriminellen Projekten mit dem Raumschiff']
      },
      description: 'Opulente Quartiere für wohlhabende Passagiere.'
    },
    {
      id: 'barracks',
      name: 'Truppenunterkünfte',
      type: 'cargo',
      power: 1,
      space: 4,
      sp: 2,
      shipTypes: ['all'],
      bonuses: {
        situational: ['+20 auf alle Befehligen-Würfe für Entermanövern und Überfallkommando.'],
        projects: ['Soldaten: +100 Erfolgspunkte bei militärischen Projekten mit dem Raumschiff']
      },
      description: 'Für wirklich wagemutige Freihändler ist der Krieg ein kaufmännisches Unternehmen wie jedes andere. Mit diesen Truppenunterkünften kann er das ausnutzen, indem er Tausende Soldaten in sein Schiff stopft.'
    },
    {
      id: 'brig',
      name: 'Schiffsgefängnis',
      type: 'cargo',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        stats: { morale: 1 },
        situational: ['Strenge Disziplin: +5 auf Einschüchtern-Würfe bei ausgedehnten Proben.'],
        projects: ['Gefängnisplatz: +25 Bei der Arbeit an jedem Ziel, bei dem das Fangen, Verwahren oder der Transport von Gefangenen nützlich sein könnte']
      },
      description: 'Obwohl fast jedes Schiff ein Gefängnis hat, verfügen einige Schiffe über aufwendigere Einrichtungen. Manche Verliese sind schmutzige, offene Kammern, in denen Gefangene in Elend angekettet sitzen, und ihre Wärter nur alle paar Tage vorbeikommen, um die Rinnen abzuspritzen und die Leichen in den Weltraum zu entlassen. Andere sind makellos effiziente, abgetrennte Verliese, in denen die Insassen jahrelang in wahnsinniger Einzelhaft leben.'
    },
    {
      id: 'partsStore',
      name: 'Ersatzteil-Lager',
      type: 'cargo',
      power: 1,
      space: 5,
      sp: 2,
      shipTypes: ['lightCruiser', 'cruiser'],
      special:['Ersatzteile: Das Ersatzteil-Lager kann zusätzliche Komponenten (die separat erworben wurden) bis zu ihrem kombinierten Raumwert aufnehmen. Dies ermöglicht der Besatzung, sie als Ersatz zu verwenden, wenn eine Komponente zerstört wird. Das Ersetzen einer Komponente erfolgt auf die gleiche Weise wie bei Erweiterten Reparaturen, mit dem Unterschied, dass ein Erfolg auch die gewünschten Komponenten ersetzt. Zusätzlich reparierst du bei der Durchführung von Erweiterten Reparaturen zwei zusätzliche Punkte der Rumpfintegrität.'
      ],
      description: 'Wenn Freihändler sich in Gebiete jenseits selbst der "verlassenen Weite" vorwagen, insbesondere auf langen Erkundungsreisen, kann der Mangel an ordnungsgemäßen Reparaturanlagen zu einem ernsten Problem werden. Wenn Bordsysteme irreparabel beschädigt oder vollständig zerstört werden, können nur Ersatzteile helfen. Wenn das Schiff über ausreichende Lagermöglichkeiten verfügt, kann eine kluge Besatzung für solche Notfälle Ersatzkomponenten einlagern.'
    },
    {
      id: 'partsStoreHeavy',
      name: 'Ersatzteil-Lager',
      type: 'cargo',
      power: 1,
      space: 10,
      sp: 2,
      shipTypes: ['transport', 'grandCruiser'],
      special:['Ersatzteile: Das Ersatzteil-Lager kann zusätzliche Komponenten (die separat erworben wurden) bis zu ihrem kombinierten Raumwert aufnehmen. Dies ermöglicht der Besatzung, sie als Ersatz zu verwenden, wenn eine Komponente zerstört wird. Das Ersetzen einer Komponente erfolgt auf die gleiche Weise wie bei Erweiterten Reparaturen, mit dem Unterschied, dass ein Erfolg auch die gewünschten Komponenten ersetzt. Zusätzlich reparierst du bei der Durchführung von Erweiterten Reparaturen zwei zusätzliche Punkte der Rumpfintegrität.'
      ],
      description: 'Wenn Freihändler sich in Gebiete jenseits selbst der "verlassenen Weite" vorwagen, insbesondere auf langen Erkundungsreisen, kann der Mangel an ordnungsgemäßen Reparaturanlagen zu einem ernsten Problem werden. Wenn Bordsysteme irreparabel beschädigt oder vollständig zerstört werden, können nur Ersatzteile helfen. Wenn das Schiff über ausreichende Lagermöglichkeiten verfügt, kann eine kluge Besatzung für solche Notfälle Ersatzkomponenten einlagern.'
    }
  ],
  
  // Verbesserungen (Panzerung, Triebwerke, etc.)
  improvements: [
    {
      id: 'enhancedRetroThrusters',
      name: 'Verbesserte Manövriertriebwerke',
      type: 'improvement',
      power: 3,
      space: 0,
      sp: 3,
      shipTypes: ['raider', 'frigate'],
      bonuses: {
        stats: {
          maneuverability: 5
        },
        situational: []
      },
      description: 'Externe Zusatztriebwerke für bessere Wendigkeit'
    },
    {
      id: 'enhancedRetroThrustersMedium',
      name: 'Verbesserte Manövriertriebwerke',
      type: 'improvement',
      power: 4,
      space: 0,
      sp: 3,
      shipTypes: ['transport','lightCruiser'],
      bonuses: {
        stats: {
          maneuverability: 5
        },
        situational: []
      },
      description: 'Externe Zusatztriebwerke für bessere Wendigkeit'
    },
    {
      id: 'enhancedRetroThrustersHeavy',
      name: 'Verbesserte Manövriertriebwerke',
      type: 'improvement',
      power: 5,
      space: 0,
      sp: 3,
      shipTypes: ['cruiser'],
      bonuses: {
        stats: {
          maneuverability: 5
        },
        situational: []
      },
      description: 'Externe Zusatztriebwerke für bessere Wendigkeit'
    },
    {
      id: 'reinforcedInteriorBulkheads',
      name: 'Verstärkte Innenwände',
      type: 'improvement',
      power: 0,
      space: 2,
      sp: 2,
      shipTypes: ['transport','frigate', 'raider'],
      bonuses: {
        stats: {
          hullIntegrity: 3
        },
        situational: ['Kritische Treffer: -10 auf kritische Treffertabelle']
      },
      description: 'Zusätzliche Schotten und verstärkte Trennwände'
    },
    {
      id: 'reinforcedInteriorBulkheadsHeavy',
      name: 'Verstärkte Innenwände',
      type: 'improvement',
      power: 0,
      space: 3,
      sp: 2,
      shipTypes: ['cruiser','lightCruiser'],
      bonuses: {
        stats: {
          hullIntegrity: 3
        },
        situational: ['Kritische Treffer: -10 auf kritische Treffertabelle']
      },
      description: 'Zusätzliche Schotten und verstärkte Trennwände'
    },
    {
      id: 'reinforcedArmor',
      name: 'Verstärkte Panzerung',
      type: 'improvement',
      power: 0,
      space: 1,
      sp: 2,
      shipTypes: ['transport', 'raider','frigate'],
      bonuses: {
       stats: {
          armor: 1,
          maneuverability: -2
        },
        situational: []
      },
      description: 'Zusätzliche Panzerplatten und Verstrebungen. Nur eine Verstärkte Panzerung pro Schiff erlaubt'
    },
    {
      id: 'reinforcedArmorHeavy',
      name: 'Verstärkte Panzerung',
      type: 'improvement',
      power: 0,
      space: 2,
      sp: 2,
      shipTypes: ['cruiser','lightCruiser'],
      bonuses: {
        stats: {
          armor: 1,
          maneuverability: -2
        },
        situational: []
      },
      description: 'Zusätzliche Panzerplatten und Verstrebungen. Nur eine Verstärkte Panzerung pro Schiff erlaubt'
    },
    {
      id: 'reinforcedProw',
      name: 'Verstärkter Bug',
      type: 'improvement',
      power: 0,
      space: 4,
      sp: 2,
      shipTypes: ['cruiser'],
      bonuses: {
        stats: {
          
        },
        shipTraits: ['Rammschaden +1W10'],
        situational: [' Imposant: Das Schiff erhält Panzerung +4 für Frontalangriffe. ']
      },
      description: 'Verstärkter Rammsporn und Bug-Panzerung. Ein Schiff mit dieser Komponente kann keine Lanzen oder Makrobatterien am Bug haben.'
    },
    {
      id: 'shadowLabyrinth',
      name: 'Schattenlabyrinth',
      type: 'improvement',
      power: 1,
      space: 2,
      sp: 2,
      shipTypes: ['transport', 'raider','frigate'],
       bonuses: {
        shipTraits: ['Wahnwitziger Aufbau: Die Zielkomponente für einen kritischen Treffer wird vom Kapitän und nicht vom Angreifer bestimmt.'],
        situational: [
          'Eindringlinge: +10 auf Befehligen bei Abwehr von Enterern'
        ]
      },
      description: 'Verwirrendes Netzwerk aus Gängen zum Schutz vor Enterern'
    },
    {
      id: 'shadowLabyrinthHeavy',
      name: 'Schattenlabyrinth',
      type: 'improvement',
      power: 2,
      space: 3,
      sp: 2,
      shipTypes: ['cruiser','lightCruiser'],
      bonuses: {
        shipTraits: ['Wahnwitziger Aufbau: Die Zielkomponente für einen kritischen Treffer wird vom Kapitän und nicht vom Angreifer bestimmt.'],
        situational: [
          'Eindringlinge: +10 auf Befehligen bei Abwehr von Enterern'
        ]
      },
      description: 'Verwirrendes Netzwerk aus Gängen zum Schutz vor Enterern'
    },
    {
      id: 'countermeasures',
      name: 'Gegenmaßnahmen',
      type: 'improvement',
      power: 1,
      space: 1,
      sp: 2,
      shipTypes: ['all'],
      special:['Einmalige Nutzung: Nach dem Auslösen bewirken die Gegenmaßnahmen einen Malus von -20 auf alle Ballistische-Fähigkeiten-Proben (Ballistic Skill Tests), die unternommen werden, um das Schiff anzugreifen. Dieser Malus gilt für die nächsten 1W5+1 strategischen Runden. Torpedos erleiden stattdessen einen Malus von -30. Nach der Nutzung müssen die Gegenmaßnahmen mit einer erfolgreichen Wartungs-Probe (Upkeep Test) außerhalb eines Kampfes (und an einem technologischen System mit Weltraumwerften) wieder aufgefüllt und überholt werden, bevor sie erneut verwendet werden können.'
      ],
      description: 'Das Schiff ist mit einem Paket aus falschen Auspex-Reflektoren, thermischen Bojen, Vox-Scremern und anderen Geräten ausgestattet, die ein feindliches Schiff daran hindern sollen, es präzise zu beschießen.'
    },
    {
      id: 'flak',
      name: 'Flak-Geschütze',
      type: 'improvement',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
       bonuses: {
        shipTraits: ['Flak-Geschütze: Wenn aktiviert(Freihandlung am Anfang der Runde) +1 Turm-Rating -10 Aufklärung.'],
      },
      special: ['Streuschuss: Im Einsatz erhöhen Flak-Geschütze das Geschütz-Rating (Turret Rating) des Schiffes um +1.',
              'Wand aus Feuer und Stahl: Wenn die Flak-Geschütze des Schiffes im Einsatz sind, erleidet es einen Malus von -10 auf seine Entdeckung (Detection).'  
    ],
      description: 'Diese Geschütze wurden entwickelt, um so viel Munition wie möglich in den Raum um ein Schiff herum zu entladen. Flak-Türme feuern ein ständiges Sperrfeuer aus Explosivgeschossen ab, die ankommende Schiffe eher zufällig als gezielt treffen. Aufgrund des massiven Munitionsverbrauchs und der Beeinträchtigung der Schiffssensoren durch die Flak-Wand werden diese Batterien nicht immer eingesetzt. Der Schiffsführer muss zu Beginn jeder strategischen Runde (als freie Aktion) entscheiden, ob die Flak-Geschütze in dieser Runde im Einsatz sind oder inaktiv bleiben.'
    },
    {
      id: 'fieldBracing',
      name: 'Feldverstrebung',
      type: 'improvement',
      power: 0,
      space: 1,
      sp: 2,
      shipTypes: ['all'],
       bonuses: {
        shipTraits: ['Rumpfunterstützung: Kann die Hp um 2, 4 oder 6 erhöhen für 1-3 Energie'],
      },
      special: ['Rumpfunterstützung: Solange diese Komponente mit Strom versorgt wird, erhöht sich die Rumpfintegrität des Schiffes um das Doppelte des zugeführten Stroms, bis zu einem Maximum von +6. Sollte diese Komponente beschädigt werden oder mit weniger Strom versorgt werden, verliert die Hülle diesen Bonuswert proportional. Dies kann die Rumpfintegrität des Schiffes nicht unter 0 senken. Die Strommenge, die dieser Komponente zugeführt wird, kann mit einer schwierigen (+0) Techgebrauch-Probe erhöht werden (dies zählt als freie Aktion im Raumschiffkampf) und kann nach Ermessen des Spielleiters andere Komponenten stromlos machen.' 
    ],
      description:'Die Hülle und die strukturellen Stützen des Schiffes sind mit Kraftfeld-Generatoren verstärkt, die die strukturelle Integrität des Schiffs erheblich verstärken können, solange sie mit Strom versorgt werden.'
  },
    {
      id: 'fireLight',
      name: 'Feuerlöschsysteme',
      type: 'improvement',
      power: 1,
      space: 1,
      sp: 2,
       shipTypes: ['transport', 'raider','frigate'],
        bonuses: {
        shipTraits: ['Feuerlöschsysteme: Kann einmal pro Runde(als Aktion) eine brennende Komponente löschen (-10) Techgebrauch-Probe']
      },
      description:'Das Schiff ist mit zusätzlichen Systemen ausgestattet, wie zum Beispiel speziellen Löschgasen, die alle dazu dienen, Brände zu bekämpfen und deren Ausbreitung zu verhindern.'
  },
    {
      id: 'fireMedium',
      name: 'Feuerlöschsysteme',
      type: 'improvement',
      power: 2,
      space: 2,
      sp: 2,
      shipTypes: ['cruiser','lightCruiser'],
       bonuses: {
        shipTraits: ['Feuerlöschsysteme: Kann einmal pro Runde(als Aktion) eine brennende Komponente löschen (-10) Techgebrauch-Probe']
      },
    
    description:'Das Schiff ist mit zusätzlichen Systemen ausgestattet, wie zum Beispiel speziellen Löschgasen, die alle dazu dienen, Brände zu bekämpfen und deren Ausbreitung zu verhindern.'
  },
    {
      id: 'luxNet',
      name: 'Lux-Netz',
      type: 'improvement',
      power: 0,
      space: 2,
      sp: 2,
      shipTypes: ['all'],
     special: ['Energiequelle: Lux-Netze sind nur auf stationären Schiffen innerhalb eines Sonnensystems funktionsfähig (das heißt, sie erzeugen nur dann Energie). Das Ausfahren dauert 2 Stunden, das Einholen 10 Stunden. Wenn das Schiff während des Betriebs aus irgendeinem Grund bewegt werden muss, wird das Lux-Netz zerstört, da das zerbrechliche Material zerreißt. Das Netz gilt im ausgefahrenen Zustand auch als exponiert (siehe Rogue Trader Seite 191). Bei der Durchführung von erweiterten Reparaturen fügt ein ausgefahrenes Netz der Anzahl der Erfolgsgrade jeder wöchentlichen Techgebrauch-Probe einen Bonus von +1 hinzu.'
     ],
    description:'Nicht alle Freihändler können zu ordentlichen Hafenanlagen zurückkehren, um Schäden aus Kämpfen zu reparieren. Oft müssen sie sich in sicheren Asteroidenfeldern oder abgelegenen Systemen behelfen – ruhige Gebiete, die ihnen ungestörte Zeit für wesentliche Instandsetzungsarbeiten bieten. Um ihre Reparaturen zu beschleunigen, greifen sie auf Hilfsenergiequellen wie Lux-Netze zurück. Diese riesigen Sonnenenergiefänger nutzen hauchdünne Folien, die sich über Hunderte von Quadratkilometern ausbreiten, um zusätzliche Energie zu erzeugen. Sie sind besonders nützlich, wenn die Hauptantriebe beschädigt sind, können aber unerwünschte Aufmerksamkeit auf ein kampfunfähiges Schiff lenken.'
    },
    {
      id: 'minelayer',
      name: 'Minenleger Bucht',
      type: 'improvement',
      power: 1,
      space: 4,
      sp: 1,
      shipTypes: ['transport','lightCruiser','cruiser'],
       bonuses: {
        shipTraits: ['Minenfeld voraus!: gewöhnliche (+20) Techngebrauch-Probe kann Minen in einem Feld auslegen, das einen Bereich von 4 VUs Breite, Tiefe und Höhe hinter dem Schiff abdeckt; dies kann auch als erweiterte Aktion während des Kampfes durchgeführt werden.']
      },
     special: ['Minenfeld voraus!: Beim Erwerb enthält die Minenlegerbucht-Komponente genug Minen für 3 Einsätze. Eine Wartungs-Probe in einem geeigneten Hafen ist erforderlich, um sie mit einem neuen Satz Minen auszustatten. Eine erfolgreiche gewöhnliche (+20) Techngebrauch-Probe kann Minen in einem Feld auslegen, das einen Bereich von 4 VUs Breite, Tiefe und Höhe hinter dem Schiff abdeckt; dies kann auch als erweiterte Aktion während des Kampfes durchgeführt werden. Um zu verhindern, dass die Minen sich gegenseitig versehentlich auslösen, können die Felder nicht überlappen. Für weitere Informationen darüber, wie Minenfelder funktionieren, siehe den Abschnitt "Minenfeld.'      
     ],
    description:'Eine oft angewandte Taktik unter Piratenflotten ist es, eine stark befahrene Schifffahrtsroute mit Minen zu übersäen und sich dann auf jedes unglückliche Schiff zu stürzen, das durch ihre massiven Explosionen lahmgelegt wurde. Sternschiff-Minen sind riesig und können mit katastrophaler Wirkung explodieren. Die meisten werden automatisch über einen passiven Auspex an Bord ausgelöst, um sich auf nahegelegene Schiffe einzuschießen, aber einige können auch ferngesteuert werden, um eine größere Effektivität zu erzielen. Für Raumschiffe, die häufige Transitrouten durch ein System befahren, stellen sie eine ständige Sorge dar, die ständige Wachsamkeit erfordert.'
    },
    {
      id: 'powerRam',
      name: 'Energierammsporn',
      type: 'improvement',
      power: 2,
      space: 0,
      sp: 2,
      shipTypes: ['lightCruiser','cruiser'],
       bonuses: {
        shipTraits: ['Energiesporn: +1W10 Schaden beim Rammen.']
      },
    description:'Während einige Händler die offensichtliche Einschüchterung eines riesigen gepanzerten Bugs bevorzugen, entscheiden sich andere für einen subtileren Ansatz. Sie verkleiden einen ansonsten unscheinbaren Rammsporn mit Kraftfeld-Generatoren. Wenn er aktiviert wird, leuchtet der Rammsporn des Schiffes in einem dunstigen Licht, was oft das Letzte ist, was ein feindlicher Kapitän vor dem Aufprall sieht.'
    },
    {
      id: 'spaceExtension',
      name: 'Raum-Erweiterung',
      type: 'improvement',
      power: 0,
      space: -5,
      sp: 4,
      shipTypes: ['all'],
      description:'Sonder Komponente die 5 Raum bringt ziehen vom verbrauchten ab geben nicht direkt was dazu'
    },
    {
      id: 'energieExtension',
      name: 'Energie-Erweiterung',
      type: 'improvement',
      power: -5,
      space: 0,
      sp: 4,
      shipTypes: ['all'],
      description:'Sonder Komponente die 5 Energie bringt ziehen vom verbrauchten ab geben nicht direkt was dazu'
    }

  ],
  // Zusatzausstattung
  equipment: [
    
    {
      id: 'trophyRoom',
      name: 'Trophäenraum',
      type: 'special',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        projects: ['Gewonnene Erfahrungen: +100 Erfolgspunkte bei Erforschungs-, Handels- oder kriminellen Projekten mit dem Raumschiff']
      },
      description: 'Ein Raum zur Katalogisierung und Zurschaustellung der größten Erfolge. Kann Konkurrenten einschüchtern oder längst vergessene Geheimnisse bergen.'
    },
    {
      id: 'observationDome',
      name: 'Beobachtungskuppel',
      type: 'special',
      power: 0,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        stats: { morale: 1 },
        projects: ['Eingravierte Sternenkarten: +50 Erfolgspunkte bei Erforschungsprojekten mit dem Raumschiff']
      },
      description: 'Eine gigantische Beobachtungskuppel aus Diamantglasscheiben und Panzerglas, die einen ungetrübten Ausblick auf den Weltraum bietet.'
    },

    {
      id: 'templeShrine',
      name: 'Tempelschrein des Gott-Imperators',
      type: 'special',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        stats: { morale: 3 },
        projects: ['Ehrfurcht vor dem Gott-Imperator: +100 Erfolgspunkte bei religiösen Projekten mit dem Raumschiff']
      },
      description: 'Eine ganze Sektion des Schiffs ist eigens dafür vorgesehen, dem Meister der Menschheit durch Gebet und Lobpreisung zu huldigen.'
    },
    
    {
      id: 'munitorium1',
      name: 'Munitorium',
      type: 'special',
      power: 2,
      space: 3,
      sp: 1,
      shipTypes: ['transport', 'raider', 'frigate'],
      bonuses: {
        weaponDamage: { macrobatteries: 1 },  // +1 Schaden für Makrobatterien
        projects: ['Gut bewaffnet: +25 Erfolgspunkte bei militärischen Projekten'],
        risks: ['Explosionsgefahr: Bei Beschädigung des Munitoriums 2W5 Schaden und Feuer']
      },
      special: [
        'Ordinatus Extremus: Makrobatterien +1 Schaden'
      ],
      description: 'Unglaubliches Waffenlager von Handfeuerwaffen bis zu Makrokanonensprengköpfen.'
    },
    {
      id: 'munitorium2',
      name: 'Munitorium',
      type: 'special',
      power: 3,
      space: 4,
      sp: 1,
      shipTypes: ['lightCruiser', 'cruiser'],
    bonuses: {
        weaponDamage: { macrobatteries: 1 },  // +1 Schaden für Makrobatterien
        projects: ['Gut bewaffnet: +25 Erfolgspunkte bei militärischen Projekten'],
        risks: ['Explosionsgefahr: Bei Beschädigung des Munitoriums 2W5 Schaden und Feuer']
      },
      special: [
        'Ordinatus Extremus: Makrobatterien +1 Schaden'
      ],
      description: 'Unglaubliches Waffenlager von Handfeuerwaffen bis zu Makrokanonensprengköpfen.'
    },
    {
      id: 'librariumVault',
      name: 'Librariumsgruft',
      type: 'special',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        skills: ['Gesammelte Daten: +10 auf Ermittlungsfertigkeiten an Bord']
      },
      special: [],
      description: 'Eine uralte Sammlung von Schriften und Manuskripten befindet sich an Bord des Schiffs.'
    },
    {
      id: 'crewReclamationFacility',
      name: 'Mannschafts-Wiederverwertungsstätte',
      type: 'special',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        shipTraits: ['Recycling: Alle Mannschaftsverluste -3 (Min: 1)', 'Moralkonflikt: Moralverluste +1']
      },
      special: [
        'Recycling: Mannschaftsverluste -3 (Minimum: 1)',
        'Moralkonflikt: Moralverluste +1'
      ],
      description: 'Das Mechanicus wandelt schwer Verwundete in Servitoren um. Der Rest der Mannschaft sieht das wahrscheinlich anders.'
    },
    {
      id: 'murderServitors',
      name: 'Mörder-Servitoren',
      type: 'special',
      power: 1,
      space: 1,
      sp: 2,
      shipTypes: ['all'],
      bonuses: {
        skills: ['Todbringer: +20 auf Überfallkommando-Aktionen'],
        situational: ['Präzise: Bei Überfallkommando kann kritischer Treffer 1-6 gewählt werden']
      },
      special: [],
      description: 'Uralte Mördermaschinen mit Schädelfratzen in Kryostarre. Ein Dutzend kann erweckt werden für Überfallkommandos.'
    },
    {
      id: 'cloudmining',
      name: 'Cloudmining-Anlage',
      type: 'special',
      power: 3,
      space: 4,
      sp: 1,
      shipTypes: ['transport'],
      bonuses: {
        projects: ['Geld in den Wolken: +50 auf ein laufendes Projekt bei erfolgreichem Abbau mit der Cloudmining-Anlage'],
      },
      special: ['Geld in den Wolken: Diese Komponente ermöglicht es dem Schiff, Eisbergbau in einem geeigneten Kometenfeld weit außerhalb eines Sonnensystems durchzuführen. Kometen müssen zuerst mit einer schwierigen (+0) Forschenderblick + Aufklärung über die Sensoren des Schiffes geortet werden. Der Abbau dauert dann 1W10+5 Tage. Sobald er abgeschlossen ist, stellen das zusätzliche Frischwasser und die Luft 1W5 Moral wieder her und verlängern die Operationen im tiefen Weltraum um einen weiteren Monat.'],
      description: 'Das Schiff ist mit spezialisierten Enterhaken und Destillations-Laderäumen ausgestattet, um wertvolle Kometen zu verarbeiten, die auf ihren einsamen Bahnen einen Stern umkreisen. Das gewonnene Wasser und die Mineralien können verwendet werden, um die Mannschaft und das Schiff zu versorgen, oder sie können gewinnbringender als gefrorene Brocken an Kenner verkauft werden, die den Luxus von reinem Wolkeneis zu schätzen wissen.'
    },
    {
      id: 'jammingH',
      name: 'Hydraphurian KL-247 Jamming-System',
      type: 'special',
      power: 4,
      space: 0,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        shipTraits:['White noise: Solange das Hydraphurian KL-247 Jamming-System aktiv ist, kann keine "stille Fahrt" durchgeführt werden. Jedoch erleiden alle fokussierten Scanner-Proben, die zum Scannen dieses Schiffs unternommen werden, einen Malus von –20.']
      },
      special: [],
      description: 'Dieses Gerät erzeugt ein heftiges und ständig wechselndes Energiefeld, das die Scanner nahegelegener Schiffe stört'
    },
    {
      id: 'manufaktoriumA',
      name: 'Manufaktorium',
      type: 'special',
      power: 2,
      space: 1,
      sp: 2,
      shipTypes: ['lightCruiser','cruiser'],
      bonuses: {
        projects: ['Zusätzliche Vorlagen: +10 Erfolgspunkte für jedes Handelprojekt'],
        situational: ['Manufacturing: +10 zur wöchentlichen Techgebrauchs-Probe bei Reperaturen.', 
                      'Manufacturing: +10 zur Beschaffungs-Probe für die Wiederherstellung der Rumpfintegrität']
      },
      special: ['Manufaktorium kann eine kleine Anzahl von persönlichen Gegenständen herstellen. Der Spielleiter entscheidet letztendlich, was hergestellt werden kann und was nicht, aber im Allgemeinen sollten es nicht mehr als ein paar Dutzend eines gewöhnlichenGegenstands sein.'],
      description: 'Diese kleinen Konstruktionsanlagen sind in der Lage, zusätzliche Teile herzustellen, die für die Durchführung erweiterter Reparaturen an einem beschädigten Raumschiff benötigt werden. Diese Teile werden aus Rohmaterialien synthetisiert, die in der Regel durch Bergbau auf einem nahegelegenen Asteroiden gewonnen werden.'
    },
    {
      id: 'melodium',
      name: 'Melodium',
      type: 'special',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        stats: {morale: 1},
        skills: ['Lieder in der Leere: +10 auf alle sozialen Fertigkeitsproben.'],
      },
      special: [],
      description: 'Für den Freihändler, der nur das Feinste an Bordausstattung wünscht, ist ein Melodium ideal. Die meisten sind als grandiose Kammern gestaltet, die mit vergoldeten Pfeifen, Hörnern und anderen Instrumenten aller Art bedeckt sind, die eine endlose Vielfalt an Musikstücken erzeugen können. Der Raum selbst verändert beim Spielen seine Form durch clevere Messingverkleidungen und Paneele, um die Melodien besser zu begleiten. Vox-Verstärker im ganzen Schiff übertragen ausgewählte Stücke bis in die tiefsten Bereiche.'
    },
    {
      id: 'medicaeDeck',
      name: 'Krankenstation',
      type: 'special',
      power: 2,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        skills: ['Diagnose und Behandlung: +20 auf alle Medicae-Fertigkeitsproben, die innerhalb der Krankenstation durchgeführt werden.'],
      },
      special: [],
      description: 'Ein Leben als Entdecker führt unweigerlich zu Begegnungen mit unerwartetem Leben. Dieses unerwartete Leben kann zu ebenso unerwarteten Verletzungen sowie zu neuartigen Krankheiten führen. Jede Unterkunft verfügt über eine grundlegende Krankenstation, aber diese ist nicht für jede Art von Verletzung oder Krankheit ausgestattet. Ebenso ist eine Krankenstation nicht dafür gerüstet, die große Anzahl schwer verletzter Überlebender eines stark beschädigten Schiffes oder einer weltweiten Epidemie zu behandeln. Ein Medicae Deck bietet die Einrichtungen und das Personal, um diese beiden Möglichkeiten zu bewältigen.'
    },
    
   
    {
      id: 'plasmaScoup',
      name: 'Plasma-Sonde',
      type: 'special',
      power: 2,
      space: 3,
      sp: 3,
      shipTypes: ['raider','frigate'],
      bonuses: {
        shipTraits: ['Treibstoffsammlen: Mit einer Piloten-Probe(+0) +1 Monat Treibstoff (Gasriese)'],
      },
      special: ['Treibstoffsammlen): Ein Schiff, das mit einer Plasma-Sonde ausgestattet ist, kann versuchen, Bergbauoperationen an Gasriesen-Planeten durchzuführen. Dies erfordert eine schwierige (+0) Flug- (Space Craft)+Manövrierbarkeits-Probe. Ein Misserfolg bedeutet, dass das Schiff 1W5 Schaden an der Rumpfintegrität für jeden Misserfolgsgrad nimmt, wobei Vakuumschilde ignoriert werden (die tödliche Umarmung der Schwerkraft kümmert sich nicht um Schildbarrieren!). Ein Erfolg gewährt dem Schiff einen Monat Betrieb, ohne nachtanken zu müssen, und +5 Errungenschaftspunkte bei jedem Vorhaben-Ziel (Endeavour Objective), das erfordert, dass sich das Schiff bewegt oder etwas transportiert (Handels- oder Erkundungsvorhaben sind offensichtliche Beispiele), da das Schiff dadurch Thrones für die Betankung spart.'],
      description: 'Diese Geräte sind normalerweise nur auf spezialisierten Bergbauschiffen zu finden, die ausschließlich dafür ausgelegt sind, in die Atmosphären von Gasriesen einzudringen, um Treibstoff für Plasma-Antriebe zu sammeln. Sie können auch auf anderen Schiffen mit geeigneten Rumpfverstrebungen angebracht werden, um der zusätzlichen Belastung beim Eintritt in die Atmosphäre standzuhalten.'
    },
    {
      id: 'plasmaScoupHeavy',
      name: 'Plasma-Sonde',
      type: 'special',
      power: 3,
      space: 4,
      sp: 3,
      shipTypes: ['lightCruiser','cruiser'],
      bonuses: {
        shipTraits: ['Treibstoffsammlen: Mit einer Piloten-Probe(+0) +1 Monat Treibstoff (Gasriese)'],
      },
      special: ['Treibstoffsammlen): Ein Schiff, das mit einer Plasma-Sonde ausgestattet ist, kann versuchen, Bergbauoperationen an Gasriesen-Planeten durchzuführen. Dies erfordert eine schwierige (+0) Flug- (Space Craft)+Manövrierbarkeits-Probe. Ein Misserfolg bedeutet, dass das Schiff 1W5 Schaden an der Rumpfintegrität für jeden Misserfolgsgrad nimmt, wobei Vakuumschilde ignoriert werden (die tödliche Umarmung der Schwerkraft kümmert sich nicht um Schildbarrieren!). Ein Erfolg gewährt dem Schiff einen Monat Betrieb, ohne nachtanken zu müssen, und +5 Errungenschaftspunkte bei jedem Vorhaben-Ziel (Endeavour Objective), das erfordert, dass sich das Schiff bewegt oder etwas transportiert (Handels- oder Erkundungsvorhaben sind offensichtliche Beispiele), da das Schiff dadurch Thrones für die Betankung spart.'],
      description: 'Diese Geräte sind normalerweise nur auf spezialisierten Bergbauschiffen zu finden, die ausschließlich dafür ausgelegt sind, in die Atmosphären von Gasriesen einzudringen, um Treibstoff für Plasma-Antriebe zu sammeln. Sie können auch auf anderen Schiffen mit geeigneten Rumpfverstrebungen angebracht werden, um der zusätzlichen Belastung beim Eintritt in die Atmosphäre standzuhalten.'
    },
    {
      id: 'pilotDeck',
      name: 'Pilotendeck',
      type: 'special',
      power: 1,
      space: 1,
      sp: 1,
      shipTypes: ['all'],
      bonuses: {
        shipTraits: [
          'Gefechtsbereit: + 2 auf das Angriffsflugzeug-Rating aller Staffeln an Bord des Raumschiffs'
        ]
      },
      description: 'Es gibt eine besondere Art von Esprit de corps (Korpsgeist) unter jenen, die die unzähligen Angriffsflugzeuge eines Raumschiffes fliegen. Von den draufgängerischen Fury-Abfangjägern über die standhaften Starhawk-Bomberbesatzungen bis hin zu den waghalsigen Shark-Angriffsboot-Piloten – ihre Fähigkeiten und Einsatzbereitschaft können über Leben und Tod des gesamten Schiffes entscheiden. Startbuchten, die mit Bereitschaftsräumen ausgestattet sind, ermöglichen es ihnen, sich ständig für die nächste Mission bereitzuhalten. Trainingssensoren-Systeme erlauben ihnen, ihre Fähigkeiten kontinuierlich zu verbessern, und Ministorum-Kapellen ermöglichen es ihnen, ihre Seelen vorzubereiten, was sie zu unerbittlichen und tödlichen Waffen macht.'
    },
    {
      id: 'salvageM',
      name: 'Bergungs-Modul',
      type: 'special',
      power: 5,
      space: 3,
      sp: 3,
      shipTypes: ['lightCruiser','cruiser','transport'],
      bonuses: {
        stats: { maneuverability: -5 }, 
        shipTraits: [
          'Bergungsoperationen: Kann Kommponenten und Wertsachen von Schiffswrackes Bergen.(Techgebrauch -10)',
        ]
      },
      description: 'Viele Freihändler stoßen auf ihren Reisen durch unerforschte Systeme auf die Wracks von Raumschiffen – einst mächtige Schiffe, die die Leere durchquerten und nun nur noch zerstörte Hüllen ihrer früheren Pracht sind (und oft ist das Schiff des Händlers selbst die Ursache für die Zerstörung). Schiffe, die mit massiven Bergungsklauen ausgestattet sind, können sich an das Wrack heften und nützliche Hüllensektionen oder andere Komponenten mit gigantischen mechanischen Armen, Mega-Melta-Strahlern und anderen Geräten abtrennen. Die geborgenen Komponenten können dann mit Gewinn verkauft oder sogar dem Schiff hinzugefügt werden, um den Ruhm des Händlers und der Besatzung zu mehren.'
    },
    {
      id: 'repaireH',
      name: 'Jäger-Reparaturdeck',
      type: 'special',
      power: 2,
      space: 2,
      sp: 1,
     shipTypes: ['lightCruiser','cruiser'],
      bonuses: {
        shipTraits: [
          'Ersatzteile: Nach jedem Raumschiffkampf, bei dem Jäger, Angriffsboote oder Bomber verloren gehen, kann ein Charakter sofort eine schwierige (-10) Techgebrauch Probe ablegen. Für jeden Erfolgsgrad werden zwei dieser Schiffe repariert.',
        ]
      },
      description: 'Jede Startbucht hat die Möglichkeit, routinemäßige Wartungen und grundlegende Reparaturen an den Flugzeugen durchzuführen, für die sie genutzt wird. Kampfschiffe erleiden jedoch regelmäßig Schäden, die weit über den Umfang grundlegender Reparaturen und routinemäßiger Wartung hinausgehen.'
    },
    {
      id: 'expandedStores',
      name: 'Vergrößerte Lager',
      type: 'special',
      power: 1,
      space: 4,
      sp: 2,
      shipTypes: ['all'],
      bonuses: {
        stats: { morale: 1 },  // Genug für alle da
        situational: [
          'Große Lager: Verdoppelt Zeit im Weltraum ohne Mannschafts-/Moralverluste',
          'Ersatzteile: +1 Rumpfstärke bei ausführlichen Reparaturen'
        ]
      },
      description: 'Große Vorräte gestatten es dem Schiff, längere Reisen anzutreten. Da viele Ersatzteile vorhanden sind, lassen sich Schäden leichter beheben.'
    }
  ]
}

// Archäotechnik (seltene/antike Komponenten)
// HINWEIS: Die meisten Archäotechnik-Komponenten, die essentielle Komponenten ersetzen,
// wurden direkt in die entsprechenden Essential-Kategorien verschoben.
// Hier bleiben nur spezielle Archäotechnik-Komponenten, die keine direkten Ersetzungen sind.
// Temporäre Datei zum Bereinigen der Archäotechnik-Array
// Diese enthält nur das Teleportarium, da alle anderen Komponenten 
// jetzt direkt in den Essential-Kategorien sind

export const archaeotech = [
  {
    id: 'teleportarium',
    name: 'Teleportarium',
    type: 'archaeotech',
    power: 1,
    space: 1,
    sp: 1,
    shipTypes: ['all'],
    isArchaeotech: true,
    bonuses: {
      situational: [
        'Überraschungsschlag: Überfallkommando ohne Enterschiffe möglich',
        'Sofortiger Transport durch das Immaterium'
      ],
      skills: [
        'Überfallkommando: +20 auf Überfallkommando-Aktionen'
      ]
    },
    description: 'Archäotechnik: Relikte aus dem Dunklen Zeitalter, die Individuen augenblicklich durch das Immaterium teleportieren können.'
  },
  {
    id: 'warpSextant',
    name: 'Warp-Sextant',
    type: 'archaeotech',
    power: 4,
    space: 1,
    sp: 2,
    shipTypes: ['all'],
    isArchaeotech: true,
    bonuses: {
      situational: [
        'Der wahre Pfad: +20 auf alle Wahrnehmungs-Proben beim Steuern des Schiffes durch den Warp',
        'Der wahre Pfad: +20 auf alle Navigation(Warp)-Proben beim Steuern des Schiffes durch den Warp',
      ],
    },
    description: 'Dieser massive mit Wasser gefüllte Tank verbessert die Fähigkeit eines Navigators, das Auf und Ab des Warps außerhalb des Schiffes sicher wahrzunehmen. Ein breites Spektrum an Sensoren misst die Intensitäten und Strömungen im Warp außerhalb des Raumschiffs. Diese Informationen werden dann sicher an den Navigator weitergeleitet, damit sie leichter analysiert und verarbeitet werden können. Die Computer des Sextanten unterstützen den Navigator zusätzlich dabei, bekannte Routen zu identifizieren und ihre aktuelle Stabilität zu berechne'
  },
  {
    id: 'warpAntenne',
    name: 'Warp-Antenne',
    type: 'archaeotech',
    power: 1,
    space: 1,
    sp: 2,
    shipTypes: ['all'],
    isArchaeotech: true,
    bonuses: {
      situational: [
        'His Holy Light (Sein Heiliges Licht): Der Navigator erhält einen Bonus von +20 auf alle Proben, um den Astronomican zu lokalisieren.',
      ],
      risks:['Leuchtfeuer: Schiffe, die mit einer Warp-Antenne ausgestattet sind, erleiden einen Malus von -10 auf Warp-Reise-Begegnungsproben .']
    },
    description: 'Als das Imperium begann, sich vom leuchtenden Licht des Astronomican zu entfernen, waren viele Navigatoren viel weniger geübt darin, ihren Weg durch den Warp zu finden. Um bei dieser Technik zu helfen, wurden massive Kraftstäbe an der Außenseite einiger Schiffe angebracht. Diese funktionierten als Antennen und ermöglichten es einem Navigator, das Signal des Astronomican leichter zu empfangen.',
  }
// Weitere spezielle Archäotechnik-Komponenten können hier hinzugefügt werden
]
// Xenotech-Komponenten (Alien-Technologie)
export const xenotechComponents = [
  
  // Neue Xenotech aus dem Regelwerk
  {
    id: 'ghostField',
    name: 'Geisterfeld',
    type: 'xenotech',
    power: 8,
    space: 4,
    sp: 3,
    shipTypes: ['all'],
    isXenotech: true,
    bonuses: {
      situational: [
        'Geisterechos: Gegner -20 auf BF, -30 bei Lanzen, -30 auf Überfallkommando',
      ]
    },
    special: [
      'Ketzerische Eldar-Technologie: Besitz allein ist Grund für Verdammnis',
      'Energetische Interferenz: Kann nicht gleichzeitig mit Deflektorschild betrieben werden'
    ],
    description: 'Eldar-Technologie, die Phantombilder des Schiffs erzeugt um gegnerische Sensoren zu narren.'
  },
  {
    id: 'runeOmen',
    name: 'Runenomen',
    type: 'xenotech',
    power: 0,
    space: 1,
    sp: 2,
    shipTypes: ['all'],
    isXenotech: true,
    bonuses: {
      skills: [
        'Blick in den Warp: +20 auf alle Navigations-Würfe'
      ],
      shipTraits: [
        'Warp-Reisen benötigen nur die halbe Zeit'
      ]
    },
     special: [
      'Ketzerische Eldar-Technologie: Besitz allein ist Grund für Verdammnis',
     
    ],
    description: 'Eldar-Vorhersagetechnologie mit Runensteinen und Kristallinse für bessere Navigation im Warp.'
  },
  {
    id: 'microlaserDefenseGrid',
    name: 'Mikrolaserverteidigungsnetz',
    type: 'xenotech',
    power: 2,
    space: 0,
    sp: 2,
    shipTypes: ['all'],
    isXenotech: true,
    bonuses: {
      stats: {
        turretRating: 2
      }
    },
    special: [
        'Lichtmauer: Hunderte kleine Lasertürme agieren koordiniert',
        'Extern: Benötigt keinen Raum im Rumpf'
      ],
    description: 'Hunderte kleine Lasertürme, die koordiniert Gefechtsköpfe und Kleinraumschiffe abschießen.'
  },
  {
    id: 'gravitySailsLight',
    name: 'Gravitationssegel',
    type: 'xenotech',
    power: 3,
    space: 0,
    sp: 3,
    shipTypes: ['transport', 'raider', 'frigate'],
    isXenotech: true,
    bonuses: {
      stats: {
        speed: 1,
        maneuverability: 5
      },
      situational: [],
     
    },
     special: [
        'Möglicherweise Yu\'vath-Technologie'
      ],
    description: 'Klingenähnliche Flossen am Bug, die sich in Gravitationsfelder einklinken.'
  },
  {
    id: 'gravitySailsHeavy',
    name: 'Gravitationssegel',
    type: 'xenotech',
    power: 5,
    space: 0,
    sp: 3,
    shipTypes: ['lightCruiser', 'cruiser'],
    isXenotech: true,
    bonuses: {
      stats: {
        speed: 1,
        maneuverability: 5
      },
      situational: [
        'Die Strömungen des Raums: Klinken sich in Gravitationsfelder ein',
        'Extern: Benötigt keinen Raum im Rumpf'
      ],
      risks: [
        'Möglicherweise Yu\'vath-Technologie'
      ]
    },
    description: 'Klingenähnliche Flossen am Bug, die sich in Gravitationsfelder einklinken.'
  },

]

// Hilfsfunktionen
export function getComponentById(id) {
  // Durchsuche alle Komponentenlisten
  const allComponents = [
    ...Object.values(essentialComponents).flat(),
    ...Object.values(supplementalComponents).flat(),
    ...archaeotech,
    ...xenotechComponents
  ]
  return allComponents.find(comp => comp.id === id)
}

// Schiffstypen-Vererbung definieren
// Grand Cruiser und Battlecruiser können alles verwenden was Cruiser auch können
const shipTypeInheritance = {
  'grandCruiser': ['cruiser'],      // Grand Cruiser erbt von Cruiser
  'battlecruiser': ['cruiser']      // Battlecruiser erbt von Cruiser  
}

// Helper-Funktion um alle kompatiblen Schiffstypen zu bekommen
function getCompatibleShipTypes(shipType) {
  const compatibleTypes = [shipType]
  
  // Füge vererbte Typen hinzu
  if (shipTypeInheritance[shipType]) {
    compatibleTypes.push(...shipTypeInheritance[shipType])
  }
  
  return compatibleTypes
}

export function getComponentsForShipType(shipType) {
  const result = {
    plasmaDrive: [],
    warpDrive: [],
    gellerField: [],
    voidShield: [],
    bridge: [],
    lifeSustainer: [],
    crewQuarters: [],
    augurArray: [],
    weapons: [],
    cargo: [],
    equipment: [],
    improvements: [],
    archaeotech: [],
    xenotech: []
  }
  
  // Map die Kategoriennamen korrekt
  const categoryMapping = {
    plasmaDrives: 'plasmaDrive',
    warpDrives: 'warpDrive',
    gellerFields: 'gellerField',
    voidShields: 'voidShield',
    bridges: 'bridge',
    lifeSustainers: 'lifeSustainer',
    crewQuarters: 'crewQuarters',
    augurArrays: 'augurArray'
  }
  
  // Hole alle kompatiblen Schiffstypen (inkl. Vererbung)
  const compatibleTypes = getCompatibleShipTypes(shipType)
  
  // Helper-Funktion für Komponenten-Filterung
  const isComponentCompatible = (comp) => {
    if (!comp.shipTypes) return true // Keine Einschränkung
    if (comp.shipTypes.includes('all')) return true // Für alle Schiffe
    
    // Prüfe ob einer der kompatiblen Typen in den erlaubten Typen ist
    return compatibleTypes.some(type => comp.shipTypes.includes(type))
  }
  
  // Filtere essentielle Komponenten nach Schiffstyp
  for (const [category, components] of Object.entries(essentialComponents)) {
    const targetCategory = categoryMapping[category]
    if (targetCategory) {
      result[targetCategory] = components.filter(isComponentCompatible)
    }
  }
  
  // Filtere Zusatzkomponenten nach Schiffstyp
  result.weapons = supplementalComponents.weapons.filter(isComponentCompatible)
  result.cargo = supplementalComponents.cargo.filter(isComponentCompatible)
  result.equipment = supplementalComponents.equipment.filter(isComponentCompatible)
  result.improvements = supplementalComponents.improvements.filter(isComponentCompatible)
  
  // Archäotechnik
  result.archaeotech = archaeotech.filter(isComponentCompatible)
  
  // Xenotech
  result.xenotech = xenotechComponents.filter(isComponentCompatible)
  
  return result
}

export function calculateShipStats(hull, components) {
  // Fallback wenn kein Hull vorhanden
  if (!hull) {
    return {
      usedSpace: 0,
      usedPower: 0,
      totalSP: 0,
      speed: 0,
      maneuverability: 0,
      detection: 0,
      armor: 0,
      hullIntegrity: 35,
      turretRating: 0,
      shields: 0,
      morale: 0,
      situationalBonuses: [],
      shipTraits: [],  // NEU: Schiffseigenschaften
      skillBonuses: {},
      skillBonusesList: [],
      weaponModifiers: {
        macrobatteries: { damage: 0 },
        lances: { damage: 0 },
        torpedoes: { damage: 0 }
      },
      projectBonuses: [],
      risks: []
    }
  }
  
  const stats = {
    usedSpace: 0,
    usedPower: 0,
    totalSP: 0,
    speed: hull.speed || 0,
    maneuverability: hull.maneuverability || 0,
    detection: hull.detection || 0,
    armor: hull.armor || 0,
    hullIntegrity: hull.hullIntegrity || 35,
    turretRating: hull.turretRating || 0,
    shields: 0,
    morale: 0,
    situationalBonuses: [],
    shipTraits: [],  // NEU: Schiffseigenschaften
    skillBonuses: {},  // Objekt für Addierung gleicher Boni
    skillBonusesList: [],  // Finale Liste für Anzeige
    weaponModifiers: {  // Neue Waffen-Modifikatoren
      macrobatteries: { damage: 0 },
      lances: { damage: 0 },
      torpedoes: { damage: 0 }
    },
    projectBonuses: [],  // Projekt-Boni
    risks: []  // Gefahren/Risiken
  }
  
  // Berechne verwendeten Raum und Energie und sammle Boni
  for (const comp of components) {
    if (!comp) continue // Skip null/undefined components
    
    stats.usedSpace += comp.space || 0
    stats.usedPower += comp.power || 0
    stats.totalSP += comp.sp || 0
    
    // Verarbeite Boni aus bonuses-Objekt
    if (comp.bonuses) {
      // Stat-Boni
      if (comp.bonuses.stats) {
        for (const [stat, value] of Object.entries(comp.bonuses.stats)) {
          if (stats[stat] !== undefined) {
            stats[stat] += value
          }
        }
      }
      // Waffen-Schaden-Boni
      if (comp.bonuses.weaponDamage) {
        if (comp.bonuses.weaponDamage.macrobatteries) {
          stats.weaponModifiers.macrobatteries.damage += comp.bonuses.weaponDamage.macrobatteries
        }
        if (comp.bonuses.weaponDamage.lances) {
          stats.weaponModifiers.lances.damage += comp.bonuses.weaponDamage.lances
        }
        if (comp.bonuses.weaponDamage.torpedoes) {
          stats.weaponModifiers.torpedoes.damage += comp.bonuses.weaponDamage.torpedoes
        }
      }
      // Projekt-Boni
      if (comp.bonuses.projects && comp.bonuses.projects.length > 0) {
        console.log('Adding project bonuses from', comp.name, ':', comp.bonuses.projects)
        if (!stats.projectBonuses) stats.projectBonuses = []
        stats.projectBonuses.push(...comp.bonuses.projects)
      }
      // Skill-Boni
      if (comp.bonuses.skills) {
        for (const skill of comp.bonuses.skills) {
          // Parse skill bonus format: "Name: +X auf Y"
          const match = skill.match(/([+-]\d+) auf (.+)/)
          if (match) {
            const value = parseInt(match[1])
            const skillName = match[2]
            if (!stats.skillBonuses[skillName]) {
              stats.skillBonuses[skillName] = 0
            }
            stats.skillBonuses[skillName] += value
          } else {
            // Wenn kein Match, füge es als situativen Bonus hinzu
            stats.situationalBonuses.push(skill)
          }
        }
      }
      // Situative Boni
      if (comp.bonuses.situational) {
        stats.situationalBonuses.push(...comp.bonuses.situational)
      }
      // ShipTraits (NEU)
      if (comp.bonuses.shipTraits) {
        stats.shipTraits.push(...comp.bonuses.shipTraits)
      }
      // Risiken
      if (comp.bonuses.risks) {
        stats.risks.push(...comp.bonuses.risks)
      }
    }
    
    // Spezielle Eigenschaften
    if (comp.shields) stats.shields = comp.shields
    
    // Legacy Support für alte special Arrays (wird zu shipTraits)
    if (comp.special && Array.isArray(comp.special)) {
      for (const special of comp.special) {
        // Filtere echte Eigenschaften (keine Boni oder Risiken)
        if (!special.includes('+') && !special.includes('-') && 
            !special.match(/([+-]\d+) auf/) &&
            !special.includes('Explosion') && !special.includes('gefahr') &&
            special.length > 0) {
          // Füge zu shipTraits hinzu
          if (special.includes('Rammschaden') || special.includes('Doppelte Vorratsdauer') ||
              special.includes('Flexibler Laderaum') || special.includes('Platz für') ||
              special.includes('Extern') || special.includes('Standard bei')) {
            stats.shipTraits.push(special)
          }
        }
      }
    }
  }
  
  // Konvertiere skillBonuses Objekt in Liste für Anzeige
  for (const [skill, value] of Object.entries(stats.skillBonuses)) {
    if (value !== 0) {
      const sign = value >= 0 ? '+' : ''
      stats.skillBonusesList.push(`${sign}${value} auf ${skill}`)
    }
  }
  
  return stats
}