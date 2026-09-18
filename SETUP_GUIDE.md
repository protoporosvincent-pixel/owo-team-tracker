# Quick Setup Guide

## Step 1: Get Your Discord Token

1. Open Discord in **Chrome/Firefox** (NOT the desktop app)
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Paste this and press Enter:
   ```javascript
   (webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
   ```
5. Copy the token that appears (it's a long string)

## Step 2: Get Discord IDs

1. Enable **Developer Mode**:
   - User Settings → Advanced → Enable Developer Mode

2. Get your User ID:
   - Right-click your username → Copy User ID

3. Get Channel ID:
   - Right-click the channel where you'll run commands → Copy Channel ID

4. Get NeonUtil Bot ID:
   - Right-click NeonUtil bot → Copy User ID

## Step 3: Configure the Bot

1. Copy the example config:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your values:
   ```env
   DISCORD_TOKEN=paste_your_token_here
   YOUR_USER_ID=your_user_id_here
   OWO_BOT_ID=408785106942164992
   NEONUTIL_BOT_ID=paste_neonutil_id_here
   CHANNEL_ID=paste_channel_id_here
   ```

## Step 4: Run the Weapon Parser

```bash
npm run parse-weapons
```

**What it does:**
1. Logs into Discord as you
2. Sends `ww` command in your chosen channel
3. Clicks through ALL pages automatically
4. Parses only epic (:epic:) and mythic (:mythic:) weapons
5. Saves everything to `weapons.json`

**Expected output:**
```
[timestamp] Logged in as YourName#1234
[timestamp] Starting weapon parsing...
[timestamp] Sending "ww" command...
[timestamp] Waiting for OwO response...
[timestamp] Parsing page 1...
[timestamp] Found 15 epic/mythic weapons on page 1
[timestamp] Pagination buttons detected. Iterating through pages...
[timestamp] Parsing page 2...
...
[timestamp] Total unique epic/mythic weapons found: 78
[timestamp] Mythic: 5
[timestamp] Epic: 73
[timestamp] Weapons saved to ./weapons.json
```

## Step 5: Register Weapons with NeonUtil (ONE-TIME ONLY)

```bash
npm run register-weapons
```

**What it does:**
1. Reads `weapons.json` (from Step 4)
2. Sends `owo weapon <code>` for each weapon
3. Registers them in NeonUtil's database
4. Takes ~3-5 minutes for 50 weapons
5. **Only needs to be done ONCE per weapon set**

**Expected output:**
```
[timestamp] Logged in as YourName#1234
[timestamp] Found 78 weapons to register with NeonUtil
[timestamp] This is a ONE-TIME setup. It will take a few minutes...

[timestamp] Registering top 50 weapons...
[timestamp] [1/50] Registering abc123 - Great Sword (99.9%)
[timestamp] [2/50] Registering def456 - Energy Staff (98.5%)
...
[timestamp] [50/50] Registering xyz789 - Healing Staff (85.2%)

[timestamp] ✅ All weapons registered with NeonUtil!
[timestamp] You can now run "npm run test-teams" to start testing.
```

## Step 6: Start Testing Teams

```bash
npm run test-teams
```

**What it does:**
1. Generates weapon + animal combinations (filtered by compatibility)
2. Creates teams in NeonUtil using `n t add`
3. Tests each team against 54 battle templates
4. Saves results to `test_results.json`

**Expected runtime:**
- ~3 minutes per team
- 200-400 teams with weapon filtering
- **Total: 10-20 hours** (run overnight)

## Troubleshooting

**"Invalid token" error:**
- Your token expired or is incorrect
- Get a fresh token using Step 1

**"Timeout waiting for bot response":**
- OwO bot might be slow or down
- Make sure you're in the correct channel
- Check that OWO_BOT_ID is correct (default: 408785106942164992)

**No pagination / only first page:**
- The button detection might need adjustment
- Check the console for button-related errors
- You might only have one page of weapons (that's fine!)

**Rate limited by Discord:**
- Wait 10-15 minutes
- The delays in config.js can be increased

## Next Steps

Once `weapons.json` is created, you can:
1. Manually review your epic/mythic weapons
2. Move to Phase 2: Team testing (coming next)

## Security Note

⚠️ **NEVER share your .env file or Discord token with anyone!**
- Your token gives FULL access to your Discord account
- Keep `.env` in `.gitignore` (already configured)
- Use a throwaway account if possible
