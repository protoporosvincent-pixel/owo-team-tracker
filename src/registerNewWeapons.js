import { Client } from 'discord.js-selfbot-v13';
import { config } from './config.js';
import { sleep, log } from './utils.js';
import fs from 'fs';

const client = new Client();

/**
 * Load old weapons from backup or test_results.json
 */
function loadOldWeapons() {
  // Try to load from backup files
  const backupPaths = [
    './weapons.json.old',
    './weapons_backup.json'
  ];
  
  for (const path of backupPaths) {
    if (fs.existsSync(path)) {
      try {
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        if (Array.isArray(data) && data.length > 0) {
          log(`Loaded ${data.length} old weapons from ${path}`);
          return data;
        }
      } catch (error) {
        log(`Error reading ${path}: ${error.message}`);
      }
    }
  }
  
  // If no backup found, try to extract from test_results.json
  if (fs.existsSync('./test_results.json')) {
    try {
      log('No backup found. Extracting weapons from test_results.json...');
      const testResults = JSON.parse(fs.readFileSync('./test_results.json', 'utf8'));
      
      // Extract unique weapon codes from test results
      const weaponCodes = new Set();
      for (const result of testResults) {
        if (result.combination && result.combination.weapons) {
          result.combination.weapons.forEach(code => weaponCodes.add(code));
        }
      }
      
      log(`Extracted ${weaponCodes.size} weapon codes from test_results.json`);
      
      // Convert codes to weapon objects (we'll use the new weapons.json for names)
      const newWeapons = JSON.parse(fs.readFileSync('./weapons.json', 'utf8'));
      const weaponMap = new Map(newWeapons.map(w => [w.code, w]));
      
      const oldWeapons = Array.from(weaponCodes).map(code => {
        const weapon = weaponMap.get(code);
        return weapon || { code, name: 'Unknown', rarity: 'unknown' };
      });
      
      log(`Found ${oldWeapons.length} old weapons from test results`);
      return oldWeapons;
      
    } catch (error) {
      log(`Error extracting weapons from test_results.json: ${error.message}`);
    }
  }
  
  log('⚠️  No old weapons found! You should create weapons.json.old first.');
  log('    Run: cp weapons.json weapons.json.old');
  log('    Or transfer weapons.json from your phone before running this script.');
  return [];
}

/**
 * Register a single weapon with OwO bot
 */
async function registerWeapon(channel, weaponCode) {
  try {
    log(`Registering weapon ${weaponCode}...`);
    await channel.send(`owo weapon ${weaponCode}`);
    
    // Random delay between 5-8 seconds
    const delay = 5000 + Math.random() * 3000;
    log(`  Waiting ${(delay/1000).toFixed(1)}s...`);
    await sleep(delay);
    
    return true;
  } catch (error) {
    log(`Error registering weapon ${weaponCode}: ${error.message}`);
    return false;
  }
}

/**
 * Register only new weapons (not in old list)
 */
async function registerNewWeapons() {
  try {
    const channel = await client.channels.fetch(config.channelId);
    
    // Load old and new weapon lists
    const oldWeapons = loadOldWeapons();
    const newWeapons = JSON.parse(fs.readFileSync('./weapons.json', 'utf8'));
    
    // Extract codes from old weapons
    const oldCodes = new Set(oldWeapons.map(w => w.code));
    
    // Find weapons that are new
    const weaponsToRegister = newWeapons.filter(w => !oldCodes.has(w.code));
    
    if (weaponsToRegister.length === 0) {
      log('\n✅ No new weapons to register! All weapons are already registered.');
      return;
    }
    
    log(`\n========================================`);
    log(`Total weapons: ${newWeapons.length}`);
    log(`Already registered: ${newWeapons.length - weaponsToRegister.length}`);
    log(`NEW weapons to register: ${weaponsToRegister.length}`);
    log(`========================================\n`);
    
    // Show which weapons will be registered
    console.log('Weapons to register:');
    weaponsToRegister.forEach((w, i) => {
      console.log(`  [${i+1}/${weaponsToRegister.length}] ${w.code} - ${w.name} (${w.rarity})`);
    });
    console.log();
    
    // Register each new weapon
    let registered = 0;
    let failed = 0;
    
    for (let i = 0; i < weaponsToRegister.length; i++) {
      const weapon = weaponsToRegister[i];
      log(`[${i+1}/${weaponsToRegister.length}] Registering ${weapon.name}...`);
      
      const success = await registerWeapon(channel, weapon.code);
      
      if (success) {
        registered++;
      } else {
        failed++;
      }
      
      // Take a longer break every 10 weapons
      if ((i + 1) % 10 === 0 && (i + 1) < weaponsToRegister.length) {
        const breakTime = 15000 + Math.random() * 10000; // 15-25 seconds
        log(`Taking a ${(breakTime/1000).toFixed(0)}s break after 10 weapons...`);
        await sleep(breakTime);
      }
    }
    
    log(`\n========================================`);
    log(`Registration complete!`);
    log(`✅ Registered: ${registered}`);
    if (failed > 0) {
      log(`❌ Failed: ${failed}`);
    }
    log(`========================================`);
    
  } catch (error) {
    log(`Error in registerNewWeapons: ${error.message}`);
    throw error;
  }
}

// Main execution
client.on('ready', async () => {
  log(`Logged in as ${client.user.tag}`);
  
  try {
    await registerNewWeapons();
    log('New weapon registration completed!');
    process.exit(0);
  } catch (error) {
    log('New weapon registration failed!');
    console.error(error);
    process.exit(1);
  }
});

client.login(config.discordToken);
