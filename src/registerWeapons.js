/**
 * One-time setup: Register all weapons with NeonUtil's database
 * This sends "owo weapon <code>" for each weapon we want to test
 */

import { Client } from 'discord.js-selfbot-v13';
import { config } from './config.js';
import { sleep, log } from './utils.js';
import { loadWeapons } from './teamGenerator.js';

const client = new Client();

/**
 * Get a random delay to mimic human behavior
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {number} Random delay
 */
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Register all weapons with NeonUtil
 */
async function registerAllWeapons() {
  try {
    const channel = await client.channels.fetch(config.channelId);
    const weapons = loadWeapons();
    
    if (weapons.length === 0) {
      log('ERROR: No weapons found. Run "npm run parse-weapons" first!');
      process.exit(1);
    }
    
    log(`Found ${weapons.length} weapons to register with NeonUtil`);
    log('This is a ONE-TIME setup. It will take a few minutes...\n');
    
    // Register ALL weapons (sorted by quality for easier tracking)
    const sortedWeapons = weapons.sort((a, b) => b.percentage - a.percentage);
    
    log(`Registering ALL ${sortedWeapons.length} weapons...`);
    log('(Using randomized delays to avoid detection)\n');
    
    for (let i = 0; i < sortedWeapons.length; i++) {
      const weapon = sortedWeapons[i];
      
      log(`[${i + 1}/${sortedWeapons.length}] Registering ${weapon.code} - ${weapon.name} (${weapon.percentage}%)`);
      
      // Send "owo weapon <code>" command
      await channel.send(`owo weapon ${weapon.code}`);
      
      // Random delay between 5-8 seconds to mimic human behavior
      const delay = randomDelay(5000, 8000);
      log(`  Waiting ${(delay / 1000).toFixed(1)}s...`);
      await sleep(delay);
      
      // Every 10 weapons, take a longer break (like a human would)
      if ((i + 1) % 10 === 0 && i + 1 < sortedWeapons.length) {
        const longBreak = randomDelay(15000, 25000);
        log(`  Taking a ${(longBreak / 1000).toFixed(1)}s break (human-like behavior)...\n`);
        await sleep(longBreak);
      }
    }
    
    log('\n✅ All weapons registered with NeonUtil!');
    log('You can now run "npm run test-teams" to start testing.\n');
    
  } catch (error) {
    log(`ERROR: ${error.message}`);
    console.error(error);
  }
}

// Main execution
client.on('ready', async () => {
  log(`Logged in as ${client.user.tag}\n`);
  
  try {
    await registerAllWeapons();
    process.exit(0);
  } catch (error) {
    log('Registration failed!');
    console.error(error);
    process.exit(1);
  }
});

client.login(config.discordToken);
