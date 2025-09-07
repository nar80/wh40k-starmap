<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 500px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="settings" class="q-mr-sm" />
          Spieler-Modus Einstellungen
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Player Mode Toggle -->
        <div class="q-mb-md">
          <q-toggle
            v-model="playerMode"
            label="Spieler-Modus aktivieren"
            color="primary"
            @update:model-value="updatePlayerMode"
          />
          <div class="text-caption text-grey-7">
            Deaktiviert Reise- und Bearbeitungsfunktionen für Spieler
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Campaign Selection -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Aktive Kampagne</div>
          <q-btn-toggle
            v-model="campaign"
            toggle-color="primary"
            :options="[
              {label: 'Hauptkampagne', value: 'main'},
              {label: 'Nebenkampagne', value: 'side'}
            ]"
            spread
            @update:model-value="updateCampaign"
          />
        </div>

        <q-separator class="q-my-md" />

        <!-- Remote Data URL -->
        <div class="q-mb-md">
          <q-input
            v-model="dataUrl"
            label="Remote-Daten URL (GitHub Gist)"
            hint="URL zum automatischen Laden der Kampagnendaten"
            dense
            @blur="updateDataUrl"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="sync"
                @click="syncNow"
                :loading="syncing"
              >
                <q-tooltip>Jetzt synchronisieren</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <div v-if="lastSync" class="text-caption text-grey-7 q-mt-xs">
            Letzte Synchronisation: {{ formatDate(lastSync) }}
          </div>
        </div>


        <!-- Upload Campaign Data (GM only) -->
        <div v-if="!playerMode" class="q-mb-md">
          <q-separator class="q-my-md" />
          <div class="text-subtitle2 q-mb-sm">Kampagnendaten hochladen</div>
          <q-btn
            outline
            color="positive"
            label="Aktuelle Karte zu GitHub Gist hochladen"
            icon="cloud_upload"
            @click="uploadToGist"
            :loading="uploading"
          />
          <div class="text-caption text-grey-7 q-mt-xs">
            Lädt die aktuelle Karte und Spielstand zum konfigurierten Gist hoch
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Schließen" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const gameStore = useGameStore()
const $q = useQuasar()

const playerMode = ref(gameStore.isPlayerMode)
const campaign = ref(gameStore.currentCampaign)
const dataUrl = ref(gameStore.remoteDataUrl)
const lastSync = ref(gameStore.lastSyncTime)
const syncing = ref(false)
const uploading = ref(false)

// Store Gist IDs for both campaigns
const gistIds = {
  main: import.meta.env.VITE_GIST_ID_MAIN || localStorage.getItem('gistIdMain') || '',
  side: import.meta.env.VITE_GIST_ID_SIDE || localStorage.getItem('gistIdSide') || ''
}

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'Nie'
  return new Date(dateStr).toLocaleString('de-DE')
}

const updatePlayerMode = (value) => {
  gameStore.setPlayerMode(value)
  if (value) {
    $q.notify({
      type: 'info',
      message: 'Spieler-Modus aktiviert. Reise- und Bearbeitungsfunktionen sind deaktiviert.',
      position: 'top'
    })
  }
}

const updateCampaign = (value) => {
  campaign.value = value
  
  // For GM: Just switch which campaign we'll upload to
  // Don't load any data - GM decides what's currently loaded
  if (!gameStore.isPlayerMode) {
    $q.notify({
      type: 'info',
      message: `Upload-Ziel: ${value === 'main' ? 'Hauptkampagne' : 'Nebenkampagne'}`,
      caption: 'Beim nächsten Upload wird diese Kampagne aktualisiert',
      position: 'top'
    })
    return
  }
  
  // For Players (shouldn't happen - they don't see this dialog)
  // But if they did, they would need to sync from the right gist
  gameStore.setCampaign(value)
  const gistId = gistIds[value]
  if (gistId) {
    dataUrl.value = `https://api.github.com/gists/${gistId}`
    gameStore.remoteDataUrl = dataUrl.value
    localStorage.setItem('remoteDataUrl', dataUrl.value)
  }
}

const updateDataUrl = () => {
  gameStore.remoteDataUrl = dataUrl.value
  localStorage.setItem('remoteDataUrl', dataUrl.value)
}

const syncNow = async () => {
  syncing.value = true
  const success = await gameStore.syncWithRemote()
  syncing.value = false
  if (success) {
    lastSync.value = gameStore.lastSyncTime
  }
}


const uploadToGist = async () => {
  // Use the correct Gist ID for the current campaign
  const currentGistId = gistIds[campaign.value]
  
  if (!currentGistId) {
    $q.notify({
      type: 'warning',
      message: `Keine Gist ID für ${campaign.value === 'main' ? 'Hauptkampagne' : 'Nebenkampagne'} konfiguriert`,
      position: 'top'
    })
    return
  }
  
  uploading.value = true
  
  try {
    // Prepare campaign data - include full ship configuration
    const campaignData = {
      systems: gameStore.systems,
      hyperlanes: gameStore.hyperlanes,
      systemPlanets: gameStore.systemPlanets,
      discoveredSystems: gameStore.discoveredSystems,
      playerShip: gameStore.playerShip,  // KOMPLETTES Schiff inkl. configuration
      systemImportance: gameStore.systemImportance,  // Sterne-Bewertungen für Spieler
      systemNPCs: gameStore.systemNPCs,  // NPCs für Spieler sichtbar
      turnNumber: gameStore.turnNumber,
      campaign: campaign.value,
      lastUpdate: new Date().toISOString()
    }
    
    // Use the stored Gist ID
    const gistId = currentGistId
    
    if (!gistId) {
      throw new Error('Ungültige Gist URL')
    }
    
    // For public gists, we need a token (you'll need to configure this)
    const token = localStorage.getItem('githubToken')
    if (!token) {
      $q.dialog({
        title: 'GitHub Token benötigt',
        message: 'Zum Hochladen benötigen Sie einen GitHub Personal Access Token',
        prompt: {
          model: '',
          type: 'password'
        },
        cancel: true,
        persistent: true
      }).onOk((token) => {
        localStorage.setItem('githubToken', token)
        uploadToGist() // Retry with token
      })
      return
    }
    
    // Update Gist
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [`campaign_${campaign.value}.json`]: {
            content: JSON.stringify(campaignData, null, 2)
          }
        }
      })
    })
    
    if (!response.ok) {
      throw new Error('Upload fehlgeschlagen: ' + response.statusText)
    }
    
    $q.notify({
      type: 'positive',
      message: 'Kampagnendaten erfolgreich hochgeladen',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Upload fehlgeschlagen: ' + error.message,
      position: 'top'
    })
  } finally {
    uploading.value = false
  }
}
</script>