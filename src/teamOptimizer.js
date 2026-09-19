/**
 * Team Optimizer - ML-Inspired Algorithm to Find Optimal Teams
 * 
 * Uses statistical analysis and collaborative filtering to predict
 * the best possible team combinations from existing test data.
 * 
 * Algorithms used:
 * 1. Collaborative Filtering - Find patterns from successful teams
 * 2. Feature Importance - Weight animals/weapons by success rate
 * 3. Ensemble Learning - Combine multiple scoring methods
 * 4. Genetic Algorithm - Breed traits from top performers
 */

import fs from 'fs';
import { loadWeapons } from './teamGenerator.js';

/**
 * Load test results
 */
function loadTestResults() {
  try {
    const data = fs.readFileSync('./test_results.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading test_results.json:', error.message);
    return [];
  }
}

/**
 * Calculate win+tie rate
 */
function combinedRate(team) {
  const total = (team.totalWins || 0) + (team.totalLosses || 0) + (team.totalTies || 0);
  return total ? ((team.totalWins || 0) + (team.totalTies || 0)) / total * 100 : 0;
}

/**
 * Calculate pure win rate
 */
function winRate(team) {
  const total = (team.totalWins || 0) + (team.totalLosses || 0) + (team.totalTies || 0);
  return total ? (team.totalWins || 0) / total * 100 : 0;
}

/**
 * ALGORITHM 1: Feature Importance Analysis
 * Analyzes which animals/weapons/formations contribute most to success
 */
function analyzeFeatureImportance(teams) {
  console.log('\n🔬 ALGORITHM 1: Feature Importance Analysis');
  console.log('='.repeat(60));
  
  const animalScores = {};
  const weaponScores = {};
  const formationScores = {};
  const animalPairScores = {};
  const weaponPairScores = {};
  
  teams.forEach(team => {
    const score = combinedRate(team);
    const wins = team.totalWins || 0;
    const ties = team.totalTies || 0;
    const animals = team.combination?.animals || [];
    const weapons = team.combination?.weapons || [];
    const weaponNames = team.combination?.weaponNames || [];
    const formation = team.combination?._meta?.formation || 'Unknown';
    
    // Animal scoring
    animals.forEach(animal => {
      if (!animalScores[animal]) animalScores[animal] = { totalScore: 0, count: 0, wins: 0, ties: 0 };
      animalScores[animal].totalScore += score;
      animalScores[animal].count++;
      animalScores[animal].wins += wins;
      animalScores[animal].ties += ties;
    });
    
    // Weapon scoring
    weaponNames.forEach((weapon, idx) => {
      if (!weaponScores[weapon]) weaponScores[weapon] = { totalScore: 0, count: 0, wins: 0, ties: 0, code: weapons[idx] };
      weaponScores[weapon].totalScore += score;
      weaponScores[weapon].count++;
      weaponScores[weapon].wins += wins;
      weaponScores[weapon].ties += ties;
    });
    
    // Formation scoring
    if (!formationScores[formation]) formationScores[formation] = { totalScore: 0, count: 0, wins: 0, ties: 0 };
    formationScores[formation].totalScore += score;
    formationScores[formation].count++;
    formationScores[formation].wins += wins;
    formationScores[formation].ties += ties;
    
    // Animal pair synergy
    for (let i = 0; i < animals.length; i++) {
      for (let j = i + 1; j < animals.length; j++) {
        const pair = [animals[i], animals[j]].sort().join('+');
        if (!animalPairScores[pair]) animalPairScores[pair] = { totalScore: 0, count: 0 };
        animalPairScores[pair].totalScore += score;
        animalPairScores[pair].count++;
      }
    }
    
    // Weapon pair synergy
    for (let i = 0; i < weaponNames.length; i++) {
      for (let j = i + 1; j < weaponNames.length; j++) {
        const pair = [weaponNames[i], weaponNames[j]].sort().join(' + ');
        if (!weaponPairScores[pair]) weaponPairScores[pair] = { totalScore: 0, count: 0 };
        weaponPairScores[pair].totalScore += score;
        weaponPairScores[pair].count++;
      }
    }
  });
  
  // Calculate averages
  Object.keys(animalScores).forEach(k => {
    animalScores[k].avgScore = animalScores[k].totalScore / animalScores[k].count;
  });
  Object.keys(weaponScores).forEach(k => {
    weaponScores[k].avgScore = weaponScores[k].totalScore / weaponScores[k].count;
  });
  Object.keys(formationScores).forEach(k => {
    formationScores[k].avgScore = formationScores[k].totalScore / formationScores[k].count;
  });
  Object.keys(animalPairScores).forEach(k => {
    animalPairScores[k].avgScore = animalPairScores[k].totalScore / animalPairScores[k].count;
  });
  Object.keys(weaponPairScores).forEach(k => {
    weaponPairScores[k].avgScore = weaponPairScores[k].totalScore / weaponPairScores[k].count;
  });
  
  // Top performers
  const topAnimals = Object.entries(animalScores)
    .sort((a, b) => b[1].avgScore - a[1].avgScore)
    .slice(0, 10);
  
  const topWeapons = Object.entries(weaponScores)
    .sort((a, b) => b[1].avgScore - a[1].avgScore)
    .slice(0, 15);
  
  const topFormations = Object.entries(formationScores)
    .sort((a, b) => b[1].avgScore - a[1].avgScore)
    .slice(0, 5);
  
  const topAnimalPairs = Object.entries(animalPairScores)
    .filter(([k, v]) => v.count >= 10) // At least 10 samples
    .sort((a, b) => b[1].avgScore - a[1].avgScore)
    .slice(0, 10);
  
  const topWeaponPairs = Object.entries(weaponPairScores)
    .filter(([k, v]) => v.count >= 5)
    .sort((a, b) => b[1].avgScore - a[1].avgScore)
    .slice(0, 10);
  
  console.log('\n📊 Top Performing Animals:');
  topAnimals.forEach(([animal, stats], i) => {
    console.log(`  ${i + 1}. ${animal.padEnd(12)} - Avg: ${stats.avgScore.toFixed(2)}% (${stats.count} teams, ${stats.wins}W/${stats.ties}T)`);
  });
  
  console.log('\n⚔️  Top Performing Weapons:');
  topWeapons.forEach(([weapon, stats], i) => {
    console.log(`  ${i + 1}. ${weapon.padEnd(30)} - Avg: ${stats.avgScore.toFixed(2)}% (${stats.count} teams)`);
  });
  
  console.log('\n🎯 Top Performing Formations:');
  topFormations.forEach(([formation, stats], i) => {
    console.log(`  ${i + 1}. ${formation.padEnd(30)} - Avg: ${stats.avgScore.toFixed(2)}% (${stats.count} teams)`);
  });
  
  console.log('\n🤝 Best Animal Synergies:');
  topAnimalPairs.forEach(([pair, stats], i) => {
    console.log(`  ${i + 1}. ${pair.padEnd(25)} - Avg: ${stats.avgScore.toFixed(2)}% (${stats.count} teams)`);
  });
  
  console.log('\n⚡ Best Weapon Synergies:');
  topWeaponPairs.forEach(([pair, stats], i) => {
    console.log(`  ${i + 1}. ${pair.substring(0, 45).padEnd(45)} - Avg: ${stats.avgScore.toFixed(2)}% (${stats.count} teams)`);
  });
  
  return {
    animalScores,
    weaponScores,
    formationScores,
    animalPairScores,
    weaponPairScores,
    topAnimals,
    topWeapons,
    topFormations
  };
}

/**
 * ALGORITHM 2: Ensemble Scoring
 * Combines multiple scoring methods to predict team strength
 */
function ensembleScoring(candidateTeam, featureScores, teams) {
  const { animalScores, weaponScores, formationScores, animalPairScores, weaponPairScores } = featureScores;
  
  let scores = {
    animalScore: 0,
    weaponScore: 0,
    formationScore: 0,
    synergyScore: 0,
    diversityScore: 0,
    historicalScore: 0
  };
  
  // 1. Animal Score (weighted average)
  const animals = candidateTeam.animals;
  animals.forEach(animal => {
    if (animalScores[animal]) {
      scores.animalScore += animalScores[animal].avgScore;
    }
  });
  scores.animalScore /= animals.length;
  
  // 2. Weapon Score (weighted average)
  const weaponNames = candidateTeam.weaponNames;
  weaponNames.forEach(weapon => {
    if (weaponScores[weapon]) {
      scores.weaponScore += weaponScores[weapon].avgScore;
    }
  });
  scores.weaponScore /= weaponNames.length;
  
  // 3. Formation Score
  const formation = candidateTeam.formation;
  if (formationScores[formation]) {
    scores.formationScore = formationScores[formation].avgScore;
  }
  
  // 4. Synergy Score (animal pairs)
  let synergyCount = 0;
  for (let i = 0; i < animals.length; i++) {
    for (let j = i + 1; j < animals.length; j++) {
      const pair = [animals[i], animals[j]].sort().join('+');
      if (animalPairScores[pair]) {
        scores.synergyScore += animalPairScores[pair].avgScore;
        synergyCount++;
      }
    }
  }
  if (synergyCount > 0) scores.synergyScore /= synergyCount;
  
  // 5. Diversity Score (different animal roles)
  const roles = new Set();
  const ANIMAL_ROLES = {
    'spider': ['attacker'], 'fox': ['attacker', 'tank'], 'panda': ['attacker', 'tank'],
    'fish': ['attacker'], 'deer': ['attacker', 'healer', 'replenisher'],
    'sept': ['attacker', 'healer'], 'squid': ['healer', 'replenisher'],
    'shrimp': ['healer', 'tank'], 'camel': ['replenisher', 'healer'],
    'owl': ['tank', 'healer'], 'lion': ['attacker', 'tank'],
    'midautumn': ['tank', 'healer', 'attacker'],
    'gorilla': ['attacker', 'healer', 'tank', 'replenisher'],
    'whdviva': ['attacker', 'healer']
  };
  
  animals.forEach(animal => {
    if (ANIMAL_ROLES[animal]) {
      ANIMAL_ROLES[animal].forEach(role => roles.add(role));
    }
  });
  scores.diversityScore = (roles.size / 4) * 100; // Max 4 roles (attacker, healer, tank, replenisher)
  
  // 6. Historical Score (check if similar team exists)
  const similarTeams = teams.filter(t => {
    const teamAnimals = t.combination?.animals || [];
    const matchCount = teamAnimals.filter(a => animals.includes(a)).length;
    return matchCount >= 2; // At least 2 matching animals
  });
  
  if (similarTeams.length > 0) {
    scores.historicalScore = similarTeams.reduce((sum, t) => sum + combinedRate(t), 0) / similarTeams.length;
  }
  
  // Weighted ensemble score with boosting for high-quality components
  const weights = {
    animalScore: 0.20,
    weaponScore: 0.20,
    formationScore: 0.20,
    synergyScore: 0.25,
    diversityScore: 0.05,
    historicalScore: 0.10
  };
  
  let finalScore = 
    scores.animalScore * weights.animalScore +
    scores.weaponScore * weights.weaponScore +
    scores.formationScore * weights.formationScore +
    scores.synergyScore * weights.synergyScore +
    scores.diversityScore * weights.diversityScore +
    scores.historicalScore * weights.historicalScore;
  
  // Synergy multiplier: if all components are strong, boost the score
  const avgComponentScore = (scores.animalScore + scores.weaponScore + scores.formationScore) / 3;
  if (avgComponentScore > 20) {
    const synergyBoost = 1 + ((avgComponentScore - 20) / 100); // 1-1.5x multiplier
    finalScore *= synergyBoost;
  }
  
  // Historical bonus: if similar teams did well, boost prediction
  if (scores.historicalScore > 40) {
    finalScore *= 1.2;
  }
  
  return { finalScore, breakdown: scores };
}

/**
 * ALGORITHM 3: Genetic Algorithm - Breed Optimal Teams
 * Takes traits from top performers and combines them
 */
function geneticAlgorithm(teams, featureScores, weapons) {
  console.log('\n🧬 ALGORITHM 2: Genetic Algorithm (Breeding Top Performers)');
  console.log('='.repeat(60));
  
  // Get top 10% teams as "parents"
  const sortedTeams = [...teams].sort((a, b) => combinedRate(b) - combinedRate(a));
  const topPercentile = Math.ceil(teams.length * 0.10);
  const parents = sortedTeams.slice(0, topPercentile);
  
  console.log(`\n📈 Using top ${topPercentile} teams (${(topPercentile/teams.length*100).toFixed(1)}%) as genetic pool`);
  console.log(`   Best parent: ${combinedRate(parents[0]).toFixed(2)}% win+tie rate`);
  console.log(`   Avg parent: ${(parents.reduce((s,t)=>s+combinedRate(t),0)/parents.length).toFixed(2)}% win+tie rate`);
  
  // Extract successful traits
  const successfulAnimals = {};
  const successfulWeapons = {};
  const successfulFormations = {};
  
  parents.forEach(parent => {
    const score = combinedRate(parent);
    (parent.combination?.animals || []).forEach(a => {
      successfulAnimals[a] = (successfulAnimals[a] || 0) + score;
    });
    (parent.combination?.weaponNames || []).forEach(w => {
      successfulWeapons[w] = (successfulWeapons[w] || 0) + score;
    });
    const formation = parent.combination?._meta?.formation;
    if (formation) {
      successfulFormations[formation] = (successfulFormations[formation] || 0) + score;
    }
  });
  
  // Generate offspring (new team combinations)
  const offspring = [];
  const GENERATIONS = 100;
  
  console.log(`\n🔬 Breeding ${GENERATIONS} offspring from successful traits...`);
  
  for (let i = 0; i < GENERATIONS; i++) {
    // Select random parents
    const parent1 = parents[Math.floor(Math.random() * parents.length)];
    const parent2 = parents[Math.floor(Math.random() * parents.length)];
    
    // Crossover: combine animals from both parents
    const animals1 = parent1.combination?.animals || [];
    const animals2 = parent2.combination?.animals || [];
    const allAnimals = [...new Set([...animals1, ...animals2])];
    
    // Select 3 animals (prefer from successful pool)
    const animalPool = Object.entries(successfulAnimals)
      .sort((a, b) => b[1] - a[1])
      .map(([animal]) => animal);
    
    const childAnimals = [];
    while (childAnimals.length < 3 && animalPool.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(animalPool.length, 5)); // Bias toward top 5
      const animal = animalPool.splice(idx, 1)[0];
      if (!childAnimals.includes(animal)) {
        childAnimals.push(animal);
      }
    }
    
    if (childAnimals.length < 3) continue;
    
    // Select weapons (prefer from successful pool)
    const weaponPool = Object.entries(successfulWeapons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 weapons
    
    const childWeaponNames = [];
    const childWeaponCodes = [];
    
    for (let j = 0; j < 3; j++) {
      const weaponIdx = Math.floor(Math.random() * Math.min(weaponPool.length, 10));
      const weaponName = weaponPool[weaponIdx][0];
      
      // Find weapon code
      const weaponObj = weapons.find(w => w.name === weaponName);
      if (weaponObj && !childWeaponCodes.includes(weaponObj.code)) {
        childWeaponNames.push(weaponName);
        childWeaponCodes.push(weaponObj.code);
      }
    }
    
    if (childWeaponNames.length < 3) continue;
    
    // Select formation (prefer successful ones)
    const formationEntries = Object.entries(successfulFormations).sort((a, b) => b[1] - a[1]);
    const formation = formationEntries[Math.floor(Math.random() * Math.min(formationEntries.length, 3))][0];
    
    offspring.push({
      animals: childAnimals,
      weapons: childWeaponCodes,
      weaponNames: childWeaponNames,
      formation: formation,
      generation: i
    });
  }
  
  console.log(`✅ Generated ${offspring.length} viable offspring`);
  
  // Score all offspring using ensemble method
  const scoredOffspring = offspring.map(child => {
    const { finalScore, breakdown } = ensembleScoring(child, featureScores, teams);
    return { ...child, predictedScore: finalScore, breakdown };
  });
  
  // Sort by predicted score
  scoredOffspring.sort((a, b) => b.predictedScore - a.predictedScore);
  
  return scoredOffspring;
}

/**
 * ALGORITHM 4: Template Coverage Optimization
 * Find team that covers most templates (beats or ties)
 */
function templateCoverageOptimization(teams) {
  console.log('\n🎯 ALGORITHM 3: Template Coverage Analysis');
  console.log('='.repeat(60));
  
  // Extract all unique templates
  const allTemplates = [...new Set(teams.flatMap(t => 
    (t.templateResults || []).map(tr => tr.template)
  ))];
  
  console.log(`\n📋 Total unique templates: ${allTemplates.length}`);
  
  // For each template, find which teams beat/tie it
  const templateCoverage = {};
  
  allTemplates.forEach(template => {
    templateCoverage[template] = {
      beatenBy: [],
      tiedBy: [],
      unbeaten: true
    };
    
    teams.forEach((team, idx) => {
      const result = (team.templateResults || []).find(tr => tr.template === template);
      if (result) {
        if (result.wins > 0) {
          templateCoverage[template].beatenBy.push({ teamIdx: idx, team });
          templateCoverage[template].unbeaten = false;
        }
        if (result.ties > 0) {
          templateCoverage[template].tiedBy.push({ teamIdx: idx, team });
        }
      }
    });
  });
  
  // Find hardest templates (fewest teams beat them)
  const hardestTemplates = Object.entries(templateCoverage)
    .sort((a, b) => {
      const aTotal = a[1].beatenBy.length + a[1].tiedBy.length;
      const bTotal = b[1].beatenBy.length + b[1].tiedBy.length;
      return aTotal - bTotal;
    })
    .slice(0, 10);
  
  console.log('\n🔥 Hardest Templates (least teams can beat/tie):');
  hardestTemplates.forEach(([template, data], i) => {
    console.log(`  ${i + 1}. ${template.padEnd(30)} - ${data.beatenBy.length} teams win, ${data.tiedBy.length} tie`);
  });
  
  // Find teams with best coverage
  const teamCoverageScores = teams.map((team, idx) => {
    const results = team.templateResults || [];
    const wins = results.filter(r => r.wins > 0).length;
    const ties = results.filter(r => r.ties > 0).length;
    const coverage = (wins + ties) / allTemplates.length * 100;
    
    return {
      teamIdx: idx,
      team,
      wins,
      ties,
      coverage,
      coverageScore: wins * 2 + ties // Win worth 2x tie
    };
  }).sort((a, b) => b.coverageScore - a.coverageScore);
  
  console.log('\n🏆 Best Template Coverage:');
  teamCoverageScores.slice(0, 10).forEach((data, i) => {
    console.log(`  ${i + 1}. ${data.coverage.toFixed(1)}% coverage (${data.wins}W + ${data.ties}T) - ${data.team.combination?.animals?.join('/')}`);
  });
  
  return { templateCoverage, teamCoverageScores, hardestTemplates };
}

/**
 * Main optimization routine
 */
async function optimizeTeams() {
  console.log('🚀 OwO Team Optimizer - Finding the Ultimate Team');
  console.log('='.repeat(60));
  
  const teams = loadTestResults();
  const weapons = loadWeapons();
  
  if (teams.length === 0) {
    console.error('❌ No test results found. Run tests first.');
    return;
  }
  
  console.log(`\n📊 Loaded ${teams.length.toLocaleString()} tested teams`);
  console.log(`   Using ${weapons.length} weapons for predictions`);
  
  const bestExisting = [...teams].sort((a, b) => combinedRate(b) - combinedRate(a))[0];
  console.log(`\n🥇 Current Best Team: ${combinedRate(bestExisting).toFixed(2)}% win+tie`);
  console.log(`   Animals: ${bestExisting.combination?.animals?.join(', ')}`);
  console.log(`   Weapons: ${bestExisting.combination?.weaponNames?.join(', ')}`);
  
  // Run algorithms
  const featureScores = analyzeFeatureImportance(teams);
  const coverageAnalysis = templateCoverageOptimization(teams);
  const predictedTeams = geneticAlgorithm(teams, featureScores, weapons);
  
  // Display top predicted teams
  console.log('\n\n🎯 TOP 10 PREDICTED OPTIMAL TEAMS');
  console.log('='.repeat(60));
  console.log('(These teams have never been tested but are predicted to perform well)\n');
  
  const topPredictions = predictedTeams.slice(0, 10);
  
  topPredictions.forEach((team, i) => {
    console.log(`${i + 1}. PREDICTED SCORE: ${team.predictedScore.toFixed(2)}%`);
    console.log(`   Animals: ${team.animals.join(', ')}`);
    console.log(`   Weapons: ${team.weaponNames.join(', ')}`);
    console.log(`   Formation: ${team.formation}`);
    console.log(`   Score Breakdown:`);
    console.log(`     - Animal Quality: ${team.breakdown.animalScore.toFixed(2)}%`);
    console.log(`     - Weapon Quality: ${team.breakdown.weaponScore.toFixed(2)}%`);
    console.log(`     - Formation: ${team.breakdown.formationScore.toFixed(2)}%`);
    console.log(`     - Synergy: ${team.breakdown.synergyScore.toFixed(2)}%`);
    console.log(`     - Diversity: ${team.breakdown.diversityScore.toFixed(2)}%`);
    console.log(`     - Historical: ${team.breakdown.historicalScore.toFixed(2)}%`);
    console.log('');
  });
  
  // Save predictions to file
  const outputData = {
    metadata: {
      totalTeamsTested: teams.length,
      currentBestScore: combinedRate(bestExisting),
      currentBestTeam: bestExisting,
      generatedAt: new Date().toISOString()
    },
    topAnimals: featureScores.topAnimals.map(([name, stats]) => ({ name, avgScore: stats.avgScore, count: stats.count })),
    topWeapons: featureScores.topWeapons.map(([name, stats]) => ({ name, avgScore: stats.avgScore, count: stats.count })),
    topFormations: featureScores.topFormations.map(([name, stats]) => ({ name, avgScore: stats.avgScore, count: stats.count })),
    hardestTemplates: coverageAnalysis.hardestTemplates.map(([name, data]) => ({ 
      name, 
      beatenBy: data.beatenBy.length, 
      tiedBy: data.tiedBy.length 
    })),
    predictedOptimalTeams: topPredictions.map(t => ({
      animals: t.animals,
      weapons: t.weapons,
      weaponNames: t.weaponNames,
      formation: t.formation,
      predictedScore: t.predictedScore,
      breakdown: t.breakdown
    }))
  };
  
  fs.writeFileSync('./optimizer_results.json', JSON.stringify(outputData, null, 2));
  console.log('\n💾 Results saved to optimizer_results.json');
  
  // Also save to docs folder for website
  const webData = {
    generatedAt: new Date().toISOString(),
    totalTeamsTested: teams.length,
    currentBestScore: combinedRate(bestExisting),
    predictions: topPredictions.map((t, i) => {
      // Assign tier based on predicted score (OwO wiki ranges)
      let tier = 'Common';
      if (t.predictedScore >= 100) tier = 'Fabled';        // 100%
      else if (t.predictedScore >= 95) tier = 'Legendary';  // 95-99%
      else if (t.predictedScore >= 81) tier = 'Mythical';   // 81-94%
      else if (t.predictedScore >= 61) tier = 'Epic';       // 61-80%
      else if (t.predictedScore >= 41) tier = 'Rare';       // 41-60%
      else if (t.predictedScore >= 21) tier = 'Uncommon';   // 21-40%
      // else Common (0-20%)
      
      return {
        rank: i + 1,
        tier,
        animals: t.animals,
        weaponCodes: t.weapons,
        weaponNames: t.weaponNames,
        formation: t.formation,
        predictedScore: parseFloat(t.predictedScore.toFixed(2)),
        confidence: t.breakdown.historicalScore > 20 ? 'High' : t.breakdown.historicalScore > 10 ? 'Medium' : 'Low'
      };
    })
  };
  
  fs.writeFileSync('./docs/optimizer_predictions.json', JSON.stringify(webData, null, 2));
  console.log('💾 Predictions saved to docs/optimizer_predictions.json for website');
  
  console.log('\n\n📝 RECOMMENDATIONS:');
  console.log('='.repeat(60));
  console.log(`1. Test the top 10 predicted teams immediately`);
  console.log(`2. Focus on animals: ${featureScores.topAnimals.slice(0, 5).map(([a]) => a).join(', ')}`);
  console.log(`3. Prioritize formations: ${featureScores.topFormations.slice(0, 3).map(([f]) => f).join(', ')}`);
  console.log(`4. If predicted teams score ${(bestExisting ? combinedRate(bestExisting) + 5 : 70).toFixed(0)}%+, the algorithm works!`);
  console.log(`5. Continue testing more teams to improve predictions\n`);
}

// Run if called directly
optimizeTeams().catch(console.error);

export { optimizeTeams, analyzeFeatureImportance, ensembleScoring, geneticAlgorithm };
