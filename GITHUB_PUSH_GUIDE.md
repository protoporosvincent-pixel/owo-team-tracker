# 🚀 GitHub Push Guide - Complete Deployment

## Quick Answer

**Yes!** Running `npm run test-teams` automatically:
1. ✅ Runs optimizer every 1,000 teams
2. ✅ Pushes to GitHub every 100 teams
3. ✅ Updates website automatically

## Initial Setup (One-Time)

### 1. Initialize Git Repository

```bash
cd "/home/vincent/Downloads/owo neon util automator"
git init
git add .
git commit -m "Initial commit: OwO Team Battle Analyzer with AI Predictions"
```

### 2. Create GitHub Repository

Go to https://github.com/new and create a new repository (e.g., `owo-team-analyzer`)

**Important:** Do NOT initialize with README, .gitignore, or license (we already have files)

### 3. Connect to GitHub

```bash
# Replace YOUR-USERNAME and YOUR-REPO with your actual GitHub info
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repo: `https://github.com/YOUR-USERNAME/YOUR-REPO`
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/docs`
5. Click **Save**
6. Wait 1-2 minutes
7. Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO/`

## Automatic Updates

### What Happens When Bot Runs

```
npm run test-teams
    ↓
Tests teams continuously
    ↓
Every 10 teams: Auto-save
    ↓
Every 100 teams: Push to GitHub (via pushToGithub.sh)
    ↓
Every 1,000 teams: Run optimizer + merge predictions
    ↓
GitHub Pages auto-deploys (30s - 2min)
    ↓
Website updates with new data!
```

### The Push Script (`pushToGithub.sh`)

Already created and automated! It does:
1. Copies `test_results.json` to `docs/`
2. Copies `optimizer_predictions.json` to `docs/` (if exists)
3. Stages all changes
4. Commits with timestamp
5. Pushes to GitHub

## Manual Push (When Needed)

### Push Everything Now

```bash
cd "/home/vincent/Downloads/owo neon util automator"

# Make sure rankings folder is in docs
cp -r rankings docs/

# Stage all files
git add .

# Commit with message
git commit -m "Add tier icons and AI predictions system"

# Push to GitHub
git push origin main
```

### Push Only Website Updates

```bash
./pushToGithub.sh
```

This is what the bot runs automatically every 100 teams!

### Force Update Website

```bash
cd "/home/vincent/Downloads/owo neon util automator"
git add docs/
git commit -m "Update website data"
git push origin main
```

## Files That Get Pushed

### Core Files (Initial Push)
- `src/` - All bot code
- `docs/index.html` - Website
- `docs/rankings/` - **Tier icons** ⭐
- `package.json` - Dependencies
- `README.md` - Documentation
- `.env` (excluded via .gitignore - DO NOT PUSH!)

### Data Files (Auto-Updated)
- `docs/test_results.json` - Updated every 100 teams
- `docs/optimizer_predictions.json` - Updated every 1,000 teams

### Local-Only Files (NOT Pushed)
- `.env` - Your Discord token (secret!)
- `node_modules/` - Dependencies (huge)
- `test_results.json` (local copy, docs copy is pushed)
- `weapons.json` (local only)
- `optimizer_checkpoint.json` (local tracking)

## Troubleshooting

### Push Failed: Authentication

```bash
# Use Personal Access Token
git remote set-url origin https://YOUR-TOKEN@github.com/YOUR-USERNAME/YOUR-REPO.git
```

Or set up SSH:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: Settings → SSH Keys → New SSH key
# Paste contents of: ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:YOUR-USERNAME/YOUR-REPO.git
```

### Push Failed: Large Files

GitHub has a 100MB file limit. If `test_results.json` gets huge:

```bash
# Use Git LFS for large files
git lfs install
git lfs track "docs/test_results.json"
git add .gitattributes
git commit -m "Track large files with LFS"
git push
```

### Website Not Updating

1. Check GitHub Actions tab for deployment status
2. Wait 2-5 minutes (GitHub Pages can be slow)
3. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
4. Check if `docs/test_results.json` was pushed: `git log docs/test_results.json`

### Optimizer Not Running

Check if 1,000 teams threshold met:
```bash
node -e "console.log(require('./test_results.json').length)"
```

Manually trigger:
```bash
npm run auto-optimize
```

## Verification

### Check What Will Be Pushed
```bash
git status
git diff docs/
```

### Check Last Push
```bash
git log --oneline -5
```

### Check Remote Status
```bash
git remote -v
git branch -vv
```

### View Website
```bash
# After pushing, view at:
# https://YOUR-USERNAME.github.io/YOUR-REPO/
```

## Best Practices

### Before Initial Push
- [x] Copy tier icons to docs: `cp -r rankings docs/`
- [x] Verify .gitignore includes `.env`
- [x] Test website locally by opening `docs/index.html`
- [ ] Remove any secrets from code

### Regular Maintenance
- Bot handles automatic pushes ✅
- Monitor GitHub Actions for failures
- Check website occasionally to verify updates
- Re-run optimizer manually if threshold not met: `npm run optimize`

## Security Notes

⚠️ **NEVER PUSH:**
- `.env` file (Discord token)
- `config.json` with tokens
- Personal access tokens
- API keys

✅ **Safe to Push:**
- All source code
- Test results
- Optimizer predictions
- Tier icons
- Website HTML/CSS/JS

## File Structure (After Push)

```
GitHub Repository
├── src/
│   ├── neonutilTester.js
│   ├── teamGenerator.js
│   ├── teamOptimizer.js
│   ├── autoOptimize.js
│   └── ...
├── docs/                    ← GitHub Pages serves from here
│   ├── index.html          ← Main website
│   ├── rankings/           ← Tier icons ⭐
│   │   ├── Common_(Tier).png
│   │   ├── Uncommon_(Tier).png
│   │   ├── Rare_(Tier).png
│   │   ├── Epic_(Tier).png
│   │   ├── Mythical_(Tier).png
│   │   ├── Legendary_(Tier).png
│   │   └── Fabled_(Tier).png
│   ├── test_results.json   ← Auto-updated every 100 teams
│   └── optimizer_predictions.json ← Auto-updated every 1,000 teams
├── package.json
├── README.md
└── .gitignore
```

## Quick Commands Reference

```bash
# Initial setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main

# Manual push everything
git add .
git commit -m "Update: description"
git push

# Auto push (bot does this)
./pushToGithub.sh

# Check status
git status
git log --oneline -5

# View what changed
git diff docs/

# Undo last commit (if needed)
git reset --soft HEAD~1
```

## Summary

### Answers to Your Questions:

**Q: Just running test-teams guarantees the optimizer runs every 1000 teams and it updates on the website right?**

**A:** YES! ✅
- Every 100 teams → Automatic push to GitHub
- Every 1,000 teams → Optimizer runs + predictions merge
- GitHub Pages auto-deploys within 1-2 minutes
- Website refreshes data every 5 minutes

**Q: How do I push everything now to GitHub?**

**A:** 
```bash
cd "/home/vincent/Downloads/owo neon util automator"
git init  # (if not done yet)
git add .
git commit -m "Initial commit with tier icons and AI system"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Then enable GitHub Pages in repo settings (Settings → Pages → Deploy from `/docs` folder)

Done! 🎉
