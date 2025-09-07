// Planetary Data Recovery Script
// Run this in your browser console to check for lost data

console.log('=== PLANETARY DATA RECOVERY CHECK ===');

// Check all localStorage keys
const allKeys = Object.keys(localStorage);
console.log('\nAll localStorage keys:', allKeys);

// Check for planetary data
const systemPlanets = localStorage.getItem('systemPlanets');
if (systemPlanets) {
  try {
    const data = JSON.parse(systemPlanets);
    const planetCount = Object.values(data).reduce((sum, system) => sum + (system?.planets?.length || 0), 0);
    console.log('\n✅ Found systemPlanets in localStorage!');
    console.log('Systems with planets:', Object.keys(data).length);
    console.log('Total planets:', planetCount);
    console.log('\nFirst few systems:', Object.keys(data).slice(0, 5));
    
    // Save backup
    const backup = {
      timestamp: new Date().toISOString(),
      systemPlanets: data,
      planetCount: planetCount
    };
    console.log('\n📋 Copy this backup data:');
    console.log(JSON.stringify(backup));
  } catch (e) {
    console.error('Error parsing systemPlanets:', e);
  }
} else {
  console.log('\n⚠️ No systemPlanets found in localStorage');
}

// Check saved maps for planetary data
const savedMaps = localStorage.getItem('savedMaps');
if (savedMaps) {
  try {
    const maps = JSON.parse(savedMaps);
    console.log('\n📍 Checking saved maps for planetary data:');
    Object.entries(maps).forEach(([name, map]) => {
      if (map.systemPlanets) {
        const planetCount = Object.values(map.systemPlanets).reduce((sum, system) => 
          sum + (system?.planets?.length || 0), 0);
        console.log(`  Map "${name}": ${planetCount} planets`);
      } else {
        console.log(`  Map "${name}": No planetary data`);
      }
    });
  } catch (e) {
    console.error('Error parsing savedMaps:', e);
  }
}

// Check for backup keys
const backupKeys = allKeys.filter(k => k.includes('backup') || k.includes('planet'));
if (backupKeys.length > 0) {
  console.log('\n🔍 Found potential backup keys:', backupKeys);
  backupKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value ? value.length + ' chars' : 'empty'}`);
  });
}

console.log('\n=== END OF RECOVERY CHECK ===');
console.log('Run this in your browser console to check for data!');