/**
 * RL-Based Team Tester - Thompson Sampling Algorithm
 * 
 * Uses Reinforcement Learning to intelligently select teams to test.
 * Much faster convergence than exhaustive search.
 * 
 * Algorithm: Thompson Sampling with Bayesian Inference
 */

import { Client } from 'discord.js-selfbot-v13';
import { config } from './config.js';
import { sleep, log } from './utils.js';
import { DEFAULT_LEVEL } from './constants.js';
import { loadWeapons } from './teamGenerator.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client();

// RL Configuration
const RL_CHANNEL_ID = '1550969083456126976'; // Different channel for RL testing
const RL_TOKEN = process.env.RL_DISCORD_TOKEN; // Different token for RL tester
const NEONUTIL_BOT_ID = '851436490415931422';
const EXPLORATION_RATE = 0.20; // 20% random exploration, 80% exploitation
const ALPHA = 1.0; // Prior strength for Beta distribution
const BETA = 1.0;
const MIN_SAMPLES = 5;

// Animals with accurate roles
const ANIMAL_ROLES = {
  'spider': ['attacker'],
  'fox': ['attacker', 'tank'],
  'panda': ['attacker', 'tank'],
  'fish': ['attacker'],
  'deer': ['attacker', 'healer', 'replenisher'],
  'sept': ['attacker', 'healer'],
  'squid': ['healer', 'replenisher'],
  'shrimp': ['healer', 'tank'],
  'camel': ['replenisher', 'healer'],
  'owl': ['tank', 'healer'],
  'lion': ['attacker', 'tank'],
  'midautumn': ['tank', 'healer', 'attacker'],
  'gorilla': ['attacker', 'healer', 'tank', 'replenisher'],
  'whdviva': ['attacker', 'healer']
};

// Formations to use
const FORMATIONS = [
  { name: 'Holy Trinity', roles: ['attacker', 'healer', 'tank'] },
  { name: 'Blitz Team', roles: ['attacker', 'healer', 'attacker'] },
  { name: 'Crune Meta', roles: ['tank', 'healer', 'attacker'] },
  { name: 'Full Stall', roles: ['tank', 'healer', 'replenisher'] },
  { name: 'Double AoE', roles: ['attacker', 'attacker', 'healer'] }
];

// RL State - Thompson Sampling with Beta distributions
let rlState = {
  animals: {},      // { animal: { alpha: num, beta: num, successRate: num, samples: num } }
  weapons: {},      // { weaponCode: { alpha: num, beta: num, successRate: num, samples: num } }
  formations: {},   // { formation: { alpha: num, beta: num, successRate: num, samples: num } }
  animalPairs: {},  // { 'animal1+animal2': { alpha, beta, successRate, samples } }
  totalTeamsTested: 0,
  bestTeam: null,
  bestScore: 0
};

/**
 * Initialize RL state from existing results
 */
function initializeRLState() {
  // Initialize all animals
  Object.keys(ANIMAL_ROLES).forEach(animal => {
    rlState.animals[animal] = { alpha: ALPHA, beta: BETA, successRate: 0, samples: 0 };
  });

  // Initialize formations
  FORMATIONS.forEach(formation => {
    rlState.formations[formation.name] = { alpha: ALPHA, beta: BETA, successRate: 0, samples: 0 };
  });

  log('RL State initialized with Beta(1,1) priors for all components');
}

/**
 * Load existing RL results
 */
function loadRLResults() {
  try {
    const data = fs.readFileSync('./rl_results.json', 'utf8');
    const results = JSON.parse(data);
    
    // Reconstruct RL state from historical data
    results.forEach(result => {
      const score = ((result.totalWins || 0) + (result.totalTies || 0)) / 
                    ((result.totalWins || 0) + (result.totalLosses || 0) + (result.totalTies || 0)) * 100;
      
      // Update animals
      (result.combination?.animals || []).forEach(animal => {
        if (!rlState.animals[animal]) {
          rlState.animals[animal] = { alpha: ALPHA, beta: BETA, successRate: 0, samples: 0 };
        }
      });
      
      // Update weapons
      (result.combination?.weapons || []).forEach(weapon => {
        if (!rlState.weapons[weapon]) {
          rlState.weapons[weapon] = { alpha: ALPHA, beta: BETA, successRate: 0, samples: 0 };
        }
      });
    });
    
    log(`Loaded ${results.length} previous RL results`);
    return results;
  } catch (error) {
    log('No previous RL results found, starting fresh');
    return [];
  }
}

/**
 * Save RL results
 */
function saveRLResults(results) {
  fs.writeFileSync('./rl_results.json', JSON.stringify(results, null, 2));
  
  // Also save RL state for analysis
  fs.writeFileSync('./rl_state.json', JSON.stringify({
    state: rlState,
    topAnimals: Object.entries(rlState.animals)
      .filter(([_, v]) => v.samples >= MIN_SAMPLES)
      .sort((a, b) => b[1].successRate - a[1].successRate)
      .slice(0, 10)
      .map(([name, stats]) => ({ name, ...stats })),
    topWeapons: Object.entries(rlState.weapons)
      .filter(([_, v]) => v.samples >= MIN_SAMPLES)
      .sort((a, b) => b[1].successRate - a[1].successRate)
      .slice(0, 15)
      .map(([code, stats]) => ({ code, ...stats }))
  }, null, 2));
}

/**
 * Sample from Beta distribution (Thompson Sampling)
 */
function sampleBeta(alpha, beta) {
  // Use approximation for Beta distribution sampling
  // This is a simplified version - good enough for our use case
  const gamma1 = gammaRandom(alpha);
  const gamma2 = gammaRandom(beta);
  return gamma1 / (gamma1 + gamma2);
}

/**
 * Sample from Gamma distribution (helper for Beta sampling)
 */
function gammaRandom(shape) {
  // Marsaglia and Tsang method
  if (shape < 1) {
    return gammaRandom(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }
  
  const d = shape - 1/3;
  const c = 1 / Math.sqrt(9 * d);
  
  while (true) {
    let x, v;
    do {
      x = gaussianRandom();
      v = 1 + c * x;
    } while (v <= 0);
    
    v = v * v * v;
    const u = Math.random();
    
    if (u < 1 - 0.0331 * x * x * x * x) {
      return d * v;
    }
    
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

/**
 * Generate Gaussian random number (Box-Muller transform)
 */
function gaussianRandom() {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Update RL state based on test result
 */
function updateRLState(team, score) {
  const success = score >= 40; // Consider 40%+ as success
  
  // Update animals
  team.animals.forEach(animal => {
    if (rlState.animals[animal]) {
      if (success) {
        rlState.animals[animal].alpha += 1;
      } else {
        rlState.animals[animal].beta += 1;
      }
      rlState.animals[animal].samples += 1;
      const total = rlState.animals[animal].alpha + rlState.animals[animal].beta;
      rlState.animals[animal].successRate = rlState.animals[animal].alpha / total;
    }
  });
  
  // Update weapons
  team.weapons.forEach(weapon => {
    if (!rlState.weapons[weapon]) {
      rlState.weapons[weapon] = { alpha: ALPHA, beta: BETA, successRate: 0, samples: 0 };
    }
    if (success) {
      rlState.weapons[weapon].alpha += 1;
    } else {
      rlState.weapons[weapon].beta += 1;
    }
    rlState.weapons[weapon].samples += 1;
    const total = rlState.weapons[weapon].alpha + rlState.weapons[weapon].beta;
    rlState.weapons[weapon].successRate = rlState.weapons[weapon].alpha / total;
  });
  
  // Update formation
  if (rlState.formations[team.formation]) {
    if (success) {
      rlState.formations[team.formation].alpha += 1;
    } else {
      rlState.formations[team.formation].beta += 1;
    }
    rlState.formations[team.formation].samples += 1;
    const total = rlState.formations[team.formation].alpha + rlState.formations[team.formation].beta;
    rlState.formations[team.formation].successRate = rlState.formations[team.formation].alpha / total;
  }
  
  // Update animal pairs
  for (let i = 0; i < team.animals.length; i++) {
    for (let j = i + 1; j < team.animals.length; j++) {
      const pair = [team.animals[i], team.animals[j]].sort().join('+');
      if (!rlState.animalPairs[pair]) {
        rlState.animalPairs[pair] = { alpha: ALPHA, beta: BETA, successRate: 0, samples: 0 };
      }
      if (success) {
        rlState.animalPairs[pair].alpha += 1;
      } else {
        rlState.animalPairs[pair].beta += 1;
      }
      rlState.animalPairs[pair].samples += 1;
      const total = rlState.animalPairs[pair].alpha + rlState.animalPairs[pair].beta;
      rlState.animalPairs[pair].successRate = rlState.animalPairs[pair].alpha / total;
    }
  }
  
  // Track best team
  rlState.totalTeamsTested++;
  if (score > rlState.bestScore) {
    rlState.bestScore = score;
    rlState.bestTeam = team;
  }
}

/**
 * Generate team using Thompson Sampling
 */
function generateTeamRL(weapons) {
  // Explore vs exploit decision
  const explore = Math.random() < EXPLORATION_RATE;
  
  if (explore) {
    // Pure exploration - random team
    return generateRandomTeam(weapons);
  }
  
  // Exploitation - use Thompson Sampling
  
  // 1. Select formation by sampling from Beta distributions
  const formationScores = FORMATIONS.map(f => {
    const stats = rlState.formations[f.name];
    return {
      formation: f,
      score: sampleBeta(stats.alpha, stats.beta)
    };
  });
  const selectedFormation = formationScores.sort((a, b) => b.score - a.score)[0].formation;
  
  // 2. Select animals for each role
  const selectedAnimals = [];
  
  for (const role of selectedFormation.roles) {
    // Get animals that can fulfill this role
    const candidateAnimals = Object.entries(ANIMAL_ROLES)
      .filter(([animal, roles]) => roles.includes(role))
      .filter(([animal]) => !selectedAnimals.includes(animal)) // No duplicates
      .map(([animal]) => animal);
    
    if (candidateAnimals.length === 0) continue;
    
    // Sample from Beta distributions
    const animalScores = candidateAnimals.map(animal => {
      const stats = rlState.animals[animal];
      return {
        animal,
        score: sampleBeta(stats.alpha, stats.beta)
      };
    });
    
    const selected = animalScores.sort((a, b) => b.score - a.score)[0].animal;
    selectedAnimals.push(selected);
  }
  
  if (selectedAnimals.length < 3) {
    // Fallback to random if we couldn't fill all roles
    return generateRandomTeam(weapons);
  }
  
  // 3. Select weapons (best available for each animal)
  const selectedWeapons = [];
  const selectedWeaponNames = [];
  
  for (const animal of selectedAnimals) {
    // Get compatible weapons for this animal
    const compatibleWeapons = weapons.filter(w => isCompatibleRL(w, animal));
    
    if (compatibleWeapons.length === 0) continue;
    
    // Sample from Beta distributions
    const weaponScores = compatibleWeapons
      .filter(w => !selectedWeapons.includes(w.code)) // No duplicates
      .map(w => {
        const stats = rlState.weapons[w.code] || { alpha: ALPHA, beta: BETA };
        return {
          weapon: w,
          score: sampleBeta(stats.alpha, stats.beta)
        };
      });
    
    if (weaponScores.length === 0) continue;
    
    const selected = weaponScores.sort((a, b) => b.score - a.score)[0].weapon;
    selectedWeapons.push(selected.code);
    selectedWeaponNames.push(selected.name);
  }
  
  if (selectedWeapons.length < 3) {
    return generateRandomTeam(weapons);
  }
  
  return {
    animals: selectedAnimals,
    weapons: selectedWeapons,
    weaponNames: selectedWeaponNames,
    formation: selectedFormation.name,
    method: 'thompson_sampling'
  };
}

/**
 * Generate random team (exploration)
 */
function generateRandomTeam(weapons) {
  const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  const animals = [];
  
  // Select animals for each role
  for (const role of formation.roles) {
    const candidates = Object.entries(ANIMAL_ROLES)
      .filter(([animal, roles]) => roles.includes(role))
      .filter(([animal]) => !animals.includes(animal))
      .map(([animal]) => animal);
    
    if (candidates.length > 0) {
      animals.push(candidates[Math.floor(Math.random() * candidates.length)]);
    }
  }
  
  // Select weapons
  const selectedWeapons = [];
  const selectedWeaponNames = [];
  
  for (const animal of animals) {
    const compatible = weapons.filter(w => 
      isCompatibleRL(w, animal) && !selectedWeapons.includes(w.code)
    );
    
    if (compatible.length > 0) {
      const weapon = compatible[Math.floor(Math.random() * compatible.length)];
      selectedWeapons.push(weapon.code);
      selectedWeaponNames.push(weapon.name);
    }
  }
  
  return {
    animals,
    weapons: selectedWeapons,
    weaponNames: selectedWeaponNames,
    formation: formation.name,
    method: 'random_exploration'
  };
}

/**
 * Check weapon-animal compatibility (simplified)
 */
function isCompatibleRL(weapon, animal) {
  const weaponName = weapon.name.toLowerCase();
  const roles = ANIMAL_ROLES[animal] || [];
  
  // Physical weapons for attackers
  if ((weaponName.includes('sword') || weaponName.includes('bow') || weaponName.includes('scythe') || weaponName.includes('axe')) 
      && roles.includes('attacker')) {
    return true;
  }
  
  // Magical weapons for healers/attackers
  if ((weaponName.includes('staff') || weaponName.includes('wand') || weaponName.includes('scepter'))
      && (roles.includes('healer') || roles.includes('attacker') || roles.includes('replenisher'))) {
    return true;
  }
  
  // Tank weapons for tanks
  if ((weaponName.includes('aegis') || weaponName.includes('shield') || weaponName.includes('banner') || weaponName.includes('defender'))
      && roles.includes('tank')) {
    return true;
  }
  
  // Universal weapons
  if (weaponName.includes('rune') || weaponName.includes('orb')) {
    return true;
  }
  
  return false;
}

/**
 * Check if team was already tested
 */
function isTeamTested(results, team) {
  return results.some(r => {
    const sameAnimals = JSON.stringify((r.combination?.animals || []).sort()) === JSON.stringify(team.animals.sort());
    const sameWeapons = JSON.stringify((r.combination?.weapons || []).sort()) === JSON.stringify(team.weapons.sort());
    return sameAnimals && sameWeapons;
  });
}

/**
 * Get random delay
 */
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Import testing functions from main tester
async function createSandboxTeam(channel) {
  log('Creating sandbox team...');
  await channel.send('n t c sandbox');
  await sleep(config.delays.betweenCommands);
}

async function updateTeamPosition(channel, position, animal, weaponCode) {
  const addCommand = `n t add ${position} ${DEFAULT_LEVEL} ${animal} ${weaponCode}`;
  log(`  Setting position ${position}: ${animal} with ${weaponCode}`);
  await channel.send(addCommand);
  
  const delay = randomDelay(4000, 6000);
  log(`  Waiting ${(delay / 1000).toFixed(1)}s...`);
  await sleep(delay);
}

async function runBattles(channel) {
  log('Running nb all...');
  await channel.send('nb all');
  await sleep(config.delays.betweenBattles + 2000);
}

function getMessageContent(message) {
  let allContent = [];
  
  if (message.content) {
    allContent.push(message.content);
  }
  
  if (message.embeds && message.embeds.length > 0) {
    message.embeds.forEach(embed => {
      if (embed.description) allContent.push(embed.description);
      if (embed.title) allContent.push(embed.title);
      if (embed.footer && embed.footer.text) allContent.push(embed.footer.text);
      if (embed.fields) {
        embed.fields.forEach(field => {
          if (field.name) allContent.push(field.name);
          if (field.value) allContent.push(field.value);
        });
      }
    });
  }
  
  return allContent.join('\n');
}

function parseBattleResults(messages) {
  const results = {};
  let totalWins = 0;
  let totalTies = 0;
  let totalLosses = 0;
  
  messages.forEach(msg => {
    if (msg.author.id !== NEONUTIL_BOT_ID) return;
    
    const content = getMessageContent(msg);
    
    // Parse individual battle results from embeds
    if (msg.embeds && msg.embeds.length > 0) {
      msg.embeds.forEach(embed => {
        if (!embed.footer || !embed.footer.text) return;
        
        const footerText = embed.footer.text;
        const templateMatch = footerText.match(/vs\.\s+(.+)/);
        if (!templateMatch) return;
        
        const template = templateMatch[1].trim();
        const title = embed.title || '';
        
        if (title.toLowerCase().includes('win')) {
          results[template] = 'win';
          totalWins++;
        } else if (title.toLowerCase().includes('tie')) {
          results[template] = 'tie';
          totalTies++;
        } else if (title.toLowerCase().includes('loss') || title.toLowerCase().includes('lost')) {
          results[template] = 'loss';
          totalLosses++;
        }
      });
    }
  });
  
  return { results, totalWins, totalTies, totalLosses };
}

/**
 * Main RL testing routine
 */
async function runRLTests() {
  client.once('ready', async () => {
    log(`RL Tester logged in as ${client.user.tag}`);
    log(`Using RL channel: ${RL_CHANNEL_ID}`);
    log(`Using separate token for parallel testing\n`);
    
    const channel = await client.channels.fetch(RL_CHANNEL_ID);
    if (!channel) {
      log('ERROR: Could not find RL channel');
      return;
    }
    
    // Load weapons
    log('Loading weapons...');
    const weapons = loadWeapons();
    log(`Loaded ${weapons.length} weapons`);
    
    // Initialize RL state
    initializeRLState();
    
    // Load existing results
    const results = loadRLResults();
    log(`Starting with ${results.length} previously tested teams\n`);
    
    // Create sandbox team
    await createSandboxTeam(channel);
    
    log('🤖 RL TESTER STARTED - Thompson Sampling Algorithm');
    log(`Exploration rate: ${EXPLORATION_RATE * 100}%`);
    log(`Target: Find 70%+ teams faster than exhaustive search\n`);
    
    let teamCount = results.length;
    
    // Main testing loop
    while (true) {
      try {
        teamCount++;
        
        // Generate team using RL
        const team = generateTeamRL(weapons);
        
        // Check if already tested
        if (isTeamTested(results, team)) {
          log(`Team already tested, generating new one...`);
          continue;
        }
        
        // Log progress
        if (teamCount % 10 === 0) {
          const topAnimals = Object.entries(rlState.animals)
            .filter(([_, v]) => v.samples >= MIN_SAMPLES)
            .sort((a, b) => b[1].successRate - a[1].successRate)
            .slice(0, 3)
            .map(([name, stats]) => `${name}(${(stats.successRate * 100).toFixed(1)}%)`)
            .join(', ');
          
          log(`\n[${teamCount}] Method: ${team.method}`);
          log(`  Formation: ${team.formation}`);
          log(`  Top animals: ${topAnimals || 'Learning...'}`);
          log(`  Best so far: ${rlState.bestScore.toFixed(2)}%`);
        }
        
        log(`\nTesting: ${team.animals.join('/')} - ${team.formation}`);
        
        // Build team
        for (let i = 0; i < 3; i++) {
          await updateTeamPosition(channel, i + 1, team.animals[i], team.weapons[i]);
        }
        
        log('Team built, starting battles against all templates...');
        
        // Run battles
        await runBattles(channel);
        await sleep(10000); // Wait longer for all results
        
        // Parse results
        const recentMessages = await channel.messages.fetch({ limit: 50 });
        const { results: battleResults, totalWins, totalTies, totalLosses } = parseBattleResults(Array.from(recentMessages.values()));
        
        const total = totalWins + totalTies + totalLosses;
        const score = total > 0 ? ((totalWins + totalTies) / total * 100) : 0;
        
        log(`Result: ${score.toFixed(2)}% (${totalWins}W/${totalTies}T/${totalLosses}L across ${total} templates)`);
        
        // Update RL state
        updateRLState(team, score);
        
        // Save result
        const result = {
          combination: {
            animals: team.animals,
            weapons: team.weapons,
            weaponNames: team.weaponNames,
            _meta: {
              formation: team.formation,
              method: team.method,
              totalGenerated: teamCount
            }
          },
          totalWins,
          totalTies,
          totalLosses,
          winRate: total > 0 ? (totalWins / total * 100) : 0,
          tieRate: total > 0 ? (totalTies / total * 100) : 0,
          templateResults: Object.entries(battleResults).map(([template, result]) => ({
            template,
            wins: result === 'win' ? 1 : 0,
            ties: result === 'tie' ? 1 : 0,
            losses: result === 'loss' ? 1 : 0
          }))
        };
        
        results.push(result);
        
        // Save every 10 teams
        if (teamCount % 10 === 0) {
          saveRLResults(results);
          log(`Progress saved (${teamCount} teams tested via RL)`);
        }
        
        // Break before next team
        log(`Taking ${(config.delays.betweenTeams / 1000).toFixed(1)}s break before next team...`);
        await sleep(config.delays.betweenTeams);
        
      } catch (error) {
        log(`Error in testing loop: ${error.message}`);
        log('Waiting 30s before retry...');
        await sleep(30000);
      }
    }
  });
  
  // Use separate RL token
  if (!RL_TOKEN) {
    console.error('ERROR: RL_DISCORD_TOKEN not found in .env file!');
    console.error('Add RL_DISCORD_TOKEN=your_token to .env');
    process.exit(1);
  }
  
  await client.login(RL_TOKEN);
}

// Start RL testing
runRLTests().catch(console.error);
