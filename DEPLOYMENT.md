# WH40K Starmap - Deployment Guide

## Übersicht

Diese Anleitung beschreibt das einfache Setup: Spielleiter arbeitet lokal, Spieler nutzen eine Netlify-Seite.

## Setup (Empfohlen)

### 1. Spielleiter (Lokal)

Du arbeitest einfach lokal auf deinem PC:

```bash
# Keine spezielle Konfiguration nötig!
npm run dev

# Die App läuft auf http://localhost:5173
# Du hast vollen Zugriff auf alle Funktionen
```

### 2. Spieler-Website (Netlify)

Eine einzige öffentliche Seite für alle Spieler:

1. **Fork das Repository auf GitHub**
2. **Netlify-Account erstellen** (kostenlos)
3. **"New site from Git"** → Repository auswählen
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment variables hinzufügen:**
   ```
   VITE_PLAYER_MODE=true
   VITE_GIST_URL_MAIN=https://gist.github.com/[dein-username]/[gist-id]
   VITE_DEFAULT_CAMPAIGN=main
   ```
6. **Deploy** → Die Seite ist unter `https://[dein-name].netlify.app` erreichbar

## GitHub Gist Setup

### 1. Gist erstellen

1. Gehe zu https://gist.github.com
2. Erstelle einen neuen **öffentlichen** Gist
3. Dateiname: `campaign_main.json`
4. Inhalt (Beispiel):
```json
{
  "systems": [],
  "hyperlanes": [],
  "systemPlanets": {},
  "discoveredSystems": [],
  "playerShip": {
    "currentSystem": "port-wander",
    "path": []
  },
  "campaign": "main",
  "lastUpdate": "2024-01-01T00:00:00Z"
}
```
5. Speichere die Gist ID aus der URL

### 2. GitHub Token erstellen (nur für GM)

1. Gehe zu https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Name: "WH40K Starmap Upload"
4. Scope: ✅ gist
5. Token kopieren und sicher speichern

## Workflow während der Session

### Als Spielleiter (lokal):

1. **Vor der Session:**
   ```bash
   npm run dev
   ```
   - Lade deine gespeicherte Kampagne
   - Bereite neue Systeme/Ereignisse vor

2. **Während der Session:**
   - Arbeite ganz normal in deiner lokalen App
   - Bewege das Schiff
   - Entdecke neue Systeme
   - Bearbeite Planetendaten

3. **Nach der Session:**
   - Öffne Settings (⚙️ Button oben rechts)
   - Klicke "Aktuelle Karte zu GitHub Gist hochladen"
   - Fertig! Spieler sehen die Updates automatisch

### Als Spieler:

1. **Zwischen Sessions:**
   - Öffne die Spieler-URL
   - **Klicke auf den Sync-Button (🔄)** um neue Daten zu laden
   - Der Button zeigt an, wann zuletzt synchronisiert wurde (z.B. "2h" = vor 2 Stunden)
   - Erkunde entdeckte Systeme
   - Mache eigene Notizen (beginnen mit "PLAYER:")
   - Bearbeite Schiffskonfiguration

2. **Schiff-Export:**
   - Settings öffnen
   - "Schiff exportieren" klicken
   - JSON-Datei an GM senden

3. **Daten aktualisieren:**
   - Klicke einfach auf den Sync-Button (🔄) oben rechts
   - Die App zeigt "Daten erfolgreich aktualisiert" wenn neue Daten geladen wurden
   - Kein automatischer Sync - nur wenn du klickst!

## Kampagnen-Management

### Zwei parallele Kampagnen

Das System unterstützt zwei Kampagnen:
- **Hauptkampagne** (`main`)
- **Nebenkampagne** (`side`)

Jede Kampagne hat:
- Eigene Gist-Datei
- Eigenen Spielstand
- Eigene entdeckte Systeme

### Kampagne wechseln:

1. Settings öffnen
2. Bei "Aktive Kampagne" wechseln
3. Daten werden automatisch geladen

## Fehlerbehebung

### "Synchronisation fehlgeschlagen"
- Prüfe die Gist-URL
- Stelle sicher, dass die Gist öffentlich ist
- Prüfe deine Internetverbindung

### "Upload fehlgeschlagen"  
- Prüfe deinen GitHub Token
- Token muss `gist` Berechtigung haben
- Token darf nicht abgelaufen sein

### Spieler sehen keine Updates
- Warte 5 Minuten (Auto-Sync Intervall)
- Oder klicke manuell auf Sync
- Browser-Cache leeren (Strg+F5)

## Sicherheit

- **Gists sind öffentlich!** Keine sensiblen Daten speichern
- GitHub Token nur lokal beim GM speichern
- Spieler-Notizen bleiben immer lokal
- Regelmäßige Backups der Kampagnendaten machen

## Erweiterte Konfiguration

### Custom Domain auf Netlify
1. Domain Einstellungen öffnen
2. Custom Domain hinzufügen
3. DNS konfigurieren

### Sync-Intervall ändern
In `.env`:
```
VITE_SYNC_INTERVAL=10  # 10 Minuten statt 5
```

### Mehrere GMs
Mehrere Personen können GM-Rechte haben:
1. Gleicher GitHub Token
2. Absprache wer wann uploaded
3. Oder: Getrennte Gists pro GM