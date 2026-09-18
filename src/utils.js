/**
 * Utility functions for the bot
 */

/**
 * Sleep for a specified amount of time
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for a message from a specific bot
 * @param {Client} client - Discord client
 * @param {string} channelId - Channel to listen in
 * @param {string} botId - Bot user ID to listen for
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Message>}
 */
export function waitForBotMessage(client, channelId, botId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      client.removeListener('messageCreate', handler);
      reject(new Error('Timeout waiting for bot response'));
    }, timeout);

    const handler = (message) => {
      // Debug: log all messages in the channel
      if (message.channelId === channelId) {
        console.log(`[DEBUG] Message from ${message.author.username} (${message.author.id})`);
        console.log(`[DEBUG] Looking for bot ID: ${botId}`);
      }
      
      if (message.channelId === channelId && message.author.id === botId) {
        clearTimeout(timer);
        client.removeListener('messageCreate', handler);
        resolve(message);
      }
    };

    client.on('messageCreate', handler);
  });
}

/**
 * Parse weapon data from message content or embed
 * @param {string} content - Message content or embed description
 * @returns {Array} Array of weapon objects
 */
export function parseWeapons(content) {
  const weapons = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.includes('Weapon Filters') || line.includes('Sort by')) {
      continue;
    }
    
    // Match weapon format: `CODE` <:rarity:id><:weapon:id>... **Name** X%
    const weaponMatch = line.match(/`([A-Z0-9]{6})`\s+(.+?)\s+\*\*(.*?)\*\*\s+([\d.]+)%/);
    
    if (weaponMatch) {
      const [, code, emojiPart, name, percentage] = weaponMatch;
      
      // Check for epic or mythic in the emoji part
      const isEpic = emojiPart.includes('<:epic:') || emojiPart.includes('<a:epic:');
      const isMythic = emojiPart.includes('<:mythic:') || emojiPart.includes('<a:mythic:');
      
      // Only keep epic and mythic
      if (isEpic || isMythic) {
        // Extract equipped animal if present
        let equippedTo = null;
        if (line.includes('➤')) {
          const animalMatch = line.match(/➤\s+<[a:]?\w+:\d+>\s+(\w+)/);
          if (animalMatch) {
            equippedTo = animalMatch[1];
          }
        }
        
        weapons.push({
          code,
          rarity: isMythic ? 'mythic' : 'epic',
          name: name.trim(),
          percentage: parseFloat(percentage),
          equippedTo,
          rawLine: line.trim()
        });
      }
    }
  }
  
  return weapons;
}

/**
 * Log with timestamp
 * @param {string} message - Message to log
 */
export function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}
