# UPDATE INSTRUCTIONS FOR PHONE

## What Changed

✅ **Added 46 special "exploit" teams** that test first before randomized testing
✅ **Fixed randomization** - now uses round-robin (different animals every team)
✅ **Resume functionality** still works - skips already-tested teams

## What You'll See

### Phase 1: Special Exploit Teams (First ~46 teams)
```
🎯 EXPLOIT: 0-MAG Revive Stall (Owl)
   owl/deer/gorilla - Vampiric Staff / Spirit Staff / Defender's Aegis

🎯 EXPLOIT: Triple Sac Hybrid
   gorilla/gorilla/gorilla - Vampiric Staff / Vampiric Staff / Defender's Aegis

🎯 EXPLOIT: Monkey Stall (Gorilla)
   gorilla/deer/spider - Arcane Scepter / Spirit Staff / Defender's Aegis

... (46 total exploit teams)
```

### Phase 2: Randomized Meta Teams (Remaining ~615k teams)
```
Holy Trinity - spider/fox/fish - Great Sword / Bow / Aegis
Holy Trinity - deer/squid/gorilla - Staff / Banner / Shield
Blitz - lion/owl/fox - Scythe / Staff / Claw
... (different animals almost every team!)
```

## Files to Update on Your Phone

**File:** `src/teamGenerator.js`
- Added `SPECIAL_EXPLOIT_TEAMS` array at the top (46 exploit teams)
- Modified `generateMetaTeams()` to test exploits first, then randomized teams
- Now uses round-robin algorithm for true variety

## How to Transfer

### Option 1: Copy the whole file
```bash
# From PC to phone via USB/cloud:
src/teamGenerator.js
```

### Option 2: Manual update
1. Open `src/teamGenerator.js` on your phone
2. Add the `SPECIAL_EXPLOIT_TEAMS` array after line 2 (see below)
3. Replace the `generateMetaTeams()` function with the new version

## SPECIAL_EXPLOIT_TEAMS Array to Add

```javascript
// Add this after line 2 (after imports)
const SPECIAL_EXPLOIT_TEAMS = [
  // 0-MAG Revive Stall
  { animals: ['owl', 'deer', 'gorilla'], weapons: ['D0FVBX', 'FNPE1O', 'FGES92'], name: '0-MAG Revive Stall (Owl)' },
  { animals: ['gorilla', 'deer', 'owl'], weapons: ['D0FVBX', 'FNPE1O', 'FGES92'], name: '0-MAG Revive Stall (Gorilla)' },
  { animals: ['gorilla', 'gorilla', 'gorilla'], weapons: ['D0FVBX', 'D0FVBX', 'FGES92'], name: 'Triple Sac Hybrid' },
  { animals: ['gorilla', 'deer', 'lion'], weapons: ['FNPE1O', 'FGES92', 'FM4L46'], name: 'Spirit Staff Hybrid (Gorilla)' },
  { animals: ['lion', 'deer', 'gorilla'], weapons: ['FNPE1O', 'FGES92', 'FM4L46'], name: 'Spirit Staff Hybrid (Lion)' },
  { animals: ['owl', 'deer', 'spider'], weapons: ['FGES92', 'D0FVBX', 'FNPE1O'], name: 'Kamikaze Shield (Owl)' },
  { animals: ['spider', 'deer', 'fox'], weapons: ['FGES92', 'FNPE1O', 'FM4L46'], name: 'Attacker Shield (Spider)' },
  { animals: ['fox', 'deer', 'spider'], weapons: ['FGES92', 'FNPE1O', 'FM4L46'], name: 'Attacker Shield (Fox)' },
  { animals: ['spider', 'deer', 'gorilla'], weapons: ['FM4L46', 'FNPE1O', 'FGES92'], name: 'Attacker Scepter (Spider)' },
  { animals: ['fox', 'deer', 'gorilla'], weapons: ['FM4L46', 'FNPE1O', 'FGES92'], name: 'Attacker Scepter (Fox)' },
  { animals: ['gorilla', 'deer', 'spider'], weapons: ['FM4L46', 'FNPE1O', 'FGES92'], name: 'Monkey Stall (Gorilla)' },
  { animals: ['gorilla', 'deer', 'lion'], weapons: ['FMHJE8', 'FN2LQ8', 'FMEW86'], name: 'Crune Meta (Gorilla)' },
  { animals: ['owl', 'deer', 'gorilla'], weapons: ['FMHJE8', 'FN2LQ8', 'FMEW86'], name: 'Crune Meta (Owl)' },
  { animals: ['deer', 'gorilla', 'fish'], weapons: ['FN2LQ8', 'FMHJE8', 'FMEW86'], name: 'Cruption Meta (Deer)' },
  { animals: ['gorilla', 'deer', 'fish'], weapons: ['FN2LQ8', 'FMHJE8', 'FMEW86'], name: 'Cruption Meta (Gorilla)' },
  { animals: ['owl', 'deer', 'gorilla'], weapons: ['D0FVBX', 'FNPE1O', 'FGES92'], name: '0-WP Lifesteal (Owl)' },
  { animals: ['spider', 'fish', 'lion'], weapons: ['FNFCUM', 'FM4L4N', 'FGES92'], name: 'Thorns AOE (Spider)' },
  { animals: ['lion', 'fish', 'spider'], weapons: ['FNFCUM', 'FM4L4N', 'FGES92'], name: 'Thorns AOE (Lion)' },
  { animals: ['fish', 'spider', 'gorilla'], weapons: ['FM4L4N', 'FNFCUM', 'FGES92'], name: 'Double AOE (Fish)' },
  { animals: ['fox', 'spider', 'deer'], weapons: ['FLMZTN', 'FMHJE6', 'FNF50V'], name: 'Poison+Mortality (Fox)' },
  { animals: ['spider', 'fox', 'deer'], weapons: ['FLMZTN', 'FMHJE6', 'FNF50V'], name: 'Poison+Mortality (Spider)' },
  { animals: ['spider', 'fox', 'deer'], weapons: ['FMHJE6', 'FNF50V', 'FLMZTN'], name: 'Double Scythe Blitz (Spider)' },
  { animals: ['fox', 'spider', 'deer'], weapons: ['FMHJE6', 'FNF50V', 'FLMZTN'], name: 'Double Scythe Blitz (Fox)' },
  { animals: ['fox', 'spider', 'deer'], weapons: ['FNF50V', 'FMHJE6', 'D0FVBX'], name: 'Anti-Sustain (Fox)' },
  { animals: ['spider', 'fox', 'deer'], weapons: ['FNF50V', 'FMHJE6', 'D0FVBX'], name: 'Anti-Sustain (Spider)' },
  { animals: ['gorilla', 'lion', 'deer'], weapons: ['FMTO10', 'FM4L4M', 'FMHJE8'], name: 'Ffishy Counter (Gorilla)' },
  { animals: ['lion', 'gorilla', 'deer'], weapons: ['FMTO10', 'FM4L4M', 'FMHJE8'], name: 'Ffishy Counter (Lion)' },
  { animals: ['gorilla', 'owl', 'deer'], weapons: ['FM4L4M', 'FMHJE8', 'FN2LQ8'], name: 'Banner Crune (Gorilla)' },
  { animals: ['owl', 'gorilla', 'deer'], weapons: ['FM4L4M', 'FMHJE8', 'FN2LQ8'], name: 'Banner Crune (Owl)' },
  { animals: ['lion', 'gorilla', 'spider'], weapons: ['FKQME0', 'FMHJE6', 'FGES92'], name: 'Freeze Blitz (Lion)' },
  { animals: ['gorilla', 'lion', 'spider'], weapons: ['FKQME0', 'FMHJE6', 'FGES92'], name: 'Freeze Blitz (Gorilla)' },
  { animals: ['deer', 'gorilla', 'owl'], weapons: ['FH8MML', 'FMHJE8', 'FGES92'], name: 'Wand Crune (Deer)' },
  { animals: ['gorilla', 'deer', 'owl'], weapons: ['FH8MML', 'FMHJE8', 'FGES92'], name: 'Wand Crune (Gorilla)' },
  { animals: ['deer', 'fish', 'gorilla'], weapons: ['FMEW86', 'FN2LQ8', 'FMHJE8'], name: 'Cruption Burst (Deer)' },
  { animals: ['fish', 'deer', 'gorilla'], weapons: ['FMEW86', 'FN2LQ8', 'FMHJE8'], name: 'Cruption Burst (Fish)' },
  { animals: ['lion', 'deer', 'gorilla'], weapons: ['FIXUZW', 'FMHJE8', 'FGES92'], name: 'Rune Crune (Lion)' },
  { animals: ['gorilla', 'deer', 'owl'], weapons: ['FNFCV0', 'FMHJE8', 'FM4L46'], name: 'WP Bomb (Gorilla)' },
  { animals: ['deer', 'gorilla', 'owl'], weapons: ['FNFCV0', 'FMHJE8', 'FM4L46'], name: 'WP Bomb (Deer)' },
  { animals: ['owl', 'gorilla', 'deer'], weapons: ['FNFCV1', 'FGES92', 'FMHJE8'], name: 'Thorn Tether (Owl)' },
  { animals: ['gorilla', 'owl', 'deer'], weapons: ['FNFCV1', 'FGES92', 'FMHJE8'], name: 'Thorn Tether (Gorilla)' },
  { animals: ['lion', 'gorilla', 'deer'], weapons: ['FNFCV2', 'FMHJE8', 'FN2LQ8'], name: 'Sin/Virtue (Lion)' },
  { animals: ['gorilla', 'lion', 'deer'], weapons: ['FNFCV2', 'FMHJE8', 'FN2LQ8'], name: 'Sin/Virtue (Gorilla)' }
];
```

## Testing Priority

1. **First ~50 teams:** Special exploit/meta builds (high win rate expected)
2. **Remaining teams:** Randomized with variety (different animals each team)

## Expected Results

- **Exploit teams:** Should find 65-75%+ win rate teams quickly
- **Randomized teams:** Gradually discover more top-tier combos

## After Update

1. Transfer your uncorrupted `test_results.json` from phone to PC
2. Run `npm run test-teams` on your phone
3. You'll see exploit teams tested first, then randomized variety

---

**Total teams to test:** ~615,046 (46 exploits + 615,000 randomized)
**Expected runtime:** ~178 days (same as before)
**Better early results:** YES! Exploit teams tested in first hour
