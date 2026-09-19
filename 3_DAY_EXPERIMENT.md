# 🧪 3-Day Experiment: Exhaustive vs RL Testing

## Objective

Run both testers simultaneously for 3 days and compare which finds better teams faster.

## Setup

### Prerequisites
- ✅ Bot token in `.env`
- ✅ Two Discord channels:
  - Original channel (for exhaustive tester)
  - Channel `1550969083456126976` (for RL tester)
- ✅ Both channels have access to OwO bot and NeonUtil bot

### Installation
```bash
cd "/home/vincent/Downloads/owo neon util automator"
npm install
```

## Running the Experiment

### Option 1: Two Terminals (Recommended)

**Terminal 1 - Exhaustive Tester:**
```bash
npm run test-teams
```

**Terminal 2 - RL Tester:**
```bash
npm run rl-teams
```

### Option 2: Background Processes

```bash
# Start exhaustive in background
nohup npm run test-teams > exhaustive.log 2>&1 &

# Start RL in background
nohup npm run rl-teams > rl.log 2>&1 &

# Check logs
tail -f exhaustive.log
tail -f rl.log
```

### Option 3: Screen/Tmux

```bash
# Create screen sessions
screen -S exhaustive
npm run test-teams
# Press Ctrl+A, then D to detach

screen -S rl
npm run rl-teams
# Press Ctrl+A, then D to detach

# Reattach later
screen -r exhaustive
screen -r rl
```

## What to Expect

### Day 1 (0-24 hours)

**Exhaustive:**
- ~2,880 teams tested
- Finding 60%+ teams randomly
- Slow, steady progress
- No learning

**RL:**
- ~1,000-1,500 teams tested
- Learning phase (unstable results)
- Exploring different combinations
- Building knowledge

**Comparison:** Exhaustive likely ahead in absolute numbers

### Day 2 (24-48 hours)

**Exhaustive:**
- ~5,760 teams tested
- More 60%+ teams found
- Still random exploration
- Predictable progress

**RL:**
- ~2,000-3,000 teams tested
- Convergence phase
- Focusing on good combinations (Owl, Gorilla, etc.)
- Higher average scores

**Comparison:** RL catching up in quality, not quantity

### Day 3 (48-72 hours)

**Exhaustive:**
- ~8,640 teams tested
- Solid collection of good teams
- 10-15 teams at 60%+
- Best: 70-75%

**RL:**
- ~3,000-5,000 teams tested
- Exploitation phase
- 15-25 teams at 60%+ (higher %)
- Best: 70-75% (similar!)

**Comparison:** RL should have similar best teams with 40-60% fewer tests

## Monitoring Progress

### Check Team Counts
```bash
# Exhaustive
jq 'length' test_results.json

# RL
jq 'length' rl_results.json
```

### Check Best Teams
```bash
# Exhaustive best
jq 'sort_by(.totalWins + .totalTies) | reverse | .[0]' test_results.json

# RL best
jq 'sort_by(.totalWins + .totalTies) | reverse | .[0]' rl_results.json
```

### Run Comparison
```bash
npm run compare
```

This shows detailed comparison with efficiency metrics!

### Check RL Learning
```bash
# Top animals by success rate
jq '.topAnimals' rl_state.json

# Top weapons
jq '.topWeapons' rl_state.json
```

## Expected Outcomes

### Scenario 1: RL Wins (Most Likely)
- RL finds 70%+ team in 2,000-3,000 tests
- Exhaustive finds same in 5,000-8,000 tests
- **Winner: RL (2-4x faster)**

### Scenario 2: Equal Performance
- Both find 70-75% teams
- Similar number of 60%+ teams
- RL uses fewer tests
- **Winner: RL (more efficient)**

### Scenario 3: Exhaustive Wins (Unlikely)
- Exhaustive finds rare edge case
- RL misses it due to focus on known patterns
- **Winner: Exhaustive (better coverage)**

## Data Collection

### Hourly Snapshots (Optional)
```bash
# Run every hour
while true; do
  timestamp=$(date +%s)
  cp test_results.json "snapshots/exhaustive_$timestamp.json"
  cp rl_results.json "snapshots/rl_$timestamp.json"
  sleep 3600
done
```

### Key Metrics to Track
- Total teams tested
- Best team score
- Number of 60%+ teams
- Average score
- Teams per hour

## Analysis After 3 Days

### Run Comparison Script
```bash
npm run compare
```

Output shows:
- Which tester found better teams
- Efficiency metrics (teams tested vs quality)
- Learning curve (RL only)
- Convergence speed
- Recommendation

### Manual Analysis

**Questions to answer:**
1. Did RL find similar best teams with fewer tests?
2. Is RL's average score higher?
3. Did RL learn over time (improving scores)?
4. Did exhaustive find unique teams RL missed?
5. Which approach is more cost-effective?

## Decision Matrix

| Outcome | Best Teams | Tests Used | Efficiency | Decision |
|---------|------------|------------|------------|----------|
| RL >> Exhaustive | Better | Fewer | High | **Use RL only** |
| RL > Exhaustive | Similar/Better | Fewer | High | **Prefer RL** |
| RL ≈ Exhaustive | Similar | Similar | Medium | **Use both** |
| RL < Exhaustive | Worse | More | Low | **Tune RL** |
| Exhaustive >> RL | Better | More | Medium | **Use exhaustive** |

## Tuning RL (If Needed)

### If RL Not Learning
```javascript
// src/rlTester.js
const EXPLORATION_RATE = 0.30; // Increase exploration
```

### If Too Random
```javascript
const EXPLORATION_RATE = 0.10; // Decrease exploration
```

### If Success Rate Too Low
```javascript
const success = score >= 30; // Lower threshold
```

### If Success Rate Too High
```javascript
const success = score >= 50; // Raise threshold
```

## Files to Keep

After experiment:
- `test_results.json` - Exhaustive results
- `rl_results.json` - RL results
- `rl_state.json` - RL learning state
- Comparison output (save to file)

## Stopping the Experiment

```bash
# If running in terminals: Ctrl+C

# If running in background:
pkill -f "test-teams"
pkill -f "rl-teams"

# If using screen:
screen -r exhaustive
# Press Ctrl+C
screen -r rl
# Press Ctrl+C
```

## Next Steps

### If RL Wins
1. Stop exhaustive tester
2. Continue with RL only
3. Tune parameters for even better performance
4. Expected to find 75%+ teams in 1-2 weeks

### If Exhaustive Wins
1. Continue exhaustive approach
2. Use RL for quick exploration
3. Analyze why RL failed (tuning needed?)

### If Equal
1. Keep both running
2. Exhaustive for coverage
3. RL for efficiency
4. Best of both worlds

## Success Metrics

**Minimum Viable Success (RL):**
- Find at least one 70%+ team
- Use <5,000 tests to do so
- Average score improving over time

**Excellent Success (RL):**
- Find multiple 70%+ teams
- Use <3,000 tests
- Average score >30% by day 3
- Clear learning curve visible

**Outstanding Success (RL):**
- Find 75%+ team
- Use <2,000 tests
- Average score >35%
- Top animals >60% success rate

## Conclusion

This 3-day experiment will definitively show whether RL (intelligence) beats exhaustive (brute force) for this problem.

**Hypothesis:** RL will find equivalent or better teams in 40-60% fewer tests.

**Let's find out!** 🚀
