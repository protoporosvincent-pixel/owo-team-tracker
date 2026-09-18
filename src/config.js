import dotenv from 'dotenv';
dotenv.config();

export const config = {
  discordToken: process.env.DISCORD_TOKEN,
  yourUserId: process.env.YOUR_USER_ID,
  owoBotId: process.env.OWO_BOT_ID || '408785106942164992',
  neonutilBotId: process.env.NEONUTIL_BOT_ID,
  channelId: process.env.CHANNEL_ID,
  
  // Delays to avoid rate limiting (in milliseconds)
  delays: {
    betweenCommands: 2000,       // 2 seconds - safer for NeonUtil cooldown
    betweenPages: 1500,          // 1.5 seconds between pagination clicks
    betweenBattles: 3000,        // 3 seconds - give NeonUtil breathing room
    afterMessageSent: 1000,      // 1 second after sending message
    betweenWeaponChecks: 3000    // 3 seconds between owo weapon commands (avoid cooldown)
  }
};
