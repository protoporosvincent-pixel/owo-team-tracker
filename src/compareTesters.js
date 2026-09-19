/**
 * Compare Exhaustive vs RL Tester Results
 * 
 * Analyzes both test_results.json and rl_results.json to show:
 * - Which found better teams
 * - Efficiency metrics
 * - Learning curves
 */

import fs from 'fs';

function loadResults(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function combinedRate(team) {
  const total = (team.totalWins || 0) + (team.totalLosses || 0) + (team.totalTies || 0);
  return total ? ((team.totalWins || 0) + (team.totalTies || 0)) / total * 100 : 0;
}

function winRate(team) {
  const total = (team.totalWins || 0) + (team.totalLosses || 0) + (team.totalTies || 0);
  return total ? (team.totalWins || 0) / total * 100 : 0;
}

function analyzeResults(results, name) {
  const sorted = results.sort((a, b) => combinedRate(b) - combinedRate(a));
  
  const stats = {
    name,
    totalTeams: results.length,
    bestTeam: sorted[0],
    bestScore: sorted[0] ? combinedRate(sorted[0]) : 0,
    top10Avg: sorted.slice(0, 10).reduce((sum, t) => sum + combinedRate(t), 0) / Math.min(10, results.length),
    avgScore: results.reduce((sum, t) => sum + combinedRate(t), 0) / results.length,
    above60: results.filter(t => combinedRate(t) >= 60).length,
    above50: results.filter(t => combinedRate(t) >= 50).length,
    above40: results.filter(t => combinedRate(t) >= 40).length
  };
  
  return stats;
}

function compare() {
  console.log('📊 Exhaustive vs RL Tester Comparison');
  console.log('='.repeat(80));
  
  const exhaustive = loadResults('./test_results.json');
  const rl = loadResults('./rl_results.json');
  
  if (exhaustive.length === 0 && rl.length === 0) {
    console.log('\n❌ No results found. Run the testers first!');
    return;
  }
  
  const exhaustiveStats = analyzeResults(exhaustive, 'Exhaustive');
  const rlStats = analyzeResults(rl, 'RL (Thompson Sampling)');
  
  console.log('\n📈 OVERALL STATISTICS\n');
  
  console.log('┌─────────────────────────┬──────────────────┬──────────────────┐');
  console.log('│ Metric                  │ Exhaustive       │ RL               │');
  console.log('├─────────────────────────┼──────────────────┼──────────────────┤');
  console.log(`│ Teams Tested            │ ${exhaustiveStats.totalTeams.toString().padEnd(16)} │ ${rlStats.totalTeams.toString().padEnd(16)} │`);
  console.log(`│ Best Team Score         │ ${exhaustiveStats.bestScore.toFixed(2).padEnd(14)}% │ ${rlStats.bestScore.toFixed(2).padEnd(14)}% │`);
  console.log(`│ Top 10 Average          │ ${exhaustiveStats.top10Avg.toFixed(2).padEnd(14)}% │ ${rlStats.top10Avg.toFixed(2).padEnd(14)}% │`);
  console.log(`│ Overall Average         │ ${exhaustiveStats.avgScore.toFixed(2).padEnd(14)}% │ ${rlStats.avgScore.toFixed(2).padEnd(14)}% │`);
  console.log(`│ Teams ≥60%              │ ${exhaustiveStats.above60.toString().padEnd(16)} │ ${rlStats.above60.toString().padEnd(16)} │`);
  console.log(`│ Teams ≥50%              │ ${exhaustiveStats.above50.toString().padEnd(16)} │ ${rlStats.above50.toString().padEnd(16)} │`);
  console.log(`│ Teams ≥40%              │ ${exhaustiveStats.above40.toString().padEnd(16)} │ ${rlStats.above40.toString().padEnd(16)} │`);
  console.log('└─────────────────────────┴──────────────────┴──────────────────┘');
  
  // Efficiency metrics
  if (exhaustiveStats.totalTeams > 0 && rlStats.totalTeams > 0) {
    console.log('\n⚡ EFFICIENCY METRICS\n');
    
    const exhaustiveEfficiency = exhaustiveStats.above60 / exhaustiveStats.totalTeams * 100;
    const rlEfficiency = rlStats.above60 / rlStats.totalTeams * 100;
    
    console.log(`Exhaustive: ${exhaustiveStats.above60} good teams / ${exhaustiveStats.totalTeams} tested = ${exhaustiveEfficiency.toFixed(2)}% hit rate`);
    console.log(`RL:         ${rlStats.above60} good teams / ${rlStats.totalTeams} tested = ${rlEfficiency.toFixed(2)}% hit rate`);
    
    if (rlEfficiency > exhaustiveEfficiency) {
      const improvement = (rlEfficiency / exhaustiveEfficiency).toFixed(2);
      console.log(`\n✅ RL is ${improvement}x more efficient at finding 60%+ teams!`);
    } else {
      console.log(`\n⚠️ RL needs more time to learn (still exploring)`);
    }
    
    // Tests needed for same best score
    console.log(`\n🎯 CONVERGENCE SPEED\n`);
    console.log(`Exhaustive needed ${exhaustiveStats.totalTeams} tests to reach ${exhaustiveStats.bestScore.toFixed(2)}%`);
    console.log(`RL needed ${rlStats.totalTeams} tests to reach ${rlStats.bestScore.toFixed(2)}%`);
    
    if (rlStats.bestScore >= exhaustiveStats.bestScore && rlStats.totalTeams < exhaustiveStats.totalTeams) {
      const speedup = (exhaustiveStats.totalTeams / rlStats.totalTeams).toFixed(2);
      console.log(`\n🚀 RL found equal/better teams ${speedup}x faster!`);
    }
  }
  
  // Best teams comparison
  console.log('\n🏆 BEST TEAMS\n');
  
  if (exhaustiveStats.bestTeam) {
    console.log('Exhaustive Best:');
    console.log(`  ${exhaustiveStats.bestScore.toFixed(2)}% - ${exhaustiveStats.bestTeam.combination?.animals?.join('/')} - ${exhaustiveStats.bestTeam.combination?._meta?.formation}`);
    console.log(`  Weapons: ${exhaustiveStats.bestTeam.combination?.weaponNames?.join(', ')}`);
  }
  
  console.log('');
  
  if (rlStats.bestTeam) {
    console.log('RL Best:');
    console.log(`  ${rlStats.bestScore.toFixed(2)}% - ${rlStats.bestTeam.combination?.animals?.join('/')} - ${rlStats.bestTeam.combination?._meta?.formation}`);
    console.log(`  Weapons: ${rlStats.bestTeam.combination?.weaponNames?.join(', ')}`);
    console.log(`  Method: ${rlStats.bestTeam.combination?._meta?.method || 'N/A'}`);
  }
  
  // Learning analysis for RL
  if (rl.length >= 50) {
    console.log('\n🧠 RL LEARNING CURVE\n');
    
    // Split into phases
    const phase1 = rl.slice(0, 50);
    const phase2 = rl.slice(50, Math.min(200, rl.length));
    const phase3 = rl.slice(200);
    
    const avgPhase1 = phase1.reduce((sum, t) => sum + combinedRate(t), 0) / phase1.length;
    const avgPhase2 = phase2.length > 0 ? phase2.reduce((sum, t) => sum + combinedRate(t), 0) / phase2.length : 0;
    const avgPhase3 = phase3.length > 0 ? phase3.reduce((sum, t) => sum + combinedRate(t), 0) / phase3.length : 0;
    
    console.log(`Phase 1 (0-50 teams):     Avg ${avgPhase1.toFixed(2)}% - Learning phase`);
    if (phase2.length > 0) {
      console.log(`Phase 2 (50-200 teams):   Avg ${avgPhase2.toFixed(2)}% - Convergence phase`);
    }
    if (phase3.length > 0) {
      console.log(`Phase 3 (200+ teams):     Avg ${avgPhase3.toFixed(2)}% - Exploitation phase`);
    }
    
    if (avgPhase2 > avgPhase1) {
      console.log('\n✅ RL is learning! Average score improving over time.');
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 RECOMMENDATION\n');
  
  if (rlStats.totalTeams < 100) {
    console.log('⏳ RL needs more data (run for at least 100 teams to evaluate)');
  } else if (rlStats.bestScore > exhaustiveStats.bestScore) {
    console.log('🎯 RL found better teams! Consider using RL exclusively.');
  } else if (rlStats.bestScore >= exhaustiveStats.bestScore * 0.95 && rlStats.totalTeams < exhaustiveStats.totalTeams * 0.5) {
    console.log('⚡ RL is faster with comparable results! RL wins!');
  } else if (exhaustiveStats.above60 / exhaustiveStats.totalTeams > rlStats.above60 / rlStats.totalTeams) {
    console.log('📊 Exhaustive has better hit rate. RL needs more tuning.');
  } else {
    console.log('🤝 Both approaches are valuable. Continue running both!');
  }
  
  console.log('\n');
}

compare();
