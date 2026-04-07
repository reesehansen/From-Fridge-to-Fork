/**
 * Gluten-free rules, detection, and substitution suggestions
 */

import { Substitution } from '../models/types';
import { normalizeIngredientName } from './normalization';

// Common gluten-containing ingredients
const GLUTEN_INGREDIENTS = new Set([
  'wheat',
  'barley',
  'rye',
  'malt',
  'breadcrumb',
  'breadcrumbs',
  'flour',
  'bread',
  'pasta',
  'noodle',
  'soy sauce',
  'beer',
  'wheaten grain', // generic
  'granule mixed grain',
]);

// Ingredients that may contain gluten depending on the product
const MIGHT_CONTAIN_GLUTEN = new Set([
  'oat',
  'oats',
  'sauce',
  'seasoning',
  'bouillon',
  'broth',
  'stock',
  'gravy',
  'thickener',
]);

// Gluten substitutions
export const GF_SUBSTITUTIONS: Record<string, string> = {
  flour: 'almond flour, coconut flour, or GF flour blend',
  'soy sauce': 'tamari or coconut aminos',
  pasta: 'GF pasta (rice, chickpea, or corn-based)',
  noodle: 'GF noodles (rice, sweet potato, or egg-based)',
  breadcrumb: 'GF breadcrumbs or almond flour',
  breadcrumbs: 'GF breadcrumbs or almond flour',
  bread: 'GF bread',
  beer: 'GF beer or other beverage',
  wheat: 'GF grain (quinoa, rice, corn)',
  barley: 'GF grain (quinoa, rice, corn)',
  rye: 'GF grain (quinoa, rice, corn)',
  malt: 'GF malt vinegar alternative',
  oat: 'certified GF oats',
  oats: 'certified GF oats',
};

/**
 * Check if an ingredient is known to contain gluten
 */
export function isGlutenIngredient(ingredientName: string): boolean {
  const normalized = normalizeIngredientName(ingredientName);

  // Direct match
  if (GLUTEN_INGREDIENTS.has(normalized)) {
    return true;
  }

  // Substring match for common patterns
  for (const glutenItem of GLUTEN_INGREDIENTS) {
    if (normalized.includes(glutenItem) || glutenItem.includes(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if an ingredient might contain gluten (subject to product verification)
 */
export function mightContainGluten(ingredientName: string): boolean {
  const normalized = normalizeIngredientName(ingredientName);
  return MIGHT_CONTAIN_GLUTEN.has(normalized);
}

/**
 * Get suggested gluten-free substitution for an ingredient
 */
export function getGFSubstitution(ingredientName: string): string | null {
  const normalized = normalizeIngredientName(ingredientName);

  if (GF_SUBSTITUTIONS[normalized]) {
    return GF_SUBSTITUTIONS[normalized];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(GF_SUBSTITUTIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

/**
 * Detect non-GF-safe ingredients in a recipe and generate substitutions
 */
export function detectNonGFIngredients(
  ingredients: Array<{ name: string; optional?: boolean }>,
): Array<{ ingredient: string; isGluten: boolean; substitution: string | null }> {
  return ingredients
    .filter((ing) => !ing.optional)
    .map((ing) => ({
      ingredient: ing.name,
      isGluten: isGlutenIngredient(ing.name),
      substitution: getGFSubstitution(ing.name),
    }))
    .filter((item) => item.isGluten || item.substitution);
}

/**
 * Check if a recipe is naturally gluten-free
 */
export function isRecipeNaturallyGF(ingredients: Array<{ name: string; optional?: boolean }>): boolean {
  return !ingredients.some((ing) => !ing.optional && isGlutenIngredient(ing.name));
}

/**
 * Generate substitution suggestions for non-GF ingredients
 */
export function generateSubstitutions(
  ingredients: Array<{ name: string; optional?: boolean }>,
): Substitution[] {
  const substitutions: Substitution[] = [];

  ingredients.forEach((ing) => {
    if (ing.optional) return;

    const sub = getGFSubstitution(ing.name);
    if (sub && isGlutenIngredient(ing.name)) {
      substitutions.push({
        ingredient: ing.name,
        suggestion: sub,
      });
    }
  });

  return substitutions;
}
