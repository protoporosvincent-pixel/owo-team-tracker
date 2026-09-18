# Complete Workflow

## Phase 1: Setup ✅

1. Install dependencies: `npm install`
2. Configure `.env` with your Discord credentials
3. Verify setup with weapon parser

## Phase 2: Parse Weapons ✅

```bash
npm run parse-weapons
```

**What it does:**
- Sends `ww` to OwO bot
- Paginates through all 20 pages
- Filters epic + mythic weapons only
- Saves 78 weapons to `weapons.json`

**Output:** `weapons.json` with weapon codes, names, percentages

## Phase 3: Quick Test (Recommended)

```bash
npm run quick-test
```

**What it does:**
- Tests 1 team against 3 templates
- Verifies NeonUtil integration works
- Takes ~30 seconds

**This validates:** Team building, weapon confirmation, battle parsing all work correctly

## Phase 4: Full Team Testing

```bash
npm run test-teams
```

**What it does:**
1. Loads 78 weapons from `weapons.json`
2. Generates combinations:
   - Top 15 weapons (by quality %)
   - 50 random animal combinations
   - = **22,750 total team combinations**
3. For each combination:
   - Build team in NeonUtil (`n t c sandbox`)
   - Add 3 animals with weapons
   - Battle 54 templates (2,700 battles)
   - Calculate win rate
   - Save progress every 10 teams

**Runtime:** ~2 days continuously

**Output:** `test_results.json` with all results sorted by win rate

## Phase 5: Analyze Results

```bash
# View top teams
node -e "const r=require('./test_results.json'); r.sort((a,b)=>b.winRate-a.winRate).slice(0,10).forEach((t,i)=>console.log(\`#\${i+1}: \${t.winRate.toFixed(2)}% - \${t.combination.animals.join('/')}\`))"
```

Or manually open `test_results.json` and find highest `winRate` values.

## Customization Options

### Test Fewer Combinations

Edit `src/neonutilTester.js` line 222:

```javascript
// Quick test: 10 weapons × 20 animals = ~2,400 combos (~5 hours)
const combinations = generateSmartCombinations(weapons, 10, 20);

// Medium test: 15 weapons × 50 animals = ~22,750 combos (~2 days)
const combinations = generateSmartCombinations(weapons, 15, 50);

// Custom
const combinations = generateSmartCombinations(weapons, topN, maxAnimalCombos);
```

### Test Specific Templates Only

Edit `src/constants.js` to comment out templates you don't care about:

```javascript
export const TEMPLATES = [
  { id: 'pstall', name: 'Pstaff Meta Res', category: 'meta' },
  { id: 'gem_blitz', name: 'Gem Blitz (tank)', category: 'blitz' },
  // { id: 'old_vstaff', name: 'Vstaff Meta', category: 'old' }, // Disabled
];
```

### Adjust Rate Limiting

Edit `src/config.js`:

```javascript
delays: {
  betweenCommands: 2000,    // Increase if rate limited
  betweenPages: 1500,
  betweenBattles: 3000,     // Increase for slower testing
  afterMessageSent: 500
}
```

## Command Reference

| Command | Purpose | Time |
|---------|---------|------|
| `npm run parse-weapons` | Parse epic/mythic weapons from OwO | ~3 min |
| `npm run quick-test` | Verify NeonUtil integration | ~30 sec |
| `npm run test-teams` | Full team testing (configurable) | hours-days |

## File Structure

```
owo neon util automator/
├── .env                    # Your credentials
├── weapons.json            # Parsed weapons (generated)
├── test_results.json       # Test results (generated)
├── src/
│   ├── config.js           # Configuration
│   ├── constants.js        # Animals & templates
│   ├── utils.js            # Helper functions
│   ├── parseWeapons.js     # Weapon parser
│   ├── teamGenerator.js    # Combination generator
│   ├── neonutilTester.js   # Main tester
│   └── quickTest.js        # Quick validation
├── SETUP_GUIDE.md          # Setup instructions
├── TESTING_GUIDE.md        # Testing details
└── WORKFLOW.md             # This file
```

## Best Practices

1. **Start with quick-test** to verify everything works
2. **Test overnight** for medium-sized runs
3. **Monitor progress** - check console for errors
4. **Save intermediate results** - script auto-saves every 10 combos
5. **Analyze patterns** - don't just pick highest win rate, look at consistency

## Troubleshooting

**Weapon parser returns 0 weapons:**
- Check OwO bot is responding
- Verify channel ID is correct
- Check console for parsing errors

**NeonUtil not responding:**
- Verify bot ID is correct (851436490415931422)
- Check if bot is online
- Try manual command first to test

**Rate limit errors:**
- Increase delays in `config.js`
- Wait 10-15 minutes before retrying
- Consider testing fewer combinations

**Script crashes mid-test:**
- Check `test_results.json` - progress is saved
- Restart script (will start from beginning - TODO: add resume)
- Report bugs with error logs

## Future Improvements

- [ ] Resume capability (pick up where left off)
- [ ] Parallel testing with multiple accounts
- [ ] Genetic algorithm for smarter combination selection
- [ ] Web dashboard for real-time monitoring
- [ ] Export teams directly to OwO format
- [ ] Template-specific optimization (best vs pstall, best vs blitz, etc.)
