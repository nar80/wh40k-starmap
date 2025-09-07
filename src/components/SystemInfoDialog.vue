<template>
  <q-dialog v-model="show" @hide="onHide">
    <q-card style="min-width: 600px; width: 70vw; max-width: 900px">
      <q-card-section 
        class="text-white q-pa-lg"
        :style="headerStyle"
      >
        <div class="text-h5 text-weight-bold text-shadow">
          {{ system ? (isDiscovered ? system.name : 'Unbekanntes System') : '' }}
        </div>
      </q-card-section>

      <q-card-section v-if="system">
        <div v-if="!isDiscovered" class="text-grey-6">
          <q-icon name="help_outline" size="lg" class="q-mr-sm" />
          <span>System noch nicht erkundet</span>
          <div class="q-mt-md">
            <strong>Sterntyp:</strong> {{ system.starType }}
          </div>
        </div>
        
        <div v-else>
          <q-tabs
            v-model="activeTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="general" label="Allgemein" icon="info" />
            <q-tab name="planets" label="Planeten" icon="public" />
            <q-tab name="npcs" label="Personen" icon="people" />
            <q-tab name="notes" label="Notizen" icon="description" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- General Tab -->
            <q-tab-panel name="general">
              <div class="row items-center q-mb-md">
                <span class="text-grey-7 q-mr-md">Wichtigkeit:</span>
                <q-btn-toggle
                  :model-value="importance"
                  @update:model-value="setImportance"
                  toggle-color="amber-7"
                  size="sm"
                  :options="[
                    {label: 'Keine', value: 0},
                    {label: '⭐', value: 1},
                    {label: '⭐⭐', value: 2},
                    {label: '⭐⭐⭐', value: 3}
                  ]"
                />
              </div>
              
              <div class="q-mb-md">
                <q-icon name="star" :color="getStarColor(system.starType)" size="md" class="q-mr-sm" />
                <strong>Sterntyp:</strong> {{ system.starType }}
              </div>
              
              <div class="q-mb-md">
                <q-icon name="flag" color="primary" size="md" class="q-mr-sm" />
                <strong>Fraktion:</strong> {{ system.faction }}
              </div>
              
              <div class="q-mb-md">
                <q-icon name="description" color="grey" size="md" class="q-mr-sm" />
                {{ system.description }}
              </div>

              <q-separator class="q-my-md" />
              
              <div v-if="system.flavorText" class="flavor-text q-pa-md bg-grey-10 rounded-borders">
                <q-icon name="format_quote" size="sm" class="q-mr-sm text-grey-6" />
                <span class="text-italic text-grey-4">{{ system.flavorText }}</span>
              </div>
            </q-tab-panel>

            <!-- Planets Tab -->
            <q-tab-panel name="planets">
              <div class="row items-center q-mb-md">
                <div class="text-h6">Planetensystem</div>
                <q-space />
                <q-btn 
                  color="purple-8" 
                  icon="public"
                  label="3D-Ansicht"
                  @click="showPlanetarySystem = true"
                  size="sm"
                />
              </div>
              
              <div v-if="planets.length === 0" class="text-grey-6 text-center q-pa-md">
                <q-icon name="public" size="xl" class="q-mb-sm" />
                <div>Keine Planetendaten vorhanden</div>
                <q-btn 
                  v-if="gameStore.editMode"
                  flat 
                  color="primary" 
                  label="Daten importieren" 
                  class="q-mt-md"
                  @click="$emit('import-system-details')"
                />
              </div>
              
              <q-list v-else dense bordered separator class="rounded-borders">
                <q-item v-for="(planet, idx) in planets" :key="idx" class="q-pa-md">
                  <q-item-section>
                    <q-item-label>
                      <strong>{{ planet.name }}</strong>
                      <span v-if="planet.type" class="text-grey-7 q-ml-sm">({{ planet.type }})</span>
                      <q-chip v-if="planet.isHabitable" size="xs" color="green" text-color="white" icon="home" class="q-ml-sm">
                        Bewohnbar
                      </q-chip>
                      <q-chip v-if="planet.hasColony" size="xs" color="blue" text-color="white" icon="location_city" class="q-ml-sm">
                        Kolonie
                      </q-chip>
                    </q-item-label>
                    
                    <div v-if="planet.resource || planet.resources" class="q-mt-sm">
                      <q-icon name="inventory_2" size="xs" color="orange" />
                      <span class="text-caption q-ml-xs">
                        Ressourcen: 
                        <span v-if="planet.resources && planet.resources.length">
                          <strong v-for="(res, ridx) in planet.resources" :key="ridx">
                            {{ res.type }} ({{ res.amount }}x {{ res.quality }}){{ ridx < planet.resources.length - 1 ? ', ' : '' }}
                          </strong>
                        </span>
                        <span v-else-if="planet.resource">
                          <strong v-if="typeof planet.resource === 'object'">
                            {{ planet.resource.type }} x{{ planet.resource.amount }}
                          </strong>
                          <strong v-else>{{ planet.resource }}</strong>
                        </span>
                      </span>
                    </div>
                    
                    <div v-if="planet.pointsOfInterest && planet.pointsOfInterest.length" class="q-mt-sm">
                      <q-icon name="place" size="xs" color="primary" />
                      <span class="text-caption q-ml-xs">
                        Sehenswürdigkeiten: 
                        <span v-for="(poi, pidx) in planet.pointsOfInterest" :key="pidx">
                          <strong>{{ poi.name }}</strong>
                          <span v-if="poi.danger" class="text-red">(Gefahr: {{ poi.danger }})</span>
                          {{ pidx < planet.pointsOfInterest.length - 1 ? ', ' : '' }}
                        </span>
                      </span>
                    </div>
                    
                    <div v-if="planet.pointOfInterest && !planet.pointsOfInterest" class="q-mt-sm">
                      <q-icon name="place" size="xs" color="primary" />
                      <span class="text-caption q-ml-xs">
                        Interessanter Ort: <strong>{{ planet.pointOfInterest }}</strong>
                      </span>
                    </div>
                    
                    <div v-if="planet.description" class="q-mt-sm text-caption text-grey-6">
                      <strong>Beschreibung:</strong> {{ planet.description }}
                    </div>
                    
                    <div v-if="planet.flavorText" class="q-mt-sm text-caption text-italic text-grey-5">
                      "{{ planet.flavorText }}"
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <!-- NPCs Tab -->
            <q-tab-panel name="npcs">
              <div class="text-h6 q-mb-md">Wichtige Personen</div>
              
              <!-- NPC List -->
              <q-list dense bordered separator class="rounded-borders q-mb-md">
                <q-item v-for="npc in npcs" :key="npc.id" class="q-pa-sm">
                  <q-item-section>
                    <q-item-label>
                      <strong>{{ npc.name }}</strong>
                      <q-badge 
                        :color="getStatusColor(npc.status)" 
                        :label="getStatusLabel(npc.status)"
                        class="q-ml-sm"
                      />
                    </q-item-label>
                    <q-item-label caption v-if="npc.role">
                      {{ npc.role }} - {{ npc.faction }}
                    </q-item-label>
                    <q-item-label caption v-if="npc.notes">
                      {{ npc.notes }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row no-wrap">
                      <q-btn 
                        flat 
                        round 
                        icon="edit" 
                        size="sm" 
                        @click="editNPC(npc)"
                      />
                      <q-btn 
                        flat 
                        round 
                        icon="delete" 
                        size="sm" 
                        color="negative"
                        @click="deleteNPC(npc.id)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="npcs.length === 0">
                  <q-item-section class="text-grey-6 text-center">
                    Keine Personen eingetragen
                  </q-item-section>
                </q-item>
              </q-list>
              
              <!-- Add NPC Button -->
              <q-btn 
                color="primary" 
                label="Person hinzufügen" 
                icon="person_add"
                @click="showNPCDialog = true"
                class="full-width"
              />
            </q-tab-panel>

            <!-- Notes Tab -->
            <q-tab-panel name="notes">
              <div class="text-h6 q-mb-md">Notizen</div>
              <q-input
                v-model="notes"
                type="textarea"
                filled
                placeholder="Füge deine Notizen hier hinzu..."
                rows="8"
                @change="saveNotes"
              />
            </q-tab-panel>
          </q-tab-panels>
        </div>
        
        <!-- NPC Add/Edit Dialog -->
        <q-dialog v-model="showNPCDialog">
          <q-card style="min-width: 400px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ editingNPC ? 'Person bearbeiten' : 'Neue Person' }}</div>
            </q-card-section>
            
            <q-card-section>
              <q-input 
                v-model="npcForm.name" 
                label="Name *" 
                filled 
                class="q-mb-md"
              />
              <q-input 
                v-model="npcForm.role" 
                label="Rolle/Titel" 
                filled 
                class="q-mb-md"
              />
              <q-input 
                v-model="npcForm.faction" 
                label="Fraktion" 
                filled 
                class="q-mb-md"
              />
              <q-select 
                v-model="npcForm.status" 
                label="Status" 
                filled 
                :options="[
                  {label: 'Freundlich', value: 'friend'},
                  {label: 'Neutral', value: 'neutral'},
                  {label: 'Feindlich', value: 'enemy'}
                ]"
                emit-value
                map-options
                class="q-mb-md"
              />
              <q-input 
                v-model="npcForm.notes" 
                label="Notizen" 
                filled 
                type="textarea"
                rows="3"
              />
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn flat label="Abbrechen" v-close-popup />
              <q-btn 
                flat 
                label="Speichern" 
                color="primary" 
                @click="saveNPC"
                :disable="!npcForm.name"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Schließen" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  
  <!-- Planetary System View Dialog -->
  <PlanetarySystemView 
    v-model="showPlanetarySystem"
    :system-id="systemId"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import PlanetarySystemView from './PlanetarySystemView.vue'

const props = defineProps({
  modelValue: Boolean,
  systemId: String
})

const emit = defineEmits(['update:modelValue', 'import-system-details'])

const gameStore = useGameStore()
const notes = ref('')
const importance = ref(0)
const npcs = ref([])
const planets = ref([])
const showNPCDialog = ref(false)
const editingNPC = ref(null)
const activeTab = ref('general')
const showPlanetarySystem = ref(false)
const npcForm = ref({
  name: '',
  role: '',
  faction: '',
  status: 'neutral',
  notes: ''
})

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const system = computed(() => {
  if (!props.systemId) return null
  return gameStore.systems.find(s => s.id === props.systemId)
})

const isDiscovered = computed(() => {
  if (!props.systemId) return false
  return gameStore.isSystemDiscovered(props.systemId)
})

const headerStyle = computed(() => {
  // Select background image based on world type
  let backgroundImage = ''
  
  if (system.value && isDiscovered.value && system.value.worldType) {
    // Map world types to image files
    const worldTypeImages = {
      'space_station': 'space_station.jpg',
      'trade_station': 'trade_station.jpg',
      'derelict_station': 'derelict_station.jpg',
      'mining_world': 'mining_world.jpg',
      'ice_world': 'ice_world.jpg',
      'scorched_world': 'scorched_world.jpg',
      'trade_world': 'trade_world.jpg',
      'lost_colony': 'lost_colony.jpg',
      'xenos_world': 'xenos_world.jpg',
      'agri_world': 'agri_world.jpg',
      'gas_giant': 'gas_giant.jpg',
      'paradise_world': 'paradise_world.jpg',
      'fortress_world': 'fortress_world.jpg',
      'ork_world': 'ork_world.jpg',
      'chaos_world': 'chaos_world.jpg',
      'death_world': 'death_world.jpg',
      'xenos_ruins': 'xenos_ruins.jpg',
      'cursed_world': 'cursed_world.jpg',
      'daemon_world': 'daemon_world.jpg',
      'eldar_world': 'eldar_world.jpg',
      'void_anomaly': 'void_anomaly.jpg',
      'kroot_world': 'kroot_world.jpg',
      'warp_storm': 'warp_storm.jpg',
      'psychic_world': 'psychic_world.jpg'
    }
    
    // Use specific image or fall back to existing ones
    const specificImage = worldTypeImages[system.value.worldType]
    if (specificImage) {
      // Check if we have a matching image from the existing ones
      if (system.value.worldType.includes('water')) {
        backgroundImage = 'url(/images/water_world.jpg)'
      } else if (system.value.worldType.includes('mining') || system.value.worldType.includes('fortress')) {
        backgroundImage = 'url(/images/makropole_world.jpg)'
      } else if (system.value.worldType.includes('trade') || system.value.worldType.includes('station')) {
        backgroundImage = 'url(/images/metropole_world.jpg)'
      } else {
        backgroundImage = 'url(/images/alien_world.jpg)'
      }
    }
  }
  
  return {
    backgroundImage: backgroundImage || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '120px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  }
})

watch(() => props.systemId, (newId) => {
  if (newId) {
    notes.value = gameStore.getSystemNotes(newId)
    importance.value = gameStore.getSystemImportance(newId)
    npcs.value = gameStore.getSystemNPCs(newId)
  }
})

const getStarColor = (starType) => {
  const colors = {
    'Gelber Zwerg': 'yellow',
    'Roter Zwerg': 'red',
    'Blauer Riese': 'blue',
    'Roter Überriese': 'deep-orange',
    'Weißer Zwerg': 'grey-4',
    'Oranger Zwerg': 'orange',
    'Blauer Zwerg': 'light-blue'
  }
  return colors[starType] || 'yellow'
}

const saveNotes = () => {
  if (props.systemId) {
    gameStore.setSystemNotes(props.systemId, notes.value)
  }
}

const setImportance = (value) => {
  importance.value = value
  if (props.systemId) {
    gameStore.setSystemImportance(props.systemId, value)
  }
}

// NPC Functions
const getStatusColor = (status) => {
  switch(status) {
    case 'friend': return 'positive'
    case 'enemy': return 'negative'
    default: return 'grey'
  }
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'friend': return 'Freund'
    case 'enemy': return 'Feind'
    default: return 'Neutral'
  }
}

const editNPC = (npc) => {
  editingNPC.value = npc
  npcForm.value = { ...npc }
  showNPCDialog.value = true
}

const deleteNPC = (npcId) => {
  if (props.systemId) {
    gameStore.removeNPC(props.systemId, npcId)
    npcs.value = gameStore.getSystemNPCs(props.systemId)
  }
}

const saveNPC = () => {
  if (!npcForm.value.name || !props.systemId) return
  
  if (editingNPC.value) {
    gameStore.updateNPC(props.systemId, editingNPC.value.id, npcForm.value)
  } else {
    gameStore.addNPC(props.systemId, npcForm.value)
  }
  
  npcs.value = gameStore.getSystemNPCs(props.systemId)
  showNPCDialog.value = false
  editingNPC.value = null
  npcForm.value = {
    name: '',
    role: '',
    faction: '',
    status: 'neutral',
    notes: ''
  }
}

// Load system data when systemId changes
watch(() => props.systemId, (newId) => {
  if (newId) {
    // Load notes
    notes.value = gameStore.getSystemNotes(newId)
    // Load importance
    importance.value = gameStore.getSystemImportance(newId)
    // Load NPCs
    npcs.value = gameStore.getSystemNPCs(newId)
    // Load planets
    planets.value = gameStore.getSystemPlanets(newId)
    // Reset to general tab
    activeTab.value = 'general'
  }
}, { immediate: true })

const onHide = () => {
  emit('update:modelValue', false)
}

// Reload data when game state is loaded
const reloadSystemData = () => {
  if (props.systemId) {
    notes.value = gameStore.getSystemNotes(props.systemId)
    importance.value = gameStore.getSystemImportance(props.systemId)
    npcs.value = gameStore.getSystemNPCs(props.systemId)
    planets.value = gameStore.getSystemPlanets(props.systemId)
  }
}

// Listen for game state loaded event
onMounted(() => {
  window.addEventListener('gameStateLoaded', reloadSystemData)
})

onUnmounted(() => {
  window.removeEventListener('gameStateLoaded', reloadSystemData)
})
</script>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}

.flavor-text {
  font-family: 'Georgia', serif;
  line-height: 1.6;
  border-left: 3px solid #444;
}
</style>