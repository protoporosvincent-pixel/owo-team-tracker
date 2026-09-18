# Team Testing Guide

## Overview

The team tester automatically:
1. Generates team combinations (animals + weapons)
2. Builds each team in NeonUtil
3. Battles against all 54 meta/blitz templates
4. Calculates win rates
5. Finds the best performing teams

## Quick Start

### Step 1: Make sure weapons are parsed
```bash
npm run parse-weapons
```

### Step 2: Run the team tester
```bash
npm run test-teams
```

## How It Works

### Team Building Process

For each combination:
1. `n t c sandbox` - Create empty sandbox team
2. `n t add 1 50 <animal1> <weapon1>` - Add first member
3. `w w <weapon1>` - Confirm weapon
4. Repeat for positions 2 and 3
5. Battle all templates
6. `n team remove 1/2/3` - Clear team

### Battle Templates

Tests against **54 templates** including:
- **Meta teams** (23): hstall, pstall, crune_pshield, spider_crune, etc.
- **Blitz teams** (21): gem_blitz, dagger_blitz, ds_blitz, tgem_blitz, etc.
- **Old meta** (10): old_vstaff, old_estaff, rstaff_stall, etc.

### Win Rate Calculation

```
Win Rate = (Total Wins) / (Total Wins + Losses + Ties) × 100%
```

Each template runs 50 simulations, so:
- 54 templates × 50 battles = **2,700 battles per combination**

## Configuration

Edit `src/neonutilTester.js` line ~222 to adjust testing scope:

```javascript
// Full test (DON'T DO THIS - will take weeks!)
const combinations = generateSmartCombinations(weapons, 78, 969); 

// Quick test (recommended for first run)
const combinations = generateSmartCombinations(weapons, 10, 20);

// Medium test (overnight run)
const combinations = generateSmartCombinations(weapons, 15, 50);

// Custom test
const combinations = generateSmartCombinations(
  weapons,
  topWeaponsCount,      // Top N weapons by quality
  animalCombosToTest    // Random animal combinations
);
```

### Time Estimates

| Weapons | Animal Combos | Total Combos | Battles | Est. Time |
|---------|--------------|--------------|---------|-----------|
| 10      | 20           | ~2,400       | 6.48M   | ~5 hours  |
| 15      | 50           | ~22,750      | 61.4M   | ~2 days   |
| 20      | 100          | ~114,000     | 307M    | ~10 days  |
| 78      | 969          | ~37.8M       | 102B    | ~years    |

*Assumes 3 seconds per battle average*

## Output Files

### `test_results.json`

Contains all test results:
```json
[
  {
    "combination": {
      "animals": ["lion", "owl", "gorilla"],
      "weapons": ["FNFCUO", "D1RG5G", "FJMIFA"],
      "weaponNames": ["Defender's Aegis [5]", "Decent Resurrection Staff", "Flame Staff"]
    },
    "totalWins": 1250,
    "totalLosses": 800,
    "totalTies": 650,
    "winRate": 46.30,
    "templateResults": [...]
  }
]
```

### Progress Saving

Results are auto-saved every 10 combinations, so you can:
- Stop the script anytime (Ctrl+C)
- Check intermediate results
- Resume later (though current version restarts - TODO: add resume feature)

## Monitoring Progress

The console shows:
```
[123/22750] Testing combination...
Adding position 1: lion with weapon FNFCUO
Adding position 2: owl with weapon D1RG5G
Adding position 3: gorilla with weapon FJMIFA
Team tested: lion/owl/gorilla - Win rate: 46.30% (1250W/800L/650T)
```

## Tips & Best Practices

1. **Start Small**: Test 10 weapons × 20 animal combos first
2. **Run Overnight**: Use screen/tmux on Linux or leave computer on
3. **Check Logs**: Monitor for errors (rate limits, bot downtime)
4. **Multiple Runs**: Test different weapon subsets in parallel (use different accounts)
5. **Analyze Results**: Top win rate doesn't mean best team - check consistency across templates

## Troubleshooting

**"Rate limited" errors:**
- Increase delays in `src/config.js`
- Current: 2s between commands, 3s between battles
- Try: 3s and 5s respectively

**Bot not responding:**
- OwO or NeonUtil might be down
- Check bot status manually
- Script will retry but may fail after timeout

**Duplicate weapon errors:**
- The script ensures 3 different weapons per team
- If you see this, it's a bug - report it

**Memory issues:**
- Testing 100K+ combinations uses lots of RAM
- Results are saved periodically to prevent data loss

## Next Steps

After testing completes:
1. Check `test_results.json` for top teams
2. Sort by `winRate` field
3. Test top 10 teams manually to verify
4. Consider the template breakdown (good vs specific metas)
5. Export your favorite teams for actual use!

## Advanced: Filter Specific Templates

Edit `src/constants.js` to test only specific templates:

```javascript
export const TEMPLATES = [
  { id: 'pstall', name: 'Pstaff Meta Res', category: 'meta' },
  { id: 'gem_blitz', name: 'Gem Blitz (tank)', category: 'blitz' },
  // Add only templates you care about
];
```

This speeds up testing significantly!
