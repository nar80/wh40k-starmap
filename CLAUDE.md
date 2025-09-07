# WH40K Starmap - Wichtige Projektinformationen

## Übersicht
Warhammer 40k Rogue Trader Sternenkarte für Pen&Paper RPG-Sitzungen im Koronus Expanse.

## Technischer Stack
- Vue 3 mit Composition API
- Quasar Framework für UI
- PixiJS v8 für die Sternenkarte
- Pinia für State Management
- Vite als Build Tool

## Features

### Karten-Editor (Edit-Modus)
**Aktivierung**: Button "Edit Mode" in der oberen rechten Ecke
- **Systeme bearbeiten**: 
  - Rechtsklick auf Karte → Neues System erstellen
  - Doppelklick auf System → System-Editor öffnen (Name, Typ, Fraktion, Sterntyp)
  - Drag & Drop zum Verschieben von Systemen
  - "Planetensystem"-Button im Editor → Planetare Ansicht öffnen
- **Hyperlanes verwalten**:
  - Starlane-Modus aktivieren → Zwei Systeme nacheinander anklicken
  - Gefahrenstufen: Grün/Gelb/Orange/Rot
  - Automatische Distanzberechnung für Reisezeiten
- **Import/Export**:
  - Karten als JSON exportieren (mit Planetendaten)
  - "Planeten importieren" → System-Details aus Textdatei laden
- **Map-Verwaltung**: Mehrere Karten speichern und laden

### Hyperlane-Gefahrenstufen
- **Grün** = Sichere etablierte Routen (dickere Linien, +25% Reisezeit)
- **Gelb** = Normale Gefahr (standard Reisezeit)
- **Orange** = Unsichere Route (-20% Reisezeit)
- **Rot** = Gefährliche aber schnellere Routen (-40% Reisezeit)
- Gefahrenfarben immer sichtbar, auch bei unerforschten Systemen

### Reisezeit-Kalkulator
- Berechnet Warp-Reisezeiten basierend auf Distanz und Gefahr
- Navigator-Erfolgsgrade modifizieren die Zeit (3+ Erfolge = 1/4 Zeit bis 2+ Misserfolge = 4x Zeit)
- Pro Woche Reise: Wurf auf Warp-Begegnungstabelle

### Warp-Begegnungstabelle
- W100 Tabelle mit thematischen Ereignissen
- Navigator-Bonus (+20) wenn Warp erfolgreich eingeschätzt
- Mehrfachwürfe basierend auf Reisewochen

### System-Wichtigkeit
- 0-3 Sterne Bewertung pro System
- Wird auf der Karte über dem System angezeigt
- Persistent in localStorage

### NPC-Tracker
- Verwaltung wichtiger Personen pro System
- Status: Freund/Neutral/Feind mit Farbcodierung
- Notizen und Rollenbeschreibungen
- Tab-basierte UI-Organisation

### System Flavor-Text
- Atmosphärische Beschreibungen für Systeme
- Nicht editierbar, in System-Definition gespeichert
- Kursiv dargestellt mit Zitat-Styling

### Planetensysteme
- Import von Planetendaten aus Textdateien
- Automatische Zuordnung zu Systemen
- Anzeige von Ressourcen und Points of Interest
- Planetare Ansicht mit Orbit-Animation
- Daten werden mit Karte exportiert/importiert

## Wichtige Lösungen und Probleme

### PixiJS v8 Graphics API
- **Problem**: PixiJS v8 hat die Graphics API geändert
- **Lösung**: 
  - Verwende `circle()` + `fill()` statt `beginFill()` + `drawCircle()` + `endFill()`
  - Verwende `setStrokeStyle()` + `stroke()` statt `lineStyle()`
  - BlurFilter: `new PIXI.BlurFilter({ strength: 10 })` statt `new PIXI.BlurFilter(10)`
- **Wichtig**: Mehrere Shapes auf einem Graphics-Objekt funktionieren nur mit neuer API

### Target Indicator (Fadenkreuz)
- **Problem**: Animation mit `alpha` macht Graphics unsichtbar
- **Lösung**: Keine Animation verwenden oder nur `scale` animieren
- **Code-Standort**: `src/components/StarMap.vue` - `drawTargetIndicator()`

### Fog of War System
- **Toggle**: Shift+F aktiviert/deaktiviert für Spielleiter
- Unerforschte Systeme:
  - Werden mit 30% Transparenz angezeigt
  - Namen sind versteckt
  - System-Details zeigen "Unbekanntes System"
  - Fadenkreuz zeigt Richtung auch für unbekannte Systeme

## Entfernte Features
- Treibstoff-System komplett entfernt
- Keine fuel, maxFuel oder refuelShip Mechaniken mehr

## Wichtige Dateien
- `src/components/StarMap.vue` - Hauptkarte mit PixiJS
- `src/components/SystemDetails.vue` - System-Informationen (versteckt für unerforschte)
- `src/components/SystemInfoDialog.vue` - Detaillierter System-Dialog mit Tabs
- `src/components/SystemEditorDialog.vue` - System-Editor für Edit-Modus
- `src/components/StarlaneEditorDialog.vue` - Hyperlane-Editor
- `src/components/PlanetarySystemView.vue` - Planetare Ansicht mit Orbits
- `src/components/SystemDetailsImporter.vue` - Import-Dialog für Planetendaten
- `src/components/ShipControls.vue` - Schiffssteuerung
- `src/components/TravelCalculator.vue` - Warp-Reisezeit Berechnung
- `src/components/WarpEncounterDialog.vue` - W100 Begegnungstabelle
- `src/stores/gameStore.js` - Spielzustand und Logik (inkl. Planetendaten)
- `src/stores/mapStore.js` - Map-Verwaltung und Speicherung
- `src/utils/systemDetailsParser.js` - Parser für Planeten-Import
- `src/data/koronusSystems.js` - Alle Systeme des Koronus Expanse
- `src/data/planetarySystems.js` - Statische Planetensystem-Daten (Fallback)

## Assets
- `/images/cleanbackground.jpg` - Sternenkarten-Hintergrund
- `/images/Rogue-Trader-Ship.png` - Schiffsicon (mit Transparenz)
- `/images/bridge.jpg` - Hintergrund für Schiffskontrollen

## Bekannte Probleme
- Bridge.jpg Hintergrundbild könnte verbessert werden
- Planetary System View hatte Größenprobleme (gelöst mit flexbox)

## Gelöste Probleme (für zukünftige Referenz)

### Problem: Risks werden nicht angezeigt wenn es das einzige Attribut ist
**Symptom:** Wenn eine Komponente (z.B. Waffe) nur `risks` hat aber keine anderen Boni, werden die Risks nicht in der Übersicht angezeigt
**Ursache:** Der übergeordnete "Boni & Modifikatoren" Block hatte ein v-if das nur auf skillBonusesList, situationalBonuses und projectBonuses prüfte, aber NICHT auf risks
**Lösung:** In ShipManagementDialog.vue beim v-if für den "Boni & Modifikatoren" Block auch `|| shipStats.risks?.length` hinzufügen
**Wichtig:** Bei neuen Bonus-Kategorien immer prüfen ob sie im übergeordneten v-if enthalten sind!

## Entwicklungshinweise
- Bei PixiJS Graphics Problemen: Erst einfaches Rechteck testen
- Bei Sichtbarkeitsproblemen: Console.log für Debugging verwenden
- Schrittweise Änderungen machen um Fehlerquellen zu identifizieren
- WICHTIG: Immer PixiJS v8 API verwenden (keine deprecated Methoden!)
- Bei Import/Export: Planetendaten werden automatisch mitgespeichert

## Nächste geplante Features
- **Planeten-Editor**: Direkte Bearbeitung von Planetendaten im UI
- **Erweiterte Planetenansicht**: 
  - Sprites für verschiedene Planetentypen und Stationen
  - Detail-Popup beim Klick auf Planeten mit Bild
  - Erkundet/Unerkundet Status für einzelne Planeten
- **Vollständiger Datenimport**: Alle Systeme aus dem Spiel importieren

## Geplantes Sync-System für Spieler

### Anforderungen
1. **Spieler sollen können:**
   - Alle erkundeten Systeme ansehen und durchklicken
   - System-Beschreibungen und Details lesen
   - Schiffsdetails und Crew ansehen
   - EIGENE Notizen zu Systemen machen (lokal gespeichert)
   - EIGENE NPCs hinzufügen (lokal)
   - Ziele markieren und Routen planen
   - Kommentare schreiben

2. **Spieler sollen NICHT können:**
   - Schiff bewegen
   - Kampagne-kritische Daten ändern
   - Edit-Modus aktivieren

3. **Workflow:**
   - Spielleiter macht alle Änderungen lokal
   - Ende der Session: Upload des Spielstands
   - Spieler bekommen automatisch neuesten Stand
   - Lokale Spieler-Notizen bleiben erhalten

### Implementierungsplan (GitHub Gist Sync)

#### Phase 1: Spieler-Modus
```javascript
// Neuer Toggle in gameStore
const isPlayerMode = ref(localStorage.getItem('playerMode') === 'true')

// Deaktiviert im Spieler-Modus:
- Schiff bewegen Button
- Edit-Modus Toggle
- Fog of War Toggle
- Speichern/Laden von Kampagnendaten
```

#### Phase 2: GitHub Gist Integration
```javascript
// Öffentlicher Gist für Read-Only Zugriff
const GIST_ID = 'xyz' // Wird in .env gespeichert

// Auto-Check alle 5 Minuten
const syncWithGist = async () => {
  const response = await fetch(`https://api.github.com/gists/${GIST_ID}`)
  const gist = await response.json()
  const savegame = JSON.parse(gist.files['savegame.json'].content)
  
  // Merge: Kampagnendaten vom Spielleiter, lokale Notizen behalten
  mergeGameState(savegame, localPlayerNotes)
}
```

#### Phase 3: Lokale Spieler-Daten
```javascript
// Separate Speicherung für Spieler-Notizen
const playerData = {
  personalNotes: {}, // Notizen zu Systemen
  personalNPCs: {},  // Eigene NPCs
  markedGoals: [],   // Markierte Ziele
  comments: []       // Kommentare zur Session
}
// Diese werden NIEMALS vom Sync überschrieben
```

### Alternative Lösungen

1. **Zwei Netlify-Deployments:**
   - spielleiter.netlify.app (Vollzugriff)
   - spieler.netlify.app (Read-Only Version)
   - Manuelles Update nach jeder Session

2. **Firebase Realtime Database:**
   - Echte Echtzeit-Synchronisation
   - Spieler sehen Änderungen sofort
   - Kostenlos bis 1GB/Monat
   - Mehr Aufwand (~1 Tag Implementierung)

3. **Supabase:**
   - PostgreSQL mit Realtime
   - Bessere Permissions-Kontrolle
   - Ebenfalls kostenloser Tier

### Vorteile der GitHub Gist Lösung
- ✅ Komplett kostenlos
- ✅ Kein Backend-Server nötig
- ✅ Spieler brauchen keinen Account
- ✅ Einfach zu implementieren (3-4 Stunden)
- ✅ Lokale Notizen bleiben privat

### Nachteile
- ❌ Keine echte Echtzeit (5 Min Delay)
- ❌ Spielleiter muss manuell uploaden
- ❌ Limitiert auf 1MB pro Gist (reicht aber locker)