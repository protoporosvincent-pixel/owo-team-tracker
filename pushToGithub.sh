#!/bin/bash
# Auto-push test results to GitHub for website updates

echo "📊 Pushing test results to GitHub..."

# Copy test_results.json to docs folder
cp test_results.json docs/test_results.json

# Add, commit, and push
git add docs/test_results.json docs/index.html
git commit -m "Update test results: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main || git push origin master

echo "✅ Done! Website will update in ~1 minute"
