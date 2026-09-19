# 🌐 Live Website Setup (FREE)

Your bot results will auto-update on a live website every 100 teams!

## Option 1: GitHub Pages (Easiest)

### Step 1: Create GitHub Repository
```bash
cd "/home/vincent/Downloads/owo neon util automator"
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub
```bash
# Create a new repo on GitHub first, then:
git remote add origin https://github.com/protoporosvincent-pixel/owo-team-tracker.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repo settings
2. Click "Pages" in sidebar
3. Source: "Deploy from a branch"
4. Branch: `main` → `/docs` folder
5. Click "Save"

### Step 4: Get Your Website URL
Your site will be live at:
```
https://YOUR_USERNAME.github.io/owo-team-tracker/
```

---

## Option 2: Netlify (Alternative)

### Step 1: Push to GitHub (same as above)

### Step 2: Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Click "New site from Git"
4. Connect your GitHub repo
5. Build settings:
   - Publish directory: `docs`
   - Click "Deploy site"

### Step 3: Get Your Website URL
Netlify will give you a URL like:
```
https://amazing-name-123456.netlify.app
```

You can customize it in site settings!

---

## 🤖 Auto-Update Features

✅ **Every 100 teams:** Bot auto-pushes to GitHub  
✅ **Website updates:** 1-2 minutes after push  
✅ **Mobile-friendly:** Works on phone/tablet  
✅ **Live leaderboard:** Always shows latest results  
✅ **Search & filter:** Find specific teams/weapons  
✅ **100% FREE:** No costs ever  

---

## 🎨 Website Features

- **Real-time stats:** Total teams, best win rate
- **Top teams:** Sorted by win+tie rate
- **Search:** Find teams by animal/weapon/formation
- **Template breakdown:** See results for each matchup
- **Auto-refresh:** Updates every 5 minutes automatically
- **Responsive:** Beautiful on desktop & mobile

---

## 🔧 Manual Push (Optional)

To manually update the website:
```bash
./pushToGithub.sh
```

Or just let the bot do it automatically every 100 teams!

---

## 📱 Share Your Results

Once live, share your website URL with:
- Discord friends
- OwO communities
- Reddit posts
- Twitter/X

People can watch your testing progress in real-time! 🎉

---

## ⚙️ Troubleshooting

**Website not updating?**
- Check if git push succeeded (look at terminal logs)
- Make sure GitHub Pages is enabled in repo settings
- Wait 1-2 minutes for GitHub to rebuild

**Push script failing?**
- Make sure you've committed the initial setup
- Check git remote is set correctly
- Ensure you're not hitting GitHub's rate limits

**Data not showing?**
- Make sure `test_results.json` exists in `docs/` folder
- Check browser console for errors (F12)
- Try hard refresh (Ctrl+Shift+R)
