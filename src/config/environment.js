// Environment configuration
export const config = {
  // Player Mode
  isPlayerMode: import.meta.env.VITE_PLAYER_MODE === 'true',
  defaultCampaign: import.meta.env.VITE_DEFAULT_CAMPAIGN || 'main',
  
  // GitHub Gist URLs
  gistUrls: {
    main: import.meta.env.VITE_GIST_URL_MAIN || '',
    side: import.meta.env.VITE_GIST_URL_SIDE || ''
  },
  
  // GitHub Token (only for GM)
  githubToken: import.meta.env.VITE_GITHUB_TOKEN || '',
  
  // Sync settings
  syncInterval: parseInt(import.meta.env.VITE_SYNC_INTERVAL || '5') * 60 * 1000, // Convert to ms
  
  // Feature flags
  features: {
    disableEdit: import.meta.env.VITE_DISABLE_EDIT === 'true',
    disableTravel: import.meta.env.VITE_DISABLE_TRAVEL === 'true',
    disableFogToggle: import.meta.env.VITE_DISABLE_FOG_TOGGLE === 'true'
  },
  
  // URLs
  urls: {
    gm: import.meta.env.VITE_GM_URL || window.location.origin,
    player: import.meta.env.VITE_PLAYER_URL || window.location.origin
  }
}

// Initialize player mode on startup if configured
export const initializeEnvironment = async (gameStore) => {
  if (config.isPlayerMode) {
    gameStore.setPlayerMode(true)
  }
  
  // Set default campaign
  if (config.defaultCampaign) {
    gameStore.setCampaign(config.defaultCampaign)
  }
  
  // Set Gist URL based on campaign
  const gistUrl = config.gistUrls[config.defaultCampaign]
  if (gistUrl) {
    gameStore.remoteDataUrl = gistUrl
    localStorage.setItem('remoteDataUrl', gistUrl)
    
    // In player mode, immediately sync data from Gist on startup
    if (config.isPlayerMode) {
      console.log('Player mode detected, syncing with remote data...')
      try {
        await gameStore.syncWithRemote({ updateExistingNPCs: false })
        console.log('Initial sync completed')
      } catch (error) {
        console.error('Initial sync failed:', error)
      }
    }
  }
  
  // Set GitHub token if available
  if (config.githubToken && !gameStore.isPlayerMode) {
    localStorage.setItem('githubToken', config.githubToken)
  }
}