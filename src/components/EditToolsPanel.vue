<template>
  <transition name="slide">
    <div v-if="gameStore.editMode" class="edit-tools-panel">
      <div class="panel-header">
        <q-icon name="construction" size="sm" />
        <span class="q-ml-sm">Edit Tools</span>
      </div>
      
      <q-separator />
      
      <div class="tool-section">
        <div class="section-title">Systeme</div>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          :class="{ active: false }"
          @click="$emit('add-system')"
        >
          <q-icon name="add_location" size="sm" class="q-mr-sm" />
          Neues System
        </q-btn>
        <div class="hint-text">
          Rechtsklick auf Karte für neues System
        </div>
      </div>
      
      <q-separator />
      
      <div class="tool-section">
        <div class="section-title">Hyperlanes</div>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          :class="{ active: gameStore.starlaneMode }"
          @click="handleStarlaneToggle"
        >
          <q-icon name="timeline" size="sm" class="q-mr-sm" />
          {{ gameStore.starlaneMode ? 'Starlane-Modus aktiv' : 'Starlane-Modus' }}
        </q-btn>
        <div class="hint-text" v-if="gameStore.starlaneMode">
          Klicke zwei Systeme nacheinander an
        </div>
      </div>
      
      <q-separator />
      
      <div class="tool-section">
        <div class="section-title">Karten-Verwaltung</div>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          @click="$emit('new-map')"
        >
          <q-icon name="add_box" size="sm" class="q-mr-sm" />
          Neue Karte
        </q-btn>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          @click="$emit('save-map')"
        >
          <q-icon name="save_as" size="sm" class="q-mr-sm" />
          Karte speichern
        </q-btn>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          @click="$emit('load-map')"
        >
          <q-icon name="folder_open" size="sm" class="q-mr-sm" />
          Karte laden
        </q-btn>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          @click="$emit('export-map')"
        >
          <q-icon name="download" size="sm" class="q-mr-sm" />
          Karte exportieren
        </q-btn>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          @click="$emit('import-map')"
        >
          <q-icon name="upload" size="sm" class="q-mr-sm" />
          Karte importieren
        </q-btn>
      </div>
      
      <q-separator />
      
      <div class="tool-section">
        <div class="section-title">System-Daten</div>
        <q-btn
          flat
          no-caps
          class="tool-btn"
          @click="$emit('import-system-details')"
        >
          <q-icon name="table_view" size="sm" class="q-mr-sm" />
          Planeten importieren
        </q-btn>
      </div>
      
      <q-separator />
      
      <div class="tool-section">
        <div class="section-title">Aktuelle Karte</div>
        <div class="current-map">
          {{ mapStore.currentMapName === 'default' ? 'Standard Koronus' : mapStore.currentMapName }}
          <q-btn
            flat
            round
            dense
            size="sm"
            :icon="mapStore.isFavorite(mapStore.currentMapName) ? 'star' : 'star_border'"
            :color="mapStore.isFavorite(mapStore.currentMapName) ? 'yellow' : 'grey'"
            @click="toggleCurrentMapFavorite"
            class="float-right"
          >
            <q-tooltip>Als Favorit markieren (max. 3)</q-tooltip>
          </q-btn>
        </div>
        <div class="hint-text" v-if="mapStore.hasUnsavedChanges">
          <q-icon name="warning" color="orange" size="xs" />
          Ungespeicherte Änderungen
        </div>
        <div class="hint-text" v-if="mapStore.favoriteMapNames.length > 0">
          <q-icon name="info" color="blue" size="xs" />
          Favoriten: {{ mapStore.favoriteMapNames.length }}/3
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore'
import { useMapStore } from '../stores/mapStore'

// No props needed anymore, using store directly

const emit = defineEmits([
  'add-system',
  'new-map',
  'save-map',
  'load-map',
  'export-map',
  'import-map',
  'import-system-details'
])

const gameStore = useGameStore()
const mapStore = useMapStore()

const handleStarlaneToggle = () => {
  gameStore.toggleStarlaneMode()
  window.dispatchEvent(new Event('toggleStarlaneMode'))
}

const toggleCurrentMapFavorite = () => {
  mapStore.toggleFavorite(mapStore.currentMapName)
}
</script>

<style scoped>
.edit-tools-panel {
  position: fixed;
  right: 0;
  top: 60px;
  bottom: 0;
  width: calc(100vw / 6);
  background: rgba(0, 0, 0, 0.9);
  border-left: 2px solid #1976d2;
  color: white;
  z-index: 100;
  overflow-y: auto;
  backdrop-filter: blur(10px);
}

.panel-header {
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  background: rgba(25, 118, 210, 0.2);
}

.tool-section {
  padding: 15px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #64b5f6;
  text-transform: uppercase;
}

.tool-btn {
  width: 100%;
  justify-content: flex-start;
  margin-bottom: 8px;
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tool-btn.active {
  background: rgba(25, 118, 210, 0.3);
  color: #64b5f6;
}

.hint-text {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  font-style: italic;
}

.current-map {
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 5px;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>