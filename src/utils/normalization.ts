/**
 * Ingredient normalization utilities
 * Handles lowercasing, punctuation removal, singularization, and synonym mapping
 */

import { Ingredient } from '../models/types';

// Synonym mappings for common ingredients
const INGREDIENT_SYNONYMS: Record<string, string> = {
  scallions: 'green onion',
  'green onions': 'green onion',
  'spring onion': 'green onion',
  'spring onions': 'green onion',
  'garbanzo beans': 'chickpea',
  chickpeas: 'chickpea',
  'chick peas': 'chickpea',
  'red onion': 'onion',
  'white onion': 'onion',
  'yellow onion': 'onion',
  crème: 'cream',
  'sour cream': 'cream',
  'greek yogurt': 'yogurt',
  'plain yogurt': 'yogurt',
  zucchini: 'courgette',
  aubergine: 'eggplant',
  'bell pepper': 'pepper',
  'sweet pepper': 'pepper',
  'roma tomato': 'tomato',
  'cherry tomato': 'tomato',
  'grape tomato': 'tomato',
  'ground beef': 'beef',
  beef: 'beef',
  chicken: 'chicken',
  'chicken breast': 'chicken',
  'chicken thigh': 'chicken',
  turkey: 'turkey',
  'ground turkey': 'turkey',
  pork: 'pork',
  'ground pork': 'pork',
  salmon: 'salmon',
  cod: 'fish',
  'white fish': 'fish',
  shrimp: 'shrimp',
  prawn: 'shrimp',
  egg: 'egg',
  eggs: 'egg',
  'black bean': 'bean',
  'black beans': 'bean',
  'kidney bean': 'bean',
  'pinto bean': 'bean',
  'white bean': 'bean',
  'canned bean': 'bean',
  rice: 'rice',
  'white rice': 'rice',
  'brown rice': 'rice',
  pasta: 'pasta',
  'egg noodle': 'noodle',
  ramen: 'noodle',
  bread: 'bread',
  'whole wheat bread': 'bread',
  tortilla: 'tortilla',
  'corn tortilla': 'tortilla',
  'flour tortilla': 'tortilla',
  'hot sauce': 'sauce',
  'soy sauce': 'sauce',
  vinegar: 'vinegar',
  'olive oil': 'oil',
  'vegetable oil': 'oil',
  'butter': 'butter',
  cheese: 'cheese',
  milk: 'milk',
  garlic: 'garlic',
  onion: 'onion',
  carrot: 'carrot',
  carrots: 'carrot',
  celery: 'celery',
  spinach: 'spinach',
  kale: 'kale',
  broccoli: 'broccoli',
  cauliflower: 'cauliflower',
  cucumber: 'cucumber',
  cucumbers: 'cucumber',
  tomato: 'tomato',
  tomatoes: 'tomato',
};

/**
 * Simple singularization - handles common English plurals
 */
export function singularize(word: string): string {
  const lower = word.toLowerCase();

  // Exceptions - words that don't pluralize normally
  if (
    lower === 'food' ||
    lower === 'lentil' ||
    lower.endsWith('ss') ||
    lower.endsWith('us')
  ) {
    return lower;
  }

  // -ies -> -y
  if (lower.endsWith('ies')) {
    return lower.slice(0, -3) + 'y';
  }

  // -ves -> check stem to determine if -f or -e
  if (lower.endsWith('ves')) {
    const stem = lower.slice(0, -3);
    // Words like "leaves", "knives", "calves" -> stem ends in l, f, h, or k
    if (
      stem.endsWith('l') ||
      stem.endsWith('f') ||
      stem.endsWith('h') ||
      (stem.endsWith('k') && stem !== 'olk')
    ) {
      return stem + 'f';
    }
    // Words like "olives" -> return stem + 'e'
    return stem + 'e';
  }

  // -xes, -zes, -ches, -shes -> remove -es
  if (
    lower.endsWith('xes') ||
    lower.endsWith('zes') ||
    lower.endsWith('ches') ||
    lower.endsWith('shes')
  ) {
    return lower.slice(0, -2);
  }

  // -toes, -does, -goes -> special case for "-toes" pattern (tomatoes, potatoes)
  if (lower.endsWith('toes')) {
    // Remove just the 's': potatoes -> potato, tomatoes -> tomato
    return lower.slice(0, -1);
  }

  // -oes (does, goes, heroes) -> remove -es, leaving -o
  if (lower.endsWith('oes')) {
    return lower.slice(0, -2);
  }

  // -s -> remove -s (but not if it ends in -ss)
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 1) {
    return lower.slice(0, -1);
  }

  return lower;
}

/**
 * Normalize ingredient name for matching
 * - Lowercase
 * - Remove punctuation and modifiers
 * - Trim whitespace
 * - Apply synonym mapping (does not singularize compound nouns)
 */
export function normalizeIngredientName(ingredient: string): string {
  let normalized = ingredient
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:()]/g, '') // Remove common punctuation
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();

  // Remove common descriptive modifiers (fresh, dried, roasted, etc.)
  normalized = normalized
    .replace(
      /\b(fresh|dried|frozen|cooked|raw|roasted|grilled|ground|ground|whole|halved|sliced|chopped|minced|diced|crushed|natural|organic|pre|light|dark)\b/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim();

  // Check direct synonym match (for multi-word phrases)
  if (INGREDIENT_SYNONYMS[normalized]) {
    return INGREDIENT_SYNONYMS[normalized];
  }

  // Singularize only the last word (the main noun), keep descriptors/types
  const words = normalized.split(' ');
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    const singularLastWord = singularize(lastWord);
    const withSingularLast = words.slice(0, -1).concat(singularLastWord).join(' ');

    // Check if singularizing the last word matches a synonym
    if (INGREDIENT_SYNONYMS[withSingularLast]) {
      return INGREDIENT_SYNONYMS[withSingularLast];
    }

    // Return the result with singularized last word
    return withSingularLast;
  }

  // Single word - singularize and check synonyms
  const singularized = singularize(normalized);
  return INGREDIENT_SYNONYMS[singularized] || singularized;
}

/**
 * Parse a raw ingredient string (e.g., "2 cups flour") into components
 */
export function parseIngredientString(raw: string): Ingredient {
  const trimmed = raw.trim();

  // Simple parsing: quantity unit name pattern
  // Match: number (optional decimal) unit name
  const match = trimmed.match(
    /^(\d+(?:\.\d+)?)\s+(cups?|tbsps?|tsps?|ml|l|g|kg|oz|lbs?|cans?|jars?|pinch|dash)\s+(.+)$/i,
  );

  if (match) {
    let unit = match[2].toLowerCase();
    // Normalize units to singular
    if (unit === 'cups') unit = 'cup';
    if (unit === 'tbsps') unit = 'tbsp';
    if (unit === 'tsps') unit = 'tsp';
    if (unit === 'lbs') unit = 'lb';
    if (unit === 'cans') unit = 'can';
    if (unit === 'jars') unit = 'jar';

    return {
      name: normalizeIngredientName(match[3]),
      quantity: parseFloat(match[1]),
      unit,
      optional: false,
    };
  }

  // If no quantity, just parse the name
  return {
    name: normalizeIngredientName(trimmed),
    optional: false,
  };
}

/**
 * Normalize a list of ingredient names for matching
 */
export function normalizeIngredients(ingredients: string[]): string[] {
  return ingredients
    .map(normalizeIngredientName)
    .filter((ing) => ing.length > 0);
}
