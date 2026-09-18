import { Client } from 'discord.js-selfbot-v13';
import { config } from './config.js';
import { sleep, waitForBotMessage, parseWeapons, log } from './utils.js';
import fs from 'fs';

const client = new Client();

/**
 * Click the next page button on a message
 * @param {Message} message - The message with buttons
 * @returns {Promise<boolean>} True if button was clicked successfully
 */
async function clickNextButton(message) {
  try {
    if (!message.components || message.components.length === 0) {
      return false;
    }
    
    // Try to click by custom ID first
    try {
      await message.clickButton('paged_next');
      return true;
    } catch (error) {
      log(`Error clicking button: ${error.message}`);
      return false;
    }
  } catch (error) {
    log(`Error clicking button: ${error.message}`);
    return false;
  }
}

/**
 * Parse all weapons by going through pagination
 */
async function parseAllWeapons() {
  try {
    const channel = await client.channels.fetch(config.channelId);
    log('Starting weapon parsing...');
    
    // Send ww command
    log('Sending "ww" command...');
    await channel.send('ww');
    await sleep(config.delays.afterMessageSent);
    
    // Wait for OwO bot response
    log('Waiting for OwO response...');
    let message = await waitForBotMessage(client, config.channelId, config.owoBotId, 15000);
    
    let allWeapons = [];
    let pageNumber = 1;
    let maxPages = 30; // Increased to handle 26+ pages of weapons
    
    // Get content from embed, TEXT_DISPLAY component, or message content
    const getContent = (msg) => {
      // Try embeds first (old format)
      if (msg.embeds && msg.embeds.length > 0) {
        return msg.embeds[0].description || msg.embeds[0].fields?.map(f => f.value).join('\n') || '';
      }
      
      // Try TEXT_DISPLAY components (new format)
      if (msg.components && msg.components.length > 0) {
        for (const row of msg.components) {
          if (row.components) {
            for (const comp of row.components) {
              if (comp.type === 'TEXT_DISPLAY') {
                // comp.content might be a string or an object with {type, content}
                if (typeof comp.content === 'string') {
                  return comp.content;
                } else if (comp.content && comp.content.content) {
                  return comp.content.content;
                }
              }
            }
          }
        }
      }
      
      // Fallback to regular content
      return msg.content || '';
    };
    
    // Debug: log message structure
    log('DEBUG: Message structure:');
    log(`- Has embeds: ${message.embeds?.length || 0}`);
    log(`- Has components: ${message.components?.length || 0}`);
    if (message.embeds?.[0]) {
      log(`- Embed title: ${message.embeds[0].title}`);
      log(`- Embed description length: ${message.embeds[0].description?.length || 0}`);
    }
    if (message.components?.length > 0) {
      const buttons = message.components.flatMap(row => row.components);
      log(`- Button count: ${buttons.length}`);
      buttons.forEach((btn, i) => {
        log(`  Button ${i}: ${btn.emoji?.name || btn.label || 'unknown'}`);
      });
    }
    
    // Parse first page
    log(`Parsing page ${pageNumber}...`);
    const firstPageContent = getContent(message);
    log(`DEBUG: Content type: ${typeof firstPageContent}`);
    log(`DEBUG: Content length: ${firstPageContent?.length || 0}`);
    log(`DEBUG: First page content (first 500 chars):\n${firstPageContent.substring(0, 500)}`);
    const weaponsOnPage = parseWeapons(firstPageContent);
    log(`DEBUG: parseWeapons returned ${weaponsOnPage.length} weapons`);
    allWeapons.push(...weaponsOnPage);
    log(`Found ${weaponsOnPage.length} epic/mythic weapons on page ${pageNumber}`);
    
    // Check if there are pagination buttons
    const hasButtons = message.components && message.components.length > 0;
    
    if (hasButtons) {
      log('Pagination buttons detected. Iterating through pages...');
      log('This may take a while...');
      
      // Track first page content to detect when we loop back
      const firstPageContent = getContent(message);
      let consecutiveEmptyPages = 0;
      const maxConsecutiveEmpty = 3; // Allow 3 consecutive empty pages before stopping
      
      // Keep clicking next until no more pages
      for (let i = 2; i <= maxPages; i++) {
        await sleep(config.delays.betweenPages);
        
        // Try to click the next button
        const clicked = await clickNextButton(message);
        
        if (!clicked) {
          log('Could not click next button. Reached the last page.');
          break;
        }
        
        // Wait for the message to update
        await sleep(config.delays.betweenPages * 2); // Double wait for update
        
        // Fetch the updated message
        try {
          message = await message.channel.messages.fetch(message.id);
          const pageContent = getContent(message);
          
          log(`DEBUG: Page ${i} content length: ${pageContent?.length || 0}`);
          log(`DEBUG: Page ${i} content (first 500 chars):\n${pageContent.substring(0, 500)}`);
          
          // Check if we've looped back to the first page (pagination wrapped around)
          if (pageContent === firstPageContent) {
            log('Detected pagination loop - reached the last page and wrapped back to first.');
            break;
          }
          
          pageNumber++;
          log(`Parsing page ${pageNumber}...`);
          const weaponsOnPage = parseWeapons(pageContent);
          
          log(`DEBUG: Found ${weaponsOnPage.length} epic/mythic weapons on page ${pageNumber}`);
          if (weaponsOnPage.length > 0) {
            log(`DEBUG: First weapon on page: ${weaponsOnPage[0].name}`);
            consecutiveEmptyPages = 0; // Reset counter
          } else {
            consecutiveEmptyPages++;
            log(`DEBUG: Empty page ${consecutiveEmptyPages}/${maxConsecutiveEmpty}`);
          }
          
          // If too many consecutive empty pages, we've probably reached the end
          if (consecutiveEmptyPages >= maxConsecutiveEmpty) {
            log(`${maxConsecutiveEmpty} consecutive pages with no epic/mythic weapons. Stopping.`);
            break;
          }
          
          if (weaponsOnPage.length > 0) {
            allWeapons.push(...weaponsOnPage);
            log(`Found ${weaponsOnPage.length} epic/mythic weapons on page ${pageNumber} (Total so far: ${allWeapons.length})`);
          } else {
            log(`No epic/mythic weapons on page ${pageNumber}, continuing...`);
          }
          
        } catch (error) {
          log(`Error fetching updated message: ${error.message}`);
          break;
        }
      }
    } else {
      log('No pagination buttons found. Only one page of weapons.');
    }
    
    // Remove duplicates (in case of any parsing issues)
    const uniqueWeapons = Array.from(
      new Map(allWeapons.map(w => [w.code, w])).values()
    );
    
    log(`\n========================================`);
    log(`Total unique epic/mythic weapons found: ${uniqueWeapons.length}`);
    log(`Mythic: ${uniqueWeapons.filter(w => w.rarity === 'mythic').length}`);
    log(`Epic: ${uniqueWeapons.filter(w => w.rarity === 'epic').length}`);
    log(`========================================`);
    
    // Save to file
    const outputPath = './weapons.json';
    fs.writeFileSync(outputPath, JSON.stringify(uniqueWeapons, null, 2));
    log(`\nWeapons saved to ${outputPath}`);
    
    // Display summary
    console.log('\n=== WEAPON SUMMARY ===');
    uniqueWeapons.forEach(weapon => {
      const equipped = weapon.equippedTo ? ` ➤ ${weapon.equippedTo}` : '';
      console.log(`${weapon.code} | ${weapon.rarity.toUpperCase().padEnd(6)} | ${weapon.percentage.toFixed(1)}% | ${weapon.name}${equipped}`);
    });
    
    return uniqueWeapons;
    
  } catch (error) {
    log(`Error parsing weapons: ${error.message}`);
    console.error(error);
    throw error;
  }
}

// Main execution
client.on('ready', async () => {
  log(`Logged in as ${client.user.tag}`);
  
  try {
    await parseAllWeapons();
    log('Weapon parsing completed successfully!');
    process.exit(0);
  } catch (error) {
    log('Weapon parsing failed!');
    console.error(error);
    process.exit(1);
  }
});

client.login(config.discordToken);
