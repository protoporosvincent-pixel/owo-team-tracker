/**
 * Auto Optimizer - Runs optimizer periodically and merges predictions
 * 
 * This script:
 * 1. Checks if 1000+ new teams have been tested since last optimization
 * 2. Runs the optimizer
 * 3. Merges new predictions with existing ones (avoiding duplicates)
 * 4. Updates the website
 */

import fs from 'fs';
import { optimizeTeams } from './teamOptimizer.js';

const CHECKPOINT_FILE = './optimizer_checkpoint.json';
const PREDICTIONS_FILE = './docs/optimizer_predictions.json';
const MIN_NEW_TEAMS = 1000; // Run optimizer every 1000 new teams

/**
 * Load checkpoint data
 */
function loadCheckpoint() {
  try {
    const data = fs.readFileSync(CHECKPOINT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { lastTeamCount: 0, lastRun: null };
  }
}

/**
 * Save checkpoint data
 */
function saveCheckpoint(teamCount) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({
    lastTeamCount: teamCount,
    lastRun: new Date().toISOString()
  }, null, 2));
}

/**
 * Load existing predictions
 */
function loadExistingPredictions() {
  try {
    const data = fs.readFileSync(PREDICTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { predictions: [] };
  }
}

/**
 * Check if two teams are the same
 */
function teamsEqual(team1, team2) {
  const animals1 = team1.animals.slice().sort().join('|');
  const animals2 = team2.animals.slice().sort().join('|');
  const weapons1 = team1.weaponCodes.slice().sort().join('|');
  const weapons2 = team2.weaponCodes.slice().sort().join('|');
  
  return animals1 === animals2 && weapons1 === weapons2;
}

/**
 * Merge new predictions with existing ones
 */
function mergePredictions(existingData, newData) {
  const existing = existingData.predictions || [];
  const newPreds = newData.predictions || [];
  
  console.log(`\n📊 Merging predictions:`);
  console.log(`   Existing: ${existing.length} teams`);
  console.log(`   New: ${newPreds.length} teams`);
  
  // Add new predictions that don't exist
  let added = 0;
  let duplicates = 0;
  
  for (const newPred of newPreds) {
    const isDuplicate = existing.some(ex => teamsEqual(ex, newPred));
    
    if (!isDuplicate) {
      existing.push(newPred);
      added++;
    } else {
      duplicates++;
    }
  }
  
  // Re-rank all predictions by score
  existing.sort((a, b) => b.predictedScore - a.predictedScore);
  existing.forEach((pred, i) => {
    pred.rank = i + 1;
  });
  
  console.log(`   ✅ Added: ${added} new teams`);
  console.log(`   ⏭️  Skipped: ${duplicates} duplicates`);
  console.log(`   📈 Total: ${existing.length} teams`);
  
  return {
    generatedAt: new Date().toISOString(),
    totalTeamsTested: newData.totalTeamsTested || 0,
    currentBestScore: newData.currentBestScore || 0,
    predictions: existing
  };
}

/**
 * Main auto-optimize routine
 */
async function autoOptimize() {
  console.log('🤖 Auto Optimizer - Periodic ML Predictions');
  console.log('='.repeat(60));
  
  // Load current team count
  let currentTeamCount = 0;
  try {
    const testResults = JSON.parse(fs.readFileSync('./test_results.json', 'utf8'));
    currentTeamCount = testResults.length;
  } catch (error) {
    console.error('❌ Could not load test_results.json');
    return;
  }
  
  console.log(`\n📊 Current teams tested: ${currentTeamCount.toLocaleString()}`);
  
  // Load checkpoint
  const checkpoint = loadCheckpoint();
  const newTeams = currentTeamCount - checkpoint.lastTeamCount;
  
  console.log(`   Last optimization: ${checkpoint.lastRun || 'Never'}`);
  console.log(`   Teams since last run: ${newTeams.toLocaleString()}`);
  
  if (newTeams < MIN_NEW_TEAMS && checkpoint.lastRun) {
    console.log(`\n⏸️  Not enough new teams yet (need ${MIN_NEW_TEAMS - newTeams} more)`);
    console.log(`   Run manually with: npm run optimize`);
    return;
  }
  
  console.log(`\n✅ Running optimizer (${newTeams} new teams)`);
  console.log('='.repeat(60));
  
  // Run optimizer
  await optimizeTeams();
  
  // Load new predictions
  const newPredictions = loadExistingPredictions();
  
  // Load existing predictions
  const existingPredictions = loadExistingPredictions();
  
  // Merge
  const merged = mergePredictions(existingPredictions, newPredictions);
  
  // Save merged predictions
  fs.writeFileSync(PREDICTIONS_FILE, JSON.stringify(merged, null, 2));
  console.log(`\n💾 Saved ${merged.predictions.length} predictions to ${PREDICTIONS_FILE}`);
  
  // Update checkpoint
  saveCheckpoint(currentTeamCount);
  console.log(`✅ Checkpoint updated\n`);
}

// Run if called directly
autoOptimize().catch(console.error);

export { autoOptimize, mergePredictions };
