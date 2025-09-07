<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="bg-purple-9 text-white">
        <div class="text-h6">
          <q-icon name="warning" class="q-mr-sm" />
          Warp-Begegnung!
        </div>
      </q-card-section>

      <!-- Schiffsstatus -->
      <q-card-section class="bg-grey-9 text-white q-pa-sm">
        <div class="row q-gutter-md text-center">
          <div class="col">
            <div class="text-caption">Schiffs-HP</div>
            <q-linear-progress 
              :value="shipHP / maxShipHP" 
              :color="shipHP > maxShipHP * 0.5 ? 'green' : shipHP > maxShipHP * 0.25 ? 'orange' : 'red'"
              size="20px"
              class="q-mt-xs"
            >
              <div class="absolute-full flex flex-center">
                <q-badge color="transparent" text-color="white" :label="`${shipHP}/${maxShipHP}`" />
              </div>
            </q-linear-progress>
          </div>
          <div class="col">
            <div class="text-caption">Mannschaft</div>
            <q-linear-progress 
              :value="crewStrength / 100" 
              :color="crewStrength > 70 ? 'green' : crewStrength > 40 ? 'orange' : 'red'"
              size="20px"
              class="q-mt-xs"
            >
              <div class="absolute-full flex flex-center">
                <q-badge color="transparent" text-color="white" :label="`${crewStrength}%`" />
              </div>
            </q-linear-progress>
          </div>
          <div class="col">
            <div class="text-caption">Moral</div>
            <q-linear-progress 
              :value="morale / 100" 
              :color="morale > 70 ? 'green' : morale > 40 ? 'orange' : 'red'"
              size="20px"
              class="q-mt-xs"
            >
              <div class="absolute-full flex flex-center">
                <q-badge color="transparent" text-color="white" :label="`${morale}%`" />
              </div>
            </q-linear-progress>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <q-checkbox 
            v-model="navigatorSuccess" 
            label="Navigator hat Warp erfolgreich eingeschätzt (+20 Bonus)"
            color="green"
          />
        </div>
        
        <div class="text-center q-mb-md">
          <div class="row q-gutter-sm justify-center">
            <q-btn 
              color="purple" 
              label="W100 Würfeln" 
              @click="rollEncounter"
              icon="casino"
              :disable="rolls.length >= rollsNeeded"
            />
            <q-btn 
              v-if="rolls.length > 0"
              color="grey" 
              label="Neu würfeln" 
              @click="resetAndRoll"
              icon="refresh"
            />
          </div>
          
          <div v-if="navigatorSuccess" class="text-caption text-green q-mt-sm">
            Navigator-Bonus: +20 wird angewendet
          </div>
        </div>
        
        <div v-if="rollsNeeded > 1 && rolls.length < rollsNeeded" class="text-center text-orange q-mb-md">
          Wurf {{ rolls.length + 1 }} von {{ rollsNeeded }}
        </div>

        <!-- Show all rolls -->
        <div v-for="(roll, index) in rolls" :key="index" class="q-mt-md">
          <q-banner class="bg-grey-9 text-white">
            <div class="text-h6">
              Wurf {{ index + 1 }}: {{ roll.base }} {{ roll.bonus ? '+20' : '' }} = {{ roll.total }}
            </div>
          </q-banner>

          <q-card class="q-mt-md" :class="getEncounterClass(roll.total)">
            <q-card-section>
              <div class="text-h6 q-mb-sm">{{ roll.encounter.title }}</div>
              <q-separator class="q-mb-md" />
              <div class="text-body1">{{ roll.encounter.description }}</div>
              
              <div v-if="roll.encounter.effect" class="q-mt-md">
                <div class="text-subtitle2 text-amber q-mb-xs">Effekte:</div>
                <div class="row q-gutter-sm">
                  <q-chip 
                    v-if="roll.encounter.hullDamage" 
                    color="red" 
                    text-color="white"
                    icon="dangerous"
                  >
                    Hüllenschaden: -{{ roll.encounter.hullDamage }} HP
                  </q-chip>
                  <q-chip 
                    v-if="roll.encounter.hullRepair" 
                    color="green" 
                    text-color="white"
                    icon="build"
                  >
                    Hüllenreparatur: +{{ roll.encounter.hullRepair }} HP
                  </q-chip>
                  <q-chip 
                    v-if="roll.encounter.crewLoss" 
                    color="orange" 
                    text-color="white"
                    icon="groups"
                  >
                    Mannschaftsverlust: -{{ roll.encounter.crewLoss }}%
                  </q-chip>
                  <q-chip 
                    v-if="roll.encounter.crewGain" 
                    color="green" 
                    text-color="white"
                    icon="group_add"
                  >
                    Mannschaftszuwachs: +{{ roll.encounter.crewGain }}%
                  </q-chip>
                  <q-chip 
                    v-if="roll.encounter.moraleLoss" 
                    color="purple" 
                    text-color="white"
                    icon="sentiment_dissatisfied"
                  >
                    Moral: -{{ roll.encounter.moraleLoss }}
                  </q-chip>
                  <q-chip 
                    v-if="roll.encounter.moraleGain" 
                    color="blue" 
                    text-color="white"
                    icon="sentiment_satisfied"
                  >
                    Moral: +{{ roll.encounter.moraleGain }}
                  </q-chip>
                </div>
                <div class="text-italic q-mt-sm">{{ roll.encounter.effect }}</div>
              </div>
              
              <div v-if="roll.encounter.choices" class="q-mt-md">
                <strong>Optionen:</strong>
                <ul>
                  <li v-for="choice in roll.encounter.choices" :key="choice">{{ choice }}</li>
                </ul>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gesamtauswirkungen -->
        <div v-if="rolls.length === rollsNeeded && rolls.length > 0" class="q-mt-lg">
          <q-separator />
          <div class="text-h6 q-mt-md q-mb-sm">Gesamtauswirkungen der Reise:</div>
          <div class="row q-gutter-sm">
            <div class="col">
              <q-card class="bg-grey-9 text-white">
                <q-card-section>
                  <div class="text-caption">{{ totalHullDamage < 0 ? 'Hüllenreparatur' : 'Hüllenschaden' }}</div>
                  <div class="text-h6">{{ totalHullDamage < 0 ? '+' : '-' }}{{ Math.abs(totalHullDamage) }} HP</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col">
              <q-card class="bg-grey-9 text-white">
                <q-card-section>
                  <div class="text-caption">Mannschaftsänderung</div>
                  <div class="text-h6">{{ totalCrewChange > 0 ? '+' : '' }}{{ totalCrewChange }}%</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col">
              <q-card class="bg-grey-9 text-white">
                <q-card-section>
                  <div class="text-caption">Moraländerung</div>
                  <div class="text-h6">{{ totalMoraleChange > 0 ? '+' : '' }}{{ totalMoraleChange }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          flat 
          label="Effekte anwenden & Schließen" 
          color="primary" 
          @click="applyEffectsAndClose"
          :disable="rolls.length < rollsNeeded"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: Boolean,
  weeksOfTravel: Number,
  routeDanger: String,
  currentShipHP: { type: Number, default: 30 },
  maxShipHP: { type: Number, default: 30 },
  currentCrewStrength: { type: Number, default: 100 },
  currentMorale: { type: Number, default: 100 }
})

const emit = defineEmits(['update:modelValue', 'apply-effects'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const navigatorSuccess = ref(false)
const rolls = ref([])
const rollsNeeded = computed(() => props.weeksOfTravel || 1)

// Current values (updated as rolls happen)
const shipHP = ref(props.currentShipHP)
const maxShipHP = ref(props.maxShipHP)
const crewStrength = ref(props.currentCrewStrength)
const morale = ref(props.currentMorale)

// Enhanced encounter table with more variety and effects
const encounters = {
  // 01-03: Katastrophale Ereignisse - Dämonische Bedrohungen
  1: {
    title: "Dämonische Invasion",
    description: "Ein katastrophaler Riss im Gellerfeld! Dutzende von Warpkreaturen materialisieren sich in den unteren Decks. Das Schiff hallt wider von unmenschlichen Schreien.",
    effect: "Massive Verluste und Schäden. Die Korridore sind mit Blut getränkt.",
    hullDamage: 8,
    crewLoss: 15,
    moraleLoss: 30,
    choices: ["Selbstzerstörung der betroffenen Sektion", "Armsmen-Gegenangriff", "Gellerfeld-Überladung riskieren"]
  },
  2: {
    title: "Besessene Crew",
    description: "Mehrere Crewmitglieder werden von Warp-Entitäten besessen. Sie verwandeln sich in groteske Mutanten und greifen ihre Kameraden an.",
    effect: "Chaos an Bord. Paranoia greift um sich.",
    hullDamage: 3,
    crewLoss: 8,
    moraleLoss: 25,
    choices: ["Exorzismus durch Schiffskapellan", "Betroffene eliminieren", "In Quarantäne isolieren"]
  },
  3: {
    title: "Warp-Raubtier",
    description: "Ein gewaltiges Warp-Raubtier umkreist das Schiff. Seine psychischen Schreie treiben schwache Geister in den Wahnsinn.",
    effect: "Das Raubtier testet die Verteidigung des Schiffs.",
    hullDamage: 5,
    crewLoss: 5,
    moraleLoss: 20,
    choices: ["Flucht in den Realraum", "Psychische Abwehr verstärken", "Ablenkungsmanöver"]
  },
  
  // 04-10: Schwere Störungen - Strukturelle Schäden
  5: {
    title: "Hüllenbruch",
    description: "Die Warp-Energien zerren an der Schiffshülle. Mehrere Sektionen werden dekomprimiert.",
    effect: "Kritische Strukturschäden. Notversiegelung aktiviert.",
    hullDamage: 10,
    crewLoss: 12,
    moraleLoss: 15,
    choices: ["Notfall-Reparaturen", "Sektionen aufgeben", "Energie zu Strukturintegrität umleiten"]
  },
  8: {
    title: "Gellerfeld-Kollaps",
    description: "Das Gellerfeld kollabiert für mehrere Sekunden. Die rohe Warp-Energie flutet durch das Schiff.",
    effect: "Wahnsinn und Mutation greifen um sich.",
    hullDamage: 4,
    crewLoss: 10,
    moraleLoss: 20,
    choices: ["Sofortige Feldwiederherstellung", "Betroffene Bereiche säubern", "Notausstieg aus dem Warp"]
  },
  
  // 11-20: Mittlere Gefahren - Begegnungen
  15: {
    title: "Space Hulk Kollision",
    description: "Ein massiver Space Hulk taucht aus dem Nichts auf. Kollisionskurs! Ausweichmanöver eingeleitet.",
    effect: "Streifschuss verursacht Schäden. Mögliche Plünderung?",
    hullDamage: 6,
    crewLoss: 3,
    choices: ["Hulk erkunden (riskant)", "Schnell vorbei navigieren", "Aus der Ferne scannen"]
  },
  18: {
    title: "Zeitparadoxon",
    description: "Das Schiff begegnet sich selbst aus einer anderen Zeitlinie. Die Crew sieht ihre eigenen Leichen treiben.",
    effect: "Massive psychologische Auswirkungen.",
    moraleLoss: 25,
    choices: ["Ignorieren und weiterreisen", "Kommunikation versuchen", "Das andere Schiff zerstören"]
  },
  
  // 21-35: Moderate Ereignisse - Crew-Probleme
  25: {
    title: "Meuterei im Unterdeck",
    description: "Die harten Bedingungen der Warp-Reise führen zu einer Meuterei in den Mannschaftsquartieren.",
    effect: "Interne Kämpfe schwächen die Crew.",
    crewLoss: 5,
    moraleLoss: 15,
    choices: ["Brutal niederschlagen", "Verhandeln", "Rädelsführer bestrafen"]
  },
  30: {
    title: "Seuche an Bord",
    description: "Eine seltsame Warp-Seuche breitet sich aus. Die Infizierten verfallen langsam zu Staub.",
    effect: "Die Medicae-Abteilung ist überfordert.",
    crewLoss: 8,
    moraleLoss: 10,
    choices: ["Quarantäne verhängen", "Experimentelle Behandlung", "Infizierte einfrieren"]
  },
  33: {
    title: "Kannibalismus-Kult",
    description: "Ein Kult hat sich in den unteren Decks gebildet. Sie jagen andere Crewmitglieder.",
    effect: "Terror in den Mannschaftsquartieren.",
    crewLoss: 4,
    moraleLoss: 18,
    choices: ["Säuberungsaktion", "Kult infiltrieren", "Bereich abriegeln"]
  },
  
  // 36-50: Kleinere Störungen
  40: {
    title: "Alptraum-Epidemie",
    description: "Die gesamte Crew wird von denselben Alpträumen geplagt. Schlafmangel wird zum Problem.",
    effect: "Erschöpfung greift um sich.",
    moraleLoss: 12,
    choices: ["Stimulanzien ausgeben", "Traum-Suppressoren", "Psychische Reinigung"]
  },
  45: {
    title: "Vox-Phantome",
    description: "Die Kommunikationssysteme empfangen Hilferufe von Schiffen, die vor Jahrhunderten verloren gingen.",
    effect: "Beunruhigend, aber meist harmlos.",
    moraleLoss: 8,
    choices: ["Vox abschalten", "Nachrichten analysieren", "Ignorieren"]
  },
  48: {
    title: "Maschinengeist-Rebellion",
    description: "Die Maschinengeister des Schiffs werden unruhig. Systeme fallen sporadisch aus.",
    effect: "Technische Probleme häufen sich.",
    hullDamage: 2,
    moraleLoss: 5,
    choices: ["Techpriester-Rituale", "Systeme neu starten", "Maschinengeister besänftigen"]
  },
  
  // 51-70: Navigationsherausforderungen
  55: {
    title: "Warp-Strudel",
    description: "Ein gewaltiger Strudel zieht das Schiff in unbekannte Regionen des Warps.",
    effect: "Kurs verloren, aber Schiff intakt.",
    moraleLoss: 5,
    choices: ["Mit dem Strom schwimmen", "Volle Kraft dagegen", "Navigator übernehmen lassen"]
  },
  60: {
    title: "Geister-Echo",
    description: "Das Schiff durchfliegt die Überreste einer uralten Raumschlacht. Geisterhafte Echos vergangener Crews.",
    effect: "Mögliche Informationen über verlorene Schätze.",
    moraleLoss: 3,
    choices: ["Echo-Muster analysieren", "Schnell durchfliegen", "Nach Überlebenden scannen"]
  },
  65: {
    title: "Falsche Sterne",
    description: "Der Navigator sieht Sterne, die nicht existieren sollten. Die Navigation wird unsicher.",
    effect: "Verzögerung, aber keine direkten Schäden.",
    choices: ["Neu kalibrieren", "Alternative Route", "Astronomicus Daten prüfen"]
  },
  
  // 71-85: Neutrale bis positive Ereignisse
  75: {
    title: "Überlebende gefunden",
    description: "Ein Rettungskapsel treibt im Warp - unmöglich, aber real. Die Insassen sind bei Verstand und dankbar.",
    effect: "Neue Crewmitglieder und Informationen.",
    crewGain: 3,
    moraleGain: 5,
    choices: ["Überlebende aufnehmen", "Gründlich untersuchen", "Vorräte teilen und weiterziehen"]
  },
  80: {
    title: "Ruhige Strömung",
    description: "Eine seltene ruhige Strömung im Warp. Die Reise verläuft außergewöhnlich glatt.",
    effect: "Zeit für Reparaturen und Erholung.",
    moraleGain: 8,
    choices: ["Reparaturen durchführen", "Crew Erholung gönnen", "Systeme warten"]
  },
  82: {
    title: "Handelskontakt",
    description: "Ein Rogue Trader Schiff auf Parallelkurs. Funkspruch: 'Handel im Warp? Warum nicht!'",
    effect: "Möglichkeit für Handel oder Informationsaustausch.",
    choices: ["Handel treiben", "Informationen austauschen", "Misstrauisch bleiben"]
  },
  
  // 86-95: Positive Ereignisse
  88: {
    title: "Verlorene Fracht",
    description: "Eine versiegelte Frachtkapsel treibt vorbei. Scans zeigen wertvolle Ausrüstung.",
    effect: "Unerwarteter Fund könnte nützlich sein.",
    moraleGain: 10,
    choices: ["Bergen", "Scannen und markieren", "Ignorieren (zu riskant)"]
  },
  90: {
    title: "Günstiger Warpwind",
    description: "Ein stabiler Warpwind beschleunigt die Reise erheblich. Der Navigator ist begeistert.",
    effect: "Deutlich schnellere Reise als erwartet.",
    moraleGain: 12,
    choices: ["Geschwindigkeit beibehalten", "Noch schneller (riskant)", "Route dokumentieren"]
  },
  92: {
    title: "Flüchtlingsschiff",
    description: "Ein kleines Schiff voller Flüchtlinge. Sie bieten sich als Crew an im Austausch für Schutz.",
    effect: "Zusätzliche Arbeitskräfte, wenn auch untrainiert.",
    crewGain: 5,
    moraleGain: 3,
    choices: ["Alle aufnehmen", "Nur Qualifizierte", "Vorräte geben und weiter"]
  },
  
  // 96-100: Sehr positive Ereignisse
  96: {
    title: "Archeotech-Cache",
    description: "Ein uraltes Beacon führt zu einem versteckten Archeotech-Lager. Die Techpriester sind ekstatisch.",
    effect: "Wertvolle Technologie gefunden!",
    moraleGain: 20,
    choices: ["Alles bergen", "Nur das Wichtigste", "Position markieren"]
  },
  98: {
    title: "Imperiale Eskorte",
    description: "Eine imperiale Flotte auf demselben Kurs bietet Geleitschutz an.",
    effect: "Sichere Reise unter militärischem Schutz.",
    moraleGain: 15,
    choices: ["Eskorte annehmen", "Parallel reisen", "Eigenen Kurs beibehalten"]
  },
  100: {
    title: "Des Imperators Segen",
    description: "Eine goldene Aura umgibt das Schiff. Die Crew fühlt sich gesegnet und gestärkt.",
    effect: "Ein Wunder! Die Crew ist inspiriert.",
    moraleGain: 25,
    crewGain: 2,
    choices: ["Dankgebet", "Fest feiern", "Phänomen dokumentieren"]
  }
}

// Fill in missing entries with variations
const fillEncounters = () => {
  const filled = {}
  for (let i = 1; i <= 100; i++) {
    if (encounters[i]) {
      filled[i] = encounters[i]
    } else {
      // Generate based on range
      if (i <= 3) {
        filled[i] = generateCatastrophic(i)
      } else if (i <= 10) {
        filled[i] = generateSevere(i)
      } else if (i <= 20) {
        filled[i] = generateModerate(i)
      } else if (i <= 35) {
        filled[i] = generateMinor(i)
      } else if (i <= 70) {
        filled[i] = generateNeutral(i)
      } else if (i <= 85) {
        filled[i] = generateMild(i)
      } else if (i <= 95) {
        filled[i] = generatePositive(i)
      } else {
        filled[i] = generateBlessed(i)
      }
    }
  }
  return filled
}

// Generator functions for different severity levels
const generateCatastrophic = (num) => {
  const events = [
    {
      title: "Realitätsriss",
      description: "Ein massiver Riss in der Realität öffnet sich direkt durch das Schiff. Decks verschwinden in unmögliche Dimensionen.",
      effect: "Ganze Sektionen existieren nicht mehr in unserer Realität.",
      hullDamage: 12,
      crewLoss: 20,
      moraleLoss: 35,
      choices: ["Gellerfeld-Überladung", "Betroffene Decks abtrennen", "Notfall-Warp-Ausstieg"]
    },
    {
      title: "Seelenfresser an Bord",
      description: "Ein Warp-Wesen aus purem Hunger materialisiert sich. Es ernährt sich von den Seelen der Crew.",
      effect: "Das Wesen hinterlässt nur leere Hüllen.",
      hullDamage: 4,
      crewLoss: 18,
      moraleLoss: 40,
      choices: ["Psioniker opfern als Köder", "Selbstzerstörung aktivieren", "In den Realraum flüchten"]
    },
    {
      title: "Chronologischer Kollaps",
      description: "Die Zeit bricht zusammen. Crew-Mitglieder altern zu Staub oder werden zu Kindern. Maschinen rosten in Sekunden.",
      effect: "Zeitparadoxe zerreißen die Realität.",
      hullDamage: 8,
      crewLoss: 25,
      moraleLoss: 30,
      choices: ["Stasis-Feld aktivieren", "Navigator-Opferung", "Zeitanker werfen"]
    }
  ]
  return events[num % events.length]
}

const generateSevere = (num) => {
  const events = [
    {
      title: "Warp-Bestien-Schwarm",
      description: "Hunderte kleine Warp-Kreaturen durchbrechen das Gellerfeld. Sie kriechen durch Lüftungsschächte und greifen in Wellen an.",
      effect: "Das Schiff wird von innen heraus angegriffen.",
      hullDamage: 5,
      crewLoss: 8,
      moraleLoss: 18,
      choices: ["Flammenwerfer-Teams einsetzen", "Betroffene Sektionen fluten", "Gellerfeld pulsieren lassen"]
    },
    {
      title: "Besessener Navigator",
      description: "Der Navigator schreit in einer fremden Sprache. Seine drei Augen leuchten in unmöglichen Farben.",
      effect: "Navigation wird extrem gefährlich.",
      hullDamage: 3,
      crewLoss: 6,
      moraleLoss: 20,
      choices: ["Navigator sedieren", "Ersatz-Navigator einsetzen", "Exorzismus versuchen"]
    },
    {
      title: "Psychischer Schrei",
      description: "Ein telepathischer Schrei durchdringt das Schiff. Schwache Geister brechen zusammen, Nasenbluten überall.",
      effect: "Massenhafte psychische Traumata.",
      crewLoss: 9,
      moraleLoss: 22,
      choices: ["Null-Feld aktivieren", "Alle Psioniker isolieren", "Psychische Dämpfer verteilen"]
    },
    {
      title: "Maschinenpest",
      description: "Eine Warp-Seuche befällt die Maschinen. Metall beginnt zu bluten, Servitoren schreien menschlich.",
      effect: "Technik versagt auf verstörende Weise.",
      hullDamage: 6,
      crewLoss: 5,
      moraleLoss: 16,
      choices: ["Heilige Öle anwenden", "Befallene Systeme purgen", "Techpriester-Notrituale"]
    },
    {
      title: "Verräter-Kult aufgedeckt",
      description: "Ein Chaos-Kult hat sich während der Reise offenbart. Sie haben bereits Dutzende konvertiert.",
      effect: "Bürgerkrieg an Bord.",
      crewLoss: 10,
      moraleLoss: 19,
      choices: ["Säuberungsaktion starten", "Kult-Anführer jagen", "Quarantäne-Protokolle"]
    }
  ]
  return events[num % events.length]
}

const generateModerate = (num) => {
  const events = [
    {
      title: "Warp-Schatten",
      description: "Dunkle Schatten ohne Quelle wandern durch die Korridore. Sie flüstern Namen von Toten.",
      effect: "Crew wird paranoid und ängstlich.",
      hullDamage: 1,
      moraleLoss: 12,
      choices: ["Lichter verstärken", "Gebete sprechen", "Schatten ignorieren"]
    },
    {
      title: "Kommunikations-Blackout",
      description: "Alle Vox-Systeme empfangen nur kreischende Stimmen in toten Sprachen.",
      effect: "Keine Kommunikation zwischen Decks.",
      hullDamage: 2,
      crewLoss: 3,
      moraleLoss: 10,
      choices: ["Läufer einsetzen", "Vox purgen", "Stille ertragen"]
    },
    {
      title: "Gravitations-Anomalien",
      description: "Die Schwerkraft fluktuiert wild. Crew und Ausrüstung werden herumgeschleudert.",
      effect: "Verletzungen und Geräteschäden.",
      hullDamage: 3,
      crewLoss: 4,
      moraleLoss: 8,
      choices: ["Mag-Stiefel ausgeben", "In Quartieren bleiben", "Gravitations-Kompensatoren"]
    },
    {
      title: "Nahrungs-Verderb",
      description: "Die Nahrungsvorräte altern rapide. Jahrhunderte vergehen in den Lagerräumen in Minuten.",
      effect: "Versorgungsengpass droht.",
      crewLoss: 2,
      moraleLoss: 13,
      choices: ["Rationierung einführen", "Stasis-Felder verstärken", "Notvorräte öffnen"]
    },
    {
      title: "Servitor-Fehlfunktion",
      description: "Die Servitoren beginnen zu weinen und flehen um Erlösung. Manche erinnern sich an ihre Namen.",
      effect: "Arbeitskraft-Ausfall und Verstörung.",
      hullDamage: 2,
      moraleLoss: 11,
      choices: ["Servitoren deaktivieren", "Gedächtnis löschen", "Gnadentod gewähren"]
    }
  ]
  return events[num % events.length]
}

const generateMinor = (num) => {
  const events = [
    {
      title: "Déjà-vu-Schleifen",
      description: "Die Crew erlebt denselben Moment immer wieder. Manche bemerken es, andere nicht.",
      effect: "Zeitwahrnehmung gestört.",
      moraleLoss: 6,
      choices: ["Chronometer neu starten", "Crew informieren", "Phänomen studieren"]
    },
    {
      title: "Phantomgerüche",
      description: "Das ganze Schiff riecht abwechselnd nach Schwefel, Rosen und verbranntem Fleisch.",
      effect: "Übelkeit und Unbehagen.",
      moraleLoss: 4,
      choices: ["Luftfilter prüfen", "Atemmasken verteilen", "Gerüche ertragen"]
    },
    {
      title: "Flüsternde Wände",
      description: "Die Schiffswände flüstern Geheimnisse und Lügen. Manche Crew hört ihre tiefsten Ängste.",
      effect: "Leichte psychische Belastung.",
      moraleLoss: 7,
      choices: ["Musik abspielen", "Wände segnen lassen", "Ohrstöpsel ausgeben"]
    },
    {
      title: "Elektrische Entladungen",
      description: "Blaue Blitze tanzen über Metalloberflächen. Konsolen geben Stromschläge ab.",
      effect: "Kleine Verletzungen und Ausfälle.",
      hullDamage: 1,
      moraleLoss: 3,
      choices: ["Systeme erden", "Isolierhandschuhe", "Energie umleiten"]
    },
    {
      title: "Albtraum-Wellen",
      description: "Ganze Schichten werden von denselben Albträumen geplagt. Ein brennendes Auge beobachtet alle.",
      effect: "Schlafmangel und Unruhe.",
      moraleLoss: 8,
      choices: ["Schlafmittel ausgeben", "Nachtwachen verstärken", "Traumfänger aufhängen"]
    }
  ]
  return events[num % events.length]
}

const generateNeutral = (num) => {
  const events = [
    {
      title: "Farbverschiebung",
      description: "Alle Farben an Bord verschieben sich ins Violette. Die Welt sieht fremd aber nicht bedrohlich aus.",
      effect: "Keine Gefahr, nur ungewohnt.",
      choices: ["Augen anpassen lassen", "Spektrum analysieren", "Abwarten"]
    },
    {
      title: "Zeit-Echos",
      description: "Crew-Mitglieder sehen gelegentlich sich selbst aus der Vergangenheit oder Zukunft.",
      effect: "Verwirrend aber harmlos.",
      choices: ["Echos kartografieren", "Crew beruhigen", "Temporal-Scans"]
    },
    {
      title: "Sanftes Summen",
      description: "Ein beruhigendes Summen durchdringt das Schiff. Fast wie ein Wiegenlied.",
      effect: "Seltsam friedliche Atmosphäre.",
      moraleGain: 1,
      choices: ["Frequenz aufzeichnen", "Genießen", "Vorsichtig bleiben"]
    },
    {
      title: "Sternbilder-Tanz",
      description: "Die Sterne außerhalb formen neue, unmögliche Konstellationen. Schön aber bedeutungslos.",
      effect: "Navigator ist fasziniert.",
      choices: ["Muster dokumentieren", "Navigator befragen", "Weiterfliegen"]
    },
    {
      title: "Warp-Stille",
      description: "Absolute Stille im Warp. Keine Stimmen, keine Echos. Beunruhigend friedlich.",
      effect: "Die Ruhe vor dem Sturm?",
      choices: ["Wachsamkeit erhöhen", "Stille genießen", "Systeme prüfen"]
    }
  ]
  return events[num % events.length]
}

const generateMild = (num) => {
  const events = [
    {
      title: "Verlorene Fracht gefunden",
      description: "Eine treibende Frachtkapsel aus dem letzten Jahrhundert. Die Vorräte sind noch gut.",
      effect: "Willkommene Nachschub.",
      moraleGain: 4,
      choices: ["Bergen und inspizieren", "Vorsichtig scannen", "Dankbar annehmen"]
    },
    {
      title: "Ruhiger Warp-Korridor",
      description: "Ein stabiler Korridor öffnet sich. Die Reise wird angenehmer.",
      effect: "Erholsame Passage.",
      moraleGain: 3,
      choices: ["Route genießen", "Daten sammeln", "Crew ausruhen lassen"]
    },
    {
      title: "Glücksbringer gefunden",
      description: "Ein altes Aquila-Amulett erscheint in der Brücke. Die Crew sieht es als gutes Omen.",
      effect: "Moral steigt durch Aberglauben.",
      moraleGain: 5,
      choices: ["Als Reliquie ehren", "Untersuchen", "Crew-Zeremonie"]
    },
    {
      title: "Hilfreiche Warp-Strömung",
      description: "Eine Strömung beschleunigt die Reise ohne Gefahr.",
      effect: "Zeitersparnis.",
      moraleGain: 2,
      choices: ["Strömung reiten", "Vorsichtig navigieren", "Geschenk annehmen"]
    }
  ]
  return events[num % events.length]
}

const generatePositive = (num) => {
  const events = [
    {
      title: "Notsignal - Überlebende!",
      description: "Ein kaiserliches Rettungsshuttle treibt im Warp. Die Insassen sind erfahrene Void-Seeleute.",
      effect: "Verstärkung für die Crew.",
      crewGain: 2,
      moraleGain: 8,
      choices: ["Überlebende aufnehmen", "Medizinische Versorgung", "Neue Crew eingliedern"]
    },
    {
      title: "Archeotech-Cache",
      description: "Ein uraltes Datenfragment treibt vorbei. Es enthält vergessenes Wissen.",
      effect: "Wertvolle technische Daten.",
      moraleGain: 7,
      choices: ["Daten sichern", "Techpriester alarmieren", "Vorsichtig analysieren"]
    },
    {
      title: "Warp-Oase",
      description: "Ein Bereich absoluter Ruhe im Warp. Die Crew kann sich vollständig erholen.",
      effect: "Perfekte Bedingungen für Reparaturen.",
      moraleGain: 10,
      hullRepair: 2,
      choices: ["Reparaturen durchführen", "Crew Ruhe gönnen", "Systeme warten"]
    },
    {
      title: "Kaiserliches Leuchtfeuer",
      description: "Ein schwaches Echo des Astronomican erreicht das Schiff. Der Navigator jubelt.",
      effect: "Navigation wird erheblich einfacher.",
      moraleGain: 9,
      choices: ["Signal verstärken", "Kurs optimieren", "Imperator danken"]
    },
    {
      title: "Glückliche Fügung",
      description: "Ein Warp-Wirbel schleudert das Schiff direkt auf Kurs. Tage wurden gespart.",
      effect: "Massive Zeitersparnis.",
      moraleGain: 6,
      choices: ["Geschenk annehmen", "Position bestätigen", "Crew informieren"]
    }
  ]
  return events[num % events.length]
}

const generateBlessed = (num) => {
  const events = [
    {
      title: "Wunder des Imperators",
      description: "Goldenes Licht erfüllt das Schiff. Wunden heilen, Maschinen reparieren sich selbst.",
      effect: "Göttlicher Segen offenbar.",
      moraleGain: 20,
      hullRepair: 5,
      crewGain: 1,
      choices: ["Gebete sprechen", "Wunder dokumentieren", "Demütig knien"]
    },
    {
      title: "Saint Celestine's Erscheinung",
      description: "Eine geflügelte Gestalt führt das Schiff durch den Warp. Die Crew weint vor Freude.",
      effect: "Inspiration und Hoffnung.",
      moraleGain: 15,
      choices: ["Vision folgen", "Hymnen singen", "Segen empfangen"]
    },
    {
      title: "Perfekte Harmonie",
      description: "Schiff, Crew und Warp sind in perfektem Einklang. Alles funktioniert fehlerlos.",
      effect: "Optimale Reisebedingungen.",
      moraleGain: 12,
      choices: ["Harmonie bewahren", "Erfolg feiern", "Dankbar sein"]
    },
    {
      title: "Schutzengel-Aura",
      description: "Das Schiff ist von einem goldenen Schimmer umgeben. Nichts Böses kann sich nähern.",
      effect: "Absolute Sicherheit.",
      moraleGain: 18,
      choices: ["Schutz wertschätzen", "Aura studieren", "Ruhe genießen"]
    }
  ]
  return events[num % events.length]
}

const fullEncounters = fillEncounters()

const getEncounter = (roll) => {
  return fullEncounters[Math.min(100, Math.max(1, roll))]
}

const getEncounterClass = (roll) => {
  if (roll <= 10) return 'bg-red-9'
  if (roll <= 35) return 'bg-orange-9'
  if (roll <= 70) return 'bg-grey-8'
  if (roll <= 85) return 'bg-blue-9'
  return 'bg-green-9'
}

const rollEncounter = () => {
  if (rolls.value.length >= rollsNeeded.value) return
  
  const base = Math.floor(Math.random() * 100) + 1
  const bonus = navigatorSuccess.value
  const total = Math.min(100, base + (bonus ? 20 : 0))
  const encounter = getEncounter(total)
  
  rolls.value.push({
    base,
    bonus,
    total,
    encounter
  })
  
  // Update current values immediately for visual feedback
  if (encounter.hullDamage) {
    shipHP.value = Math.max(0, shipHP.value - encounter.hullDamage)
  }
  if (encounter.hullRepair) {
    shipHP.value = Math.min(maxShipHP.value, shipHP.value + encounter.hullRepair)
  }
  if (encounter.crewLoss) {
    crewStrength.value = Math.max(0, crewStrength.value - encounter.crewLoss)
  }
  if (encounter.crewGain) {
    crewStrength.value = Math.min(100, crewStrength.value + encounter.crewGain)
  }
  if (encounter.moraleLoss) {
    morale.value = Math.max(0, morale.value - encounter.moraleLoss)
  }
  if (encounter.moraleGain) {
    morale.value = Math.min(100, morale.value + encounter.moraleGain)
  }
  
  // Auto-roll next if needed and not catastrophic
  if (rolls.value.length < rollsNeeded.value && total > 10) {
    setTimeout(() => rollEncounter(), 1500)
  }
}

const resetAndRoll = () => {
  rolls.value = []
  shipHP.value = props.currentShipHP
  crewStrength.value = props.currentCrewStrength
  morale.value = props.currentMorale
  rollEncounter()
}

// Calculate totals
const totalHullDamage = computed(() => {
  const damage = rolls.value.reduce((sum, roll) => sum + (roll.encounter.hullDamage || 0), 0)
  const repair = rolls.value.reduce((sum, roll) => sum + (roll.encounter.hullRepair || 0), 0)
  return damage - repair // Negative values mean healing
})

const totalCrewChange = computed(() => {
  const loss = rolls.value.reduce((sum, roll) => sum + (roll.encounter.crewLoss || 0), 0)
  const gain = rolls.value.reduce((sum, roll) => sum + (roll.encounter.crewGain || 0), 0)
  return gain - loss
})

const totalMoraleChange = computed(() => {
  const loss = rolls.value.reduce((sum, roll) => sum + (roll.encounter.moraleLoss || 0), 0)
  const gain = rolls.value.reduce((sum, roll) => sum + (roll.encounter.moraleGain || 0), 0)
  return gain - loss
})

const applyEffectsAndClose = () => {
  if (rolls.value.length < rollsNeeded.value) return
  
  emit('apply-effects', {
    hullDamage: totalHullDamage.value,
    crewChange: totalCrewChange.value,
    moraleChange: totalMoraleChange.value,
    finalHP: shipHP.value,
    finalCrew: crewStrength.value,
    finalMorale: morale.value
  })
  
  // Show summary notification
  $q.notify({
    type: totalHullDamage.value > 10 || totalCrewChange.value < -10 ? 'negative' : 
          totalCrewChange.value > 5 || totalMoraleChange.value > 10 ? 'positive' : 'warning',
    message: 'Warp-Reise abgeschlossen',
    caption: `HP: ${totalHullDamage.value < 0 ? '+' : '-'}${Math.abs(totalHullDamage.value)}, Crew: ${totalCrewChange.value > 0 ? '+' : ''}${totalCrewChange.value}%, Moral: ${totalMoraleChange.value > 0 ? '+' : ''}${totalMoraleChange.value}`,
    position: 'top'
  })
  
  show.value = false
}

// Reset when dialog opens
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    rolls.value = []
    navigatorSuccess.value = false
    shipHP.value = props.currentShipHP
    maxShipHP.value = props.maxShipHP
    crewStrength.value = props.currentCrewStrength
    morale.value = props.currentMorale
  }
})
</script>

<style scoped>
.bg-red-9 {
  background: linear-gradient(135deg, #800000, #cc0000);
}
.bg-orange-9 {
  background: linear-gradient(135deg, #cc6600, #ff9933);
}
.bg-grey-8 {
  background: linear-gradient(135deg, #424242, #616161);
}
.bg-blue-9 {
  background: linear-gradient(135deg, #0066cc, #3399ff);
}
.bg-green-9 {
  background: linear-gradient(135deg, #006600, #00cc00);
}
</style>