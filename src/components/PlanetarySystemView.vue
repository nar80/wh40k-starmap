<template>
  <q-dialog 
    v-model="show" 
    :maximized="isFullscreen"
    :position="isFullscreen ? undefined : 'standard'"
    transition-show="slide-up" 
    transition-hide="slide-down"
  >
    <q-card class="bg-black planetary-card" :style="cardStyle">
      <q-bar class="bg-primary">
        <q-icon name="solar_system" />
        <div>{{ systemName }} System</div>
        <q-space />
        <q-btn 
          dense 
          flat 
          :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="toggleFullscreen"
        >
          <q-tooltip>{{ isFullscreen ? 'Fenstermodus' : 'Vollbild' }}</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Schließen (ESC)</q-tooltip>
        </q-btn>
      </q-bar>
      
      <q-card-section class="q-pa-none" style="flex: 1; display: flex;">
        <div ref="systemContainer" class="planetary-system-container"></div>
      </q-card-section>
      
      <!-- Objects List Panel -->
      <q-card class="objects-list-panel bg-grey-10 text-white">
        <q-card-section class="q-pa-sm">
          <div class="row items-center q-mb-sm">
            <div class="text-subtitle2 text-amber">Objekte im System</div>
            <q-space />
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="add"
              color="primary"
              @click="addNewObject"
            >
              <q-tooltip>Neues Objekt hinzufügen</q-tooltip>
            </q-btn>
          </div>
          <q-list dense separator dark>
            <q-item 
              v-for="obj in systemObjects" 
              :key="obj.id"
              clickable
              @click="selectObject(obj)"
              :class="{ 'bg-primary': selectedPlanet?.name === obj.name }"
              class="q-px-sm"
            >
              <q-item-section avatar>
                <q-icon :name="getObjectIcon(obj)" :color="getObjectColor(obj)" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption">{{ obj.name }}</q-item-label>
                <q-item-label caption class="text-grey-6">{{ getTypeDisplayName(obj.data?.type || obj.type || 'Unbekannt') }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="edit"
                  @click.stop="editObject(obj)"
                  class="q-pa-xs"
                >
                  <q-tooltip>Bearbeiten</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      
      <!-- Star Info Panel -->
      <q-card v-if="selectedStar" class="planet-info-panel bg-grey-10 text-white">
        <q-card-section class="q-pb-sm">
          <div class="text-h6">{{ selectedStar.name }}</div>
          <div class="text-subtitle2 text-amber">
            {{ selectedStar.type }}
          </div>
        </q-card-section>
        
        <!-- Star Lore -->
        <q-card-section v-if="selectedStar.lore" class="q-pt-none q-pb-sm">
          <div class="text-body2 text-italic text-grey-3" style="line-height: 1.4;">
            "{{ selectedStar.lore }}"
          </div>
        </q-card-section>
        
        <!-- Star Data -->
        <q-card-section class="q-pt-none q-pb-sm">
          <div class="text-subtitle2 text-amber q-mb-xs">Stellare Daten</div>
          <div class="text-caption">
            <div v-if="selectedStar.classification">
              <span class="text-grey-5">Klassifikation:</span> {{ selectedStar.classification }}
            </div>
            <div v-if="selectedStar.temperature">
              <span class="text-grey-5">Oberflächentemperatur:</span> {{ selectedStar.temperature }}
            </div>
            <div v-if="selectedStar.age">
              <span class="text-grey-5">Alter:</span> {{ selectedStar.age }}
            </div>
            <div v-if="selectedStar.luminosity">
              <span class="text-grey-5">Leuchtkraft:</span> {{ selectedStar.luminosity }}
            </div>
            <div v-if="selectedStar.mass">
              <span class="text-grey-5">Masse:</span> {{ selectedStar.mass }}
            </div>
          </div>
        </q-card-section>
        
        <!-- Special Features -->
        <q-card-section v-if="selectedStar.features?.length" class="q-pt-none q-pb-sm">
          <div class="text-subtitle2 text-amber q-mb-xs">Besonderheiten</div>
          <div v-for="feature in selectedStar.features" :key="feature" class="text-caption q-mb-xs">
            • {{ feature }}
          </div>
        </q-card-section>
        
        <!-- Warp Influence -->
        <q-card-section v-if="selectedStar.warpInfluence" class="q-pt-none">
          <div class="text-subtitle2 text-amber q-mb-xs">Warp-Einfluss</div>
          <div class="text-caption text-grey-3">{{ selectedStar.warpInfluence }}</div>
        </q-card-section>
      </q-card>
      
      <!-- Planet Info Panel -->
      <q-card v-else-if="selectedPlanet" class="planet-info-panel bg-grey-10 text-white">
        <q-card-section class="q-pb-sm">
          <div class="text-h6">{{ selectedPlanet.name }}</div>
          <div class="text-subtitle2 text-grey-5">
            {{ selectedPlanet.type }}
            <q-chip v-if="selectedPlanet.isHabitable" size="sm" color="green" text-color="white" dense class="q-ml-sm">
              Bewohnbar
            </q-chip>
            <q-chip v-if="selectedPlanet.hasColony" size="sm" color="blue" text-color="white" dense class="q-ml-sm">
              Kolonie
            </q-chip>
          </div>
        </q-card-section>
        
        <!-- Flavor Text -->
        <q-card-section v-if="selectedPlanet.flavorText" class="q-pt-none q-pb-sm">
          <div class="text-body2 text-italic text-grey-3" style="line-height: 1.4;">
            "{{ selectedPlanet.flavorText }}"
          </div>
        </q-card-section>
        
        <!-- Umweltbedingungen -->
        <q-card-section v-if="selectedPlanet.environment" class="q-pt-none q-pb-sm">
          <div class="text-subtitle2 text-amber q-mb-xs">Umwelt</div>
          <div class="row text-caption">
            <div class="col-6">
              <div><span class="text-grey-5">Atmosphäre:</span> {{ selectedPlanet.environment.atmosphere }}</div>
              <div><span class="text-grey-5">Temperatur:</span> {{ selectedPlanet.environment.temperature }}</div>
            </div>
            <div class="col-6">
              <div><span class="text-grey-5">Gravitation:</span> {{ selectedPlanet.environment.gravity }}</div>
              <div><span class="text-grey-5">Wetter:</span> {{ selectedPlanet.environment.weather }}</div>
            </div>
          </div>
          <div v-if="selectedPlanet.environment.specialConditions?.length" class="q-mt-xs">
            <span class="text-grey-5">Besonderheiten:</span>
            <q-chip v-for="condition in selectedPlanet.environment.specialConditions" 
              :key="condition" 
              size="xs" 
              color="orange-9" 
              text-color="white" 
              dense 
              class="q-ml-xs">
              {{ condition }}
            </q-chip>
          </div>
        </q-card-section>
        
        <!-- Ressourcen -->
        <q-card-section v-if="selectedPlanet.resources?.length || selectedPlanet.resource" class="q-pt-none q-pb-sm">
          <div class="text-subtitle2 text-amber q-mb-xs">Ressourcen</div>
          <div v-if="selectedPlanet.resources">
            <div v-for="res in selectedPlanet.resources" :key="typeof res === 'string' ? res : res.type" class="text-caption">
              <template v-if="typeof res === 'string'">
                • {{ res }}
              </template>
              <template v-else>
                • {{ res.type }} 
                <q-badge :color="getResourceQualityColor(res.quality)" class="q-ml-sm">
                  {{ res.quality }} ({{ res.amount }})
                </q-badge>
              </template>
            </div>
          </div>
          <div v-else-if="selectedPlanet.resource" class="text-caption">
            • {{ typeof selectedPlanet.resource === 'object' ? selectedPlanet.resource.type : selectedPlanet.resource }}
            <span v-if="selectedPlanet.resource.amount" class="text-grey-5"> ({{ selectedPlanet.resource.amount }})</span>
          </div>
        </q-card-section>
        
        <!-- Points of Interest -->
        <q-card-section v-if="selectedPlanet.pointsOfInterest?.length || selectedPlanet.pointOfInterest" class="q-pt-none q-pb-sm">
          <div class="text-subtitle2 text-amber q-mb-xs">Sehenswürdigkeiten</div>
          <div v-if="selectedPlanet.pointsOfInterest">
            <div v-for="poi in selectedPlanet.pointsOfInterest" :key="poi.name" class="text-caption q-mb-xs">
              • {{ poi.name }}
              <q-badge v-if="poi.danger" :color="getDangerColor(poi.danger)" class="q-ml-sm">
                Gefahr: {{ poi.danger }}/5
              </q-badge>
              <div v-if="poi.description" class="text-grey-5 q-ml-md">{{ poi.description }}</div>
            </div>
          </div>
          <div v-else-if="selectedPlanet.pointOfInterest" class="text-caption">
            • {{ selectedPlanet.pointOfInterest }}
          </div>
        </q-card-section>
        
        <!-- Bevölkerung -->
        <q-card-section v-if="selectedPlanet.population" class="q-pt-none q-pb-sm">
          <div class="text-subtitle2 text-amber q-mb-xs">Bevölkerung</div>
          <div class="text-caption">
            <div><span class="text-grey-5">Größe:</span> {{ selectedPlanet.population.size.toFixed(1) }} Millionen</div>
            <div><span class="text-grey-5">Typ:</span> {{ selectedPlanet.population.type }}</div>
            <div><span class="text-grey-5">Loyalität:</span> {{ selectedPlanet.population.loyality }}</div>
            <div v-if="selectedPlanet.population.settlements?.length" class="q-mt-xs">
              <span class="text-grey-5">Siedlungen:</span>
              <div v-for="settlement in selectedPlanet.population.settlements" :key="settlement.name" class="q-ml-md">
                • {{ settlement.name }} ({{ settlement.type }}, {{ settlement.size }})
              </div>
            </div>
          </div>
        </q-card-section>
        
        <!-- Beschreibung (falls vorhanden) -->
        <q-card-section v-if="selectedPlanet.description" class="q-pt-none q-pb-sm">
          <div class="text-subtitle2 text-amber q-mb-xs">Beschreibung</div>
          <div class="text-caption text-grey-3">{{ selectedPlanet.description }}</div>
        </q-card-section>
        
        <!-- Monde -->
        <q-card-section v-if="selectedPlanet.moons" class="q-pt-none">
          <div class="text-subtitle2 text-amber q-mb-xs">Monde</div>
          <div v-for="moon in selectedPlanet.moons" :key="moon.name" class="text-caption">
            • {{ moon.name }} - {{ moon.description }}
          </div>
        </q-card-section>
      </q-card>
    </q-card>
    
    <!-- Edit Object Dialog -->
    <q-dialog v-model="showEditDialog">
      <q-card class="bg-grey-9" style="min-width: 600px; max-width: 800px">
        <q-card-section class="bg-primary">
          <div class="text-h6">{{ editingObject?.name }} bearbeiten</div>
        </q-card-section>
        
        <q-tabs
          v-model="editTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="basic" label="Basis" />
          <q-tab name="text" label="Texte" />
          <q-tab name="details" label="Details" />
        </q-tabs>
        
        <q-separator />
        
        <q-tab-panels v-model="editTab" animated class="bg-grey-9">
          <!-- Basis Tab -->
          <q-tab-panel name="basic">
            <q-form @submit="saveObject">
            <!-- Name -->
            <q-input
              v-model="editForm.name"
              label="Name"
              dark
              outlined
              dense
              class="q-mb-md"
            />
            
            <!-- Kategorie -->
            <q-select
              v-model="editForm.category"
              :options="objectCategories"
              label="Kategorie"
              dark
              outlined
              dense
              class="q-mb-md"
            />
            
            <!-- Subtyp -->
            <q-select
              v-model="editForm.type"
              :options="availableSubtypes"
              label="Typ"
              dark
              outlined
              dense
              class="q-mb-md"
            />
            
            <!-- Bewohnbar & Kolonie -->
            <div class="row q-gutter-md q-mb-md">
              <q-checkbox
                v-model="editForm.isHabitable"
                label="Bewohnbar"
                dark
                dense
              />
              <q-checkbox
                v-model="editForm.hasColony"
                label="Hat Kolonie"
                dark
                dense
              />
            </div>
            
            <!-- Points of Interest -->
            <q-expansion-item
              label="Sehenswürdigkeiten"
              dark
              dense
              class="q-mb-md"
            >
              <q-card dark>
                <q-card-section>
                  <div v-for="(poi, index) in editForm.pointsOfInterest" :key="index" class="q-mb-md">
                    <div class="row q-gutter-sm items-center">
                      <div class="col">
                        <q-input
                          v-model="poi.name"
                          label="Name"
                          dark
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-3">
                        <q-input
                          v-model.number="poi.danger"
                          type="number"
                          min="0"
                          max="5"
                          label="Gefahr (0-5)"
                          dark
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-auto">
                        <q-btn
                          flat
                          round
                          dense
                          icon="delete"
                          color="red"
                          @click="editForm.pointsOfInterest.splice(index, 1)"
                        />
                      </div>
                    </div>
                    <q-input
                      v-model="poi.description"
                      label="Beschreibung (optional)"
                      type="textarea"
                      rows="2"
                      dark
                      outlined
                      dense
                      class="q-mt-sm"
                    />
                  </div>
                  <q-btn
                    flat
                    dense
                    icon="add"
                    label="Sehenswürdigkeit hinzufügen"
                    color="primary"
                    @click="addPointOfInterest"
                  />
                </q-card-section>
              </q-card>
            </q-expansion-item>
            
            <!-- Ressourcen (nur für Planeten) -->
            <div v-if="editForm.category === 'Planet'">
              <div class="text-subtitle2 text-amber q-mb-sm">Ressourcen</div>
              <q-checkbox
                v-for="resource in availableResources"
                :key="resource"
                v-model="editForm.resources"
                :val="resource"
                :label="resource"
                dark
                dense
                class="q-mb-sm"
              />
            </div>
            
            <!-- Umwelt -->
            <q-expansion-item
              label="Umwelt & Besonderheiten"
              dark
              dense
              class="q-mb-md"
            >
              <q-card dark>
                <q-card-section>
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-select
                        v-model="editForm.environment.atmosphere"
                        :options="atmosphereOptions"
                        label="Atmosphäre"
                        dark
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="editForm.environment.temperature"
                        :options="temperatureOptions"
                        label="Temperatur"
                        dark
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="editForm.environment.gravity"
                        :options="gravityOptions"
                        label="Gravitation"
                        dark
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="editForm.environment.weather"
                        :options="weatherOptions"
                        label="Wetter"
                        dark
                        outlined
                        dense
                      />
                    </div>
                  </div>
                  
                  <div class="q-mt-md">
                    <div class="text-subtitle2 text-amber q-mb-sm">Besondere Bedingungen</div>
                    <q-select
                      v-model="editForm.environment.specialConditions"
                      :options="specialConditionsOptions"
                      label="Besonderheiten (mehrere auswählbar)"
                      multiple
                      use-chips
                      stack-label
                      dark
                      outlined
                      dense
                    />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
            
            <!-- Bevölkerung (optional) -->
            <q-expansion-item
              v-if="editForm.type && !editForm.type.includes('Asteroid')"
              label="Bevölkerung (optional)"
              dark
              dense
              class="q-mb-md"
            >
              <q-card dark>
                <q-card-section>
                  <q-input
                    v-model.number="editForm.populationSize"
                    type="number"
                    step="0.1"
                    label="Bevölkerungsgröße (Millionen)"
                    dark
                    outlined
                    dense
                    class="q-mb-sm"
                  />
                  <q-input
                    v-model="editForm.populationType"
                    label="Bevölkerungstyp"
                    dark
                    outlined
                    dense
                    class="q-mb-sm"
                  />
                  <q-select
                    v-model="editForm.populationLoyality"
                    :options="loyalityOptions"
                    label="Loyalität"
                    dark
                    outlined
                    dense
                  />
                </q-card-section>
              </q-card>
            </q-expansion-item>
            </q-form>
          </q-tab-panel>
          
          <!-- Texte Tab -->
          <q-tab-panel name="text">
            <q-input
              v-model="editForm.description"
              label="Kurzbeschreibung"
              type="textarea"
              rows="3"
              dark
              outlined
              dense
              class="q-mb-md"
              hint="Kurze technische Beschreibung des Objekts"
            />
            
            <q-input
              v-model="editForm.flavorText"
              label="Atmosphärischer Text (Flavor Text)"
              type="textarea"
              rows="6"
              dark
              outlined
              dense
              class="q-mb-md"
              hint="Atmosphärische Beschreibung für Immersion - wird kursiv angezeigt"
            />
          </q-tab-panel>
          
          <!-- Details Tab -->
          <q-tab-panel name="details">
            <!-- Platzhalter für zukünftige Detail-Optionen -->
            <div class="text-grey-5">
              Hier können später weitere Details hinzugefügt werden.
            </div>
          </q-tab-panel>
        </q-tab-panels>
        
        <q-card-actions align="right">
          <q-btn 
            v-if="!editingObject?.isNew"
            flat 
            label="Löschen" 
            color="negative" 
            @click="deleteObject" 
          />
          <q-space />
          <q-btn flat label="Abbrechen" color="grey" v-close-popup />
          <q-btn flat label="Speichern" color="primary" @click="saveObject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue'
import * as PIXI from 'pixi.js'
import { planetarySystems, defaultPlanetarySystem } from '../data/planetarySystems'
import { useGameStore } from '../stores/gameStore'

const props = defineProps({
  modelValue: Boolean,
  systemId: String
})

const emit = defineEmits(['update:modelValue'])

const gameStore = useGameStore()
const systemContainer = ref(null)
const selectedPlanet = ref(null)
const selectedStar = ref(null)
const isFullscreen = ref(true)
const showEditDialog = ref(false)
const editingObject = ref(null)
const editTab = ref('basic')
const editForm = reactive({
  name: '',
  category: 'Planet',  // Hauptkategorie
  type: '',  // Subtyp
  description: '',
  flavorText: '',  // Atmosphärischer Text
  isHabitable: false,
  hasColony: false,
  pointsOfInterest: [],
  resources: [],
  populationSize: 0,
  populationType: '',
  populationLoyality: '',
  environment: {
    atmosphere: 'Unknown',
    temperature: 'Variable',
    gravity: 'Standard',
    weather: 'Unknown',
    specialConditions: []
  }
})

let app = null
let viewport = null
let animationId = null

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const systemName = computed(() => {
  const system = gameStore.systems.find(s => s.id === props.systemId)
  if (system) return system.name
  
  const systemData = planetarySystems[props.systemId] || defaultPlanetarySystem
  return systemData.star.name
})

const cardStyle = computed(() => {
  if (isFullscreen.value) {
    return {}
  }
  return {
    width: '80vw',
    maxWidth: '1200px',
    height: '80vh'
  }
})

// Options für Edit-Dialog
const objectCategories = [
  'Planet',
  'Station',
  'Schiff',
  'Asteroiden',
  'Anomalie'
]

// Mapping von englischen (internen) Typen zu deutschen Anzeigenamen
const typeTranslations = {
  // Planet Typen - Konsolidiert
  'Dead': 'Toter Planet',
  'Tomb': 'Toter Planet',
  
  'Ice': 'Eiswelt',
  'Snow': 'Eiswelt',
  'Frozen': 'Eiswelt',
  
  'Tropical': 'Dschungelwelt',
  'Jungle': 'Dschungelwelt',
  'Boreal': 'Dschungelwelt',
  
  'Sand': 'Wüstenwelt',
  'Desert': 'Wüstenwelt',
  'Arid': 'Wüstenwelt',
  'Deser': 'Wüstenwelt',  // Tippfehler in Daten
  
  'Savannah': 'Steppenwelt',
  'Savanah': 'Steppenwelt',  // Tippfehler in Daten
  'Steppes': 'Steppenwelt',
  
  'Burning': 'Lavawelt',
  'Lava': 'Lavawelt',
  'Ash': 'Aschewelt',
  
  'Rocky': 'Felsplanet',
  'Rock': 'Felsplanet',
  'Planetoid': 'Planetoid',
  
  'Continental': 'Kontinentalwelt',
  'Ocean': 'Ozeanwelt',
  
  'Shattered': 'Zerbrochene Welt',
  'Cracked': 'Zerbrochene Welt',
  
  'Mining': 'Minenwelt',
  'Mined': 'Minenwelt',
  
  'Gas Giant': 'Gasriese',
  'GasGiant': 'Gasriese',
  'Gas': 'Gasriese',
  
  // WH40k spezifische Typen (diese behalten wir!)
  'Agrarwelt': 'Agrarwelt',
  'Makropole': 'Makropole',
  'Fabrikwelt': 'Fabrikwelt',
  'Feudalwelt': 'Feudalwelt',
  'Garten Welt': 'Garten Welt',
  'Todeswelt': 'Todeswelt',
  
  // Schiff Typen
  'Ship': 'Schiff',
  'Wrack': 'Wrack',
  'Space Hulk': 'Space Hulk',
  'Darkpiercer': 'Dunkeldurchbrecher',
  
  // Station Typen
  'Station': 'Station',
  
  // Anomalie Typen
  'Anomaly': 'Anomalie',
  'Star': 'Stern',
  
  // Sonstige
  'Asteroid': 'Asteroid',
  'Ice-': 'Eiswelt',  // Tippfehler in Daten
  '-': 'Unbekannt',
  'Unbekannt': 'Unbekannt'
}

// Funktion um englischen Typ zu deutschem Namen zu übersetzen
const getTypeDisplayName = (type) => {
  return typeTranslations[type] || type
}

const objectSubtypes = {
  'Planet': [
    // Basis-Planetentypen (reduziert)
    'Toter Planet',
    'Eiswelt',
    'Dschungelwelt',
    'Wüstenwelt',
    'Steppenwelt',
    'Lavawelt',
    'Aschewelt',
    'Felsplanet',
    'Kontinentalwelt',
    'Ozeanwelt',
    'Zerbrochene Welt',
    'Minenwelt',
    'Gasriese',
    'Planetoid',
    // WH40k spezifische Typen (wichtig!)
    'Agrarwelt',
    'Makropole',
    'Fabrikwelt',
    'Feudalwelt',
    'Garten Welt',
    'Todeswelt'
  ],
  'Station': [
    'Raumstation',
    'Orbitalplattform',
    'Handelsstation',
    'Militärbasis',
    'Forschungsstation',
    'Werft',
    'Minenstation',
    'Verlassene Station'
  ],
  'Schiff': [
    'Wrack',
    'Space Hulk',
    'Geisterschiff',
    'Xenos-Schiff',
    'Imperiales Schiff',
    'Chaos-Schiff',
    'Händlerschiff',
    'Piraten-Schiff',
    'Explorator-Schiff'
  ],
  'Asteroiden': [
    'Asteroidenfeld',
    'Asteroidengürtel',
    'Bergbau-Asteroiden',
    'Trümmerfeld'
  ],
  'Anomalie': [
    'Warpstörung',
    'Nebel',
    'Schwarzes Loch',
    'Pulsar',
    'Zeitanomalie',
    'Stern-Anomalie',
    'Unbekannt'
  ]
}

// Computed property für verfügbare Subtypen basierend auf Kategorie
const availableSubtypes = computed(() => {
  return objectSubtypes[editForm.category] || []
})

const availableResources = [
  'Adamantium',
  'Promethium',
  'Seltene Erden',
  'Wasser',
  'Nahrung',
  'Plasma',
  'Kristalle',
  'Archäotechnik',
  'Xenotechnik'
]

const loyalityOptions = [
  'Treu ergeben',
  'Loyal',
  'Neutral',
  'Misstrauisch',
  'Feindlich',
  'Rebellisch'
]

// Umwelt-Optionen
const atmosphereOptions = [
  'None', 'Thin', 'Breathable', 'Toxic', 'Corrosive', 'Crushing', 
  'Artificial', 'Unknown'
]

const temperatureOptions = [
  'Frozen', 'Cold', 'Temperate', 'Hot', 'Burning', 'Variable', 'Controlled', 'Unknown'
]

const gravityOptions = [
  'Zero', 'Low', 'Standard', 'High', 'Crushing', 'Variable', 'Artificial', 'Unknown'
]

const weatherOptions = [
  'None', 'Calm', 'Storms', 'Extreme', 'Variable', 'Dust Storms', 
  'Blizzards', 'Monsoons', 'Fire Storms', 'Ash Storms', 'Eternal Storms', 'Unknown'
]

const specialConditionsOptions = [
  'Radiation', 'Volcanic Activity', 'Tectonic Instability', 'Magnetic Storms',
  'High Humidity', 'Dense Vegetation', 'Exotic Diseases', 'Toxic Atmosphere',
  'Extreme Heat', 'Extreme Cold', 'No Atmosphere', 'Ancient Ruins',
  'Mysterious Silence', 'Seasonal Changes', 'Diverse Biomes', 'Water Scarcity',
  'Extreme Temperature Variance', 'Sand Storms', 'Global Ocean', 'Tidal Forces',
  'Aquatic Life', 'Nuclear Winter', 'Ruins of Civilization', 'Lava Flows',
  'Sulfuric Atmosphere', 'Cryovolcanic Activity', 'Ice Storms', 'Subsurface Oceans',
  'Metallic Hydrogen Rain', 'Electromagnetic Storms', 'Floating Platforms',
  'Life Support Required', 'Void Exposure Risk', 'Necron Presence', 'Gauss Fields',
  'Living Metal'
]

// Computed property for all system objects
const systemObjects = computed(() => {
  const objects = []
  
  // Use same logic as initPlanetaryView
  const importedPlanets = gameStore.getSystemPlanets(props.systemId)
  let systemData
  
  if (importedPlanets && importedPlanets.length > 0) {
    // Convert imported data to planetary system format
    const system = gameStore.systems.find(s => s.id === props.systemId)
    systemData = {
      star: { 
        name: system?.name || 'Unknown', 
        type: system?.starType || 'Gelber Zwerg'
      },
      planets: importedPlanets.map((planet) => ({
        name: planet.name,
        type: planet.type || 'Unbekannt',
        ...planet
      }))
    }
  } else {
    // Check if we have a predefined planetary system
    systemData = planetarySystems[props.systemId]
    
    // If not, create a default with the correct star type from the system
    if (!systemData) {
      const system = gameStore.systems.find(s => s.id === props.systemId)
      systemData = {
        star: { 
          name: system?.name || 'Unbekannter Stern', 
          type: system?.starType || 'Gelber Zwerg', 
          radius: 40 
        },
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
    }
  }
  
  if (!systemData) return objects
  
  // Add star
  if (systemData.star) {
    objects.push({
      id: 'star',
      name: systemData.star.name,
      type: 'Stern',
      data: systemData.star
    })
  }
  
  // Add planets
  if (systemData.planets) {
    systemData.planets.forEach((planet, index) => {
      objects.push({
        id: `planet-${index}`,
        name: planet.name,
        type: planet.type || 'Planet',
        data: planet
      })
    })
  }
  
  // Add other objects (stations, ships, battles) if they exist
  if (systemData.otherObjects) {
    systemData.otherObjects.forEach((obj, index) => {
      objects.push({
        id: `other-${index}`,
        name: obj.name,
        type: obj.type || 'Objekt',
        data: obj
      })
    })
  }
  
  return objects
})

// Icon mapping for different object types
const getObjectIcon = (obj) => {
  // Zuerst prüfen auf Kategorie, dann auf Typ für Details
  const category = obj.data?.category || ''
  const type = (obj.data?.type || obj.type || '').toLowerCase()
  
  // Stern ist speziell
  if (obj.id === 'star') return 'brightness_7'
  
  // Nach Kategorie
  if (category === 'Station') return 'satellite_alt'
  if (category === 'Schiff') return 'rocket_launch'
  if (category === 'Asteroiden') return 'radio_button_unchecked'
  if (category === 'Anomalie') return 'blur_on'
  
  // Planeten - nach Subtyp unterscheiden
  if (category === 'Planet' || !category) {
    if (type.includes('gasriese')) return 'blur_circular'
    if (type.includes('eiswelt') || type.includes('eis') || type.includes('ice')) return 'ac_unit'
    if (type.includes('wüstenwelt') || type.includes('wüste') || type.includes('desert')) return 'wb_sunny'
    if (type.includes('ozeanwelt') || type.includes('ozean') || type.includes('ocean')) return 'water_drop'
    if (type.includes('vulkan') || type.includes('lava')) return 'local_fire_department'
    if (type.includes('garten') || type.includes('paradies')) return 'park'
    if (type.includes('tod') || type.includes('death')) return 'dangerous'
    if (type.includes('bergbau') || type.includes('mining') || type.includes('minen')) return 'engineering'
    if (type.includes('agrar') || type.includes('farm')) return 'agriculture'
    if (type.includes('forge') || type.includes('schmiede') || type.includes('fabrik')) return 'factory'
    if (type.includes('hive') || type.includes('makropole')) return 'location_city'
  }
  
  // Fallback Icons basierend auf alten type Strings (für Migration)
  if (type.includes('station') || type.includes('orbital')) return 'satellite_alt'
  if (type.includes('wrack') || type.includes('hulk') || type.includes('ship')) return 'rocket_launch'
  if (type.includes('asteroid')) return 'radio_button_unchecked'
  
  // Default planet icon
  return 'public'
}

// Color mapping for different object types
const getObjectColor = (obj) => {
  const type = obj.type?.toLowerCase() || ''
  
  if (type.includes('stern') || obj.id === 'star') return 'yellow'
  if (type.includes('gasriese')) return 'orange-4'
  if (type.includes('eiswelt') || type.includes('eis')) return 'light-blue'
  if (type.includes('wüstenwelt') || type.includes('wüste')) return 'orange-7'
  if (type.includes('ozeanwelt') || type.includes('ozean')) return 'blue'
  if (type.includes('vulkan')) return 'red'
  if (type.includes('garten') || type.includes('paradies')) return 'green'
  if (type.includes('tod') || type.includes('death')) return 'deep-purple'
  if (type.includes('station')) return 'grey-5'
  if (type.includes('schiff') || type.includes('ship')) return 'cyan'
  if (type.includes('schlacht') || type.includes('battle')) return 'red-8'
  if (type.includes('forge') || type.includes('schmiede')) return 'deep-orange'
  if (type.includes('hive') || type.includes('makropole')) return 'purple'
  
  return 'grey-6'
}

// Generate star data with lore
const generateStarData = (star) => {
  const starTypes = {
    'Gelber Zwerg': {
      classification: 'Klasse G2V',
      temperature: '5.778 K',
      age: '4,6 Milliarden Jahre',
      luminosity: '1,0 Sol',
      mass: '1,0 Sonnenmassen',
      lore: 'Ein stabiler Hauptreihenstern, dessen gleichmäßiges Licht seit Äonen über dieses System wacht. Die sanfte gelbe Strahlung erinnert an die fernen Tage des Heiligen Terra.',
      features: ['Stabile Fusionsreaktion', 'Moderate Sonnenwinde'],
      warpInfluence: 'Die ruhige stellare Aktivität erzeugt kaum Störungen im Warp-Raum.'
    },
    'Roter Riese': {
      classification: 'Klasse M3III',
      temperature: '3.500 K',
      age: '8,2 Milliarden Jahre',
      luminosity: '850 Sol',
      mass: '0,8 Sonnenmassen',
      lore: 'Ein uralter Stern in seinen letzten Jahrmillionen, aufgebläht zu gewaltiger Größe. Sein düsteres rotes Licht kündet vom nahenden Ende.',
      features: ['Expandierte Photosphäre', 'Unregelmäßige Helligkeitsschwankungen', 'Verstärkter Sternwind'],
      warpInfluence: 'Die instabile Natur des sterbenden Sterns erzeugt seltsame Echos im Empyreum.'
    },
    'Blauer Riese': {
      classification: 'Klasse B2III',
      temperature: '20.000 K',
      age: '10 Millionen Jahre',
      luminosity: '25.000 Sol',
      mass: '15 Sonnenmassen',
      lore: 'Ein titanischer blauer Stern, dessen intensive Strahlung alles Leben in seiner Nähe verbrennt. Seine kurze, gewaltsame Existenz wird in einer Supernova enden.',
      features: ['Extreme UV-Strahlung', 'Starke Sternwinde', 'Hohe Masseverlustrate'],
      warpInfluence: 'Die immense Energie des Sterns erzeugt Verwerfungen im Warp, die Navigation erschweren.'
    },
    'Weißer Zwerg': {
      classification: 'Klasse DA',
      temperature: '12.000 K',
      age: '2 Milliarden Jahre (als Zwerg)',
      luminosity: '0,001 Sol',
      mass: '0,6 Sonnenmassen',
      lore: 'Der kristallisierte Kern eines toten Sterns, ein stellarer Leichnam der noch für Milliarden Jahre schwach glimmen wird.',
      features: ['Entartete Materie', 'Keine Fusion', 'Langsame Abkühlung'],
      warpInfluence: 'Die Totenstille dieses erloschenen Sterns beruhigt den Warp unnatürlich.'
    },
    'Oranger Zwerg': {
      classification: 'Klasse K5V',
      temperature: '4.200 K',
      age: '7 Milliarden Jahre',
      luminosity: '0,4 Sol',
      mass: '0,75 Sonnenmassen',
      lore: 'Ein bescheidener Stern von orangem Schein, älter und kühler als Sol, aber von bemerkenswerter Stabilität.',
      features: ['Sehr stabil', 'Geringe Flare-Aktivität', 'Lange Lebensdauer'],
      warpInfluence: 'Die Beständigkeit dieses Sterns macht Warp-Reisen in seiner Nähe vorhersehbar.'
    },
    'Blauer Zwerg': {
      classification: 'Klasse O9V',
      temperature: '30.000 K',
      age: '2 Millionen Jahre',
      luminosity: '50.000 Sol',
      mass: '20 Sonnenmassen',
      lore: 'Ein junger, wütender Stern dessen blaues Feuer mit der Intensität von zehntausend Sonnen brennt.',
      features: ['Extremste UV-Strahlung', 'Ionisiert interstellares Gas', 'Wird als Supernova enden'],
      warpInfluence: 'Die rohe Gewalt dieses Sterns reißt Löcher in die Barriere zwischen Realität und Warp.'
    }
  }
  
  const data = starTypes[star.type] || starTypes['Gelber Zwerg']
  
  return {
    ...star,
    ...data
  }
}

// Select object from list
const selectObject = (obj) => {
  if (obj.id === 'star') {
    selectedPlanet.value = null
    selectedStar.value = generateStarData(obj.data)
  } else {
    selectedStar.value = null
    selectedPlanet.value = obj.data
  }
}

// Edit-Funktionen
const editObject = (obj) => {
  editingObject.value = obj
  
  // Fülle das Formular mit den aktuellen Daten - reactive update
  // Versuche Kategorie aus altem type zu ermitteln
  let category = obj.data?.category || 'Planet'
  let type = obj.data?.type || obj.type || ''
  
  // Migration alter Daten
  if (!obj.data?.category) {
    if (type.toLowerCase().includes('station') || type.toLowerCase().includes('orbital')) {
      category = 'Station'
    } else if (type.toLowerCase().includes('wrack') || type.toLowerCase().includes('hulk') || type.toLowerCase().includes('ship')) {
      category = 'Schiff'
    } else if (type.toLowerCase().includes('asteroid')) {
      category = 'Asteroiden'
    } else if (type.toLowerCase().includes('anomal') || type.toLowerCase().includes('warp')) {
      category = 'Anomalie'
    } else {
      category = 'Planet'
    }
  }
  
  Object.assign(editForm, {
    name: obj.name || '',
    category: category,
    type: type,
    description: obj.data?.description || '',
    flavorText: obj.data?.flavorText || '',
    isHabitable: obj.data?.isHabitable || false,
    hasColony: obj.data?.hasColony || false,
    pointsOfInterest: obj.data?.pointsOfInterest || [],
    resources: obj.data?.resources || [],
    populationSize: obj.data?.population?.size || 0,
    populationType: obj.data?.population?.type || '',
    populationLoyality: obj.data?.population?.loyality || '',
    environment: obj.data?.environment || {
      atmosphere: 'Unknown',
      temperature: 'Variable',
      gravity: 'Standard',
      weather: 'Unknown',
      specialConditions: []
    }
  })
  
  // Reset to basic tab when opening
  editTab.value = 'basic'
  
  showEditDialog.value = true
}

// Funktion zum Hinzufügen einer neuen Sehenswürdigkeit
const addPointOfInterest = () => {
  editForm.pointsOfInterest.push({
    name: '',
    type: 'Unknown',
    faction: 'Unknown',
    danger: 0,
    description: ''
  })
}

const deleteObject = () => {
  if (!editingObject.value || editingObject.value.isNew) return
  
  // Confirm deletion
  if (!confirm(`Wirklich "${editingObject.value.name}" löschen?`)) return
  
  // Get current planets
  const importedPlanets = gameStore.getSystemPlanets(props.systemId) || []
  
  // Find and remove the planet
  const planetIndex = importedPlanets.findIndex(p => p.name === editingObject.value.name)
  
  if (planetIndex !== -1) {
    importedPlanets.splice(planetIndex, 1)
    
    console.log(`Deleting planet from system ${props.systemId}:`, editingObject.value.name)
    
    // Save updated data
    gameStore.setSystemPlanets(props.systemId, importedPlanets)
    
    // Close dialog and refresh view
    showEditDialog.value = false
    
    // Reinitialize to show changes
    if (app) {
      initPlanetaryView()
    }
  }
}

const addNewObject = () => {
  // Create a new object for adding
  editingObject.value = {
    id: `new-${Date.now()}`,
    name: 'Neuer Planet',
    type: 'Planet',
    isNew: true
  }
  
  // Initialize form with defaults for new object
  Object.assign(editForm, {
    name: 'Neuer Planet',
    category: 'Planet',
    type: 'Toter Planet',
    description: '',
    flavorText: '',
    isHabitable: false,
    hasColony: false,
    pointsOfInterest: [],
    resources: [],
    populationSize: 0,
    populationType: '',
    populationLoyality: '',
    environment: {
      atmosphere: 'Unknown',
      temperature: 'Variable',
      gravity: 'Standard',
      weather: 'Unknown',
      specialConditions: []
    }
  })
  
  showEditDialog.value = true
}

const saveObject = () => {
  if (!editingObject.value) return
  
  // Hole die aktuellen Planetendaten
  const importedPlanets = gameStore.getSystemPlanets(props.systemId) || []
  
  // Check if this is a new object
  if (editingObject.value.isNew) {
    // Create new planet object
    const newPlanet = {
      name: editForm.name,
      category: editForm.category,
      type: editForm.type,
      description: editForm.description,
      flavorText: editForm.flavorText,
      isHabitable: editForm.isHabitable,
      hasColony: editForm.hasColony,
      pointsOfInterest: editForm.pointsOfInterest.length > 0 ? editForm.pointsOfInterest : undefined,
      resources: editForm.resources,
      environment: editForm.environment
    }
    
    // Add population if present
    if (editForm.populationSize > 0) {
      newPlanet.population = {
        size: editForm.populationSize,
        type: editForm.populationType,
        loyality: editForm.populationLoyality
      }
    }
    
    // Add to planets array
    importedPlanets.push(newPlanet)
    
    console.log(`Adding new planet to system ${props.systemId}:`, newPlanet)
    
    // Save updated data
    gameStore.setSystemPlanets(props.systemId, importedPlanets)
    
    // Close dialog and refresh view
    showEditDialog.value = false
    
    // Reinitialize to show changes
    if (app) {
      initPlanetaryView()
    }
    
    return
  }
  
  // Finde den zu bearbeitenden Planeten
  const planetIndex = importedPlanets.findIndex(p => p.name === editingObject.value.name)
  
  if (planetIndex !== -1) {
    // Aktualisiere die Planetendaten
    const updatedPlanet = {
      ...importedPlanets[planetIndex],
      name: editForm.name,
      category: editForm.category,
      type: editForm.type,
      description: editForm.description,
      flavorText: editForm.flavorText,
      isHabitable: editForm.isHabitable,
      hasColony: editForm.hasColony,
      pointsOfInterest: editForm.pointsOfInterest.length > 0 ? editForm.pointsOfInterest : undefined,
      resources: editForm.resources,
      environment: editForm.environment
    }
    
    // Füge Bevölkerung hinzu wenn vorhanden
    if (editForm.populationSize > 0) {
      updatedPlanet.population = {
        size: editForm.populationSize,
        type: editForm.populationType,
        loyality: editForm.populationLoyality
      }
    }
    
    // Ersetze den alten Planeten mit dem aktualisierten
    importedPlanets[planetIndex] = updatedPlanet
    
    console.log(`Saving updated planets for system ${props.systemId}:`, importedPlanets)
    
    // Speichere die aktualisierten Daten
    gameStore.setSystemPlanets(props.systemId, importedPlanets)
    
    // Schließe Dialog und aktualisiere die Ansicht
    showEditDialog.value = false
    
    // Neu initialisieren um die Änderungen anzuzeigen
    if (app) {
      initPlanetaryView()
    }
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // Re-init on next tick to adjust to new size
  if (app) {
    setTimeout(() => {
      if (show.value) {
        initPlanetaryView()
      }
    }, 100)
  }
}

watch(show, (newVal) => {
  if (newVal && props.systemId) {
    // Reset selections when opening
    selectedPlanet.value = null
    selectedStar.value = null
    setTimeout(() => initPlanetaryView(), 100)
  } else if (!newVal && app) {
    // Clean up when closing
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    app.destroy(true)
    app = null
    // Reset selections when closing
    selectedPlanet.value = null
    selectedStar.value = null
  }
})

// Also watch for system changes while dialog is open
watch(() => props.systemId, (newSystemId, oldSystemId) => {
  if (newSystemId !== oldSystemId && show.value) {
    // Reset selections when system changes
    selectedPlanet.value = null
    selectedStar.value = null
    // Reinitialize view with new system
    initPlanetaryView()
  }
})

const initPlanetaryView = async () => {
  if (!systemContainer.value) return
  
  // Clean up existing app
  if (app) {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    app.destroy(true)
    app = null
  }
  
  // Wait for container to be ready
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const containerRect = systemContainer.value.getBoundingClientRect()
  
  app = new PIXI.Application()
  await app.init({
    width: containerRect.width,
    height: containerRect.height,
    backgroundColor: 0x000814,
    antialias: true
  })
  
  systemContainer.value.appendChild(app.canvas)
  
  viewport = new PIXI.Container()
  viewport.x = containerRect.width / 2
  viewport.y = containerRect.height / 2
  app.stage.addChild(viewport)
  
  // Try to use imported planet data first, fallback to static data
  const importedPlanets = gameStore.getSystemPlanets(props.systemId)
  console.log(`Loading planets for system ${props.systemId}:`, importedPlanets)
  let systemData
  
  if (importedPlanets && importedPlanets.length > 0) {
    // Convert imported data to planetary system format
    const system = gameStore.systems.find(s => s.id === props.systemId)
    systemData = {
      star: { 
        name: system?.name || 'Unknown', 
        type: system?.starType || 'Gelber Zwerg', 
        radius: 50 
      },
      planets: importedPlanets.map((planet, index) => ({
        name: planet.name,
        category: planet.category || 'Planet', // Kategorie übernehmen
        type: planet.type || 'Unbekannt',
        orbitRadius: 100 + (index * 80), // Auto-calculate orbit
        size: planet.type?.toLowerCase().includes('giant') ? 30 : 15,
        description: planet.description || planet.pointOfInterest || '',
        color: getPlanetColor(planet.type || planet.name),
        // Erweiterte Daten übernehmen
        flavorText: planet.flavorText,
        isHabitable: planet.isHabitable,
        hasColony: planet.hasColony,
        environment: planet.environment,
        resources: planet.resources,
        resource: planet.resource, // Fallback für alte Daten
        pointsOfInterest: planet.pointsOfInterest,
        pointOfInterest: planet.pointOfInterest, // Fallback für alte Daten
        population: planet.population,
        moons: planet.moons,
        explored: planet.explored
      }))
    }
  } else {
    // Check if we have a predefined planetary system
    systemData = planetarySystems[props.systemId]
    
    // If not, create a default with the correct star type from the system
    if (!systemData) {
      const system = gameStore.systems.find(s => s.id === props.systemId)
      systemData = {
        star: { 
          name: system?.name || 'Unbekannter Stern', 
          type: system?.starType || 'Gelber Zwerg', 
          radius: 40 
        },
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
    }
  }
  
  // Draw star
  const star = new PIXI.Graphics()
  const starColor = getStarColorForType(systemData.star.type)
  
  // Create gradient effect for star
  star.circle(0, 0, systemData.star.radius)
  star.fill(starColor)
  
  // Make star interactive
  star.eventMode = 'static'
  star.cursor = 'pointer'
  star.on('pointerdown', () => {
    selectedPlanet.value = null
    selectedStar.value = generateStarData(systemData.star)
  })
  
  // Add glow effect
  star.filters = [new PIXI.BlurFilter({ strength: 10 })]
  
  viewport.addChild(star)
  
  // Clear previous animated planets
  animatedPlanets = []
  
  // Draw orbits and objects
  systemData.planets.forEach((planet, index) => {
    // Bestimme Kategorie
    const isStation = planet.category === 'Station'
    const isShip = planet.category === 'Schiff'
    const isAnomaly = planet.category === 'Anomalie'
    const isAsteroid = planet.category === 'Asteroiden'
    
    // Draw orbit line (für alle)
    const orbit = new PIXI.Graphics()
    orbit.setStrokeStyle({ width: 1, color: 0x444444, alpha: 0.5 })
    orbit.circle(0, 0, planet.orbitRadius)
    orbit.stroke()
    viewport.addChild(orbit)
    
    // Create container for rotation
    const planetContainer = new PIXI.Container()
    
    // Draw object with different shapes based on category
    const planetSprite = new PIXI.Graphics()
    
    if (isStation) {
      // Station: Quadrat
      const halfSize = planet.size * 0.8
      planetSprite.rect(-halfSize, -halfSize, halfSize * 2, halfSize * 2)
      planetSprite.fill(planet.color || 0xaaaaaa)
    } else if (isShip) {
      // Schiff: Dreieck
      planetSprite.moveTo(0, -planet.size)
      planetSprite.lineTo(-planet.size * 0.8, planet.size)
      planetSprite.lineTo(planet.size * 0.8, planet.size)
      planetSprite.closePath()
      planetSprite.fill(planet.color || 0x9999aa)
    } else if (isAnomaly) {
      // Anomalie: Stern-Form
      const spikes = 8
      const outerRadius = planet.size
      const innerRadius = planet.size * 0.5
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) {
          planetSprite.moveTo(x, y)
        } else {
          planetSprite.lineTo(x, y)
        }
      }
      planetSprite.closePath()
      planetSprite.fill(planet.color || 0xff00ff)
    } else if (isAsteroid) {
      // Asteroiden: Unregelmäßige Form
      const points = 8
      for (let i = 0; i < points; i++) {
        const angle = (i * Math.PI * 2) / points
        const radius = planet.size * (0.7 + Math.random() * 0.3)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) {
          planetSprite.moveTo(x, y)
        } else {
          planetSprite.lineTo(x, y)
        }
      }
      planetSprite.closePath()
      planetSprite.fill(planet.color || 0x777766)
    } else {
      // Planet: Normaler Kreis
      planetSprite.circle(0, 0, planet.size)
      planetSprite.fill(planet.color || 0x888888)
    }
    
    planetSprite.x = planet.orbitRadius
    planetSprite.y = 0
    
    // Make planet interactive
    planetSprite.eventMode = 'static'
    planetSprite.cursor = 'pointer'
    planetSprite.on('pointerdown', () => {
      selectedStar.value = null
      selectedPlanet.value = planet
    })
    
    // Add planet name
    const text = new PIXI.Text({
      text: planet.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xffffff
      }
    })
    text.anchor.set(0.5)
    text.x = planet.orbitRadius
    text.y = planet.size + 15
    
    planetContainer.addChild(planetSprite)
    planetContainer.addChild(text)
    
    // Draw moons if they exist
    if (planet.moons) {
      planet.moons.forEach(moon => {
        const moonSprite = new PIXI.Graphics()
        moonSprite.circle(0, 0, moon.size)
        moonSprite.fill(0xcccccc)
        
        const moonDistance = planet.size + 20
        moonSprite.x = planet.orbitRadius + Math.cos(moon.angle * Math.PI / 180) * moonDistance
        moonSprite.y = Math.sin(moon.angle * Math.PI / 180) * moonDistance
        
        planetContainer.addChild(moonSprite)
      })
    }
    
    // Set initial rotation
    planetContainer.rotation = (index * 0.5)
    planetContainer.orbitSpeed = 0.001 * (index + 1)
    
    viewport.addChild(planetContainer)
    
    // Store for animation
    planet.container = planetContainer
    animatedPlanets.push(planet)
  })
  
  // Setup zoom and pan controls
  let isDragging = false
  let lastPos = null
  
  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen
  
  app.stage.on('pointerdown', (e) => {
    isDragging = true
    lastPos = e.global.clone()
  })
  
  app.stage.on('pointermove', (e) => {
    if (isDragging) {
      const dx = e.global.x - lastPos.x
      const dy = e.global.y - lastPos.y
      viewport.x += dx
      viewport.y += dy
      lastPos = e.global.clone()
    }
  })
  
  app.stage.on('pointerup', () => {
    isDragging = false
  })
  
  app.canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
    viewport.scale.x *= scaleFactor
    viewport.scale.y *= scaleFactor
  }, { passive: false })
  
  // Start animation
  animate()
}

const getStarColorForType = (type) => {
  const colors = {
    'Gelber Zwerg': 0xffff00,
    'Roter Zwerg': 0xff4444,
    'Blauer Riese': 0x4444ff,
    'Roter Überriese': 0xff0000,
    'Weißer Zwerg': 0xeeeeee,
    'Oranger Zwerg': 0xffaa00,
    'Blauer Zwerg': 0x88ccff
  }
  return colors[type] || 0xffff00
}

const getPlanetColor = (type) => {
  if (!type) return 0x888888
  
  const typeStr = type.toLowerCase()
  
  // === DEUTSCHE TYPEN (für neue Planeten) ===
  if (typeStr.includes('eiswelt')) return 0xaaccff
  if (typeStr.includes('dschungel')) return 0x44aa44
  if (typeStr.includes('wüste')) return 0xddaa66
  if (typeStr.includes('steppe')) return 0xccaa77
  if (typeStr.includes('lava')) return 0xff4444
  if (typeStr.includes('asche')) return 0x666666
  if (typeStr.includes('felsplanet')) return 0x888888
  if (typeStr.includes('kontinental')) return 0x6688aa
  if (typeStr.includes('ozean')) return 0x4488ff
  if (typeStr.includes('zerbrochen')) return 0x666633
  if (typeStr.includes('minen')) return 0xaa8844
  if (typeStr.includes('gasriese')) return 0xcc9966
  if (typeStr.includes('planetoid')) return 0x999999
  if (typeStr.includes('toter planet') || typeStr.includes('tot')) return 0x444444
  
  // WH40k spezifische deutsche Typen
  if (typeStr.includes('agrar')) return 0x88cc44
  if (typeStr.includes('makropole')) return 0x9966cc
  if (typeStr.includes('fabrik')) return 0x996633
  if (typeStr.includes('feudal')) return 0xaa9966
  if (typeStr.includes('garten')) return 0x66bb66
  if (typeStr.includes('todeswelt')) return 0x663333
  
  // === ENGLISCHE TYPEN (für alte Daten) ===
  // Gasriesen
  if (typeStr === 'gas giant' || typeStr === 'gasgiant' || typeStr === 'gas') return 0xcc9966
  
  // Eis/Schnee/Gefrorene Welten
  if (typeStr.includes('ice') || typeStr.includes('frozen') || typeStr.includes('snow')) return 0xaaccff
  
  // Wüsten/Trockene Welten
  if (typeStr.includes('desert') || typeStr.includes('arid') || typeStr.includes('sand')) return 0xddaa66
  if (typeStr.includes('savannah') || typeStr.includes('savanah') || typeStr.includes('steppes')) return 0xccaa77
  
  // Heiße/Vulkanische Welten
  if (typeStr.includes('burning') || typeStr.includes('lava')) return 0xff4444
  if (typeStr.includes('ash')) return 0x666666
  
  // Grüne/Lebendige Welten
  if (typeStr.includes('jungle') || typeStr.includes('tropical')) return 0x44aa44
  if (typeStr.includes('boreal')) return 0x669966
  if (typeStr.includes('continental')) return 0x6688aa
  
  // Wasserwelten
  if (typeStr.includes('ocean') || typeStr.includes('water')) return 0x4488ff
  
  // Fels/Stein Welten
  if (typeStr.includes('rocky') || typeStr.includes('rock')) return 0x888888
  
  // Tote/Zerstörte Welten
  if (typeStr.includes('dead') || typeStr === '-') return 0x444444
  if (typeStr.includes('tomb')) return 0x333333
  if (typeStr.includes('shattered') || typeStr.includes('cracked')) return 0x666633
  
  // Bergbau
  if (typeStr.includes('mining') || typeStr.includes('mined')) return 0xaa8844
  
  // Schiffe
  if (typeStr.includes('ship') || typeStr.includes('vessel')) return 0x9999aa
  if (typeStr.includes('hulk') || typeStr.includes('wrack')) return 0x555566
  if (typeStr.includes('darkpiercer')) return 0x222244
  
  // Stationen
  if (typeStr.includes('station')) return 0xaaaaaa
  
  // Asteroiden
  if (typeStr.includes('asteroid')) return 0x777766
  
  // Anomalien
  if (typeStr.includes('anomaly')) return 0xff00ff
  if (typeStr.includes('star')) return 0xffff00
  
  // Unbekannt
  if (typeStr.includes('unbekannt')) return 0x666666
  
  return 0x888888
}

// Helper functions for UI display
const getResourceQualityColor = (quality) => {
  const colors = {
    'Legendary': 'purple',
    'Excellent': 'orange',
    'Good': 'green',
    'Standard': 'blue',
    'Poor': 'grey'
  }
  return colors[quality] || 'grey'
}

const getDangerColor = (danger) => {
  if (danger >= 5) return 'red'
  if (danger >= 4) return 'orange'
  if (danger >= 3) return 'amber-8'  // Dunkleres Gelb/Amber statt yellow
  if (danger >= 2) return 'light-blue'
  return 'green'
}

// Store planets for animation
let animatedPlanets = []

const animate = () => {
  if (!app || !show.value) return
  
  // Use the stored animated planets
  animatedPlanets.forEach(planet => {
    if (planet.container) {
      planet.container.rotation += planet.container.orbitSpeed
    }
  })
  
  animationId = requestAnimationFrame(animate)
}

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (app) {
    app.destroy(true)
  }
})
</script>

<style scoped>
.planetary-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.planetary-system-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #000814;
}

.objects-list-panel {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 250px;
  max-width: 90vw;
  max-height: 40vh;
  overflow-y: auto;
  z-index: 10;
}

.planet-info-panel {
  position: absolute;
  top: 60px;
  right: 10px;
  width: 300px;
  max-width: 90vw;
  z-index: 10;
}
</style>