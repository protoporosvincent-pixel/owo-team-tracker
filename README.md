# OwO NeonUtil Team Optimizer

A Discord selfbot that automates testing of OwO team combinations using NeonUtil to find the optimal setup.

## ⚠️ WARNING
Selfbots violate Discord's Terms of Service. Use at your own risk. Your account may be banned.

## Features

- **Phase 1: Weapon Parser** (CURRENT)
  - Automatically parses all your weapons from OwO
  - Handles pagination to get all pages
  - Filters for epic and mythic weapons only
  - Saves to JSON for later use

- **Phase 2: Team Testing** (TODO)
  - Generate all valid team combinations
  - Automate battle testing against all NeonUtil templates
  - Calculate win rates
  - Find optimal team composition

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your credentials:
```bash
cp .env.example .env
# Edit .env with your Discord token and IDs
```

3. Get your Discord token:
   - Open Discord in browser (desktop app won't work)
   - Press F12 to open Developer Tools
   - Go to Network tab
   - Type a message anywhere
   - Look for "messages" request
   - In headers, find "authorization" - that's your token

4. Get IDs:
   - Enable Developer Mode in Discord settings
   - Right-click on your username → Copy ID (YOUR_USER_ID)
   - Right-click on the channel → Copy ID (CHANNEL_ID)
   - Right-click on NeonUtil bot → Copy ID (NEONUTIL_BOT_ID)

## Usage

### 1. Parse Your Weapons
```bash
npm run parse-weapons
```

This will:
1. Send `ww` command to OwO
2. Click through all pagination buttons
3. Parse all epic/mythic weapons
4. Save to `weapons.json`

### 2. Test Team Combinations
```bash
npm run test-teams
```

This will:
1. Load weapons from `weapons.json`
2. Generate smart combinations (top weapons + random animal combos)
3. For each combination:
   - Create sandbox team in NeonUtil (`n t c sandbox`)
   - Add 3 animals with weapons
   - Battle against ALL templates (54 templates)
   - Calculate win rate
   - Clear team and move to next
4. Save results to `test_results.json`
5. Show top 10 best teams

**Note:** This takes a LONG time! With default settings:
- Testing 15 top weapons with 50 animal combos = ~22,750 combinations
- Each combination battles 54 templates = ~1.2 million battles
- At 3 seconds per battle = ~1,000+ hours

**Recommended approach:**
- Start with smaller test (edit `neonutilTester.js` line 222)
- Use `generateSmartCombinations(weapons, 10, 20)` for quick test
- This tests: 10 best weapons × 20 animal combos = ~2,400 combinations (~3-4 hours)

### Configuration

Edit `.env` file:
```env
DISCORD_TOKEN=your_token_here
YOUR_USER_ID=your_user_id
OWO_BOT_ID=408785106942164992
NEONUTIL_BOT_ID=neonutil_bot_id
CHANNEL_ID=your_channel_id
```

## Project Structure

```
├── src/
│   ├── config.js          # Configuration loader
│   ├── utils.js           # Helper functions
│   ├── parseWeapons.js    # Weapon parser script
│   └── index.js           # Main bot (TODO)
├── .env                   # Your credentials (gitignored)
├── weapons.json           # Parsed weapons (generated)
└── package.json
```

## Roadmap

- [x] Basic selfbot setup
- [x] Weapon parsing with pagination
- [x] Filter epic/mythic weapons
- [x] Generate team combinations
- [x] Build teams in NeonUtil
- [x] Battle all templates automatically
- [x] Win rate calculation
- [x] Progress tracking & resume capability
- [x] Results reporting with top teams
- [ ] Optimize combinations (genetic algorithm?)
- [ ] Parallel testing with multiple accounts
- [ ] Web dashboard for results

## Notes

- The bot includes rate limiting to reduce ban risk
- All progress is saved to JSON files
- You can stop and resume at any time
- Estimated runtime: ~22 days for full testing (with 78 epic weapons, 20 animals)

## License

ISC
