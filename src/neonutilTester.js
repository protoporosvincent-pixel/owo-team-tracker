import { Client } from 'discord.js-selfbot-v13';
import { config } from './config.js';
import { sleep, waitForBotMessage, log } from './utils.js';
import { TEMPLATES, DEFAULT_LEVEL } from './constants.js';
import { loadWeapons, generateMetaTeams } from './teamGenerator.js';
import fs from 'fs';

const client = new Client();

/**
 * Create an empty sandbox team in NeonUtil
 */
async function createSandboxTeam(channel) {
  log('Creating sandbox team...');
  await channel.send('n t c sandbox');
  await sleep(config.delays.betweenCommands);
}

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
 * Add an animal to the team
 * @param {TextChannel} channel - Discord channel
 * @param {number} pos - Position (1, 2, or 3)
 * @param {string} animal - Animal name
 * @param {string} weaponCode - Weapon code
 */
async function addTeamMember(channel, pos, animal, weaponCode) {
  const addCommand = `n t add ${pos} ${DEFAULT_LEVEL} ${animal} ${weaponCode}`;
  
  // Just send the command once - overwrites existing position
  log(`Updating position ${pos}: ${animal} with weapon ${weaponCode}`);
  await channel.send(addCommand);
  
  // VERY long delay - 4-6 seconds to avoid global rate limit
  const delay = randomDelay(4000, 6000);
  log(`  Waiting ${(delay / 1000).toFixed(1)}s...`);
  await sleep(delay);
}

/**
 * Remove all team members
 * @param {TextChannel} channel - Discord channel
 */
async function clearTeam(channel) {
  // Skip clearing - we'll just overwrite positions with new members
  log('Skipping team clear (will overwrite positions)');
}

/**
 * Parse battle results from NeonUtil response
 * @param {string} content - Message content
 * @returns {Object} Battle results {wins, losses, ties}
 */
function parseBattleResults(content) {
  // Look for pattern like "🎲 1 win, 1 tie, 48 losses" or "🎲 32 ties, 18 losses" or "🎲 50 losses"
  const match = content.match(/🎲\s*(?:(\d+)\s*wins?)?\s*(?:,?\s*(\d+)\s*ties?)?\s*(?:,?\s*(\d+)\s*losses?)?/i);
  
  if (match) {
    const wins = match[1] ? parseInt(match[1]) : 0;
    const ties = match[2] ? parseInt(match[2]) : 0;
    const losses = match[3] ? parseInt(match[3]) : 0;
    
    return { wins, ties, losses };
  }
  
  // Alternative pattern: Check for explicit text like "Battle was too long! It's a tie!"
  if (content.includes("It's a tie") || content.includes("tie!")) {
    // Look for any numbers near ties/losses/wins
    const tiesMatch = content.match(/(\d+)\s*ties?/i);
    const lossesMatch = content.match(/(\d+)\s*losses?/i);
    const winsMatch = content.match(/(\d+)\s*wins?/i);
    
    return {
      wins: winsMatch ? parseInt(winsMatch[1]) : 0,
      ties: tiesMatch ? parseInt(tiesMatch[1]) : 0,
      losses: lossesMatch ? parseInt(lossesMatch[1]) : 0
    };
  }
  
  return { wins: 0, ties: 0, losses: 0 };
}

/**
 * Extract content from message (handles embeds, TEXT_DISPLAY, and all component types)
 * @param {Message} message - Discord message
 * @returns {string} Message content
 */
function getMessageContent(message) {
  let allContent = [];
  
  // Try regular message content first
  if (message.content) {
    allContent.push(message.content);
  }
  
  // Try embeds
  if (message.embeds && message.embeds.length > 0) {
    for (const embed of message.embeds) {
      if (embed.description) allContent.push(embed.description);
      // IMPORTANT: Extract field names AND values - win/loss data is often in fields!
      if (embed.fields && embed.fields.length > 0) {
        embed.fields.forEach(f => {
          if (f.name) allContent.push(f.name);
          if (f.value) allContent.push(f.value);
        });
      }
      // CRITICAL: Extract footer - this is where win/loss stats are!
      if (embed.footer && embed.footer.text) {
        allContent.push(embed.footer.text);
      }
    }
  }
  
  // Try ALL component types - recursively extract text
  if (message.components && message.components.length > 0) {
    const extractFromComponents = (components) => {
      for (const comp of components) {
        // Extract any text content
        if (comp.content) {
          if (typeof comp.content === 'string') {
            allContent.push(comp.content);
          } else if (comp.content && comp.content.content) {
            allContent.push(comp.content.content);
          }
        }
        
        // Extract label
        if (comp.label) {
          allContent.push(comp.label);
        }
        
        // Extract text
        if (comp.text) {
          allContent.push(comp.text);
        }
        
        // Recursively check nested components
        if (comp.components && comp.components.length > 0) {
          extractFromComponents(comp.components);
        }
      }
    };
    
    extractFromComponents(message.components);
  }
  
  return allContent.join('\n');
}

/**
 * Battle against ALL templates at once using "nb all"
 * @param {TextChannel} channel - Discord channel
 * @param {number} iterations - Number of times to run nb all (for more samples)
 * @returns {Object} Aggregated battle results per template
 */
async function battleAllTemplates(channel, iterations = 1) {
  log(`Running nb all (${iterations} iteration)...`);
  
  const allResults = {};
  
  for (let iter = 0; iter < iterations; iter++) {
    log(`  Iteration ${iter + 1}/${iterations}...`);
    
    await channel.send('nb all');
    
    // Wait for response
    await sleep(randomDelay(5000, 7000));
    
    // Fetch recent messages to find NeonUtil's response
    try {
      const messages = await channel.messages.fetch({ limit: 3 });
      const response = messages.find(m => m.author.id === config.neonutilBotId);
      
      if (!response) {
        log(`Warning: Could not find response from NeonUtil for iteration ${iter + 1}`);
        continue;
      }
      
      const content = getMessageContent(response);
      
      // Parse all template results from the response
      // Format uses Discord custom emojis: "<:loss:...> **Template-Name** — You lost in X turns!"
      // or "<:win:...> **Template-Name** — You won in X turns!"
      // or "<:tie:...> **Template-Name** — Battle was too long! It's a tie!"
      const lines = content.split('\n');
      
      let matchCount = 0;
      for (const line of lines) {
        // Look for win/loss/tie lines with custom emojis
        const winMatch = line.match(/<:(?:win|victory):[^>]+>\s*\*\*([^*]+)\*\*\s*[—\-–]\s*You won in \d+ turns!/i);
        const lossMatch = line.match(/<:(?:loss|defeat):[^>]+>\s*\*\*([^*]+)\*\*\s*[—\-–]\s*You lost in \d+ turns!/i);
        const tieMatch = line.match(/<:(?:tie|draw):[^>]+>\s*\*\*([^*]+)\*\*\s*[—\-–]\s*Battle was too long! It's a tie!/i);
        
        if (winMatch) {
          const templateName = winMatch[1].trim();
          if (!allResults[templateName]) {
            allResults[templateName] = { wins: 0, losses: 0, ties: 0 };
          }
          allResults[templateName].wins++;
          matchCount++;
          if (iter === 0) log(`    ✅ ${templateName} - WIN`);
        } else if (lossMatch) {
          const templateName = lossMatch[1].trim();
          if (!allResults[templateName]) {
            allResults[templateName] = { wins: 0, losses: 0, ties: 0 };
          }
          allResults[templateName].losses++;
          matchCount++;
        } else if (tieMatch) {
          const templateName = tieMatch[1].trim();
          if (!allResults[templateName]) {
            allResults[templateName] = { wins: 0, losses: 0, ties: 0 };
          }
          allResults[templateName].ties++;
          matchCount++;
        }
      }
      
      log(`  Found ${matchCount} battles in iteration ${iter + 1}`);
      
    } catch (error) {
      log(`Error fetching battle results for iteration ${iter + 1}: ${error.message}`);
    }
    
    // Small delay between iterations
    if (iter < iterations - 1) {
      await sleep(randomDelay(3000, 5000));
    }
  }
  
  log(`Parsed ${Object.keys(allResults).length} unique templates`);
  return allResults;
}

/**
 * Test a team combination against all templates using "nb all"
 * @param {TextChannel} channel - Discord channel
 * @param {Object} combination - Team combination {animals, weapons, weaponNames}
 * @returns {Object} Test results with win rate
 */
async function testCombination(channel, combination) {
  try {
    // Build the team
    for (let i = 0; i < 3; i++) {
      await addTeamMember(channel, i + 1, combination.animals[i], combination.weapons[i]);
    }
    
    // Take a break after building team before starting battles
    log('Team built, starting battles against all templates...');
    await sleep(randomDelay(3000, 5000));
    
    // Battle all templates at once (run 1 time - fast but less sample size)
    const allResults = await battleAllTemplates(channel, 1);
    
    // Calculate totals
    let totalWins = 0;
    let totalLosses = 0;
    let totalTies = 0;
    const templateResults = [];
    
    for (const [templateName, results] of Object.entries(allResults)) {
      totalWins += results.wins;
      totalLosses += results.losses;
      totalTies += results.ties;
      
      templateResults.push({
        template: templateName,
        wins: results.wins,
        losses: results.losses,
        ties: results.ties
      });
    }
    
    // Calculate win rate
    const totalBattles = totalWins + totalLosses + totalTies;
    const winRate = totalBattles > 0 ? (totalWins / totalBattles) * 100 : 0;
    const tieRate = totalBattles > 0 ? (totalTies / totalBattles) * 100 : 0;
    
    log(`Team tested: ${combination.animals.join('/')} - Win rate: ${winRate.toFixed(2)}%, Tie rate: ${tieRate.toFixed(2)}% (${totalWins}W/${totalLosses}L/${totalTies}T across ${templateResults.length} templates)`);
    
    // Clear team for next combination
    await clearTeam(channel);
    
    // Take a break between teams
    const teamBreak = randomDelay(8000, 12000);
    log(`Taking ${(teamBreak / 1000).toFixed(1)}s break before next team...\n`);
    await sleep(teamBreak);
    
    return {
      combination,
      totalWins,
      totalLosses,
      totalTies,
      winRate,
      tieRate,
      templateResults
    };
  } catch (error) {
    log(`Error testing combination: ${error.message}`);
    // Try to clear team anyway
    try {
      await clearTeam(channel);
    } catch (e) {
      log(`Error clearing team: ${e.message}`);
    }
    return null;
  }
}

/**
 * Main testing function
 */
async function runTests() {
  try {
    const channel = await client.channels.fetch(config.channelId);
    
    // Load weapons
    log('Loading weapons...');
    const weapons = loadWeapons();
    log(`Loaded ${weapons.length} weapons`);
    
    // Generate combinations
    log('Generating team combinations...');
    // Use META formations (Holy Trinity, Blitz, Stall, etc.)
    // Only generates teams that follow actual OwO meta strategies
    const combinationGenerator = generateMetaTeams(weapons);
    
    log('Teams based on META formations (Holy Trinity, Blitz, Stall, etc.)');
    log('Each team follows proven strategies with correct roles.\n');
    
    // Create sandbox team
    await createSandboxTeam(channel);
    
    // Load existing results (for resume functionality)
    const results = loadExistingResults();
    let teamCount = results.length;
    let skippedCount = 0;
    
    if (teamCount > 0) {
      log(`\n🔄 RESUMING from ${teamCount} previously tested teams`);
      log(`Will skip already-tested combinations\n`);
    }
    
    // Test all combinations (generated on-the-fly)
    for (const combination of combinationGenerator) {
      // Skip if already tested
      if (isAlreadyTested(results, combination)) {
        skippedCount++;
        if (skippedCount % 100 === 0) {
          log(`Skipped ${skippedCount} already-tested teams...`);
        }
        continue;
      }
      
      teamCount++;
      
      // Log progress every 50 teams
      if (teamCount % 50 === 0) {
        log(`\n[${teamCount}] Testing: ${combination._meta.formation} - ${combination.animals.join('/')}...`);
      } else if (teamCount % 10 === 0) {
        log(`\n[${teamCount}] Testing combination...`);
      }
      
      const result = await testCombination(channel, combination);
      
      if (result) {
        results.push(result);
        
        // Save progress periodically
        if (teamCount % 10 === 0) {
          saveResults(results);
          log(`Progress saved (${teamCount} teams tested)`);
          
          // Auto-push to GitHub every 100 teams
          if (teamCount % 100 === 0) {
            log(`📊 Pushing results to GitHub (${teamCount} teams)...`);
            try {
              const { execSync } = await import('child_process');
              execSync('./pushToGithub.sh', { stdio: 'inherit' });
              log(`✅ Website updated!`);
            } catch (error) {
              log(`⚠️  GitHub push failed (not critical): ${error.message}`);
            }
          }
          
          // Auto-run optimizer every 1000 teams
          if (teamCount % 1000 === 0) {
            log(`\n🤖 Running AI optimizer (${teamCount} teams tested)...`);
            try {
              const { execSync } = await import('child_process');
              execSync('npm run auto-optimize', { stdio: 'inherit' });
              log(`✅ Optimizer completed!`);
            } catch (error) {
              log(`⚠️  Optimizer failed (not critical): ${error.message}`);
            }
          }
        }
      }
    }
    
    // Save final results
    saveResults(results);
    
    // Show statistics
    log(`\n📊 Testing Statistics:`);
    log(`Total teams tested: ${results.length}`);
    log(`Skipped (already tested): ${skippedCount}`);
    log(`New teams this run: ${results.length - loadExistingResults().length + skippedCount}`);
    
    // Show top 10 teams
    const sorted = results.sort((a, b) => b.winRate - a.winRate);
    log('\n========== TOP 10 TEAMS ==========');
    for (let i = 0; i < Math.min(10, sorted.length); i++) {
      const team = sorted[i];
      log(`#${i + 1}: ${team.winRate.toFixed(2)}% win rate, ${team.tieRate.toFixed(2)}% tie rate`);
      log(`  Animals: ${team.combination.animals.join(', ')}`);
      log(`  Weapons: ${team.combination.weaponNames.join(' | ')}`);
      log(`  Record: ${team.totalWins}W / ${team.totalLosses}L / ${team.totalTies}T`);
    }
    
    log('\n✅ Testing completed! Results saved to test_results.json');
    
  } catch (error) {
    log(`Fatal error: ${error.message}`);
    console.error(error);
  }
}

/**
 * Load existing results from file (for resume functionality)
 * @returns {Array} Array of previous results
 */
function loadExistingResults() {
  try {
    if (fs.existsSync('./test_results.json')) {
      const data = fs.readFileSync('./test_results.json', 'utf8');
      const results = JSON.parse(data);
      log(`Found existing results file with ${results.length} teams tested`);
      return results;
    }
  } catch (error) {
    log(`Could not load existing results: ${error.message}`);
  }
  return [];
}

/**
 * Check if a team combination was already tested
 * @param {Array} existingResults - Array of previous results
 * @param {Object} combination - Team combination to check
 * @returns {boolean} True if already tested
 */
function isAlreadyTested(existingResults, combination) {
  return existingResults.some(result => {
    const prevAnimals = result.combination.animals.join(',');
    const prevWeapons = result.combination.weapons.join(',');
    const currAnimals = combination.animals.join(',');
    const currWeapons = combination.weapons.join(',');
    
    return prevAnimals === currAnimals && prevWeapons === currWeapons;
  });
}

/**
 * Save results to JSON file
 * @param {Array} results - Array of test results
 */
function saveResults(results) {
  const outputPath = './test_results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
}

// Main execution
client.on('ready', async () => {
  log(`Logged in as ${client.user.tag}`);
  
  try {
    await runTests();
    log('All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    log('Testing failed!');
    console.error(error);
    process.exit(1);
  }
});

client.login(config.discordToken);
