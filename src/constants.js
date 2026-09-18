/**
 * Constants for the bot
 */

// Available animals - ONLY the ones user specified
export const ANIMALS = [
  'midautumn',
  'sept',
  'whdviva',
  'camel',
  'fish',
  'panda',
  'spider',
  'shrimp',
  'deer',
  'fox',
  'lion',
  'owl',
  'squid',
  'gorilla'
];

// Animal combat stats for weapon compatibility
export const ANIMAL_STATS = {
  'midautumn': { hp: 8, att: 4, pr: 2, wp: 3, mag: 1, mr: 2 },
  'sept': { hp: 7, att: 1, pr: 1, wp: 1, mag: 8, mr: 2 },
  'whdviva': { hp: 7, att: 3, pr: 1, wp: 7, mag: 1, mr: 1 },
  'camel': { hp: 1, att: 0, pr: 0, wp: 5, mag: 14, mr: 0 },
  'fish': { hp: 0, att: 0, pr: 0, wp: 1, mag: 19, mr: 0 },
  'spider': { hp: 0, att: 19, pr: 0, wp: 1, mag: 0, mr: 0 },
  'shrimp': { hp: 0, att: 0, pr: 0, wp: 10, mag: 10, mr: 0 },
  'panda': { hp: 1, att: 10, pr: 0, wp: 9, mag: 0, mr: 0 },
  'lion': { hp: 7, att: 7, pr: 2, wp: 1, mag: 1, mr: 2 },
  'deer': { hp: 3, att: 1, pr: 1, wp: 3, mag: 11, mr: 1 },
  'fox': { hp: 4, att: 9, pr: 1, wp: 3, mag: 1, mr: 2 },
  'squid': { hp: 3, att: 1, pr: 2, wp: 6, mag: 6, mr: 2 },
  'gorilla': { hp: 8, att: 7, pr: 2, wp: 1, mag: 1, mr: 2 },
  'owl': { hp: 10, att: 1, pr: 3, wp: 1, mag: 2, mr: 3 }
};

// Battle templates - ONLY the ones user specified
export const TEMPLATES = [
  { id: 'hstall', name: 'Hstaff-Scepter-Stall' },
  { id: 'pstall', name: 'Pstaff Meta Res' },
  { id: 'pstall_discharge', name: 'Pstaff Meta Discharge' },
  { id: 'crune_pshield', name: 'Crune Pshield' },
  { id: 'spider_crune', name: 'Spider_Crune' },
  { id: 'estaff_crune', name: 'Estaff Gem-Crune' },
  { id: 'wand_crune', name: 'Wand-Crune' },
  { id: 'bow_crune', name: 'Bow-Crune' },
  { id: 'wbow_crune', name: 'Wbow-Shield-Crune' },
  { id: 'claw_crune', name: 'Cclaw-Shield-Crune' },
  { id: 'wand_crune_sstaff', name: 'Wand Crune Sstaff' },
  { id: 'sc_stall_new', name: 'New Shield Crune Stall' },
  { id: 'hdbr', name: 'Hybrid Double Rstaff' },
  { id: 'r1pmag', name: 'Rstaff-Pstaff-Mag' },
  { id: 'ds_shield_wp', name: 'DS Shield (WP tank)' },
  { id: 'ffishy', name: 'Pstall Disruption' },
  { id: 'pstaff_rstall', name: 'Pstaff-Rstall' },
  { id: 'esc_blitz', name: 'Estaff-Scythe Blitz' },
  { id: 'ds_crune_sg', name: 'Double Scythe Crune' },
  { id: 'tgem_blitz', name: 'Triple-Gem-Blitz' },
  { id: 'dbffish_scepter', name: 'Double-Ffish-Scepter' },
  { id: 'dbffish', name: 'Double Ffish Disruption' },
  { id: 'ffishcharge', name: 'Ffish Discharge Disruption' }
];

// Default team level
export const DEFAULT_LEVEL = 50;
