<template>
  <q-dialog v-model="show" maximized>
    <q-card class="ship-management-card">
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="rocket" size="md" class="q-mr-md" />
          <div class="text-h5">{{ ship.name }} - Schiffsverwaltung</div>
          <q-space />
          <q-btn 
            flat 
            dense 
            icon="file_download" 
            @click="exportShip"
            class="q-mr-sm"
          >
            <q-tooltip>Schiff exportieren</q-tooltip>
          </q-btn>
          <q-btn 
            flat 
            dense 
            icon="file_upload" 
            @click="triggerImport"
            class="q-mr-sm"
          >
            <q-tooltip>Schiff importieren</q-tooltip>
          </q-btn>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="importShip"
            style="display: none"
          />
          <q-btn flat round dense icon="close" @click="show = false" />
        </div>
      </q-card-section>

      <q-tabs
        v-model="activeTab"
        class="bg-grey-9 text-white"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        stretch
      >
        <q-tab name="overview" label="Übersicht" icon="dashboard" />
        <q-tab name="components" label="Komponenten" icon="build" />
        <q-tab name="crew" label="Besatzung" icon="groups" />
        <q-tab name="cargo" label='Fracht' icon="inventory_2" />
        <q-tab name="notes" label="Notizen" icon="description" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="bg-grey-10">
        <!-- Übersicht Tab -->
        <q-tab-panel name="overview">
          <div class="row q-col-gutter-md">
            <!-- Schiffsklassen-Info -->
            <div class="col-12" v-if="ship.hullClass">
              <q-card class="bg-grey-9">
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <!-- Schiffsbild -->
                    <div class="col-12 col-md-4">
                      <div class="ship-image-container">
                        <q-img 
                          v-if="ship.hullClass.image" 
                          :src="ship.hullClass.image" 
                          :alt="ship.hullClass.name"
                          style="height: 250px; width: 100%"
                          fit="cover"
                          @error="(err) => console.error('Image load error:', ship.hullClass.image, err)"
                        >
                          <template v-slot:loading>
                            <q-spinner color="white" size="50px" />
                          </template>
                          <template v-slot:error>
                            <div class="absolute-full flex flex-center bg-negative text-white">
                              Bild konnte nicht geladen werden
                            </div>
                          </template>
                        </q-img>
                        <div v-else class="ship-image-placeholder">
                          <q-icon name="rocket_launch" size="64px" color="grey-6" />
                          <div class="text-grey-6 text-caption q-mt-md">Kein Bild verfügbar</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Schiffsinformationen -->
                    <div class="col-12 col-md-8">
                      <div class="text-h5 text-white q-mb-md">{{ ship.hullClass.name }}</div>
                      
                      <div class="row q-gutter-sm q-mb-md">
                        <q-chip v-if="ship.hullClass.dimensions" dark color="blue-grey-8" icon="straighten">
                          {{ ship.hullClass.dimensions }}
                        </q-chip>
                        <q-chip v-if="ship.hullClass.mass" dark color="blue-grey-8" icon="scale">
                          {{ ship.hullClass.mass }}
                        </q-chip>
                        <q-chip v-if="ship.hullClass.crew" dark color="blue-grey-8" icon="groups">
                          {{ ship.hullClass.crew }}
                        </q-chip>
                        <q-chip v-if="ship.hullClass.acceleration" dark color="blue-grey-8" icon="speed">
                          Max: {{ ship.hullClass.acceleration }}
                        </q-chip>
                      </div>
                      
                      <div v-if="ship.hullClass.description" class="text-body2 text-grey-3">
                        {{ ship.hullClass.description }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <!-- Schiffsklasse und Grundwerte -->
            <div class="col-12 col-md-6">
              <q-card class="bg-grey-9">
                <q-card-section>
                  <div class="text-h6 text-white q-mb-md">Schiffsdaten</div>
                  
                  <div class="row q-gutter-sm">
                    <div class="col">
                      <q-input 
                        v-model="ship.name" 
                        label="Schiffsname" 
                        dark 
                        filled
                        @change="saveShip"
                      />
                    </div>
                    <div class="col">
                      <q-select 
                        v-model="ship.hullId" 
                        :options="hullClasses" 
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                        label="Schiffsklasse"
                        dark
                        filled
                        @update:model-value="updateHullClass"
                      />
                    </div>
                  </div>

                  <!-- Schiffsvergangenheit und Eigenheiten -->
                  <div class="q-mt-md">
                    <div class="row q-gutter-sm">
                      <div class="col">
                        <q-select
                          v-model="ship.history"
                          :options="historyOptions"
                          option-label="name"
                          option-value="id"
                          label="Schiffsvergangenheit"
                          dark
                          filled
                          dense
                          @update:model-value="saveShip"
                        >
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label>{{ scope.opt.name }}</q-item-label>
                                <q-item-label caption lines="2">{{ scope.opt.description.substring(0, 100) }}...</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                      <div class="col">
                        <q-select
                          v-model="ship.quirk"
                          :options="quirkOptions"
                          option-label="name"
                          option-value="id"
                          label="Eigenheit"
                          dark
                          filled
                          dense
                          @update:model-value="saveShip"
                        >
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label>{{ scope.opt.name }}</q-item-label>
                                <q-item-label caption lines="2">{{ scope.opt.description.substring(0, 100) }}...</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                    </div>

                    <!-- Beschreibungen anzeigen wenn ausgewählt -->
                    <div v-if="ship.history" class="q-mt-sm">
                      <q-banner dense class="bg-blue-grey-9 text-white">
                        <template v-slot:avatar>
                          <q-icon name="history" color="amber" />
                        </template>
                        <div class="text-subtitle2">{{ ship.history.name }}</div>
                        <div class="text-caption">{{ ship.history.description }}</div>
                      </q-banner>
                    </div>
                    
                    <div v-if="ship.quirk" class="q-mt-sm">
                      <q-banner dense class="bg-blue-grey-9 text-white">
                        <template v-slot:avatar>
                          <q-icon name="psychology" color="amber" />
                        </template>
                        <div class="text-subtitle2">{{ ship.quirk.name }}</div>
                        <div class="text-caption">{{ ship.quirk.description }}</div>
                      </q-banner>
                    </div>
                  </div>

                  <div class="q-mt-md">
                    <div class="text-subtitle2 text-amber q-mb-sm">Grundwerte</div>
                    <div class="row q-gutter-xs">
                      <q-chip color="blue" text-color="white" icon="speed">
                        Geschwindigkeit: {{ shipStats.speed || 0 }}
                      </q-chip>
                      <q-chip color="orange" text-color="white" icon="rotate_right">
                        Manöver: {{ shipStats.maneuverability || 0 }}
                      </q-chip>
                      <q-chip color="red" text-color="white" icon="visibility">
                        Aufklärung: {{ shipStats.detection || 0 }}
                      </q-chip>
                      <q-chip color="purple" text-color="white" icon="shield">
                        Schilde: {{ shipStats.shields || 0 }}
                      </q-chip>
                      <q-chip color="green" text-color="white" icon="gps_fixed">
                        Panzerung: {{ shipStats.armor || 0 }}
                      </q-chip>
                      <q-chip color="cyan" text-color="white" icon="military_tech">
                        Turm-Rating: {{ shipStats.turretRating || 0 }}
                      </q-chip>
                      <q-chip color="yellow" text-color="black" icon="favorite">
                        Hülle: {{ shipStats.hullIntegrity || ship.hullClass?.hullIntegrity || 0 }}
                      </q-chip>
                      <q-chip color="pink" text-color="white" icon="mood">
                        Moral: {{ (shipStats.morale || 0) > 0 ? '+' : '' }}{{ shipStats.morale || 0 }}
                      </q-chip>
                      <q-chip v-if="shipStats.crew" color="deep-purple" text-color="white" icon="groups">
                        Mannschaft: {{ shipStats.crew > 0 ? '+' : '' }}{{ shipStats.crew }}%
                      </q-chip>
                    </div>
                  </div>

                  <q-separator dark class="q-my-md" />

                  <div class="text-subtitle2 text-amber q-mb-sm">Ressourcen</div>
                  <div class="q-gutter-sm">
                    <!-- Raum -->
                    <div>
                      <div class="text-caption text-grey">Raum</div>
                      <q-linear-progress 
                        :value="usedSpace / ship.maxSpace" 
                        size="25px"
                        :color="usedSpace > ship.maxSpace ? 'red' : 'green'"
                        class="q-mb-xs"
                      >
                        <div class="absolute-full flex flex-center">
                          <div class="text-white text-caption">
                            {{ usedSpace }} / {{ ship.maxSpace }}
                          </div>
                        </div>
                      </q-linear-progress>
                    </div>

                    <!-- Energie -->
                    <div>
                      <div class="text-caption text-grey">Energie</div>
                      <q-linear-progress 
                        :value="generatedPower > 0 ? usedPower / generatedPower : 0" 
                        size="25px"
                        :color="usedPower > generatedPower ? 'red' : 'yellow'"
                        class="q-mb-xs"
                      >
                        <div class="absolute-full flex flex-center">
                          <div class="text-white text-caption">
                            {{ usedPower }} / {{ generatedPower }}
                          </div>
                        </div>
                      </q-linear-progress>
                    </div>

                    <!-- SP (Ship Points) -->
                    <div>
                      <div class="text-caption text-grey">Schiffspunkte (SP)</div>
                      <q-chip color="amber" text-color="black">
                        Ausgegeben: {{ usedSP }} SP
                      </q-chip>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Waffen-Übersicht und Eigenschaften -->
            <div class="col-12 col-md-6">
              <q-card class="bg-grey-9">
                <q-card-section>
                  <div class="text-h6 text-white q-mb-md">Bewaffnung</div>
                  
                  <q-list dark separator v-if="installedWeapons.length > 0">
                    <q-item v-for="(weapon, index) in installedWeapons" :key="`weapon-${index}`">
                      <q-item-section avatar>
                        <q-icon :name="getWeaponIcon(weapon)" color="red" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>
                          {{ weapon.name }}
                          <q-icon v-if="weapon.modified" name="auto_fix_high" color="amber" size="xs" title="Modifiziert durch Komponenten" />
                        </q-item-label>
                        <q-item-label caption>
                          <span :class="weapon.modified ? 'text-amber' : 'text-orange'">
                            Schaden: {{ weapon.damage }}
                          </span>
                          <span v-if="weapon.critValue" class="text-yellow"> | Krit: {{ weapon.critValue }}</span>
                          <span class="text-blue"> | RW: {{ weapon.range }}</span>
                          <span class="text-green"> | Stärke: {{ weapon.strength }}</span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  
                  <div v-else class="text-grey text-center q-pa-md">
                    Keine Waffen installiert
                  </div>
                  
                  <q-separator dark class="q-my-md" />
                  
                  <!-- Schiffseigenschaften -->
                  <div class="text-h6 text-white q-mb-md">Schiffseigenschaften</div>
                  
                  <div v-if="shipProperties.length > 0">
                    <div>
                      <div v-for="prop in shipProperties" :key="prop" class="q-mb-sm">
                        <div class="ship-trait-chip">
                          <q-icon name="anchor" size="sm" color="teal-6" class="q-mr-sm flex-shrink-0" />
                          <span class="ship-trait-text">{{ prop }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-grey text-center">
                    Keine besonderen Eigenschaften
                  </div>
                  
                  <!-- Boni-Übersicht -->
                  <div v-if="shipStats.skillBonusesList?.length || shipStats.situationalBonuses?.length || shipStats.projectBonuses?.length || shipStats.risks?.length" class="q-mt-md">
                    <q-separator dark class="q-mb-md" />
                    <div class="text-h6 text-white q-mb-md">Boni & Modifikatoren</div>
                    
                    <div v-if="shipStats.skillBonusesList?.length" class="q-mb-sm">
                      <div class="text-subtitle2 text-green q-mb-xs">Fähigkeits-Boni:</div>
                      <div class="text-caption text-grey-4">
                        <div v-for="bonus in shipStats.skillBonusesList" :key="bonus">
                          • {{ bonus }}
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="shipStats.situationalBonuses?.length">
                      <div class="text-subtitle2 text-blue q-mb-xs">Situative Boni:</div>
                      <div>
                        <div v-for="bonus in shipStats.situationalBonuses" :key="bonus" class="q-mb-xs">
                          <q-chip dark size="sm" color="purple-9" text-color="white" icon="psychology">
                            {{ bonus }}
                          </q-chip>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="shipStats.projectBonuses && shipStats.projectBonuses.length > 0" class="q-mt-sm">
                      <div class="text-subtitle2 text-purple q-mb-xs">Projekt-Boni:</div>
                      <div class="text-caption text-grey-4">
                        <div v-for="(bonus, index) in shipStats.projectBonuses" :key="`project-${index}`">
                          • {{ bonus }}
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="shipStats.risks && shipStats.risks.length > 0" class="q-mt-sm">
                      <div class="text-subtitle2 text-red q-mb-xs">Risiken & Gefahren:</div>
                      <div class="text-caption text-grey-4">
                        <div v-for="(risk, idx) in shipStats.risks" :key="`risk-${idx}-${risk.substring(0,10)}`">
                          • {{ risk }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- Komponenten Tab -->
        <q-tab-panel name="components">
          <div class="row q-col-gutter-md">
            <!-- Komponenten-Kategorien -->
            <div class="col-12 col-md-4">
              <q-card class="bg-grey-9">
                <q-card-section>
                  <div class="text-h6 text-white q-mb-md">Komponenten-Kategorien</div>
                  
                  <q-list dark separator>
                    <q-expansion-item
                      label="Essentielle Komponenten"
                      header-class="text-amber"
                      expand-separator
                      group="components"
                      default-opened
                    >
                      <q-list>
                        <q-item 
                          v-for="cat in essentialCategories" 
                          :key="cat.id"
                          clickable
                          :active="selectedComponentCategory === cat.id"
                          @click="selectedComponentCategory = cat.id"
                          active-class="bg-primary text-white"
                        >
                          <q-item-section avatar>
                            <q-icon :name="cat.icon" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ cat.label }}</q-item-label>
                            <q-item-label caption v-if="ship.components[cat.id]">
                              Installiert: {{ ship.components[cat.id]?.name }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-expansion-item>
                    
                    <q-expansion-item
                      label="Zusatzkomponenten"
                      header-class="text-green"
                      expand-separator
                      group="components"
                    >
                      <q-list>
                        <q-item 
                          v-for="cat in supplementalCategories" 
                          :key="cat.id"
                          clickable
                          :active="selectedComponentCategory === cat.id"
                          @click="selectedComponentCategory = cat.id"
                          active-class="bg-primary text-white"
                        >
                          <q-item-section avatar>
                            <q-icon :name="cat.icon" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ cat.label }}</q-item-label>
                            <q-item-label caption>
                              {{ ship.components[cat.id]?.length || 0 }} installiert
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-expansion-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
            
            <!-- Verfügbare Komponenten -->
            <div class="col-12 col-md-4">
              <q-card class="bg-grey-9">
                <q-card-section>
                  <div class="text-h6 text-white q-mb-md">Verfügbare Komponenten</div>
                  
                  <!-- Waffentyp-Filter (nur bei Waffen anzeigen) -->
                  <div v-if="selectedComponentCategory === 'weapons'" class="q-mb-md">
                    <q-select
                      v-model="selectedWeaponType"
                      :options="weaponTypeOptions"
                      label="Waffentyp filtern"
                      dark
                      outlined
                      dense
                      emit-value
                      map-options
                      clearable
                      clear-icon="close"
                    >
                      <template v-slot:prepend>
                        <q-icon name="filter_alt" />
                      </template>
                    </q-select>
                  </div>
                  
                  <q-list dark separator style="max-height: 400px; overflow-y: auto">
                    <q-item 
                      v-for="comp in availableComponents" 
                      :key="comp.id"
                      clickable
                      @click="selectComponent(comp)"
                      :class="isComponentInstalled(comp) ? 'bg-green-10' : ''"
                    >
                      <q-item-section>
                        <q-item-label>
                          {{ comp.name }}
                          <!-- Waffentyp Badge -->
                          <q-badge v-if="comp.weaponType" :color="getWeaponTypeColor(comp.weaponType)" class="q-ml-xs">
                            {{ getWeaponTypeLabel(comp.weaponType) }}
                          </q-badge>
                          <q-badge v-if="comp.isArchaeotech" color="amber" text-color="black" class="q-ml-xs">
                            <q-icon name="memory" size="xs" class="q-mr-xs" />Archäotechnik
                          </q-badge>
                          <q-badge v-if="comp.isXenotech" color="deep-purple" class="q-ml-xs">
                            <q-icon name="bug_report" size="xs" class="q-mr-xs" />Xenotech
                          </q-badge>
                        </q-item-label>
                        <q-item-label caption>
                          <span :class="{'text-red': comp.space > availableSpace}">
                            Raum: {{ comp.space }}
                          </span> | 
                          <span v-if="selectedComponentCategory === 'plasmaDrive'" class="text-green">
                            Energie: +{{ Math.abs(comp.power) }}
                          </span>
                          <span v-else :class="{'text-red': comp.power > availablePower && selectedComponentCategory !== 'plasmaDrive'}">
                            Energie: {{ comp.power }}
                          </span>
                          <span v-if="comp.sp > 0"> | SP: {{ comp.sp }}</span>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="row items-center q-gutter-xs">
                          <!-- Zeige Anzahl installierter Waffen -->
                          <q-badge 
                            v-if="selectedComponentCategory === 'weapons' && getWeaponCount(comp) > 0"
                            color="blue"
                            :label="getWeaponCount(comp) + 'x'"
                          />
                          <q-btn 
                            v-if="!isComponentInstalled(comp)"
                            flat 
                            dense 
                            round 
                            icon="add" 
                            color="green"
                            @click.stop="installComponent(comp)"
                            :disable="!canInstallComponent(comp)"
                          />
                          <q-icon 
                            v-else
                            name="check"
                            color="green"
                          />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  
                  <!-- Aktuell installierte Komponente anzeigen (Essentielle) -->
                  <div v-if="currentInstalledComponent" class="q-mt-md q-pa-sm bg-green-10 rounded-borders">
                    <div class="text-caption text-green q-mb-xs">Aktuell installiert:</div>
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-white">{{ currentInstalledComponent.name }}</div>
                        <div class="text-caption text-grey-4">
                          Raum: {{ currentInstalledComponent.space }}, 
                          <span v-if="currentInstalledComponent.type === 'plasmaDrive'">
                            Energie: +{{ Math.abs(currentInstalledComponent.power) }}
                          </span>
                          <span v-else>
                            Energie: {{ currentInstalledComponent.power }}
                          </span>
                        </div>
                      </div>
                      <q-btn 
                        flat 
                        dense 
                        round 
                        icon="delete" 
                        color="red"
                        size="sm"
                        @click="removeCurrentComponent()"
                        title="Komponente entfernen"
                      />
                    </div>
                  </div>
                  
                  <!-- Installierte Zusatzkomponenten anzeigen -->
                  <div v-if="currentInstalledSupplementalComponents.length > 0" class="q-mt-md">
                    <div class="text-caption text-green q-mb-xs">Installierte {{ getCategoryLabel() }}:</div>
                    <q-list dark separator dense>
                      <q-item v-for="(comp, index) in currentInstalledSupplementalComponents" :key="`installed-${index}`">
                        <q-item-section>
                          <q-item-label>{{ comp.name }}</q-item-label>
                          <q-item-label caption>
                            Raum: {{ comp.space }}, Energie: {{ comp.power }}
                            <span v-if="comp.sp">, SP: {{ comp.sp }}</span>
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn 
                            flat 
                            dense 
                            round 
                            icon="delete" 
                            color="red"
                            size="sm"
                            @click="removeSupplementalComponent(comp, index)"
                            title="Entfernen"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <!-- Komponenten-Details -->
            <div class="col-12 col-md-4">
              <q-card class="bg-grey-9">
                <q-card-section>
                  <div class="text-h6 text-white q-mb-md">Details</div>
                  
                  <div v-if="selectedComponent">
                    <div class="text-subtitle1 text-amber q-mb-sm">
                      {{ selectedComponent.name }}
                    </div>
                    
                    <div class="q-mb-sm">
                      <q-chip color="blue" text-color="white" icon="space_bar">
                        Raum: {{ selectedComponent.space }}
                      </q-chip>
                      <q-chip v-if="selectedComponentCategory === 'plasmaDrive'" color="green" text-color="white" icon="bolt">
                        Energie: +{{ Math.abs(selectedComponent.power) }}
                      </q-chip>
                      <q-chip v-else color="yellow" text-color="black" icon="bolt">
                        Energie: {{ selectedComponent.power }}
                      </q-chip>
                      <q-chip v-if="selectedComponent.sp" color="amber" text-color="black" icon="stars">
                        SP: {{ selectedComponent.sp }}
                      </q-chip>
                    </div>
                    
                    <div v-if="selectedComponent.description" class="q-mb-md">
                      <div class="text-subtitle2 text-grey q-mb-xs">Beschreibung:</div>
                      <div class="text-body2 text-blue-grey-3">
                        {{ selectedComponent.description }}
                      </div>
                    </div>
                    
                    <!-- Waffenwerte anzeigen für Waffen -->
                    <div v-if="selectedComponent.type === 'weapon'" class="q-mb-md">
                      <div class="text-subtitle2 text-orange q-mb-xs">Waffenwerte:</div>
                      <div class="row q-gutter-sm">
                        <q-chip v-if="selectedComponent.damage" size="sm" color="red-9" text-color="white">
                          Schaden: {{ selectedComponent.damage }}
                        </q-chip>
                        <q-chip v-if="selectedComponent.critValue" size="sm" color="orange-9" text-color="white">
                          Krit: {{ selectedComponent.critValue }}
                        </q-chip>
                        <q-chip v-if="selectedComponent.range" size="sm" color="blue-9" text-color="white">
                          Reichweite: {{ selectedComponent.range }}
                        </q-chip>
                        <q-chip v-if="selectedComponent.strength" size="sm" color="purple-9" text-color="white">
                          Stärke: {{ selectedComponent.strength }}
                        </q-chip>
                      </div>
                    </div>
                    
                    <!-- Neue Bonus-Struktur anzeigen -->
                    <div v-if="selectedComponent.bonuses">
                      <!-- Stats Boni -->
                      <div v-if="selectedComponent.bonuses.stats && Object.keys(selectedComponent.bonuses.stats).length > 0" class="q-mb-sm">
                        <div class="text-subtitle2 text-green q-mb-xs">Stat-Modifikationen:</div>
                        <div class="q-gutter-xs">
                          <q-chip v-for="(value, stat) in selectedComponent.bonuses.stats" :key="stat" 
                            size="sm" color="green-9" text-color="white">
                            {{ getStatName(stat) }}: {{ value > 0 ? '+' : '' }}{{ value }}
                          </q-chip>
                        </div>
                      </div>
                      
                      <!-- Skill Boni -->
                      <div v-if="selectedComponent.bonuses.skills && selectedComponent.bonuses.skills.length > 0" class="q-mb-sm">
                        <div class="text-subtitle2 text-blue q-mb-xs">Fertigkeits-Boni:</div>
                        <ul class="text-body2 text-white">
                          <li v-for="skill in selectedComponent.bonuses.skills" :key="skill">
                            {{ skill }}
                          </li>
                        </ul>
                      </div>
                      
                      <!-- Ship Traits -->
                      <div v-if="selectedComponent.bonuses.shipTraits && selectedComponent.bonuses.shipTraits.length > 0" class="q-mb-sm">
                        <div class="text-subtitle2 text-teal q-mb-xs">Schiffseigenschaften:</div>
                        <ul class="text-body2 text-white">
                          <li v-for="trait in selectedComponent.bonuses.shipTraits" :key="trait">
                            {{ trait }}
                          </li>
                        </ul>
                      </div>
                      
                      <!-- Situational Boni -->
                      <div v-if="selectedComponent.bonuses.situational && selectedComponent.bonuses.situational.length > 0" class="q-mb-sm">
                        <div class="text-subtitle2 text-purple q-mb-xs">Situative Boni:</div>
                        <ul class="text-body2 text-white">
                          <li v-for="bonus in selectedComponent.bonuses.situational" :key="bonus">
                            {{ bonus }}
                          </li>
                        </ul>
                      </div>
                      
                      <!-- Project Boni -->
                      <div v-if="selectedComponent.bonuses.projects && selectedComponent.bonuses.projects.length > 0" class="q-mb-sm">
                        <div class="text-subtitle2 text-amber q-mb-xs">Projekt-Boni:</div>
                        <ul class="text-body2 text-white">
                          <li v-for="project in selectedComponent.bonuses.projects" :key="project">
                            {{ project }}
                          </li>
                        </ul>
                      </div>
                      
                      <!-- Risiken -->
                      <div v-if="selectedComponent.bonuses.risks && selectedComponent.bonuses.risks.length > 0" class="q-mb-sm">
                        <div class="text-subtitle2 text-red q-mb-xs">Risiken:</div>
                        <ul class="text-body2 text-orange">
                          <li v-for="risk in selectedComponent.bonuses.risks" :key="risk">
                            {{ risk }}
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <!-- Legacy Support für alte special Arrays -->
                    <div v-if="selectedComponent.special && selectedComponent.special.length">
                      <div class="text-subtitle2 text-grey q-mb-xs">Spezialeffekte:</div>
                      <ul class="text-body2 text-white">
                        <li v-for="effect in selectedComponent.special" :key="effect">
                          {{ effect }}
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div v-else class="text-body2 text-grey">
                    Wähle eine Komponente aus der Liste
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- Ressourcen-Übersicht unten -->
          <q-card class="bg-grey-9 q-mt-md">
            <q-card-section>
              <div class="row q-gutter-md">
                <div class="col">
                  <div class="text-caption text-grey">Raum</div>
                  <q-linear-progress 
                    :value="usedSpace / ship.maxSpace" 
                    size="25px"
                    :color="usedSpace > ship.maxSpace ? 'red' : 'green'"
                  >
                    <div class="absolute-full flex flex-center">
                      <div class="text-white text-caption">
                        {{ usedSpace }} / {{ ship.maxSpace }} ({{ availableSpace }} frei)
                      </div>
                    </div>
                  </q-linear-progress>
                </div>
                
                <div class="col">
                  <div class="text-caption text-grey">Energie</div>
                  <q-linear-progress 
                    :value="usedPower / generatedPower" 
                    size="25px"
                    :color="usedPower > generatedPower ? 'red' : 'yellow'"
                  >
                    <div class="absolute-full flex flex-center">
                      <div class="text-white text-caption">
                        {{ usedPower }} / {{ generatedPower }} ({{ availablePower }} frei)
                      </div>
                    </div>
                  </q-linear-progress>
                </div>
                
                <div class="col">
                  <div class="text-caption text-grey">Schiffspunkte</div>
                  <q-chip color="amber" text-color="black">
                    {{ usedSP }} SP ausgegeben
                  </q-chip>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!-- Besatzung Tab -->
        <q-tab-panel name="crew">
          <div class="text-h6 text-white q-mb-md">Besatzung & Offiziere</div>
          
          <!-- Rang 1: Lord-Kapitän -->
          <div class="text-subtitle1 text-amber q-mb-sm">RANG 1</div>
          <div class="row q-col-gutter-lg q-mb-lg justify-center">
            <div class="col-4 col-md-3 col-lg-1" style="min-width: 200px;">
              <q-card class="bg-grey-9 crew-card">
                <q-img 
                  :src="getCrewPortrait('lord-kapitan')"
                 style="max-width: 220px; height: 200px;"
                  class="crew-portrait"
                  @error="(e) => handlePortraitError(e, 'lord-kapitan')"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-8">
                      <q-icon name="person" size="32px" color="grey-5" />
                    </div>
                  </template>
                </q-img>
                <q-card-section class="q-pa-xs">
                  <div class="text-caption text-amber text-center" style="font-size: 12px;">Lord-Kapitän</div>
                  <q-input
                    v-model="ship.crew.lordKapitan.name"
                    dense
                    dark
                    label="Name"
                    @change="saveShip"
                  />
                  <q-input
                    v-model="ship.crew.lordKapitan.notes"
                    dense
                    dark
                    type="textarea"
                    label="Notizen"
                    rows="2"
                    input-style="font-size: 10px; line-height: 1.2;"
                    @change="saveShip"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- Rang 2: Führungsoffiziere -->
          <div class="text-subtitle1 text-amber q-mb-sm">RANG 2</div>
          <div class="row q-col-gutter-md q-mb-lg justify-center">
            <div class="col-3 col-md-2 col-lg-1" v-for="position in rang2Positions" :key="position.id" style="min-width: 180px; max-width: 180px;">
              <q-card class="bg-grey-9 crew-card">
                <q-img 
                  :src="getCrewPortrait(position.id)"
                      :ratio="3/4"
                  class="crew-portrait"
                  @error="(e) => handlePortraitError(e, position.id)"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-8">
                      <q-icon name="person" size="24px" color="grey-5" />
                    </div>
                  </template>
                </q-img>
                <q-card-section class="q-pa-xs">
                  <div class="text-caption text-amber text-center" style="font-size: 12px;">{{ position.title }}</div>
                  <q-input
                    v-model="ship.crew[position.id].name"
                    dense
                    dark
                    label="Name"
                    @change="saveShip"
                  />
                  <q-input
                    v-model="ship.crew[position.id].notes"
                    dense
                    dark
                    type="textarea"
                    label="Notizen"
                    rows="3"
                    input-style="font-size: 9px; line-height: 1.2;"
                    @change="saveShip"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- Rang 3: Spezialisten -->
          <div class="text-subtitle1 text-amber q-mb-sm">RANG 3</div>
          <div class="row q-col-gutter-sm q-mb-lg justify-center">
            <div class="col-2 col-md-1" v-for="position in rang3Positions" :key="position.id" style="min-width: 180px; max-width: 180px;">
              <q-card class="bg-grey-9 crew-card">
                <q-img 
                  :src="getCrewPortrait(position.id)"
                  :ratio="3/4"
                  class="crew-portrait"
                  @error="(e) => handlePortraitError(e, position.id)"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-8">
                      <q-icon name="person" size="20px" color="grey-5" />
                    </div>
                  </template>
                </q-img>
                <q-card-section class="q-pa-xs">
                  <div class="text-caption text-amber text-center text-truncate" style="font-size: 12px;">{{ position.title }}</div>
                  <q-input
                    v-model="ship.crew[position.id].name"
                    dense
                    dark
                    label="Name"
                    @change="saveShip"
                  />
                    <q-input
                    v-model="ship.crew[position.id].notes"
                    dense
                    dark
                    type="textarea"
                    label="Notizen"
                    rows="3"
                    input-style="font-size: 9px; line-height: 1.2;"
                    @change="saveShip"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
          
          <!-- Weitere wichtige Crew-Mitglieder -->
          <div class="text-subtitle1 text-amber q-mb-sm">Weitere wichtige Crew-Mitglieder</div>
          <q-card class="bg-grey-9">
            <q-card-section>
              <q-list dark separator>
                <q-item v-for="member in ship.additionalCrew" :key="member.id" class="q-px-sm">
                  <q-item-section avatar>
                    <q-icon :name="getCrewIcon(member.role)" color="grey-5" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ member.name }}</q-item-label>
                    <q-item-label caption>{{ member.role }}</q-item-label>
                  </q-item-section>
                  <q-item-section v-if="member.notes" class="text-caption text-grey-5">
                    {{ member.notes }}
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="red"
                      @click="removeCrewMember(member.id)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              
              <!-- Add new crew member -->
              <div class="q-mt-md">
                <q-btn
                  label="Crew-Mitglied hinzufügen"
                  icon="add"
                  color="primary"
                  @click="showAddCrewDialog = true"
                />
              </div>
            </q-card-section>
          </q-card>
          
          <!-- General crew notes -->
          <div class="q-mt-lg">
            <q-input
              v-model="ship.crewNotes"
              type="textarea"
              filled
              dark
              label="Allgemeine Besatzungsnotizen"
              rows="5"
              @change="saveShip"
            />
          </div>
        </q-tab-panel>

        <!-- Fracht Tab -->
        <q-tab-panel name="cargo">
          <div class="text-h6 text-white q-mb-md">Frachtraum & Ausrüstung</div>
          <q-input
            v-model="ship.cargoNotes"
            type="textarea"
            filled
            dark
            label="Fracht und Ausrüstung"
            rows="10"
            @change="saveShip"
          />
        </q-tab-panel>

        <!-- Notizen Tab -->
        <q-tab-panel name="notes">
          <div class="text-h6 text-white q-mb-md">Allgemeine Notizen</div>
          <q-input
            v-model="ship.notes"
            type="textarea"
            filled
            dark
            label="Notizen zum Schiff"
            rows="10"
            @change="saveShip"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
  
  <!-- Add Crew Member Dialog -->
  <q-dialog v-model="showAddCrewDialog">
    <q-card class="bg-grey-9" style="width: 400px">
      <q-card-section>
        <div class="text-h6 text-white">Crew-Mitglied hinzufügen</div>
      </q-card-section>
      
      <q-card-section>
        <q-input
          v-model="newCrewMember.name"
          label="Name"
          dark
          filled
          class="q-mb-md"
        />
        
        <q-select
          v-model="newCrewMember.role"
          label="Position/Rolle"
          dark
          filled
          :options="crewRoleOptions"
          class="q-mb-md"
        />
        
        <q-input
          v-model="newCrewMember.notes"
          label="Notizen"
          type="textarea"
          dark
          filled
          rows="3"
        />
      </q-card-section>
      
      <q-card-actions align="right">
        <q-btn flat label="Abbrechen" color="grey" v-close-popup />
        <q-btn 
          flat 
          label="Hinzufügen" 
          color="primary" 
          @click="() => {
            addCrewMember(newCrewMember)
            newCrewMember = { name: '', role: '', notes: '' }
            showAddCrewDialog = false
          }"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { 
  hullTypes, 
  essentialComponents, 
  supplementalComponents,
  archaeotech,
  getComponentsForShipType,
  calculateShipStats,
  shipHistories,
  shipQuirks
} from '../data/shipComponents'
import { useGameStore } from '../stores/gameStore'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const gameStore = useGameStore()
const $q = useQuasar()

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('overview')
const selectedComponentCategory = ref('plasmaDrive')
const selectedComponent = ref(null)
const showAddCrewDialog = ref(false)
const selectedWeaponType = ref(null) // Filter für Waffentyp
const fileInput = ref(null) // Referenz für File Input

// Schiffsvergangenheit und Eigenheiten Optionen
const historyOptions = computed(() => {
  return Object.values(shipHistories).map(h => ({
    id: h.id,
    name: h.name,
    description: h.description,
    bonuses: h.bonuses
  }))
})

const quirkOptions = computed(() => {
  return Object.values(shipQuirks).map(q => ({
    id: q.id,
    name: q.name,
    description: q.description,
    bonuses: q.bonuses
  }))
})

// New crew member form
const newCrewMember = reactive({
  name: '',
  role: '',
  notes: ''
})

// Crew role options for dropdown
const crewRoleOptions = [
  'Navigator',
  'Tech-Priest',
  'Astropath',
  'Missionary',
  'Seneschal',
  'Void Master',
  'Arch-Militant',
  'Explorator',
  'Chirurgeon',
  'Master-at-Arms',
  'Bosun',
  'Master of Ordnance',
  'Enginseer',
  'Quartermaster',
  'Ship\'s Confessor',
  'Armsman',
  'Rating',
  'Servitor'
]

// Crew hierarchy definitions
const rang2Positions = [
  { id: 'ersterOffizier', title: 'Seneschall' },
  { id: 'maschinenseherPrimus', title: 'Maschinenseher Primus' },
  { id: 'primarisNavigator', title: 'Primaris-Navigator' },
  { id: 'erzMilitant', title: 'Erz-Militant' },
  { id: 'oberstesFaktotum', title: 'Oberstes Faktotum' }
]

const rang3Positions = [
  { id: 'truppenMeister', title: 'Truppenmeister' },
  { id: 'ersterSteuermann', title: 'Erster Steuermann' },
  { id: 'geschuetzMeister', title: 'Geschützmeister' },
  { id: 'voxmeister', title: 'Voxmeister' },
  { id: 'obersterChirurg', title: 'Oberster Chirurg' },
  { id: 'meisterDesBordgeflusters', title: 'Meister des Bordgeflüsters' },
  { id: 'telepathicaChormeister', title: 'Telepathica-Chormeister' }
]

// Echte Schiffsklassen aus den Daten
const hullClasses = computed(() => {
  return Object.entries(hullTypes).map(([id, hull]) => ({
    label: hull.name,
    value: id,
    hull: hull
  }))
})

// Schiffsdaten - mit Standardwerten initialisiert
const ship = reactive({
  name: 'Sanguine Tear',
  hullId: 'swordClass',
  hullClass: hullTypes.swordClass,
  maxSpace: hullTypes.swordClass.space,
  maxPower: 0, // Will be calculated from plasmaDrive
  history: null, // Schiffsvergangenheit
  quirk: null, // Eigenheit
  components: {
    plasmaDrive: null,
    warpDrive: null,
    gellerField: null,
    voidShield: null,
    bridge: null,
    lifeSustainer: null,
    crewQuarters: null,
    augurArray: null,
    weapons: [],
    cargo: [],
    equipment: [],
    improvements: [],
    archaeotech: [],
    xenotech: []
  },
  crew: {
    lordKapitan: { name: '', notes: '' },
    ersterOffizier: { name: '', notes: '' },
    maschinenseherPrimus: { name: '', notes: '' },
    primarisNavigator: { name: '', notes: '' },
    erzMilitant: { name: '', notes: '' },
    oberstesFaktotum: { name: '', notes: '' },
    truppenMeister: { name: '', notes: '' },
    ersterSteuermann: { name: '', notes: '' },
    geschuetzMeister: { name: '', notes: '' },
    voxmeister: { name: '', notes: '' },
    obersterChirurg: { name: '', notes: '' },
    meisterDesBordgeflusters: { name: '', notes: '' },
    telepathicaChormeister: { name: '', notes: '' }
  },
  additionalCrew: [],
  notes: '',
  crewNotes: '',
  cargoNotes: ''
})

// Alle Komponenten als flache Liste
const allInstalledComponents = computed(() => {
  const components = []
  
  // Essentielle Komponenten
  if (ship.components.plasmaDrive) components.push(ship.components.plasmaDrive)
  if (ship.components.warpDrive) components.push(ship.components.warpDrive)
  if (ship.components.gellerField) components.push(ship.components.gellerField)
  if (ship.components.voidShield) components.push(ship.components.voidShield)
  if (ship.components.bridge) components.push(ship.components.bridge)
  if (ship.components.lifeSustainer) components.push(ship.components.lifeSustainer)
  if (ship.components.crewQuarters) components.push(ship.components.crewQuarters)
  if (ship.components.augurArray) components.push(ship.components.augurArray)
  
  // Zusatzkomponenten
  components.push(...ship.components.weapons)
  components.push(...ship.components.cargo)
  components.push(...(ship.components.equipment || []))
  components.push(...(ship.components.improvements || []))
  components.push(...(ship.components.archaeotech || []))
  components.push(...(ship.components.xenotech || []))
  
  return components
})

// Berechne verwendeten Raum/Energie
const usedSpace = computed(() => {
  return allInstalledComponents.value.reduce((sum, comp) => sum + (comp.space || 0), 0)
})

const usedPower = computed(() => {
  // Plasmaantrieb generiert Energie, nicht verbraucht sie
  return allInstalledComponents.value
    .filter(comp => comp.type !== 'plasmaDrive')
    .reduce((sum, comp) => sum + (comp.power || 0), 0)
})

const generatedPower = computed(() => {
  // Plasmaantrieb generiert positive Energie
  return Math.abs(ship.components.plasmaDrive?.power || 0)
})

const availablePower = computed(() => {
  return generatedPower.value - usedPower.value
})

const usedSP = computed(() => {
  return allInstalledComponents.value.reduce((sum, comp) => sum + (comp.sp || 0), 0)
})

const shipStats = computed(() => {
  if (!ship.hullClass) {
    return {
      projectBonuses: [],
      risks: [],
      situationalBonuses: [],
      shipTraits: [],
      skillBonusesList: []
    }
  }
  
  // Force Vue to track weapons changes
  const weaponCount = ship.components.weapons?.length || 0
  
  const stats = calculateShipStats(ship.hullClass, allInstalledComponents.value)
  
  // Ensure arrays exist even if empty
  stats.projectBonuses = stats.projectBonuses || []
  stats.risks = stats.risks || []
  stats.situationalBonuses = stats.situationalBonuses || []
  stats.shipTraits = stats.shipTraits || []
  stats.skillBonusesList = stats.skillBonusesList || []
  
  // Füge Effekte von Schiffsvergangenheit hinzu
  if (ship.history && ship.history.bonuses) {
    const bonuses = ship.history.bonuses
    
    // Direkte Stat-Modifikationen
    if (bonuses.detection) stats.detection += bonuses.detection
    if (bonuses.armor) stats.armor += bonuses.armor
    if (bonuses.speed) stats.speed += bonuses.speed
    if (bonuses.maneuverability) stats.maneuverability += bonuses.maneuverability
    if (bonuses.hullIntegrity) stats.hullIntegrity += bonuses.hullIntegrity
    if (bonuses.power) stats.power += bonuses.power
    if (bonuses.morale) stats.morale += bonuses.morale
    if (bonuses.crew) stats.crew = (stats.crew || 0) + bonuses.crew
    
    // Skills und andere Boni
    if (bonuses.skills) {
      stats.skillBonusesList.push(...bonuses.skills.map(s => `${s} (${ship.history.name})`))
    }
    if (bonuses.situational) {
      stats.situationalBonuses.push(...bonuses.situational)
    }
    if (bonuses.projectBonuses) {
      stats.projectBonuses.push(...bonuses.projectBonuses)
    }
    if (bonuses.risks) {
      stats.risks.push(...bonuses.risks)
    }
    if (bonuses.shipTraits) {
      stats.shipTraits.push(...bonuses.shipTraits)
    }
  }
  
  // Füge Effekte von Eigenheit hinzu
  if (ship.quirk && ship.quirk.bonuses) {
    const bonuses = ship.quirk.bonuses
    
    // Direkte Stat-Modifikationen
    if (bonuses.detection) stats.detection += bonuses.detection
    if (bonuses.armor) stats.armor += bonuses.armor
    if (bonuses.speed) stats.speed += bonuses.speed
    if (bonuses.maneuverability) stats.maneuverability += bonuses.maneuverability
    if (bonuses.hullIntegrity) stats.hullIntegrity += bonuses.hullIntegrity
    if (bonuses.power) stats.power += bonuses.power
    if (bonuses.morale) stats.morale += bonuses.morale
    if (bonuses.crew) stats.crew = (stats.crew || 0) + bonuses.crew
    
    // Skills und andere Boni
    if (bonuses.skills) {
      stats.skillBonusesList.push(...bonuses.skills.map(s => `${s} (${ship.quirk.name})`))
    }
    if (bonuses.situational) {
      stats.situationalBonuses.push(...bonuses.situational)
    }
    if (bonuses.projectBonuses) {
      stats.projectBonuses.push(...bonuses.projectBonuses)
    }
    if (bonuses.risks) {
      stats.risks.push(...bonuses.risks)
    }
    if (bonuses.shipTraits) {
      stats.shipTraits.push(...bonuses.shipTraits)
    }
  }
  
  // Force Vue reactivity for risks array - WICHTIGER FIX
  if (stats.risks && stats.risks.length > 0) {
    // Erstelle ein komplett neues Array um Vue's Reaktivität zu triggern
    stats.risks = JSON.parse(JSON.stringify(stats.risks))
  }
  
  
  return stats
})

// Zähle wie oft eine Waffe installiert ist
const getWeaponCount = (weapon) => {
  if (!ship.components.weapons) return 0
  return ship.components.weapons.filter(w => w.id === weapon.id).length
}

// Prüfe ob Komponente bereits installiert ist
const isComponentInstalled = (component) => {
  const type = selectedComponentCategory.value
  
  // Für essentielle Komponenten
  if (['plasmaDrive', 'warpDrive', 'gellerField', 'voidShield', 
       'bridge', 'lifeSustainer', 'crewQuarters', 'augurArray'].includes(type)) {
    return ship.components[type]?.id === component.id
  }
  
  // Für Waffen - NIEMALS als installiert markieren, damit mehrfach installierbar
  if (type === 'weapons') {
    return false // Immer erlauben weitere zu installieren
  }
  
  // Für andere Array-Komponenten - prüfen ob bereits installiert
  if (type === 'cargo') {
    return ship.components.cargo.some(c => c.id === component.id)
  } else if (type === 'equipment') {
    return (ship.components.equipment || []).some(c => c.id === component.id)
  } else if (type === 'improvements') {
    return (ship.components.improvements || []).some(c => c.id === component.id)
  } else if (type === 'archaeotech') {
    return (ship.components.archaeotech || []).some(c => c.id === component.id)
  } else if (type === 'xenotech') {
    return (ship.components.xenotech || []).some(c => c.id === component.id)
  }
  
  return false
}

const installedComponents = computed(() => allInstalledComponents.value)

// Installierte Waffen mit modifizierten Werten
const installedWeapons = computed(() => {
  const weapons = ship.components.weapons || []
  const modifiers = shipStats.value.weaponModifiers || {}
  
  // Wende Modifikatoren auf Waffen an
  return weapons.map(weapon => {
    const modifiedWeapon = { ...weapon }
    
    // Verwende weaponType Feld direkt
    const weaponType = weapon.weaponType || 'unknown'
    
    // Wende entsprechende Modifikatoren an
    if (weaponType === 'macrobattery' && modifiers.macrobatteries?.damage) {
      // Parse damage string und füge Bonus hinzu
      const damageMatch = modifiedWeapon.damage.match(/(\d+W\d+)([+-]\d+)?/)
      if (damageMatch) {
        const baseDamage = damageMatch[1]
        const currentBonus = parseInt(damageMatch[2] || '0')
        const newBonus = currentBonus + modifiers.macrobatteries.damage
        modifiedWeapon.damage = `${baseDamage}${newBonus >= 0 ? '+' : ''}${newBonus}`
        modifiedWeapon.modified = true
      }
    } else if (weaponType === 'lance' && modifiers.lances?.damage) {
      const damageMatch = modifiedWeapon.damage.match(/(\d+W\d+)([+-]\d+)?/)
      if (damageMatch) {
        const baseDamage = damageMatch[1]
        const currentBonus = parseInt(damageMatch[2] || '0')
        const newBonus = currentBonus + modifiers.lances.damage
        modifiedWeapon.damage = `${baseDamage}${newBonus >= 0 ? '+' : ''}${newBonus}`
        modifiedWeapon.modified = true
      }
    }
    
    return modifiedWeapon
  })
})

// Schiffseigenschaften aus shipStats verwenden
const shipProperties = computed(() => {
  // Verwende die shipTraits aus den berechneten Stats
  return shipStats.value.shipTraits || []
})

const getComponentIcon = (type) => {
  const icons = {
    warp: 'blur_on',
    geller: 'shield',
    bridge: 'meeting_room',
    life: 'air',
    quarters: 'hotel',
    auger: 'radar',
    weapon: 'gps_fixed',
    plasma: 'bolt'
  }
  return icons[type] || 'settings'
}

const getComponentColor = (type) => {
  const colors = {
    warpDrive: 'purple',
    gellerField: 'cyan',
    bridge: 'orange',
    lifeSustainer: 'green',
    crewQuarters: 'blue',
    augurArray: 'red',
    weapon: 'red',
    plasmaDrive: 'yellow',
    voidShield: 'indigo',
    cargo: 'brown',
    special: 'pink'
  }
  return colors[type] || 'grey'
}

// Waffen-Icon basierend auf Typ
const getWeaponIcon = (weapon) => {
  if (weapon.name.toLowerCase().includes('torpedo')) {
    return 'rocket_launch'
  } else if (weapon.name.toLowerCase().includes('lanze') || weapon.name.toLowerCase().includes('lance')) {
    return 'flash_on'
  } else {
    return 'gps_fixed' // Makrobatterien
  }
}

// Aktuell installierte Komponente(n) für gewählte Kategorie
const currentInstalledComponent = computed(() => {
  const category = selectedComponentCategory.value
  
  // Für essentielle Komponenten
  if (['plasmaDrive', 'warpDrive', 'gellerField', 'voidShield', 
       'bridge', 'lifeSustainer', 'crewQuarters', 'augurArray'].includes(category)) {
    return ship.components[category]
  }
  
  return null
})

// Installierte Zusatzkomponenten für gewählte Kategorie
const currentInstalledSupplementalComponents = computed(() => {
  const category = selectedComponentCategory.value
  
  if (category === 'weapons') {
    return ship.components.weapons || []
  } else if (category === 'cargo') {
    return ship.components.cargo || []
  } else if (category === 'equipment') {
    return ship.components.equipment || []
  } else if (category === 'improvements') {
    return ship.components.improvements || []
  } else if (category === 'archaeotech') {
    return ship.components.archaeotech || []
  } else if (category === 'xenotech') {
    return ship.components.xenotech || []
  }
  
  return []
})

// Komponente der aktuellen Kategorie entfernen
const removeCurrentComponent = () => {
  const category = selectedComponentCategory.value
  
  if (['plasmaDrive', 'warpDrive', 'gellerField', 'voidShield', 
       'bridge', 'lifeSustainer', 'crewQuarters', 'augurArray'].includes(category)) {
    ship.components[category] = null
    
    // Reset max power when removing plasma drive
    if (category === 'plasmaDrive') {
      ship.maxPower = 0
    }
  }
  
  saveShip()
}

// Zusatzkomponente entfernen
const removeSupplementalComponent = (component, index) => {
  const category = selectedComponentCategory.value
  
  if (category === 'weapons') {
    ship.components.weapons.splice(index, 1)
  } else if (category === 'cargo') {
    ship.components.cargo.splice(index, 1)
  } else if (category === 'equipment') {
    if (!ship.components.equipment) ship.components.equipment = []
    ship.components.equipment.splice(index, 1)
  } else if (category === 'improvements') {
    if (!ship.components.improvements) ship.components.improvements = []
    ship.components.improvements.splice(index, 1)
  } else if (category === 'archaeotech') {
    if (!ship.components.archaeotech) ship.components.archaeotech = []
    ship.components.archaeotech.splice(index, 1)
  } else if (category === 'xenotech') {
    if (!ship.components.xenotech) ship.components.xenotech = []
    ship.components.xenotech.splice(index, 1)
  }
  
  saveShip()
}

// Hole Label für aktuelle Kategorie
const getCategoryLabel = () => {
  const category = selectedComponentCategory.value
  const categoryMap = {
    weapons: 'Waffen',
    cargo: 'Frachträume',
    special: 'Spezialausrüstung'
  }
  return categoryMap[category] || 'Komponenten'
}

// Kategorien-Definitionen
const essentialCategories = [
  { id: 'plasmaDrive', label: 'Plasmaantrieb', icon: 'bolt' },
  { id: 'warpDrive', label: 'Warpantrieb', icon: 'blur_on' },
  { id: 'gellerField', label: 'Gellerfeld', icon: 'shield' },
  { id: 'voidShield', label: 'Deflektorschild', icon: 'security' },
  { id: 'bridge', label: 'Brücke', icon: 'meeting_room' },
  { id: 'lifeSustainer', label: 'Lebenserhaltung', icon: 'air' },
  { id: 'crewQuarters', label: 'Mannschaftsquartiere', icon: 'hotel' },
  { id: 'augurArray', label: 'Sensoren', icon: 'radar' }
]

const supplementalCategories = [
  { id: 'weapons', label: 'Waffen', icon: 'gps_fixed' },
  { id: 'cargo', label: 'Frachträume & Passagiere', icon: 'inventory_2' },
  { id: 'improvements', label: 'Verbesserungen', icon: 'upgrade' },
  { id: 'equipment', label: 'Zusatzausstattung', icon: 'build_circle' },
  { id: 'archaeotech', label: 'Archäotechnik', icon: 'memory', color: 'amber' },
  { id: 'xenotech', label: 'Xenotech', icon: 'bug_report', color: 'deep-purple' }
]

// Waffentyp-Optionen für Filter
const weaponTypeOptions = [
  { label: 'Alle Waffen', value: null },
  { label: 'Makrobatterien', value: 'macrobattery' },
  { label: 'Lanzen', value: 'lance' },
  { label: 'Torpedos', value: 'torpedo' },
  { label: 'Nova-Kanonen', value: 'novaCannon' },
  { label: 'Landebuchten', value: 'landingBay' }
]

// Helper-Funktionen für Waffentypen
const getWeaponTypeLabel = (type) => {
  const typeMap = {
    macrobattery: 'Makrobatterie',
    lance: 'Lanze',
    torpedo: 'Torpedo',
    novaCannon: 'Nova-Kanone',
    landingBay: 'Landebucht'
  }
  return typeMap[type] || type
}

const getWeaponTypeColor = (type) => {
  const colorMap = {
    macrobattery: 'orange',
    lance: 'purple',
    torpedo: 'red',
    novaCannon: 'pink',
    landingBay: 'teal'
  }
  return colorMap[type] || 'grey'
}

// Verfügbare Komponenten basierend auf Kategorie
const availableComponents = computed(() => {
  if (!selectedComponentCategory.value || !ship.hullClass) return []
  
  const shipType = ship.hullClass.type
  const available = getComponentsForShipType(shipType)
  
  let components = []
  
  // Für Arrays (alle Zusatzkomponenten)
  if (['weapons', 'cargo', 'equipment', 'improvements', 'archaeotech', 'xenotech'].includes(selectedComponentCategory.value)) {
    components = available[selectedComponentCategory.value] || []
  } else {
    // Für einzelne Komponenten
    components = available[selectedComponentCategory.value] || []
  }
  
  // Waffentyp-Filter anwenden
  if (selectedComponentCategory.value === 'weapons' && selectedWeaponType.value) {
    components = components.filter(comp => comp.weaponType === selectedWeaponType.value)
  }
  
  return components
})

// Verfügbarer Raum
const availableSpace = computed(() => {
  return ship.maxSpace - usedSpace.value
})

// Kann Komponente installiert werden?
const canInstallComponent = (component) => {
  if (!component) return false
  
  // Prüfe Raum
  if (component.space > availableSpace.value) return false
  
  // Prüfe Energie (außer für Plasmaantrieb, der generiert Energie)
  if (selectedComponentCategory.value !== 'plasmaDrive' && component.power > availablePower.value) return false
  
  // Für essentielle Komponenten: Prüfe ob bereits eine installiert ist
  const essentialTypes = ['plasmaDrive', 'warpDrive', 'gellerField', 'voidShield', 
                         'bridge', 'lifeSustainer', 'crewQuarters', 'augurArray']
  if (essentialTypes.includes(selectedComponentCategory.value)) {
    return !ship.components[selectedComponentCategory.value]
  }
  
  return true
}

// Komponente auswählen für Details
const selectComponent = (component) => {
  selectedComponent.value = component
}

// Komponente installieren
const installComponent = (component) => {
  if (!canInstallComponent(component)) return
  
  const type = selectedComponentCategory.value
  
  // Essentielle Komponenten (einzeln)
  if (['plasmaDrive', 'warpDrive', 'gellerField', 'voidShield', 
       'bridge', 'lifeSustainer', 'crewQuarters', 'augurArray'].includes(type)) {
    ship.components[type] = { ...component, type }
  } 
  // Zusatzkomponenten (Arrays)
  else if (type === 'weapons') {
    // Clone component und behalte original type
    const weaponCopy = { ...component }
    // Setze einen speziellen componentType für tracking
    weaponCopy.componentType = 'weapon'
    ship.components.weapons.push(weaponCopy)
  } else if (type === 'cargo') {
    ship.components.cargo.push({ ...component, type: 'cargo' })
  } else if (type === 'equipment') {
    if (!ship.components.equipment) ship.components.equipment = []
    ship.components.equipment.push({ ...component, type: 'equipment' })
  } else if (type === 'improvements') {
    if (!ship.components.improvements) ship.components.improvements = []
    ship.components.improvements.push({ ...component, type: 'improvement' })
  } else if (type === 'archaeotech') {
    if (!ship.components.archaeotech) ship.components.archaeotech = []
    ship.components.archaeotech.push({ ...component, type: 'archaeotech' })
  } else if (type === 'xenotech') {
    if (!ship.components.xenotech) ship.components.xenotech = []
    ship.components.xenotech.push({ ...component, type: 'xenotech' })
  }
  
  // Update max power when installing plasma drive
  if (type === 'plasmaDrive') {
    ship.maxPower = Math.abs(component.power)
  }
  
  saveShip()
}

// Komponente entfernen
const removeComponent = (type, index = null) => {
  if (index !== null) {
    // Array-Komponente
    ship.components[type].splice(index, 1)
  } else {
    // Einzelne Komponente
    ship.components[type] = null
  }
  saveShip()
}

// Track which format to use for each portrait
const portraitFormats = reactive({})

// Crew management functions
const getCrewPortrait = (positionId) => {
  // Use tracked format or default to png
  const format = portraitFormats[positionId] || 'png'
  return `/images/crew/${positionId}.${format}`
}

const handlePortraitError = (event, positionId) => {
  // If png fails, try jpg
  if (!portraitFormats[positionId] || portraitFormats[positionId] === 'png') {
    portraitFormats[positionId] = 'jpg'
    event.target.src = `/images/crew/${positionId}.jpg`
  }
}

const getCrewIcon = (role) => {
  const roleIcons = {
    'Navigator': 'explore',
    'Tech-Priest': 'settings',
    'Astropath': 'wifi',
    'Missionary': 'auto_awesome',
    'Seneschal': 'account_balance',
    'Void Master': 'sailing',
    'Arch-Militant': 'shield',
    'Explorator': 'science',
    'Chirurgeon': 'medical_services',
    'Master-at-Arms': 'security',
    'Bosun': 'groups',
    'Master of Ordnance': 'rocket',
    'Enginseer': 'engineering',
    'Quartermaster': 'inventory',
    'Ship\'s Confessor': 'church'
  }
  
  return roleIcons[role] || 'person'
}

const removeCrewMember = (id) => {
  const index = ship.additionalCrew.findIndex(m => m.id === id)
  if (index !== -1) {
    ship.additionalCrew.splice(index, 1)
    saveShip()
  }
}

const addCrewMember = (member) => {
  ship.additionalCrew.push({
    id: Date.now(),
    ...member
  })
  saveShip()
}

// Komponente über Index entfernen (für installierte Komponenten-Liste)
const removeComponentByIndex = (component, globalIndex) => {
  const type = component.type
  
  // Essentielle Komponenten
  if (['plasmaDrive', 'warpDrive', 'gellerField', 'voidShield', 
       'bridge', 'lifeSustainer', 'crewQuarters', 'augurArray'].includes(type)) {
    ship.components[type] = null
    // Reset max power when removing plasma drive
    if (type === 'plasmaDrive') {
      ship.maxPower = 0
    }
  } 
  // Zusatzkomponenten - finde den Index im entsprechenden Array
  else if (type === 'weapon' || component.componentType === 'weapon') {
    const idx = ship.components.weapons.findIndex(c => c === component)
    if (idx !== -1) ship.components.weapons.splice(idx, 1)
  } else if (type === 'cargo') {
    const idx = ship.components.cargo.findIndex(c => c === component)
    if (idx !== -1) ship.components.cargo.splice(idx, 1)
  } else if (type === 'equipment') {
    if (ship.components.equipment) {
      const idx = ship.components.equipment.findIndex(c => c === component)
      if (idx !== -1) ship.components.equipment.splice(idx, 1)
    }
  } else if (type === 'improvement') {
    if (ship.components.improvements) {
      const idx = ship.components.improvements.findIndex(c => c === component)
      if (idx !== -1) ship.components.improvements.splice(idx, 1)
    }
  } else if (type === 'archaeotech') {
    if (ship.components.archaeotech) {
      const idx = ship.components.archaeotech.findIndex(c => c === component)
      if (idx !== -1) ship.components.archaeotech.splice(idx, 1)
    }
  } else if (type === 'xenotech') {
    if (ship.components.xenotech) {
      const idx = ship.components.xenotech.findIndex(c => c === component)
      if (idx !== -1) ship.components.xenotech.splice(idx, 1)
    }
  }
  
  saveShip()
}

const updateHullClass = (hullId) => {
  ship.hullId = hullId
  ship.hullClass = hullTypes[hullId]
  ship.maxSpace = hullTypes[hullId].space
  // Reset components when changing hull
  ship.components = {
    plasmaDrive: null,
    warpDrive: null,
    gellerField: null,
    voidShield: null,
    bridge: null,
    lifeSustainer: null,
    crewQuarters: null,
    augurArray: null,
    weapons: [],
    cargo: [],
    equipment: [],
    improvements: [],
    archaeotech: [],
    xenotech: []
  }
  saveShip()
}

// Stat-Namen Übersetzung
const getStatName = (stat) => {
  const statNames = {
    speed: 'Geschwindigkeit',
    maneuverability: 'Manövrierfähigkeit',
    detection: 'Ortung',
    armor: 'Panzerung',
    hullIntegrity: 'Hüllenintegrität',
    turretRating: 'Geschützturm',
    shields: 'Schilde',
    morale: 'Moral'
  }
  return statNames[stat] || stat
}

const handleImageError = (event) => {
  // Bild konnte nicht geladen werden, zeige Placeholder
  event.target.style.display = 'none'
}

const saveShip = () => {
  // Speichere Schiffsdaten mit berechneten Stats im gameStore und localStorage
  const shipConfig = {
    name: ship.name,
    hullId: ship.hullId,
    hull: ship.hullClass, // Speichere die aktuelle Hull-Klasse
    history: ship.history, // Speichere Schiffsvergangenheit
    quirk: ship.quirk, // Speichere Eigenheit
    components: ship.components,
    crew: ship.crew, // Speichere Crew-Daten
    additionalCrew: ship.additionalCrew, // Speichere zusätzliche Crew
    notes: ship.notes,
    crewNotes: ship.crewNotes,
    cargoNotes: ship.cargoNotes,
    // Speichere die berechneten Stats direkt
    calculatedStats: {
      speed: shipStats.value.speed,
      maneuverability: shipStats.value.maneuverability,
      detection: shipStats.value.detection,
      armor: shipStats.value.armor,
      hullIntegrity: shipStats.value.hullIntegrity,
      turretRating: shipStats.value.turretRating,
      shields: shipStats.value.shields,
      morale: shipStats.value.morale,
      crew: shipStats.value.crew || 0,
      usedSpace: shipStats.value.usedSpace,
      usedPower: shipStats.value.usedPower,
      maxSpace: ship.maxSpace,
      generatedPower: generatedPower.value,
      // Zusätzliche wichtige Werte
      skillBonuses: shipStats.value.skillBonuses,
      situationalBonuses: shipStats.value.situationalBonuses,
      shipTraits: shipStats.value.shipTraits,  // NEU: Schiffseigenschaften speichern
      projectBonuses: shipStats.value.projectBonuses,
      risks: shipStats.value.risks,
      weaponModifiers: shipStats.value.weaponModifiers
    }
  }
  gameStore.saveShipConfiguration(shipConfig)
  
  // Aktualisiere auch den Schiffsnamen im playerShip
  gameStore.playerShip.name = ship.name
}

const loadShip = () => {
  // Lade aus gameStore
  const saved = gameStore.getShipConfiguration()
  if (saved) {
    try {
      ship.name = saved.name || 'Sanguine Tear'
      ship.hullId = saved.hullId || 'swordClass'
      
      // Wichtig: Setze die Hull-Klasse richtig (unterstütze beide Varianten)
      if (saved.hullClass) {
        ship.hullClass = saved.hullClass
      } else if (saved.hull) {
        ship.hullClass = saved.hull
      } else if (ship.hullId && hullTypes[ship.hullId]) {
        ship.hullClass = hullTypes[ship.hullId]
      }
      
      // Lade Schiffsvergangenheit und Eigenheit
      ship.history = saved.history || null
      ship.quirk = saved.quirk || null
      
      ship.components = saved.components || {
        plasmaDrive: null,
        warpDrive: null,
        gellerField: null,
        voidShield: null,
        bridge: null,
        lifeSustainer: null,
        crewQuarters: null,
        augurArray: null,
        weapons: [],
        cargo: [],
        equipment: [],
        improvements: [],
        archaeotech: [],
        xenotech: []
      }
      ship.notes = saved.notes || ''
      ship.crewNotes = saved.crewNotes || ''
      ship.cargoNotes = saved.cargoNotes || ''
      
      // Lade Crew-Daten
      if (saved.crew) {
        ship.crew = saved.crew
      }
      if (saved.additionalCrew) {
        ship.additionalCrew = saved.additionalCrew
      }
      
      // Ensure hullClass is properly loaded
      if (ship.hullId && hullTypes[ship.hullId]) {
        ship.hullClass = hullTypes[ship.hullId]
        ship.maxSpace = ship.hullClass.space
      }
      
      // Update max power from plasma drive
      if (ship.components.plasmaDrive) {
        ship.maxPower = Math.abs(ship.components.plasmaDrive.power)
      }
    } catch (e) {
      console.error('Failed to load ship data:', e)
    }
  }
  
  // Verwende den Namen aus dem gameStore
  if (gameStore.playerShip.name) {
    ship.name = gameStore.playerShip.name
  }
}

// Lade Schiff beim Start
onMounted(() => {
  loadShip()
})

// Überwache Änderungen an der Schiffskonfiguration im gameStore
// Export-Funktion für Schiff
const exportShip = () => {
  try {
    // Erstelle Export-Objekt mit allen Schiffsdaten
    const shipExport = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      ship: {
        name: ship.name,
        hullId: ship.hullId,
        hullClass: ship.hullClass,
        components: ship.components,
        crew: ship.crew,
        cargo: ship.cargo,
        notes: ship.notes,
        crewNotes: ship.crewNotes,
        cargoNotes: ship.cargoNotes,
        maxSpace: ship.maxSpace,
        maxPower: ship.maxPower
      }
    }
    
    // Generiere Dateiname: schiffsname-schiffsklasse.json
    const shipClassName = ship.hullClass?.name?.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '') || 'UnbekannteKlasse'
    const shipName = ship.name?.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '') || 'UnbenanntesSchiff'
    const filename = `${shipName}-${shipClassName}.json`.replace(/\s+/g, '_')
    
    // Download generieren
    const dataStr = JSON.stringify(shipExport, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', filename)
    linkElement.click()
    
    $q.notify({
      type: 'positive',
      message: `Schiff "${ship.name}" exportiert`,
      position: 'top'
    })
  } catch (error) {
    console.error('Export-Fehler:', error)
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Exportieren des Schiffs',
      position: 'top'
    })
  }
}

// Trigger für Import (öffnet File Dialog)
const triggerImport = () => {
  fileInput.value?.click()
}

// Import-Funktion für Schiff
const importShip = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const importData = JSON.parse(text)
    
    // Validierung
    if (!importData.ship || !importData.version) {
      throw new Error('Ungültiges Schiff-Format')
    }
    
    // Bestätigungsdialog
    $q.dialog({
      title: 'Schiff importieren',
      message: `Möchten Sie das Schiff "${importData.ship.name}" importieren? Das aktuelle Schiff wird überschrieben.`,
      cancel: true,
      persistent: true
    }).onOk(() => {
      // Schiffsdaten direkt im gameStore speichern
      const importedShip = {
        name: importData.ship.name,
        hullId: importData.ship.hullClass?.id || importData.ship.hullId,
        hullClass: importData.ship.hullClass,
        hull: importData.ship.hullClass, // Für Kompatibilität
        components: importData.ship.components,
        crew: importData.ship.crew,
        cargo: importData.ship.cargo,
        notes: importData.ship.notes,
        crewNotes: importData.ship.crewNotes,
        cargoNotes: importData.ship.cargoNotes,
        maxSpace: importData.ship.maxSpace,
        maxPower: importData.ship.maxPower
      }
      
      // Speichere in gameStore
      gameStore.saveShipConfiguration(importedShip)
      
      // Aktualisiere auch den Schiffsnamen direkt im playerShip
      gameStore.playerShip.name = importData.ship.name
      
      // UI neu laden
      loadShip()
      
      $q.notify({
        type: 'positive',
        message: `Schiff "${importData.ship.name}" erfolgreich importiert`,
        position: 'top'
      })
    })
    
  } catch (error) {
    console.error('Import-Fehler:', error)
    $q.notify({
      type: 'negative',
      message: 'Fehler beim Importieren: ' + error.message,
      position: 'top'
    })
  }
  
  // Reset file input
  event.target.value = ''
}

// Watcher für Kategorie-Wechsel - Filter zurücksetzen
watch(selectedComponentCategory, () => {
  selectedWeaponType.value = null
})

watch(() => gameStore.playerShip.configuration, (newConfig) => {
  if (newConfig) {
    loadShip()
  }
}, { deep: true })
</script>

<style scoped>
.ship-management-card {
  background: #1a1a1a;
}

.q-tab-panel {
  min-height: calc(100vh - 200px);
}

.q-linear-progress__track {
  opacity: 0.3;
}

/* Ship Trait Chip Styling */
.ship-trait-chip {
  display: flex;
  align-items: flex-start;
  background: rgba(38, 166, 154, 0.15);
  border: 1px solid rgba(38, 166, 154, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  max-width: 100%;
}

.ship-trait-text {
  color: #e0e0e0;
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: normal;
  flex: 1;
}

/* Für besonders lange Traits */
.ship-trait-chip:has(.ship-trait-text:nth-child(1n)) {
  font-size: 0.825rem;
}

/* Schiffsbild Styling */
.ship-image-container {
  width: 100%;
  height: 250px;
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  border-radius: 8px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid #333;
}

.ship-image {
  width: 100%;
  height: 100%;
}

.ship-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.crew-card {
  transition: transform 0.3s;
}

.crew-card:hover {
  transform: translateY(-2px);
}

.crew-portrait {
  border-bottom: 2px solid #444;
}
</style>