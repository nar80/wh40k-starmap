<template>
  <div>
    <div ref="mapContainer" class="star-map-container" @contextmenu.prevent></div>
    
    <!-- Starlane Mode Indicator -->
    <div v-if="gameStore.starlaneMode" class="starlane-mode-indicator">
      <q-chip color="primary" text-color="white" icon="timeline">
        Starlane-Modus: {{ starlaneStartSystem ? 'Zielsystem wählen' : 'Startsystem wählen' }}
        <q-btn 
          flat 
          round 
          dense 
          size="sm" 
          icon="close" 
          @click="handleCancelStarlane"
          class="q-ml-sm"
        />
      </q-chip>
    </div>
    
    <SystemInfoDialog
      v-model="showSystemDialog"
      :system-id="selectedSystemId"
      @planets-updated="onPlanetsUpdated"
    />
    <PlanetarySystemView
      v-model="showPlanetaryView"
      :system-id="planetarySystemId"
    />
    <SystemEditorDialog
      v-model="showEditDialog"
      :system="editingSystem"
      :new-system-position="newSystemPosition"
      @system-saved="onSystemSaved"
      @system-deleted="onSystemDeleted"
      @show-planetary-system="showPlanetarySystemForEdit"
    />
    <StarlaneEditorDialog
      v-model="showStarlaneDialog"
      :from-system-id="starlaneFromId"
      :to-system-id="starlaneToId"
      :existing-lane="editingLane"
      @lane-saved="onLaneSaved"
      @lane-deleted="onLaneDeleted"
    />
    
    <ShipManagementDialog v-model="showShipManagement" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as PIXI from 'pixi.js'
import { useGameStore } from '../stores/gameStore'
import { useMapStore } from '../stores/mapStore'
import SystemInfoDialog from './SystemInfoDialog.vue'
import SystemEditorDialog from './SystemEditorDialog.vue'
import StarlaneEditorDialog from './StarlaneEditorDialog.vue'
import PlanetarySystemView from './PlanetarySystemView.vue'
import ShipManagementDialog from './ShipManagementDialog.vue'

const mapContainer = ref(null)
const gameStore = useGameStore()
const mapStore = useMapStore()
const showSystemDialog = ref(false)
const selectedSystemId = ref(null)
const showEditDialog = ref(false)
const editingSystem = ref(null)
const newSystemPosition = ref(null)
const showShipManagement = ref(false)

// Starlane editor state
const showStarlaneDialog = ref(false)
const starlaneStartSystem = ref(null)
const starlaneFromId = ref(null)
const starlaneToId = ref(null)
const editingLane = ref(null)

// Planetary view state
const showPlanetaryView = ref(false)
const planetarySystemId = ref(null)

let app = null
let viewport = null
let systemSprites = new Map()
let laneGraphics = null
let shipSprite = null
let fogOverlay = null
let backgroundSprite = null
let targetIndicator = null
let testSquares = []  // Store all test squares to clean them up

// Store event handler for cleanup
let preventContextMenu = null

// Define starlane functions early so they're available in onMounted
const toggleStarlaneMode = () => {
  
  if (!gameStore.starlaneMode) {
    // Clean up when exiting starlane mode
    cancelStarlaneMode()
  } else {
    // Update cursor for starlane mode if sprites exist
    if (systemSprites && systemSprites.size > 0) {
      systemSprites.forEach((sprite) => {
        sprite.cursor = 'crosshair'
      })
    }
  }
}

const cancelStarlaneMode = () => {
  // Don't toggle here - just clean up the UI state
  
  // Reset any highlighted systems
  if (starlaneStartSystem.value && systemSprites) {
    const sprite = systemSprites.get(starlaneStartSystem.value.id)
    if (sprite) {
      sprite.alpha = 1
      sprite.scale.set(1, 1)
    }
  }
  
  starlaneStartSystem.value = null
  
  // Reset cursors if sprites exist
  if (systemSprites && systemSprites.size > 0) {
    systemSprites.forEach((sprite) => {
      sprite.cursor = gameStore.editMode ? 'move' : 'pointer'
    })
  }
}

// Handler for the close button - this one should toggle the store
const handleCancelStarlane = () => {
  console.log('StarMap: Cancel button clicked, turning off starlane mode')
  gameStore.toggleStarlaneMode()  // This will set it to false
  cancelStarlaneMode()  // Clean up UI
}

onMounted(async () => {
  app = new PIXI.Application()
  await app.init({
    width: mapContainer.value.clientWidth,
    height: mapContainer.value.clientHeight,
    backgroundAlpha: 0,
    antialias: true,
    // Automatically pause rendering when tab is not visible
    autoStart: true,
    sharedTicker: true
  })
  
  // Pause/resume PIXI ticker based on tab visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      app.ticker.stop()
    } else {
      app.ticker.start()
    }
  })
  
  mapContainer.value.appendChild(app.canvas)
  
  // Prevent ALL context menus when in edit mode
  preventContextMenu = (e) => {
    if (gameStore.editMode) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      return false
    }
  }
  
  // Add to multiple levels to be sure
  document.addEventListener('contextmenu', preventContextMenu, true)
  window.addEventListener('contextmenu', preventContextMenu, true)
  app.canvas.addEventListener('contextmenu', preventContextMenu, true)
  mapContainer.value.addEventListener('contextmenu', preventContextMenu, true)
  
  // Handle right click for adding systems in edit mode  
  app.canvas.addEventListener('mouseup', (e) => {
    if (e.button === 2 && gameStore.editMode) { // Right mouse button
      e.preventDefault()
      e.stopPropagation()
      
      // Get mouse position relative to canvas
      const rect = app.canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Debug log
      
      // Convert to world coordinates (accounting for viewport transform)
      const worldX = (mouseX - viewport.x) / viewport.scale.x
      const worldY = (mouseY - viewport.y) / viewport.scale.y
      
      console.log('World coordinates:', worldX, worldY)
      
      editingSystem.value = null
      newSystemPosition.value = { x: Math.round(worldX), y: Math.round(worldY) }
      showEditDialog.value = true
      
      return false
    }
  }, true)
  
  await setupViewport()
  drawHyperlanes()
  drawSystems()
  await drawShip()
  updateFogOfWar()
  drawTargetIndicator()  // Draw after fog of war to ensure it's on top
  
  setupInteraction()
  
  // Listen for map data changes
  window.addEventListener('mapDataChanged', () => {
    redrawMap()
  })
  
  // Listen for starlane mode toggle
  window.addEventListener('toggleStarlaneMode', () => {
    toggleStarlaneMode()
  })
})

const setupViewport = async () => {
  viewport = new PIXI.Container()
  app.stage.addChild(viewport)
  
  // Load and add background (now PNG)
  const texture = await PIXI.Assets.load('/images/cleanbackground.png')
  backgroundSprite = new PIXI.Sprite(texture)
  backgroundSprite.anchor.set(0.5)
  backgroundSprite.x = 0
  backgroundSprite.y = -30  // Verschiebe Hintergrund 30px nach oben
  
  // High-res background (5433x3484) doesn't need as much scaling
  backgroundSprite.scale.set(1, 1)  // 1.5x gives plenty of space with better quality
  
  viewport.addChild(backgroundSprite)
  
  // Set initial scale - start more zoomed out for better overview
  const minScaleX = app.screen.width / 1920
  const minScaleY = app.screen.height / 1080
  const initialScale = Math.min(minScaleX, minScaleY) * 0.5 // Start at 50% zoom
  viewport.scale.set(initialScale, initialScale)
  
  // Center viewport
  viewport.x = app.screen.width / 2
  viewport.y = app.screen.height / 2
  
  let isDragging = false
  let lastPos = null
  
  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen
  
  app.stage.on('pointerdown', (e) => {
    // Only handle left click for dragging
    if (e.button === 0) {
      isDragging = true
      lastPos = e.global.clone()
    }
  })
  
  app.stage.on('pointermove', (e) => {
    if (isDragging) {
      const dx = e.global.x - lastPos.x
      const dy = e.global.y - lastPos.y
      
      // Calculate new position
      const newX = viewport.x + dx
      const newY = viewport.y + dy
      
      // Calculate bounds based on actual background size (5433x3484) and scale
      const bgWidth = 5433 * 1 * viewport.scale.x
      const bgHeight = 3484 * 1 * viewport.scale.y
      
      // If background is smaller than screen, center it
      if (bgWidth <= app.screen.width) {
        viewport.x = app.screen.width / 2
      } else {
        // Limit panning to keep background edges at screen edges
        const minX = app.screen.width - bgWidth / 2
        const maxX = bgWidth / 2
        viewport.x = Math.max(Math.min(newX, maxX), minX)
      }
      
      if (bgHeight <= app.screen.height) {
        viewport.y = app.screen.height / 2
      } else {
        // Limit panning to keep background edges at screen edges (with 10px extra at bottom)
        const minY = app.screen.height - bgHeight / 2
        const maxY = bgHeight / 2
        viewport.y = Math.max(Math.min(newY, maxY), minY)
      }
      
      lastPos = e.global.clone()
    }
  })
  
  app.stage.on('pointerup', () => {
    isDragging = false
  })
  
  app.canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = viewport.scale.x * scaleFactor
    
    // Much wider zoom range for better exploration
    const minScale = 0.1  // Can zoom out to 10% (see much more area)
    const maxScale = 5    // Can zoom in to 500% (see fine details)
    
    // Apply scale limits
    if (newScale >= minScale && newScale <= maxScale) {
      viewport.scale.x = newScale
      viewport.scale.y = newScale
    }
  }, { passive: false })
}

const drawHyperlanes = () => {
  // Remove old hyperlanes if they exist
  if (laneGraphics) {
    viewport.removeChild(laneGraphics)
  }
  
  laneGraphics = new PIXI.Graphics()
  
  // Make lanes interactive in edit mode
  laneGraphics.eventMode = gameStore.editMode ? 'static' : 'none'
  laneGraphics.cursor = gameStore.editMode ? 'pointer' : 'default'
  
  viewport.addChild(laneGraphics)
  
  gameStore.hyperlanes.forEach(lane => {
    const fromSystem = gameStore.systems.find(s => s.id === lane.from)
    const toSystem = gameStore.systems.find(s => s.id === lane.to)
    
    if (fromSystem && toSystem) {
      const fromDiscovered = gameStore.isSystemDiscovered(fromSystem.id)
      const toDiscovered = gameStore.isSystemDiscovered(toSystem.id)
      
      // Only show lane if at least one end is discovered (when fog of war is enabled)
      if (!gameStore.fogOfWarEnabled || fromDiscovered || toDiscovered) {
        // Determine color based on danger level - always show danger colors
        let laneColor = 0x40ff40 // Default green
        let lineWidth = 2
        let laneAlpha = 1.0
        
        // Show danger level regardless of discovery status
        if (lane.danger) {
          switch(lane.danger) {
            case 'green':
              laneColor = 0x40ff40 // Bright green for safe
              lineWidth = 5  // Thicker for visibility
              break
            case 'yellow':
              laneColor = 0xffff00 // Yellow for normal danger
              lineWidth = 4
              break
            case 'orange':
              laneColor = 0xffa500 // Orange for unsafe
              lineWidth = 4
              break
            case 'red':
              laneColor = 0xff4040 // Red for dangerous
              lineWidth = 4
              break
          }
        }
        
        // Reduce opacity if destination is unknown
        const isFullyDiscovered = fromDiscovered && toDiscovered
        if (!isFullyDiscovered) {
          laneAlpha = 0.5 // Half transparent if we don't know both ends
        }
        
        laneGraphics.setStrokeStyle({
          width: lineWidth,
          color: laneColor,
          alpha: laneAlpha
        })
        laneGraphics.moveTo(fromSystem.x, fromSystem.y)
        laneGraphics.lineTo(toSystem.x, toSystem.y)
        laneGraphics.stroke()
      }
    }
  })
  
  // Make sure ship stays on top of hyperlanes if it exists
  if (shipSprite && viewport.children.includes(shipSprite)) {
    viewport.setChildIndex(shipSprite, viewport.children.length - 1)
    // And target indicator on top of that
    if (targetIndicator && viewport.children.includes(targetIndicator)) {
      viewport.setChildIndex(targetIndicator, viewport.children.length - 1)
    }
  }
}

const getStarColor = (starType, isDiscovered) => {
  if (!isDiscovered) return 0x444444
  
  const colors = {
    'Gelber Zwerg': 0xffff00,
    'Roter Zwerg': 0xff4444,
    'Blauer Riese': 0x4444ff,
    'Roter Überriese': 0xff0000,
    'Weißer Zwerg': 0xeeeeee,
    'Oranger Zwerg': 0xffaa00,
    'Blauer Zwerg': 0x88ccff
  }
  return colors[starType] || 0xffff00
}

const drawSystems = () => {
  // Batch all graphics operations for better performance
  const systemsBatch = new PIXI.Container()
  
  gameStore.systems.forEach(system => {
    const isDiscovered = gameStore.isSystemDiscovered(system.id)
    
    const systemContainer = new PIXI.Container()
    systemContainer.x = system.x
    systemContainer.y = system.y
    
    const circle = new PIXI.Graphics()
    circle.circle(0, 0, 20)  // Larger systems for high-res background
    circle.fill(getStarColor(system.starType, isDiscovered))
    
    systemContainer.addChild(circle)
    
    // Store system reference for drag & drop
    systemContainer.systemData = system
    
    // Always create text, but set visibility based on discovery
    const text = new PIXI.Text({
      text: system.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 18,  // Much larger text for readability
        fill: 0xffffff,
        dropShadow: true,
        dropShadowDistance: 2,
        dropShadowBlur: 2
      }
    })
    text.anchor.set(0.5)
    text.y = 35  // Further from larger system
    text.visible = isDiscovered
    systemContainer.addChild(text)
    
    // Add importance stars if set
    const importance = gameStore.getSystemImportance(system.id)
    if (importance > 0 && isDiscovered) {
      const stars = new PIXI.Text({
        text: '⭐'.repeat(importance),
        style: {
          fontFamily: 'Arial',
          fontSize: 20,  // Larger stars
          fill: 0xffff00
        }
      })
      stars.anchor.set(0.5)
      stars.y = -40  // Further from larger system
      systemContainer.addChild(stars)
    }

    // Add "fully explored" indicator if all planets are explored
    if (gameStore.isSystemFullyExplored(system.id) && isDiscovered) {
      const exploredMarker = new PIXI.Graphics()
      exploredMarker.setStrokeStyle({ width: 2, color: 0x00ff88, alpha: 0.9 })
      exploredMarker.circle(0, 0, 28)
      exploredMarker.stroke()
      systemContainer.addChild(exploredMarker)

      // Add checkmark icon
      const checkmark = new PIXI.Text({
        text: '✓',
        style: {
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0x00ff88,
          fontWeight: 'bold'
        }
      })
      checkmark.anchor.set(0.5)
      checkmark.x = 25
      checkmark.y = -25
      systemContainer.addChild(checkmark)
    }

    // Mark start system with a special indicator
    if (gameStore.getStartSystem() === system.id && gameStore.editMode) {
      const startMarker = new PIXI.Graphics()
      startMarker.setStrokeStyle({ width: 3, color: 0x00ff00, alpha: 0.8 })
      startMarker.circle(0, 0, 30)
      startMarker.stroke()
      
      // Add "START" text
      const startText = new PIXI.Text({
        text: 'START',
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0x00ff00,
          fontWeight: 'bold'
        }
      })
      startText.anchor.set(0.5)
      startText.y = -55
      
      systemContainer.addChild(startMarker)
      systemContainer.addChild(startText)
    }
    
    systemContainer.eventMode = 'static'
    systemContainer.cursor = gameStore.editMode ? 'move' : 'pointer'
    
    // Track clicks for double-click detection
    let lastClickTime = 0
    let isDragging = false
    let hasMoved = false
    let dragStartPos = null
    let originalSystemPos = null
    const DRAG_THRESHOLD = 5 // pixels
    
    systemContainer.on('pointerdown', (event) => {
      event.stopPropagation()
      
      const currentTime = Date.now()
      const timeDiff = currentTime - lastClickTime
      
      if (gameStore.starlaneMode && event.button === 0) {
        // Handle starlane creation mode
        handleStarlaneClick(system)
      } else if (gameStore.editMode && event.button === 0 && !gameStore.starlaneMode) {
        // Prepare for potential drag in edit mode
        dragStartPos = event.global.clone()
        originalSystemPos = { x: systemContainer.x, y: systemContainer.y }
        hasMoved = false
        
      } else {
        // Handle double-click for both edit and non-edit modes
        if (timeDiff < 300) { // Double click detected (within 300ms)
          selectedSystemId.value = system.id
          showSystemDialog.value = true
        } else if (!gameStore.editMode) { // Single click - just select the system (non-edit mode only)
          if (isDiscovered) {
            gameStore.selectSystem(system.id)
          }
        }
      }
      
      lastClickTime = currentTime
    })
    
    systemContainer.on('pointermove', (event) => {
      if (dragStartPos && gameStore.editMode && !gameStore.starlaneMode) {
        const currentPos = event.global
        const distance = Math.sqrt(
          Math.pow(currentPos.x - dragStartPos.x, 2) + 
          Math.pow(currentPos.y - dragStartPos.y, 2)
        )
        
        // Start dragging only after threshold
        if (!isDragging && distance > DRAG_THRESHOLD) {
          isDragging = true
          hasMoved = true
          
          // Add visual feedback
          systemContainer.alpha = 0.7
          systemContainer.scale.set(1.1, 1.1)
          
          // Bring to front
          viewport.setChildIndex(systemContainer, viewport.children.length - 1)
        }
        
        if (isDragging) {
          const dx = (currentPos.x - dragStartPos.x) / viewport.scale.x
          const dy = (currentPos.y - dragStartPos.y) / viewport.scale.y
          
          systemContainer.x = originalSystemPos.x + dx
          systemContainer.y = originalSystemPos.y + dy
        }
      }
    })
    
    systemContainer.on('pointerup', (event) => {
      if (isDragging && gameStore.editMode) {
        isDragging = false
        dragStartPos = null
        
        // Reset visual feedback
        systemContainer.alpha = 1
        systemContainer.scale.set(1, 1)
        
        // Update system position in data
        const systemIndex = gameStore.systems.findIndex(s => s.id === system.id)
        if (systemIndex !== -1) {
          gameStore.systems[systemIndex].x = Math.round(systemContainer.x)
          gameStore.systems[systemIndex].y = Math.round(systemContainer.y)
          
          // Mark as changed for auto-save
          mapStore.markAsChanged()
          
          // Redraw hyperlanes as positions changed
          drawHyperlanes()
        }
      } else if (gameStore.editMode && !hasMoved && !gameStore.starlaneMode && event.button === 0) {
        // Click without drag in edit mode opens editor (but not in starlane mode)
        dragStartPos = null
        editingSystem.value = system
        newSystemPosition.value = null
        showEditDialog.value = true
      }
      
      dragStartPos = null
    })
    
    systemContainer.on('pointerupoutside', () => {
      if (isDragging) {
        isDragging = false
        dragStartPos = null
        systemContainer.alpha = 1
        systemContainer.scale.set(1, 1)
      }
    })
    
    systemsBatch.addChild(systemContainer)
    systemSprites.set(system.id, systemContainer)
  })
  
  // Add all systems at once for better performance
  viewport.addChild(systemsBatch)
}

const drawShip = async () => {
  if (shipSprite) {
    viewport.removeChild(shipSprite)
  }
  
  const ship = gameStore.playerShip
  const currentSystem = gameStore.systems.find(s => s.id === ship.currentSystem)
  
  if (currentSystem) {
    try {
      // Load the PNG version with transparency
      const texture = await PIXI.Assets.load('/images/Rogue-Trader-Ship.png')
      
      shipSprite = new PIXI.Sprite(texture)
      
      // Scale the ship to appropriate size (larger to match bigger systems)
      shipSprite.width = 82
      shipSprite.height = 37
      
      // Center the anchor
      shipSprite.anchor.set(0.5)
      
      // Position above the system (further due to larger scale)
      shipSprite.x = currentSystem.x
      shipSprite.y = currentSystem.y - 50
      
      // Slight rotation for dynamic look
      shipSprite.rotation = 0
      
      // Add tint for better visibility - darker bronze/copper color
      shipSprite.tint = 0xCC7733
      
      // Make ship interactive for double-click
      shipSprite.eventMode = 'static'
      shipSprite.cursor = 'pointer'
      
      // Add double-click handler
      let lastClickTime = 0
      shipSprite.on('pointertap', (event) => {
        const currentTime = Date.now()
        if (currentTime - lastClickTime < 300) { // 300ms for double-click
          showShipManagement.value = true
        }
        lastClickTime = currentTime
      })
      
    } catch (error) {
      // Fallback to triangle if image fails to load
      console.warn('Could not load ship image, using fallback')
      shipSprite = new PIXI.Graphics()
      shipSprite.moveTo(0, -10)
      shipSprite.lineTo(-5, 5)
      shipSprite.lineTo(5, 5)
      shipSprite.closePath()
      shipSprite.fill(0xff0000)
      
      shipSprite.x = currentSystem.x
      shipSprite.y = currentSystem.y - 20
    }
    
    viewport.addChild(shipSprite)
    
    // Ensure ship is rendered on top of everything except target indicator
    viewport.setChildIndex(shipSprite, viewport.children.length - 1)
    
    // If target indicator exists, make sure it stays on top
    if (targetIndicator && viewport.children.includes(targetIndicator)) {
      viewport.setChildIndex(targetIndicator, viewport.children.length - 1)
    }
  }
}

const drawTargetIndicator = () => {
  // Clean up old indicators and test squares
  if (targetIndicator) {
    viewport.removeChild(targetIndicator)
    targetIndicator = null
  }
  
  // Remove all test squares and their animations
  testSquares.forEach(square => {
    if (square.ticker) {
      app.ticker.remove(square.ticker)
    }
    viewport.removeChild(square)
  })
  testSquares = []
  
  if (!gameStore.selectedSystem) {
    return
  }
  
  const targetSystem = gameStore.selectedSystem
  
  // For undiscovered systems, show indicator even if system is hidden
  const isDiscovered = gameStore.isSystemDiscovered(targetSystem.id)
  
  // Create target indicator - smaller crosshair (40x40 instead of 100x100)
  targetIndicator = new PIXI.Graphics()
  
  // Add red horizontal line (thinner)
  targetIndicator.rect(-20, -1, 40, 2)
  targetIndicator.fill(0xff0000)
  
  // Add red vertical line (thinner)
  targetIndicator.rect(-1, -20, 2, 40)
  targetIndicator.fill(0xff0000)
  
  // Add yellow corner brackets
  // Top left
  targetIndicator.rect(-20, -20, 8, 2)
  targetIndicator.fill(0xffff00)
  targetIndicator.rect(-20, -20, 2, 8)
  targetIndicator.fill(0xffff00)
  
  // Top right
  targetIndicator.rect(12, -20, 8, 2)
  targetIndicator.fill(0xffff00)
  targetIndicator.rect(18, -20, 2, 8)
  targetIndicator.fill(0xffff00)
  
  // Bottom left
  targetIndicator.rect(-20, 18, 8, 2)
  targetIndicator.fill(0xffff00)
  targetIndicator.rect(-20, 12, 2, 8)
  targetIndicator.fill(0xffff00)
  
  // Bottom right
  targetIndicator.rect(12, 18, 8, 2)
  targetIndicator.fill(0xffff00)
  targetIndicator.rect(18, 12, 2, 8)
  targetIndicator.fill(0xffff00)
  
  targetIndicator.x = targetSystem.x
  targetIndicator.y = targetSystem.y
  
  viewport.addChild(targetIndicator)
}

const updateFogOfWar = () => {
  if (laneGraphics) {
    viewport.removeChild(laneGraphics)
  }
  drawHyperlanes()
  
  gameStore.systems.forEach(system => {
    const sprite = systemSprites.get(system.id)
    if (sprite) {
      const isDiscovered = gameStore.isSystemDiscovered(system.id)
      sprite.alpha = isDiscovered ? 1 : 0.3
      
      // Update system color
      const circle = sprite.children[0]
      if (circle) {
        circle.clear()
        circle.circle(0, 0, 15)
        circle.fill(getStarColor(system.starType, isDiscovered))
      }
      
      // Update text visibility
      const text = sprite.children[1]
      if (text) {
        // Text already exists, update visibility
        text.visible = isDiscovered
      } else if (isDiscovered) {
        // Create text if discovered and doesn't exist
        const newText = new PIXI.Text({
          text: system.name,
          style: {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0xffffff
          }
        })
        newText.anchor.set(0.5)
        newText.y = 25
        sprite.addChild(newText)
      }
    }
  })
}

const setupInteraction = () => {
  // Track if tab is visible
  let isTabVisible = !document.hidden
  
  // Only subscribe to specific changes that actually need redraws
  let isUpdating = false
  let lastShipSystem = gameStore.playerShip.currentSystem
  let lastSelectedSystem = gameStore.selectedSystem?.id
  
  // Pause updates when tab is not visible
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden
    
    // When tab becomes visible again, do a single update if needed
    if (isTabVisible) {
      const shipMoved = gameStore.playerShip.currentSystem !== lastShipSystem
      const selectionChanged = gameStore.selectedSystem?.id !== lastSelectedSystem
      
      if (shipMoved) {
        lastShipSystem = gameStore.playerShip.currentSystem
        drawShip()
      }
      if (selectionChanged) {
        lastSelectedSystem = gameStore.selectedSystem?.id
        drawTargetIndicator()
      }
    }
  })
  
  gameStore.$subscribe(async (mutation, state) => {
    // Skip all updates if tab is not visible
    if (!isTabVisible) return
    
    // Prevent multiple simultaneous updates
    if (isUpdating) return
    
    // Only redraw ship if it actually moved
    const shipMoved = state.playerShip.currentSystem !== lastShipSystem
    if (shipMoved) {
      isUpdating = true
      lastShipSystem = state.playerShip.currentSystem
      await drawShip()
      isUpdating = false
    }
    
    // Only redraw target if selection changed
    const selectionChanged = state.selectedSystem?.id !== lastSelectedSystem
    if (selectionChanged) {
      lastSelectedSystem = state.selectedSystem?.id
      drawTargetIndicator()
    }
    
    // Fog of war updates are handled separately via event
  })
  
  // Listen for fog of war toggle
  window.addEventListener('fogOfWarToggled', () => {
    if (isTabVisible) {  // Only update if tab is visible
      updateFogOfWar()
    }
  })
}

onUnmounted(() => {
  // Clean up visibility change listener
  document.removeEventListener('visibilitychange', () => {})
  
  if (app) {
    app.ticker.stop()
    app.destroy(true)
  }
  
  // Clean up event listeners
  if (preventContextMenu) {
    document.removeEventListener('contextmenu', preventContextMenu, true)
    window.removeEventListener('contextmenu', preventContextMenu, true)
  }
  
  // Clear all stored references
  systemSprites.clear()
  laneGraphics = null
  shipSprite = null
  targetIndicator = null
  fogOverlay = null
  backgroundSprite = null
})

// Handle system saved from editor
const onSystemSaved = (system) => {
  // Redraw everything to reflect changes
  redrawMap()
}

// Handle system deleted from editor  
const onSystemDeleted = (systemId) => {
  // Completely redraw the map to ensure clean state
  redrawMap()
}

// Called when planets are updated in SystemInfoDialog
const onPlanetsUpdated = () => {
  redrawMap()
}

// Redraw the entire map
const redrawMap = async () => {
  // Clear ALL graphics from viewport except background
  const children = [...viewport.children]
  children.forEach(child => {
    if (child !== backgroundSprite) {
      viewport.removeChild(child)
    }
  })
  
  // Clear stored references
  systemSprites.clear()
  laneGraphics = null
  shipSprite = null
  targetIndicator = null
  fogOverlay = null
  
  // Redraw everything fresh
  drawHyperlanes()
  drawSystems()
  await drawShip()
  updateFogOfWar()
  drawTargetIndicator()
}

// Watch for edit mode changes
watch(() => gameStore.editMode, (editMode) => {
  // Update cursor style
  if (app && app.stage) {
    app.stage.cursor = editMode ? 'crosshair' : 'default'
  }

  // Update system cursors
  systemSprites.forEach((sprite) => {
    sprite.cursor = editMode ? 'move' : 'pointer'
  })
})

// Redraw systems when planetary view is closed (to update explored indicators)
watch(showPlanetaryView, async (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    // Dialog was closed - wait a tick for data to sync, then redraw
    await nextTick()
    await redrawMap()
  }
})

// Starlane click handler

const handleStarlaneClick = (system) => {
  if (!starlaneStartSystem.value) {
    // First click - select start system
    starlaneStartSystem.value = system
    
    // Highlight the start system
    const sprite = systemSprites.get(system.id)
    if (sprite) {
      sprite.alpha = 0.7
      sprite.scale.set(1.2, 1.2)
    }
  } else {
    // Second click - create or edit hyperlane
    const fromId = starlaneStartSystem.value.id
    const toId = system.id
    
    if (fromId === toId) {
      // Can't connect to itself
      return
    }
    
    // Check if hyperlane already exists
    const existingLane = gameStore.hyperlanes.find(lane => 
      (lane.from === fromId && lane.to === toId) ||
      (lane.from === toId && lane.to === fromId)
    )
    
    // Reset start system visual
    const startSprite = systemSprites.get(starlaneStartSystem.value.id)
    if (startSprite) {
      startSprite.alpha = 1
      startSprite.scale.set(1, 1)
    }
    
    // Open dialog
    starlaneFromId.value = fromId
    starlaneToId.value = toId
    editingLane.value = existingLane
    showStarlaneDialog.value = true
    
    // Reset for next starlane (but stay in starlane mode)
    starlaneStartSystem.value = null
  }
}

const onLaneSaved = () => {
  // Redraw hyperlanes
  drawHyperlanes()
}

const onLaneDeleted = () => {
  // Redraw hyperlanes
  drawHyperlanes()
}

// Show planetary system view from editor dialog
const showPlanetarySystemForEdit = () => {
  if (editingSystem.value && editingSystem.value.id) {
    planetarySystemId.value = editingSystem.value.id
    showPlanetaryView.value = true
  }
}
</script>

<style scoped>
.star-map-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: #000814;
}

.star-map-container canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.starlane-mode-indicator {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}
</style>