# 🧠 Team Optimizer - AI-Powered Team Prediction

## What It Does

The Team Optimizer uses **machine learning-inspired algorithms** to analyze your test results and predict optimal teams that haven't been tested yet.

## Algorithms Used

### 1. **Feature Importance Analysis** 📊
- Calculates which animals, weapons, and formations contribute most to success
- Identifies animal/weapon synergies (pairs that work well together)
- Shows hardest templates to beat

### 2. **Genetic Algorithm** 🧬
- Takes traits from top 10% performing teams
- "Breeds" new team combinations by mixing successful traits
- Creates 100 offspring teams with predicted scores

### 3. **Ensemble Scoring** 🎯
Predicts team strength using 6 factors:
- **Animal Quality** (25%) - Average success rate of each animal
- **Weapon Quality** (25%) - Average success rate of each weapon
- **Formation** (15%) - How well the formation performs
- **Synergy** (20%) - How well animals work together (pair bonuses)
- **Diversity** (5%) - Role coverage (attacker/healer/tank/replenisher)
- **Historical** (10%) - Success of similar teams already tested

### 4. **Template Coverage Analysis** 📋
- Identifies which templates are hardest to beat
- Shows which teams have best coverage (beat/tie most templates)

## How to Use

```bash
npm run optimize
```

## Output Files

### `optimizer_results.json`
Contains:
- Top 10 predicted optimal teams (never tested)
- Best animals, weapons, formations
- Hardest templates to beat
- Detailed scoring breakdown

### Console Output
- Feature importance rankings
- Best synergies
- Top 10 predictions with scores
- Actionable recommendations

## Interpreting Results

### Predicted Scores
The algorithm predicts **Win+Tie %** based on patterns from existing data.

**Important**: Predictions are conservative! Teams might perform better than predicted.

### Score Breakdown Example
```
PREDICTED SCORE: 26.63%
  - Animal Quality: 20.63%   (how good the animals are)
  - Weapon Quality: 19.47%   (how good the weapons are)
  - Formation: 27.87%        (how good the formation is)
  - Synergy: 25.22%          (how well they work together)
  - Diversity: 100%          (role coverage bonus)
  - Historical: 23.76%       (similar teams' performance)
```

## Key Insights from Current Data (4,910 teams)

### 🏆 Best Animals
1. **Owl** - 24.34% avg (best defensive tank)
2. **Gorilla** - 21.16% avg (best all-rounder)
3. **Squid** - 18.73% avg (best healer/support)
4. **Fox** - 17.42% avg (strong attacker)
5. **Fish** - 16.76% avg (magic attacker)

### ⚔️ Best Weapons
1. **Empowered Arcane Scepter** - 26.67% avg
2. **Energy Staff** - 26.64% avg
3. **Great Sword** - 25.89% avg
4. **Vampiric Staff** - 24.48% avg
5. **Defender's Aegis** - 20.96% avg

### 🎯 Best Formations
1. **EXPLOIT: Kamikaze Shield (Owl)** - 54.55% (1 sample)
2. **EXPLOIT: Triple Sac Hybrid** - 34.78% (1 sample)
3. **Crune Meta** - 27.87% avg (258 teams)

### 🤝 Best Animal Synergies
1. **Gorilla + Owl** - 27.42% avg
2. **Lion + Owl** - 26.29% avg
3. **Deer + Owl** - 25.39% avg

### 🔥 Hardest Templates
1. **Bow-Crune** - 0 teams win, 23 tie (impossible to beat?)
2. **Double Scythe Crune** - 9 wins, 17 ties (very hard)
3. **Wbow-Shield-Crune** - 2 wins, 37 ties

## Top 10 Predicted Teams

These teams have NEVER been tested but are predicted to perform well:

1. **Owl/Deer/Gorilla** - Spirit Staff/Orb of Potency/Vampiric Staff - Crune Meta (26.63% predicted)
2. **Gorilla/Owl/Deer** - Great Sword/Defender's Aegis/Empowered Staff of Purity - Short Stall (25.94%)
3. **Gorilla/Owl/Camel** - Spirit Staff/Energy Staff/Empowered Staff of Purity - Crune Meta (25.83%)
4. **Lion/Gorilla/Owl** - Vanguard's Banner/Resurrection Staff/Energy Staff - Short Stall (25.82%)
5. **Spider/Gorilla/Owl** - Orb of Potency/Pristine Vampiric Staff/Vanguard's Banner - Crune Meta (25.73%)

## Recommendations

### Immediate Actions
1. **Test the top 10 predicted teams** - These are your best bets
2. **Focus on Owl + Gorilla combos** - Consistently highest synergy
3. **Try Crune Meta formation** - Best performing formation overall
4. **Use Energy Staff / Vampiric Staff** - Highest weapon success rates

### Long-term Strategy
1. Continue testing to gather more data
2. Re-run optimizer after every 1,000-2,000 new teams
3. Exploit formations show high variance - need more samples
4. Focus on templates you struggle with (Bow-Crune, Double Scythe Crune)

## Validation

**Test the predictions!** If they score within 5% of predicted, the algorithm is working.

Current best: **73.91%** (Lion/Camel/Deer - Full Stall)
Prediction target: **79%+** for algorithm validation

## Notes

- Predictions are based on **4,910 tested teams** (0.12% of total possible)
- More data = better predictions
- Exploit formations have few samples (high variance)
- Some weapon combos are underrepresented
- Algorithm favors defensive/stall teams (current meta bias)

## Advanced: Manual Testing

To test a specific predicted team, extract from `optimizer_results.json`:

```json
{
  "animals": ["owl", "deer", "gorilla"],
  "weapons": ["FNFCUN", "FNPE1R", "FNFQU4"]
}
```

Then use the weapon codes to set up your team manually in Discord!
