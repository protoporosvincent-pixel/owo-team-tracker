# 🌐 GitHub Pages Setup - Step by Step

## Your Repository
**URL:** https://github.com/protoporosvincent-pixel/owo-team-tracker

## Step-by-Step Setup

### 1. Go to Your Repository Settings

Visit: https://github.com/protoporosvincent-pixel/owo-team-tracker/settings

### 2. Find "Pages" in Left Sidebar

Scroll down the left sidebar and click on **"Pages"**

### 3. Configure GitHub Pages

You should see a section called "Build and deployment"

**Set these options:**

- **Source:** Select `Deploy from a branch`
- **Branch:** Select `main`
- **Folder:** Select `/docs` (very important!)
- Click **Save**

### 4. Wait for Deployment

After clicking Save:
- A banner will appear: "GitHub Pages source saved"
- Wait 1-3 minutes for initial build
- Refresh the page

You should see:
```
Your site is live at https://protoporosvincent-pixel.github.io/owo-team-tracker/
```

### 5. Visit Your Website

**Your website URL:** https://protoporosvincent-pixel.github.io/owo-team-tracker/

**Note:** First deployment can take 2-5 minutes. Be patient!

## Troubleshooting

### Pages Section Not Showing?

If you don't see "Pages" in the left sidebar:
1. Make sure you're in the **Settings** tab (not Code, Issues, etc.)
2. Scroll down - it's usually near the bottom of the left sidebar
3. May be under "Code and automation" section

### "Branch: main" Not Available?

If you can't select `main`:
1. Go back to your repository main page
2. Check if your branch is called `main` or `master`
3. If it's `master`, select that instead
4. Or rename branch: `git branch -M main` and `git push -u origin main`

### Folder Options Don't Show `/docs`?

If `/docs` folder option doesn't appear:
1. Make sure you pushed: `git push origin main`
2. Verify docs folder exists on GitHub: 
   - Go to https://github.com/protoporosvincent-pixel/owo-team-tracker
   - Click on `docs` folder
   - Verify `index.html` is there

### Site Shows 404 Error?

If the site loads but shows 404:
1. Check the URL ends with `/` (slash): `https://...github.io/owo-team-tracker/`
2. Try these URLs:
   - https://protoporosvincent-pixel.github.io/owo-team-tracker/
   - https://protoporosvincent-pixel.github.io/owo-team-tracker/index.html

### Still Not Working?

Check GitHub Actions:
1. Go to your repo
2. Click "Actions" tab
3. Look for "pages build and deployment"
4. If red (failed), click it to see error
5. If yellow (in progress), wait
6. If green (success), your site is live!

## Verification Checklist

- [ ] Repository is public (or you have GitHub Pro for private Pages)
- [ ] Settings → Pages → Source is set to "Deploy from a branch"
- [ ] Branch is set to `main`
- [ ] Folder is set to `/docs`
- [ ] Clicked "Save"
- [ ] Waited 2-5 minutes
- [ ] Visited: https://protoporosvincent-pixel.github.io/owo-team-tracker/

## Alternative: Manual Check

You can verify the files are accessible even without Pages:

**Raw GitHub URLs:**
- Index: https://raw.githubusercontent.com/protoporosvincent-pixel/owo-team-tracker/main/docs/index.html
- Data: https://raw.githubusercontent.com/protoporosvincent-pixel/owo-team-tracker/main/docs/test_results.json

If these work, your files are pushed correctly and Pages just needs to be enabled.

## Common Mistakes

### ❌ Wrong: Source set to "GitHub Actions"
Should be: "Deploy from a branch"

### ❌ Wrong: Branch set to `gh-pages`
Should be: `main`

### ❌ Wrong: Folder set to `/ (root)`
Should be: `/docs`

### ❌ Wrong: Visiting `github.com` instead of `github.io`
Should be: `github.io` (not `github.com`)

## After Setup

Once enabled, GitHub Pages will:
1. Build your site automatically on every push
2. Deploy within 30 seconds to 2 minutes
3. Show status in Actions tab
4. Update your live site

## Quick Test

After enabling Pages, test these:

1. **Homepage:** https://protoporosvincent-pixel.github.io/owo-team-tracker/
2. **Data file:** https://protoporosvincent-pixel.github.io/owo-team-tracker/test_results.json
3. **Predictions:** https://protoporosvincent-pixel.github.io/owo-team-tracker/optimizer_predictions.json
4. **Tier icon:** https://protoporosvincent-pixel.github.io/owo-team-tracker/rankings/Epic_%28Tier%29.png

All should load without 404 errors.

## Success!

When working, you'll see:
- Beautiful team ranking website
- Tier icons showing properly
- AI predictions in sidebar
- Auto-updates every 5 minutes

Your website URL: **https://protoporosvincent-pixel.github.io/owo-team-tracker/**

Bookmark it! 🎉
