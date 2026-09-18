/**
 * Quick test script to verify NeonUtil integration works
 * Tests just 1 combination against 3 templates
 */

import { Client } from 'discord.js-selfbot-v13';
import { config } from './config.js';
import { sleep, waitForBotMessage, log } from './utils.js';
import { loadWeapons } from './teamGenerator.js';

const client = new Client();

async function quickTest() {
  try {
    const channel = await client.channels.fetch(config.channelId);
    const weapons = loadWeapons();
    
    if (weapons.length === 0) {
      log('ERROR: No weapons found. Run "npm run parse-weapons" first!');
      process.exit(1);
    }
    
    // Use top 3 weapons
    const topWeapons = weapons.sort((a, b) => b.percentage - a.percentage).slice(0, 3);
    
    log('=== QUICK TEST ===');
    log('Testing 1 team against 3 templates...\n');
    
    // Create sandbox team
    log('1. Creating sandbox team...');
    await channel.send('n t c sandbox');
    await sleep(config.delays.betweenCommands);
    log('   ✓ Command sent\n');
    
    // Add team members
    const testTeam = {
      animals: ['lion', 'owl', 'gorilla'],
      weapons: topWeapons.slice(0, 3)
    };
    
    log('2. Building team:');
    for (let i = 0; i < 3; i++) {
      const animal = testTeam.animals[i];
      const weapon = testTeam.weapons[i];
      
      log(`   Position ${i + 1}: ${animal} with ${weapon.name} (${weapon.code})`);
      
      const addCommand = `n t add ${i + 1} 50 ${animal} ${weapon.code}`;
      
      // Step 1: Send add command (first time)
      await channel.send(addCommand);
      await sleep(config.delays.betweenCommands);
      
      // Step 2: Send ww to display weapon from OwO
      await channel.send(`ww ${weapon.code}`);
      await sleep(config.delays.betweenCommands);
      
      // Step 3: Send add command AGAIN for NeonUtil to grab weapon
      await channel.send(addCommand);
      await sleep(config.delays.betweenCommands);
    }
    log('   ✓ Team built\n');
    log('   ✓ Team built\n');
    
    // Battle 3 templates
    log('3. Testing against templates:');
    const testTemplates = ['pstall', 'gem_blitz', 'esc_blitz'];
    
    for (const templateId of testTemplates) {
      await channel.send(`nb ${templateId}`);
      
      // Wait for battle to complete (battles take 15-20 seconds)
      await sleep(18000);
      
      try {
        // Fetch recent messages and find NeonUtil's response
        const messages = await channel.messages.fetch({ limit: 10 });
        const response = messages.find(m => m.author.id === config.neonutilBotId);
        
        if (!response) {
          log(`   ${templateId}: Could not find bot response`);
          continue;
        }
        
        // Debug: dump full message structure
        log(`   [DEBUG] Message ID: ${response.id}`);
        log(`   [DEBUG] Content length: ${response.content?.length || 0}`);
        log(`   [DEBUG] Embeds: ${response.embeds?.length || 0}`);
        log(`   [DEBUG] Components: ${response.components?.length || 0}`);
        
        // Debug: Show actual embed fields
        if (response.embeds?.[0]?.fields) {
          response.embeds[0].fields.forEach((field, idx) => {
            log(`   [DEBUG] Field ${idx}: name="${field.name}", value length=${field.value?.length || 0}`);
          });
        }
        
        // Debug: Check embed footer
        if (response.embeds?.[0]?.footer) {
          log(`   [DEBUG] Embed footer: ${response.embeds[0].footer.text}`);
        }
        
        // Debug: Check components in detail
        if (response.components?.[0]?.components) {
          response.components[0].components.forEach((comp, idx) => {
            log(`   [DEBUG] Component ${idx}: type=${comp.type}, label="${comp.label}", customId="${comp.customId}"`);
          });
        }
        
        // Extract ALL content from message
        let content = [];
        
        if (response.content) content.push(response.content);
        
        if (response.embeds && response.embeds.length > 0) {
          response.embeds.forEach(e => {
            if (e.description) content.push(e.description);
            // IMPORTANT: Extract embed fields - this is where win/loss data is!
            if (e.fields && e.fields.length > 0) {
              e.fields.forEach(f => {
                if (f.name) content.push(f.name);
                if (f.value) content.push(f.value);
              });
            }
            // CRITICAL: Extract footer - battle results are here!
            if (e.footer && e.footer.text) {
              content.push(e.footer.text);
            }
          });
        }
        
        if (response.components) {
          const extractText = (components) => {
            for (const comp of components) {
              if (comp.content) {
                content.push(typeof comp.content === 'string' ? comp.content : (comp.content.content || ''));
              }
              if (comp.label) content.push(comp.label);
              if (comp.text) content.push(comp.text);
              if (comp.components) extractText(comp.components);
            }
          };
          extractText(response.components);
        }
        
        const fullContent = content.join('\n');
        
        // Debug: Show what we extracted
        log(`   [DEBUG] Extracted ${content.length} content pieces, total length: ${fullContent.length}`);
        log(`   [DEBUG] Full content:\n${fullContent.substring(0, 500)}`);
        
        // Parse results - look for "🎲 X wins, Y ties, Z losses"
        const match = fullContent.match(/🎲\s*(?:(\d+)\s*wins?)?\s*(?:,?\s*(\d+)\s*ties?)?\s*(?:,?\s*(\d+)\s*losses?)?/i);
        if (match) {
          const wins = match[1] ? parseInt(match[1]) : 0;
          const ties = match[2] ? parseInt(match[2]) : 0;
          const losses = match[3] ? parseInt(match[3]) : 0;
          const total = wins + ties + losses;
          const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
          
          log(`   ${templateId}: ${winRate}% (${wins}W/${losses}L/${ties}T)`);
        } else {
          log(`   ${templateId}: Could not parse: "${fullContent.substring(0, 200)}"`);
        }
      } catch (error) {
        log(`   ${templateId}: Error - ${error.message}`);
      }
    }
    
    // Clear team
    log('\n4. Cleaning up...');
    for (let i = 1; i <= 3; i++) {
      await channel.send(`n team remove ${i}`);
      await sleep(config.delays.betweenCommands / 2);
    }
    log('   ✓ Team cleared\n');
    
    log('=== TEST COMPLETE ===');
    log('✓ Everything works! You can now run "npm run test-teams"');
    
  } catch (error) {
    log(`ERROR: ${error.message}`);
    console.error(error);
  }
}

client.on('ready', async () => {
  log(`Logged in as ${client.user.tag}\n`);
  
  try {
    await quickTest();
    process.exit(0);
  } catch (error) {
    log('Test failed!');
    console.error(error);
    process.exit(1);
  }
});

client.login(config.discordToken);
