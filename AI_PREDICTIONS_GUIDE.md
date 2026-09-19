# 🤖 AI Predictions System - Complete Guide

## Overview

The AI Predictions System uses machine learning algorithms to analyze tested teams and generate predictions for optimal untested teams. Results are displayed on the website with OwO-style tier rankings.

## How It Works

### 1. **Optimizer Algorithm**
Analyzes all tested teams and generates top 10 predictions using:
- Feature importance (which animals/weapons work best)
- Genetic algorithm (breeding successful traits)
- Ensemble scoring (combining 6 factors)
- Synergy detection (animal/weapon pairs)

### 2. **Auto-Merge System**
- Runs automatically every 1,000 teams tested
- Merges new predictions with existing ones
- Removes duplicates
- Re-ranks all predictions by score

### 3. **Website Display**
- Sidebar on website shows all predictions
- Ranked by OwO-style tiers
- Includes weapon codes for easy testing
- Auto-refreshes every 5 minutes

## OwO-Style Tier System

Predictions are ranked using the official OwO tier quality intervals:

| Tier | Score Range | Icon | Description |
|------|------------|------|-------------|
| **Fabled** | 100% | ![Fabled](rankings/Fabled_%28Tier%29.png) | Perfect score - extremely rare |
| **Legendary** | 95-99% | ![Legendary](rankings/Legendary_%28Tier%29.png) | Near-perfect - top tier |
| **Mythical** | 81-94% | ![Mythical](rankings/Mythical_%28Tier%29.png) | Exceptional performance |
| **Epic** | 61-80% | ![Epic](rankings/Epic_%28Tier%29.png) | Very strong teams |
| **Rare** | 41-60% | ![Rare](rankings/Rare_%28Tier%29.png) | Above average |
| **Uncommon** | 21-40% | ![Uncommon](rankings/Uncommon_%28Tier%29.png) | Average performance |
| **Common** | 0-20% | ![Common](rankings/Common_%28Tier%29.png) | Below average |

### Current Predictions (4,910 teams):

Most predictions fall in **Uncommon** (21-40%) tier because:
- Algorithm predicts conservative scores (25-30%)
- This matches the realistic performance range
- Actual tested performance may exceed predictions!

**Your best tested team:** 73.91% (Epic tier)
**Top predictions:** 28-29% (Uncommon tier)

The gap exists because untested teams are predicted conservatively.

## Commands

### Manual Run
```bash
npm run optimize
```
- Runs optimizer on current data
- Generates top 10 predictions
- Saves to `optimizer_results.json` and `docs/optimizer_predictions.json`

### Auto-Merge Run
```bash
npm run auto-optimize
```
- Checks if 1000+ new teams since last run
- Runs optimizer if threshold met
- Merges new predictions with existing
- Removes duplicates
- Updates website

### Automatic (Built-in)
The bot automatically runs `auto-optimize` every 1,000 teams during testing!

## Files

### `optimizer_results.json`
Full analysis output:
- Metadata (teams tested, current best)
- Top animals/weapons/formations
- Hardest templates
- Top 10 predictions with detailed breakdown

### `docs/optimizer_predictions.json`
Website-ready format:
```json
{
  "generatedAt": "2026-09-19T...",
  "totalTeamsTested": 4910,
  "currentBestScore": 73.91,
  "predictions": [
    {
      "rank": 1,
      "tier": "Epic",
      "animals": ["deer", "owl", "gorilla"],
      "weaponCodes": ["FM4L4M", "FNFCUM", "FG50I0"],
      "weaponNames": ["Vanguard's Banner", "Great Sword", "Defender's Aegis"],
      "formation": "Crune Meta",
      "predictedScore": 28.73,
      "confidence": "High"
    }
  ]
}
```

### `optimizer_checkpoint.json`
Tracks when optimizer last ran:
```json
{
  "lastTeamCount": 4910,
  "lastRun": "2026-09-19T..."
}
```

## Website Features

### Predictions Sidebar

**Location:** Right side of screen (purple tab: "🤖 AI Predictions")

**Features:**
- Click purple tab to open
- Shows prediction count badge
- Displays stats (total predictions, best score)
- Lists all predictions with:
  - Rank number
  - Tier badge (colored by rarity)
  - Predicted score
  - Animals
  - Weapons (names + codes)
  - Formation type
  - Confidence level

**Mobile:** Full-width overlay

### Auto-Refresh
- Predictions reload every 5 minutes
- Automatically picks up new predictions from optimizer runs

## Interpretation Guide

### Predicted Scores

**28-30% (Epic/Mythical):** Excellent predictions
- Combines best animals (Owl, Gorilla)
- Uses top weapons (Energy Staff, Great Sword)
- Follows successful formations (Crune Meta)
- High confidence based on similar teams

**25-27% (Rare/Epic):** Good predictions
- Solid animal combos
- Decent weapon synergies
- Standard formations

**22-24% (Uncommon):** Worth testing
- Less common combinations
- May have untested synergies
- Medium confidence

**<22% (Common):** Low priority
- Unusual combinations
- Lower historical success
- Test only if curious

### Confidence Levels

- **High:** Similar teams performed well (20%+ historical score)
- **Medium:** Some similar teams exist (10-20%)
- **Low:** Few or no similar teams tested (<10%)

## Current Top Predictions

From 4,910 teams tested:

1. **Deer/Owl/Gorilla** - Vanguard's Banner/Great Sword/Defender's Aegis - **28.73%** (Epic)
2. **Gorilla/Owl/Fox** - Orb of Potency/Energy Staff/Staff of Corruption - **28.19%** (Epic)
3. **Owl/Lion/Gorilla** - Energy Staff/Spirit Staff/Resurrection Staff - **28.10%** (Epic)

All focus on **Owl + Gorilla** synergy (27.42% avg success rate).

## Testing Predictions

### How to Test a Prediction

1. Open predictions sidebar on website
2. Find a team you want to test
3. Copy the weapon codes (e.g., `FM4L4M • FNFCUM • FG50I0`)
4. Use those codes to register weapons in Discord
5. Set up team with the specified animals
6. Run battles against all templates

### What to Expect

- Predictions are **conservative**
- Teams may perform better than predicted
- Epic/Mythical tiers have highest success chance
- High confidence = more reliable prediction

### Validation

If multiple Epic/Mythical predictions score **50%+ Win+Tie**, the algorithm is validated!

## Statistics (4,910 teams)

### Best Components

**Animals:**
1. Owl - 24.34% avg
2. Gorilla - 21.16% avg
3. Squid - 18.73% avg

**Weapons:**
1. Empowered Arcane Scepter - 26.67% avg
2. Energy Staff - 26.64% avg
3. Great Sword - 25.89% avg

**Formations:**
1. Crune Meta - 27.87% avg (258 teams)
2. Short Stall - 19.00% avg
3. Holy Trinity - 15.46% avg

**Best Synergy:** Gorilla + Owl - 27.42% avg

### Hardest Templates

1. **Bow-Crune** - 0 teams win, 23 tie (impossible?)
2. **Double Scythe Crune** - 9 wins, 17 ties
3. **Wbow-Shield-Crune** - 2 wins, 37 ties

## Automation Flow

```
Bot Tests Teams
    ↓
Every 1,000 teams
    ↓
Auto-Optimizer Runs
    ↓
Generates 10 Predictions
    ↓
Merges with Existing (removes duplicates)
    ↓
Re-ranks All Predictions
    ↓
Updates Website JSON
    ↓
Every 100 teams: Pushes to GitHub
    ↓
Website Auto-Refreshes (5 min)
    ↓
Users See New Predictions!
```

## Troubleshooting

### No Predictions Showing
- Check if `docs/optimizer_predictions.json` exists
- Run `npm run optimize` manually
- Refresh website (may take 5 minutes for auto-refresh)

### Low Predicted Scores
- This is expected behavior
- Algorithm is conservative
- Test the teams anyway - they may surprise you!

### Duplicate Predictions
- Auto-merge removes duplicates automatically
- Based on animals + weapon codes matching

### Optimizer Fails
- Needs at least 100 teams tested
- Check `test_results.json` exists
- Check `weapons.json` exists

## Advanced: Manual Prediction Editing

You can manually edit `docs/optimizer_predictions.json` to:
- Add your own predictions
- Adjust tier rankings
- Change confidence levels
- Reorder predictions

Format:
```json
{
  "rank": 1,
  "tier": "Fabled",
  "animals": ["owl", "gorilla", "deer"],
  "weaponCodes": ["CODE1", "CODE2", "CODE3"],
  "weaponNames": ["Weapon 1", "Weapon 2", "Weapon 3"],
  "formation": "Crune Meta",
  "predictedScore": 35.0,
  "confidence": "High"
}
```

## Future Improvements

- [ ] Increase prediction count (top 20-50)
- [ ] Add template-specific predictions
- [ ] Show prediction accuracy over time
- [ ] Filter predictions by formation/animals
- [ ] Export predictions to test queue

## FAQ

**Q: Why are predicted scores lower than actual best teams?**
A: The algorithm averages component scores. It's conservative by design. Actual performance may exceed predictions.

**Q: Should I only test Epic/Mythical predictions?**
A: No! Rare and Uncommon can also perform well. They just have less historical data.

**Q: How often should I run the optimizer?**
A: It runs automatically every 1,000 teams. You can also run manually anytime with `npm run optimize`.

**Q: Can predictions get worse over time?**
A: No! Each run adds new predictions and keeps the best ones. More data = better predictions.

**Q: What if a prediction is already tested?**
A: The auto-merge system checks for duplicates. If a team is tested, it won't appear in predictions anymore (it's in the main results instead).
