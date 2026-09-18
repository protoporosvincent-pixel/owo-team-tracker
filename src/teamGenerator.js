import { ANIMALS } from './constants.js';
import fs from 'fs';

// Special exploit/synergy teams based on weapon mechanics
// These are tested FIRST to ensure we don't miss top-tier meta builds
const SPECIAL_EXPLOIT_TEAMS = [
  // 0-MAG Revive Stall
  { animals: ['owl', 'deer', 'gorilla'], weapons: ['D0FVBX', 'FNPE1O', 'FGES92'], name: '0-MAG Revive Stall (Owl)' },
  { animals: ['gorilla', 'deer', 'owl'], weapons: ['D0FVBX', 'FNPE1O', 'FGES92'], name: '0-MAG Revive Stall (Gorilla)' },
  
  // Triple Sac Hybrid
  { animals: ['gorilla', 'gorilla', 'gorilla'], weapons: ['D0FVBX', 'D0FVBX', 'FGES92'], name: 'Triple Sac Hybrid' },
  
  // Damage-Heal Hybrid (Spirit Staff)
  { animals: ['gorilla', 'deer', 'lion'], weapons: ['FNPE1O', 'FGES92', 'FM4L46'], name: 'Spirit Staff Hybrid (Gorilla)' },
  { animals: ['lion', 'deer', 'gorilla'], weapons: ['FNPE1O', 'FGES92', 'FM4L46'], name: 'Spirit Staff Hybrid (Lion)' },
  
  // Kamikaze Shield
  { animals: ['owl', 'deer', 'spider'], weapons: ['FGES92', 'D0FVBX', 'FNPE1O'], name: 'Kamikaze Shield (Owl)' },
  
  // Attacker Shield (Short Stall)
  { animals: ['spider', 'deer', 'fox'], weapons: ['FGES92', 'FNPE1O', 'FM4L46'], name: 'Attacker Shield (Spider)' },
  { animals: ['fox', 'deer', 'spider'], weapons: ['FGES92', 'FNPE1O', 'FM4L46'], name: 'Attacker Shield (Fox)' },
  
  // Attacker Scepter (Monkey Stall)
  { animals: ['spider', 'deer', 'gorilla'], weapons: ['FM4L46', 'FNPE1O', 'FGES92'], name: 'Attacker Scepter (Spider)' },
  { animals: ['fox', 'deer', 'gorilla'], weapons: ['FM4L46', 'FNPE1O', 'FGES92'], name: 'Attacker Scepter (Fox)' },
  { animals: ['gorilla', 'deer', 'spider'], weapons: ['FM4L46', 'FNPE1O', 'FGES92'], name: 'Monkey Stall (Gorilla)' },
  
  // Crune Meta Core
  { animals: ['gorilla', 'deer', 'lion'], weapons: ['FMHJE8', 'FN2LQ8', 'FMEW86'], name: 'Crune Meta (Gorilla)' },
  { animals: ['owl', 'deer', 'gorilla'], weapons: ['FMHJE8', 'FN2LQ8', 'FMEW86'], name: 'Crune Meta (Owl)' },
  
  // Cruption Meta
  { animals: ['deer', 'gorilla', 'fish'], weapons: ['FN2LQ8', 'FMHJE8', 'FMEW86'], name: 'Cruption Meta (Deer)' },
  { animals: ['gorilla', 'deer', 'fish'], weapons: ['FN2LQ8', 'FMHJE8', 'FMEW86'], name: 'Cruption Meta (Gorilla)' },
  
  // 0-WP Lifesteal Stall
  { animals: ['owl', 'deer', 'gorilla'], weapons: ['D0FVBX', 'FNPE1O', 'FGES92'], name: '0-WP Lifesteal (Owl)' },
  
  // Thorns AOE
  { animals: ['spider', 'fish', 'lion'], weapons: ['FNFCUM', 'FM4L4N', 'FGES92'], name: 'Thorns AOE (Spider)' },
  { animals: ['lion', 'fish', 'spider'], weapons: ['FNFCUM', 'FM4L4N', 'FGES92'], name: 'Thorns AOE (Lion)' },
  
  // Double AOE Magic
  { animals: ['fish', 'spider', 'gorilla'], weapons: ['FM4L4N', 'FNFCUM', 'FGES92'], name: 'Double AOE (Fish)' },
  
  // Poison + Mortality Stack
  { animals: ['fox', 'spider', 'deer'], weapons: ['FLMZTN', 'FMHJE6', 'FNF50V'], name: 'Poison+Mortality (Fox)' },
  { animals: ['spider', 'fox', 'deer'], weapons: ['FLMZTN', 'FMHJE6', 'FNF50V'], name: 'Poison+Mortality (Spider)' },
  
  // Double Scythe Blitz
  { animals: ['spider', 'fox', 'deer'], weapons: ['FMHJE6', 'FNF50V', 'FLMZTN'], name: 'Double Scythe Blitz (Spider)' },
  { animals: ['fox', 'spider', 'deer'], weapons: ['FMHJE6', 'FNF50V', 'FLMZTN'], name: 'Double Scythe Blitz (Fox)' },
  
  // Anti-Sustain Counter (Leeching Scythe)
  { animals: ['fox', 'spider', 'deer'], weapons: ['FNF50V', 'FMHJE6', 'D0FVBX'], name: 'Anti-Sustain (Fox)' },
  { animals: ['spider', 'fox', 'deer'], weapons: ['FNF50V', 'FMHJE6', 'D0FVBX'], name: 'Anti-Sustain (Spider)' },
  
  // Ffishy (Pstaff Counter)
  { animals: ['gorilla', 'lion', 'deer'], weapons: ['FMTO10', 'FM4L4M', 'FMHJE8'], name: 'Ffishy Counter (Gorilla)' },
  { animals: ['lion', 'gorilla', 'deer'], weapons: ['FMTO10', 'FM4L4M', 'FMHJE8'], name: 'Ffishy Counter (Lion)' },
  
  // Banner Crune
  { animals: ['gorilla', 'owl', 'deer'], weapons: ['FM4L4M', 'FMHJE8', 'FN2LQ8'], name: 'Banner Crune (Gorilla)' },
  { animals: ['owl', 'gorilla', 'deer'], weapons: ['FM4L4M', 'FMHJE8', 'FN2LQ8'], name: 'Banner Crune (Owl)' },
  
  // Freeze Blitz
  { animals: ['lion', 'gorilla', 'spider'], weapons: ['FKQME0', 'FMHJE6', 'FGES92'], name: 'Freeze Blitz (Lion)' },
  { animals: ['gorilla', 'lion', 'spider'], weapons: ['FKQME0', 'FMHJE6', 'FGES92'], name: 'Freeze Blitz (Gorilla)' },
  
  // Wand Crune
  { animals: ['deer', 'gorilla', 'owl'], weapons: ['FH8MML', 'FMHJE8', 'FGES92'], name: 'Wand Crune (Deer)' },
  { animals: ['gorilla', 'deer', 'owl'], weapons: ['FH8MML', 'FMHJE8', 'FGES92'], name: 'Wand Crune (Gorilla)' },
  
  // Cruption MAG Burst
  { animals: ['deer', 'fish', 'gorilla'], weapons: ['FMEW86', 'FN2LQ8', 'FMHJE8'], name: 'Cruption Burst (Deer)' },
  { animals: ['fish', 'deer', 'gorilla'], weapons: ['FMEW86', 'FN2LQ8', 'FMHJE8'], name: 'Cruption Burst (Fish)' },
  
  // Rune Crune Hybrid
  { animals: ['lion', 'deer', 'gorilla'], weapons: ['FIXUZW', 'FMHJE8', 'FGES92'], name: 'Rune Crune (Lion)' },
  
  // WP Bomb Burst
  { animals: ['gorilla', 'deer', 'owl'], weapons: ['FNFCV0', 'FMHJE8', 'FM4L46'], name: 'WP Bomb (Gorilla)' },
  { animals: ['deer', 'gorilla', 'owl'], weapons: ['FNFCV0', 'FMHJE8', 'FM4L46'], name: 'WP Bomb (Deer)' },
  
  // Thorn Tether Tank
  { animals: ['owl', 'gorilla', 'deer'], weapons: ['FNFCV1', 'FGES92', 'FMHJE8'], name: 'Thorn Tether (Owl)' },
  { animals: ['gorilla', 'owl', 'deer'], weapons: ['FNFCV1', 'FGES92', 'FMHJE8'], name: 'Thorn Tether (Gorilla)' },
  
  // Sin/Virtue Stack Hybrid
  { animals: ['lion', 'gorilla', 'deer'], weapons: ['FNFCV2', 'FMHJE8', 'FN2LQ8'], name: 'Sin/Virtue (Lion)' },
  { animals: ['gorilla', 'lion', 'deer'], weapons: ['FNFCV2', 'FMHJE8', 'FN2LQ8'], name: 'Sin/Virtue (Gorilla)' }
];

// Role-based team compositions (meta formations)
const TEAM_FORMATIONS = {
  holyTrinity: {
    name: 'Holy Trinity',
    roles: ['attacker', 'healer', 'tank'],
    description: 'Balanced: Attacker → Healer → Tank'
  },
  blitz: {
    name: 'Blitz Team',
    roles: ['attacker', 'healer', 'attacker'],
    description: 'High damage rush: 2 Attackers + Healer'
  },
  fullStall: {
    name: 'Full Stall',
    roles: ['tank', 'healer', 'replenisher'],
    description: 'Defensive outlast: Shield → Healer → Replenisher'
  },
  shortStall: {
    name: 'Short Stall',
    roles: ['attacker', 'healer', 'tank'],
    description: 'WP-sustain stall with Scepter'
  },
  doubleAoE: {
    name: 'Double AoE',
    roles: ['attacker', 'healer', 'tank'],
    description: 'All AoE weapons'
  },
  tripleSac: {
    name: 'Triple Sac Hybrid',
    roles: ['healer', 'tank', 'tank'],
    description: 'Sacrifice passives + hybrid tank'
  }
};

// EXPLOIT-BASED FORMATIONS - Test variants of known meta mechanics
const EXPLOIT_FORMATIONS = {
  sacrificeLoop: {
    name: 'Sacrifice + Resurrection Loop',
    roles: ['tank', 'healer', 'tank'],
    description: 'Infinite sustain: Sacrifice buff → Rstaff revive → repeat',
    preferredAnimals: ['gorilla', 'owl', 'lion']
  },
  
  cruneMeta: {
    name: 'Crune Meta',
    roles: ['tank', 'healer', 'attacker'],
    description: 'PR/MR sustain: Celebration heals + restores WP per turn',
    preferredAnimals: ['gorilla', 'owl', 'deer']
  },
  
  cruptionBurst: {
    name: 'Cruption Burst',
    roles: ['healer', 'attacker', 'tank'],
    description: 'Buff steal + MAG burst: Corruption extends stolen buffs',
    preferredAnimals: ['deer', 'gorilla', 'fish']
  },
  
  doubleScytheBlitz: {
    name: 'Double Scythe Blitz',
    roles: ['attacker', 'attacker', 'healer'],
    description: 'Anti-heal burst: Mortality + Poison negates healing',
    preferredAnimals: ['spider', 'fox', 'deer']
  },
  
  ffishyCounter: {
    name: 'Ffishy Counter',
    roles: ['attacker', 'replenisher', 'healer'],
    description: 'Anti-buff counter: Stinky blocks + Banner removes buffs',
    preferredAnimals: ['gorilla', 'lion', 'deer']
  },
  
  monkeyStall: {
    name: 'Monkey Stall',
    roles: ['attacker', 'healer', 'tank'],
    description: 'WP-sustain: Scepter attacker at 100% STR when WP empty',
    preferredAnimals: ['spider', 'fox', 'gorilla']
  },
  
  shortStallExploit: {
    name: 'Short Stall (Exploit)',
    roles: ['attacker', 'healer', 'tank'],
    description: 'Attacker survivability: STR attacker holds Shield',
    preferredAnimals: ['spider', 'fox', 'lion']
  },
  
  kamikazeShield: {
    name: 'Kamikaze Shield',
    roles: ['tank', 'healer', 'attacker'],
    description: 'Death buff: Kamikaze buff on death, Rstaff revives',
    preferredAnimals: ['owl', 'gorilla']
  },
  
  zeroMagRevive: {
    name: '0-MAG Revive Stall',
    roles: ['healer', 'tank', 'replenisher'],
    description: '0-MAG exploit: High HP/PR survives to revive with Sacrifice',
    preferredAnimals: ['owl', 'gorilla']
  },
  
  zeroWpLifesteal: {
    name: '0-WP Lifesteal Stall',
    roles: ['healer', 'tank', 'replenisher'],
    description: '0-WP exploit: AOE lifesteal without WP investment',
    preferredAnimals: ['owl', 'gorilla']
  }
};


// Animal roles (from meta guide) - ALL 14 animals with accurate stats
const ANIMAL_ROLES = {
  // Physical Attackers (STR-focused)
  'spider': ['attacker'],                    // 19 STR, 1 WP - Pure physical
  'fox': ['attacker', 'tank'],               // 9 STR, 4 HP, 3 PR, 1 WP, 2 MR, 1 HP - Hybrid attacker/tank
  'panda': ['attacker', 'tank'],             // 10 STR, 9 PR - Hybrid attacker/tank
  
  // Magical Attackers (MAG-focused)
  'fish': ['attacker'],                      // 19 MAG - Pure magical
  'deer': ['attacker', 'healer', 'replenisher'], // 11 MAG, 4 WP, 3 HP, 1 PR, 1 MR - Versatile
  'sept': ['attacker', 'healer'],            // 8 MAG, 7 STR, 1 HP, 1 PR, 1 WP, 2 MR - MAG attacker/healer hybrid
  
  // Healers/Support (MAG + WP)
  'squid': ['healer', 'replenisher'],        // 6 MAG, 6 WP, 3 HP, 2 MR, 1 PR - Support
  'shrimp': ['healer', 'tank'],              // 10 MR, 10 PR - Tanky healer
  'camel': ['replenisher', 'healer'],        // 14 WP, 5 MAG - WP replenisher
  
  // Tanks (HP + PR/MR)
  'owl': ['tank', 'healer'],                 // 10 HP, 3 PR, 2 MR, 2 WP, 1 MAG - Pure tank
  'lion': ['attacker', 'tank'],              // 7 STR, 7 HP, 2 PR, 2 MR, 1 WP - Hybrid tank/attacker
  'midautumn': ['tank', 'healer', 'attacker'], // 8 HP, 4 MAG, 3 STR, 2 WP, 1 PR, 2 MR - Tank/healer hybrid
  
  // Hybrid/Best All-Rounder
  'gorilla': ['attacker', 'healer', 'tank', 'replenisher'], // 8 STR, 7 PR, 2 MR, 1 HP, 1 WP - Best hybrid
  'whdviva': ['attacker', 'healer']          // 7 STR, 7 MAG, 3 HP, 1 PR, 1 WP, 1 MR - Balanced hybrid attacker
};

// Weapon roles (what role they serve)
const WEAPON_ROLES = {
  // Physical Attackers
  'Great Sword': 'attacker',
  'Bow': 'attacker',
  'Poison Dagger': 'attacker',
  'Glacial Axe': 'attacker',
  'Culling Scythe': 'attacker',
  'Leeching Scythe': 'attacker',
  'Foul Fish': 'attacker',
  'Wounding Crossbow': 'attacker',
  
  // Magical Attackers
  'Energy Staff': 'attacker',
  'Flame Staff': 'attacker',
  'Vampiric Staff': 'attacker', // hybrid attacker/healer
  'Wand': 'attacker',
  
  // Healers
  'Healing Staff': 'healer',
  'Spirit Staff': 'healer',
  'Resurrection Staff': 'healer',
  
  // Replenishers
  'Arcane Scepter': 'replenisher',
  'Scepter': 'replenisher',
  
  // Tanks
  'Defender': 'tank',
  'Aegis': 'tank',
  'Briar-Heart': 'tank',
  'Briar': 'tank',
  
  // Support/Universal
  'Vanguard': 'support',
  'Banner': 'support',
  'Rune of the Forgotten': 'universal',
  'Rune of Celebration': 'universal',
  'Rune of Luck': 'universal',
  'Orb of Potency': 'universal',
  'Orb': 'universal',
  
  // Hybrid/Special
  'Soul Tithe': 'attacker',
  'Arbiter': 'attacker',
  'Staff of Purity': 'healer',
  'Corruption': 'support',
  'Conduit': 'support',
  'Claw': 'support',
  'Bleeding Gaze': 'attacker',
  'Gaze': 'attacker'
};
// From official weapon guide with best animals per weapon
const WEAPON_BEST_ANIMALS = {
  // Physical/STR weapons
  'Great Sword': ['lion', 'gorilla', 'fox', 'panda', 'spider'],
  'Bow': ['fox', 'spider', 'panda', 'lion'],
  'Poison Dagger': ['fox', 'spider', 'panda', 'lion'],
  'Glacial Axe': ['lion', 'gorilla', 'fox', 'panda'],
  'Culling Scythe': ['fox', 'spider', 'panda', 'lion'],
  'Leeching Scythe': ['fox', 'spider', 'panda', 'lion'],
  'Foul Fish': ['lion', 'gorilla', 'fox', 'panda'],
  'Wounding Crossbow': ['fox', 'spider', 'panda', 'lion'],
  
  // Magical/MAG weapons
  'Healing Staff': ['squid', 'shrimp', 'deer', 'camel', 'fish'],
  'Vampiric Staff': ['squid', 'shrimp', 'deer', 'camel', 'fish'],
  'Wand': ['deer', 'camel', 'fish', 'squid', 'shrimp'], // Wand of Absorption
  'Flame Staff': ['squid', 'deer', 'camel', 'fish', 'shrimp'],
  'Energy Staff': ['shrimp', 'squid', 'fish', 'camel', 'deer'],
  'Spirit Staff': ['squid', 'deer', 'shrimp', 'camel', 'fish'],
  'Arcane Scepter': ['deer', 'camel', 'shrimp', 'squid', 'fish'],
  'Scepter': ['deer', 'camel', 'shrimp', 'squid', 'fish'],
  'Resurrection Staff': ['squid', 'deer', 'shrimp', 'camel', 'fish'],
  'Soul Tithe': ['gorilla', 'deer', 'squid', 'camel', 'fish'],
  
  // Hybrid weapons (can use STR or MAG)
  'Rune of the Forgotten': ['panda', 'lion', 'gorilla', 'spider', 'fox', 'deer', 'squid', 'fish', 'camel', 'shrimp'],
  'Arbiter': ['lion', 'gorilla', 'panda', 'deer', 'squid'], // Arbiter's Edge
  'Staff of Purity': ['deer', 'squid', 'lion', 'gorilla'],
  'Corruption': ['deer', 'squid', 'gorilla'], // Staff of Corruption
  'Rune of Luck': ['panda', 'lion', 'gorilla', 'spider', 'fox'],
  
  // Tank/Support weapons (work with tanky animals)
  'Defender': ['owl', 'gorilla', 'lion'], // Defender's Aegis
  'Aegis': ['owl', 'gorilla', 'lion'],
  'Orb of Potency': ['gorilla', 'owl', 'lion', 'panda', 'squid'],
  'Orb': ['gorilla', 'owl', 'lion', 'panda', 'squid'],
  'Vanguard': ['gorilla', 'lion', 'owl'], // Vanguard's Banner
  'Banner': ['gorilla', 'lion', 'owl'],
  'Rune of Celebration': ['owl', 'gorilla', 'lion'],
  'Briar-Heart': ['owl', 'gorilla', 'lion'], // Briar-Heart Staff
  'Briar': ['owl', 'gorilla', 'lion'],
  
  // Universal (work with anyone but have preferences)
  'Conduit': ['deer', 'squid', 'gorilla', 'lion'], // Conduit Claw
  'Claw': ['deer', 'squid', 'gorilla', 'lion'],
  'Bleeding Gaze': ['deer', 'squid', 'lion', 'gorilla'],
  'Gaze': ['deer', 'squid', 'lion', 'gorilla'],
};

// Animals categorized by role
const PHYSICAL_ANIMALS = ['spider', 'panda', 'fox', 'lion', 'gorilla', 'midautumn', 'whdviva'];
const MAGICAL_ANIMALS = ['fish', 'camel', 'deer', 'sept', 'squid', 'shrimp'];
const TANK_ANIMALS = ['owl', 'gorilla', 'lion'];
const HYBRID_ANIMALS = ['owl', 'gorilla', 'lion', 'deer', 'squid', 'shrimp'];

/**
 * Check if an animal can fulfill a role
 * @param {string} animal - Animal name
 * @param {string} role - Role name (attacker, healer, tank, replenisher)
 * @returns {boolean} True if animal can do this role
 */
function canFulfillRole(animal, role) {
  const roles = ANIMAL_ROLES[animal] || [];
  return roles.includes(role);
}

/**
 * Get weapon role
 * @param {Object} weapon - Weapon object
 * @returns {string} Role name
 */
function getWeaponRole(weapon) {
  for (const [keyword, role] of Object.entries(WEAPON_ROLES)) {
    if (weapon.name.includes(keyword)) {
      return role;
    }
  }
  return 'universal'; // Default to universal if not found
}

/**
 * Check if weapon matches the position's required role
 * @param {Object} weapon - Weapon object
 * @param {string} requiredRole - Required role for this position
 * @returns {boolean} True if weapon fits the role
 */
function weaponMatchesRole(weapon, requiredRole) {
  const weaponRole = getWeaponRole(weapon);
  
  // Universal weapons work anywhere
  if (weaponRole === 'universal' || weaponRole === 'support') return true;
  
  // Otherwise must match exactly (or be compatible)
  if (weaponRole === requiredRole) return true;
  
  // Vampiric Staff works as both attacker and healer
  if (weapon.name.includes('Vampiric') && (requiredRole === 'attacker' || requiredRole === 'healer')) {
    return true;
  }
  
  return false;
}

/**
 * Generate SPECIAL exploit teams first, then regular randomized teams
 * @param {Array} weapons - Array of weapon objects
 * @returns {Generator} Generator that yields valid team combinations
 */
export function* generateMetaTeams(weapons) {
  console.log(`\n🎯 PHASE 1: Testing SPECIAL EXPLOIT TEAMS (${SPECIAL_EXPLOIT_TEAMS.length} teams)`);
  console.log(`These are high-priority meta builds based on weapon mechanics\n`);
  
  let totalGenerated = 0;
  
  // PHASE 1: Test special exploit teams first
  for (const specialTeam of SPECIAL_EXPLOIT_TEAMS) {
    // Find weapon objects by code
    const weaponObjs = specialTeam.weapons.map(code => 
      weapons.find(w => w.code === code)
    ).filter(w => w); // Remove any not found
    
    // Only yield if all weapons exist
    if (weaponObjs.length === 3) {
      totalGenerated++;
      yield {
        animals: specialTeam.animals,
        weapons: specialTeam.weapons,
        weaponNames: weaponObjs.map(w => w.name),
        _meta: {
          formation: `EXPLOIT: ${specialTeam.name}`,
          roles: ['special', 'special', 'special'],
          totalGenerated,
          isExploit: true
        }
      };
    }
  }
  
  console.log(`\n✅ Special exploit teams completed (${totalGenerated} teams)`);
  console.log(`\n🔄 PHASE 2: Testing ALL FORMATIONS (TRULY RANDOMIZED)`);
  console.log(`Standard: ${Object.keys(TEAM_FORMATIONS).join(', ')}`);
  console.log(`Exploits: ${Object.keys(EXPLOIT_FORMATIONS).join(', ')}\n`);
  
  // PHASE 2: Create team pools from all formations, sample randomly
  const teamPools = [];
  
  const allFormationsList = [
    ...Object.entries(TEAM_FORMATIONS),
    ...Object.entries(EXPLOIT_FORMATIONS)
  ];
  
  console.log('Building team pools from all formations...');
  
  for (const [formationId, formation] of allFormationsList) {
    console.log(`  Building pool for ${formation.name}...`);
    
    const [role1, role2, role3] = formation.roles;
    
    const animalsForRole1 = formation.preferredAnimals 
      ? formation.preferredAnimals.filter(a => canFulfillRole(a, role1))
      : Object.keys(ANIMAL_ROLES).filter(a => canFulfillRole(a, role1));
    const animalsForRole2 = formation.preferredAnimals
      ? formation.preferredAnimals.filter(a => canFulfillRole(a, role2))
      : Object.keys(ANIMAL_ROLES).filter(a => canFulfillRole(a, role2));
    const animalsForRole3 = formation.preferredAnimals
      ? formation.preferredAnimals.filter(a => canFulfillRole(a, role3))
      : Object.keys(ANIMAL_ROLES).filter(a => canFulfillRole(a, role3));
    
    // For each animal combo, create a generator
    for (const animal1 of animalsForRole1) {
      for (const animal2 of animalsForRole2) {
        if (animal1 === animal2) continue;
        for (const animal3 of animalsForRole3) {
          if (animal1 === animal3 || animal2 === animal3) continue;
          
          const animals = [animal1, animal2, animal3];
          
          const weaponsForPos1 = weapons.filter(w => 
            isCompatible(w, animal1) && weaponMatchesRole(w, role1)
          );
          const weaponsForPos2 = weapons.filter(w => 
            isCompatible(w, animal2) && weaponMatchesRole(w, role2)
          );
          const weaponsForPos3 = weapons.filter(w => 
            isCompatible(w, animal3) && weaponMatchesRole(w, role3)
          );
          
          // Shuffle weapons for this combo
          const shuffledW1 = [...weaponsForPos1].sort(() => Math.random() - 0.5);
          const shuffledW2 = [...weaponsForPos2].sort(() => Math.random() - 0.5);
          const shuffledW3 = [...weaponsForPos3].sort(() => Math.random() - 0.5);
          
          // Create weapon combo generator for this animal combo
          const weaponGen = {
            animals,
            formation: formation.name,
            roles: formation.roles,
            w1List: shuffledW1,
            w2List: shuffledW2,
            w3List: shuffledW3,
            i1: 0, i2: 0, i3: 0,
            hasNext() {
              return this.i1 < this.w1List.length;
            },
            next() {
              if (!this.hasNext()) return null;
              
              // Find next valid combination (skip duplicates)
              while (this.i1 < this.w1List.length) {
                while (this.i2 < this.w2List.length) {
                  // Skip if w2 === w1
                  if (this.w2List[this.i2].code === this.w1List[this.i1].code) {
                    this.i2++;
                    continue;
                  }
                  
                  while (this.i3 < this.w3List.length) {
                    const w1 = this.w1List[this.i1];
                    const w2 = this.w2List[this.i2];
                    const w3 = this.w3List[this.i3];
                    
                    // Skip if w3 === w1 or w3 === w2
                    if (w3.code === w1.code || w3.code === w2.code) {
                      this.i3++;
                      continue;
                    }
                    
                    // Valid combination found, advance for next call
                    this.i3++;
                    
                    return {
                      animals: this.animals,
                      weapons: [w1.code, w2.code, w3.code],
                      weaponNames: [w1.name, w2.name, w3.name],
                      formation: this.formation,
                      roles: this.roles
                    };
                  }
                  
                  // Reset i3, advance i2
                  this.i3 = 0;
                  this.i2++;
                }
                
                // Reset i2, advance i1
                this.i2 = 0;
                this.i1++;
              }
              
              return null;
            }
          };
          
          teamPools.push(weaponGen);
        }
      }
    }
  }
  
  console.log(`\nCreated ${teamPools.length} team pools`);
  console.log('Starting round-robin sampling from all pools...\n');
  
  // Round-robin through ALL pools (formations + animal combos)
  let activePools = teamPools.filter(p => p.hasNext());
  
  while (activePools.length > 0) {
    // Shuffle active pools each round for extra randomness
    activePools.sort(() => Math.random() - 0.5);
    
    for (const pool of activePools) {
      if (pool.hasNext()) {
        const team = pool.next();
        if (team) {
          totalGenerated++;
          yield {
            animals: team.animals,
            weapons: team.weapons,
            weaponNames: team.weaponNames,
            _meta: {
              formation: team.formation,
              roles: team.roles,
              totalGenerated
            }
          };
        }
      }
    }
    
    // Remove exhausted pools
    activePools = activePools.filter(p => p.hasNext());
  }
  
  console.log(`\n✅ All ${totalGenerated.toLocaleString()} possible teams generated!`);
}

/**
 * Check if a weapon is compatible with an animal (based on actual OwO meta)
 * @param {Object} weapon - Weapon object with name property
 * @param {string} animal - Animal name
 * @returns {boolean} True if compatible
 */
function isCompatible(weapon, animal) {
  const weaponName = weapon.name;
  
  // Check if weapon has specific best animals listed
  for (const [weaponKeyword, bestAnimals] of Object.entries(WEAPON_BEST_ANIMALS)) {
    if (weaponName.includes(weaponKeyword)) {
      return bestAnimals.includes(animal);
    }
  }
  
  // Fallback: generic compatibility based on animal type
  // Pure physical weapons for physical animals
  if (PHYSICAL_ANIMALS.includes(animal)) {
    if (weaponName.includes('Sword') || weaponName.includes('Bow') || 
        weaponName.includes('Scythe') || weaponName.includes('Axe') ||
        weaponName.includes('Crossbow') || weaponName.includes('Dagger')) {
      return true;
    }
  }
  
  // Pure magical weapons for magical animals
  if (MAGICAL_ANIMALS.includes(animal)) {
    if (weaponName.includes('Staff') || weaponName.includes('Wand') ||
        weaponName.includes('Scepter') || weaponName.includes('Tithe')) {
      return true;
    }
  }
  
  // Tank weapons for tank animals
  if (TANK_ANIMALS.includes(animal)) {
    if (weaponName.includes('Aegis') || weaponName.includes('Banner') ||
        weaponName.includes('Briar') || weaponName.includes('Defender')) {
      return true;
    }
  }
  
  // Universal weapons work for hybrid animals
  if (HYBRID_ANIMALS.includes(animal)) {
    if (weaponName.includes('Rune') || weaponName.includes('Orb')) {
      return true;
    }
  }
  
  // If no specific match found, weapon not compatible
  return false;
}

/**
 * Generate all valid team combinations
 * @param {Array} weapons - Array of weapon objects from weapons.json
 * @returns {Array} Array of team combinations
 */
export function generateTeamCombinations(weapons) {
  const combinations = [];
  
  // Get all animal combinations (3 different animals from available list)
  const animalCombos = [];
  for (let i = 0; i < ANIMALS.length; i++) {
    for (let j = i + 1; j < ANIMALS.length; j++) {
      for (let k = j + 1; k < ANIMALS.length; k++) {
        animalCombos.push([ANIMALS[i], ANIMALS[j], ANIMALS[k]]);
      }
    }
  }
  
  console.log(`Generated ${animalCombos.length} animal combinations`);
  
  // For each animal combo, try all weapon combinations
  // (3 different weapons from the 78 available)
  let totalCount = 0;
  
  for (const [animal1, animal2, animal3] of animalCombos) {
    // Try all weapon combinations for these 3 animals
    for (let i = 0; i < weapons.length; i++) {
      for (let j = i + 1; j < weapons.length; j++) {
        for (let k = j + 1; k < weapons.length; k++) {
          combinations.push({
            animals: [animal1, animal2, animal3],
            weapons: [
              weapons[i].code,
              weapons[j].code,
              weapons[k].code
            ],
            weaponNames: [
              weapons[i].name,
              weapons[j].name,
              weapons[k].name
            ]
          });
          totalCount++;
        }
      }
    }
  }
  
  console.log(`Total combinations: ${totalCount}`);
  return combinations;
}

/**
 * Generate teams on-the-fly using a generator function (memory efficient)
 * @param {Array} weapons - Array of weapon objects
 * @returns {Generator} Generator that yields team combinations
 */
export function* generateFullCombinationsIterator(weapons) {
  console.log(`Using ALL ${weapons.length} weapons for comprehensive testing`);
  
  // Generate UNIQUE animal combinations
  const animalCombos = [];
  for (let i = 0; i < ANIMALS.length; i++) {
    for (let j = i + 1; j < ANIMALS.length; j++) {
      for (let k = j + 1; k < ANIMALS.length; k++) {
        animalCombos.push([ANIMALS[i], ANIMALS[j], ANIMALS[k]]);
      }
    }
  }
  
  console.log(`Total unique animal combinations: ${animalCombos.length}`);
  console.log(`Generating teams on-the-fly to save memory...`);
  
  let totalGenerated = 0;
  
  // For each animal combo, yield weapon combinations one at a time
  for (const animals of animalCombos) {
    // For each position, get compatible weapons
    const compatibleWeapons = animals.map(animal => 
      weapons.filter(weapon => isCompatible(weapon, animal))
    );
    
    // Generate all unique weapon combinations (3 different weapons)
    for (let i = 0; i < compatibleWeapons[0].length; i++) {
      for (let j = 0; j < compatibleWeapons[1].length; j++) {
        // Skip if same weapon used twice
        if (compatibleWeapons[0][i].code === compatibleWeapons[1][j].code) continue;
        
        for (let k = 0; k < compatibleWeapons[2].length; k++) {
          // Skip if weapon already used
          if (compatibleWeapons[0][i].code === compatibleWeapons[2][k].code ||
              compatibleWeapons[1][j].code === compatibleWeapons[2][k].code) continue;
          
          totalGenerated++;
          
          yield {
            animals: animals,
            weapons: [
              compatibleWeapons[0][i].code,
              compatibleWeapons[1][j].code,
              compatibleWeapons[2][k].code
            ],
            weaponNames: [
              compatibleWeapons[0][i].name,
              compatibleWeapons[1][j].name,
              compatibleWeapons[2][k].name
            ],
            _meta: {
              totalGenerated,
              currentAnimalCombo: animals.join('/')
            }
          };
        }
      }
    }
  }
  
  console.log(`Finished generating ${totalGenerated} teams`);
}

/**
 * Load weapons from JSON file
 * @returns {Array} Array of weapons
 */
export function loadWeapons() {
  try {
    const data = fs.readFileSync('./weapons.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading weapons.json:', error.message);
    return [];
  }
}
