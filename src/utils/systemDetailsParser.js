export function parseSystemDetails(text) {
  const systems = {}
  const lines = text.split('\n').filter(line => line.trim())
  
  let currentSystem = null
  let skipHeader = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Check if this is a system name (doesn't contain tabs and isn't a header line)
    if (!line.includes('\t') && !line.startsWith('Name:')) {
      // Clean up system name - remove "Star System" suffix
      currentSystem = line.replace(/\s*Star System\s*$/i, '').trim()
      systems[currentSystem] = {
        name: currentSystem,
        planets: []
      }
      skipHeader = true // Next line will be the header
      continue
    }
    
    // Skip header lines
    if (skipHeader || line.startsWith('Name:')) {
      skipHeader = false
      continue
    }
    
    // Parse planet/object data
    if (currentSystem && line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim())
      
      // Handle different formats
      let planet = {}
      
      if (parts[0]) {
        planet.name = parts[0]
        
        // Check if second column is a type or resource
        if (parts[1] && !parts[1].includes('x')) {
          planet.type = parts[1]
          planet.resource = parts[2] || null
          planet.pointOfInterest = parts[3] || null
          planet.description = parts[4] || null
        } else {
          planet.type = null
          planet.resource = parts[1] || null
          planet.pointOfInterest = parts[2] || null
          planet.description = parts[3] || null
        }
        
        // Clean up resource field
        if (planet.resource && planet.resource !== '-') {
          const resourceMatch = planet.resource.match(/(.+?)\s*x\s*(\d+)/)
          if (resourceMatch) {
            planet.resource = {
              type: resourceMatch[1].trim(),
              amount: parseInt(resourceMatch[2])
            }
          } else if (planet.resource.includes('%')) {
            planet.resource = {
              type: planet.resource.replace(/\d+%\s*/, ''),
              amount: planet.resource.match(/(\d+)%/)?.[1] + '%'
            }
          }
        } else {
          planet.resource = null
        }
        
        // Clean up other fields
        if (planet.pointOfInterest === '-' || !planet.pointOfInterest) {
          planet.pointOfInterest = null
        }
        if (planet.description === '-' || !planet.description) {
          planet.description = null
        }
        
        systems[currentSystem].planets.push(planet)
      }
    }
  }
  
  return systems
}

// Map system names to match our existing system IDs
export function mapSystemNames(parsedName) {
  const nameMapping = {
    'An#8954No01-KT': 'an8954no01-kt',
    'Adermatt II': 'adermatt-ii',
    'Agathus Archides': 'agathus-archides',
    'Atlassian Reach': 'atlassian-reach',
    'Aviorus': 'aviorus',
    // Add more mappings as needed
  }
  
  return nameMapping[parsedName] || parsedName.toLowerCase().replace(/\s+/g, '-')
}