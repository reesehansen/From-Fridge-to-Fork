/**
 * Recipe matching and scoring service
 * Handles exact/close matching, scoring, and sorting logic
 */

import { Recipe, RecipeMatch, DietaryProfile, Substitution } from '../models/types';
import { normalizeIngredientName, normalizeIngredients } from '../utils/normalization';
import {
  isRecipeNaturallyGF,
  generateSubstitutions,
  detectNonGFIngredients,
} from '../utils/glutenFree';

interface MatchScore {
  recipe: Recipe;
  matchType: 'exact' | 'close';
  missing: string[];
  score: number; // Lower is better
  timeMinutes: number;
}

/**
 * Get non-optional, non-staple ingredients from a recipe
 */
function getRequiredRecipeIngredients(
  recipe: Recipe,
  pantryStaples: Set<string>,
): string[] {
  return recipe.ingredients
    .filter((ing) => !ing.optional && !pantryStaples.has(normalizeIngredientName(ing.name)))
    .map((ing) => normalizeIngredientName(ing.name));
}

/**
 * Calculate matching score
 * Lower score = better match
 */
function calculateScore(missingCount: number, recipeTimeMinutes: number): number {
  // Primary: fewest missing
  // Secondary: shortest time (as tiebreaker)
  return missingCount * 1000 + recipeTimeMinutes;
}

/**
 * Check if recipe matches user ingredients (exact match)
 */
function isExactMatch(
  recipe: Recipe,
  userIngredients: Set<string>,
  pantryStaples: Set<string>,
): boolean {
  const requiredRecipeIng = getRequiredRecipeIngredients(recipe, pantryStaples);

  if (requiredRecipeIng.length === 0) {
    // All ingredients are optional or pantry staples
    return true;
  }

  return requiredRecipeIng.every((ing) => userIngredients.has(ing));
}

/**
 * Get missing ingredients for a recipe
 */
function getMissingIngredients(
  recipe: Recipe,
  userIngredients: Set<string>,
  pantryStaples: Set<string>,
): string[] {
  const requiredRecipeIng = getRequiredRecipeIngredients(recipe, pantryStaples);
  return requiredRecipeIng.filter((ing) => !userIngredients.has(ing));
}

/**
 * Check if recipe is close match (within missing limit)
 */
function isCloseMatch(
  missing: string[],
  missingLimit: number,
): boolean {
  return missing.length > 0 && missing.length <= missingLimit;
}

/**
 * Build a RecipeMatch object
 */
function buildRecipeMatch(
  recipe: Recipe,
  userIngredients: Set<string>,
  missingIngredients: string[],
  pantryStaples: Set<string>,
  profile: DietaryProfile,
): RecipeMatch {
  const requiredIng = getRequiredRecipeIngredients(recipe, pantryStaples);
  const haveIngredients = requiredIng.filter((ing) => userIngredients.has(ing));

  // Generate substitutions if GF profile is applied
  let substitutions: Substitution[] = [];
  if (profile.glutenFree) {
    substitutions = generateSubstitutions(recipe.ingredients);
  }

  // Generate assistant text
  const assistantText = generateAssistantText(
    recipe,
    haveIngredients,
    missingIngredients,
    substitutions,
    profile,
  );

  return {
    recipeSummary: {
      id: recipe.id,
      title: recipe.title,
      timeMinutes: recipe.timeMinutes,
      mealType: recipe.mealType,
      difficulty: recipe.difficulty,
      tags: recipe.tags,
    },
    haveIngredients,
    missingIngredients,
    substitutions,
    assistantText,
  };
}

/**
 * Generate friendly assistant text for a recipe
 */
function generateAssistantText(
  recipe: Recipe,
  haveIngredients: string[],
  missingIngredients: string[],
  substitutions: Substitution[],
  profile: DietaryProfile,
): string {
  let text = '';

  // GF safety status
  if (profile.glutenFree) {
    if (substitutions.length === 0 && recipe.tags.includes('gluten-free')) {
      text += `✓ Naturally gluten-free! `;
    } else if (substitutions.length > 0) {
      text += `⚠️ Swap ${substitutions.length} ingredient(s) for GF versions. `;
    }
  }

  // Missing ingredients
  if (missingIngredients.length > 0) {
    text += `You're missing ${missingIngredients.length}: ${missingIngredients.slice(0, 2).join(', ')}${
      missingIngredients.length > 2 ? `, +${missingIngredients.length - 2} more` : ''
    }. `;
  } else {
    text += `You have all ingredients! `;
  }

  // Quick tip based on recipe type or difficulty
  const tips = [
    'Prep ingredients before starting - it will speed you up.',
    'This is quick weeknight material.',
    'Don\'t skip the salt at the end - it will brighten the flavor.',
    'Cook on medium heat for even results.',
    'Taste as you go; you can always add more seasoning.',
    'This reheats well - make extra for tomorrow\'s lunch.',
    'Room temperature ingredients blend better.',
    'Can be made a day ahead; just reheat gently.',
  ];
  text += tips[recipe.ingredients.length % tips.length];

  return text.slice(0, 200).trim(); // Keep under ~200 chars
}

/**
 * Search and match recipes
 */
export function searchRecipes(
  recipes: Recipe[],
  userIngredients: string[],
  missingLimit: number,
  pantryStaples: Set<string>,
  profile: DietaryProfile,
  maxResults: number,
): { exactMatches: RecipeMatch[]; closeMatches: RecipeMatch[]; normalizedInputs: string[] } {
  // Normalize user ingredients
  const normalized = normalizeIngredients(userIngredients);
  const userIngredientSet = new Set(normalized);

  const scores: MatchScore[] = [];

  // Score all recipes
  recipes.forEach((recipe) => {
    // Filter by GF if profile requires it
    if (profile.glutenFree && !recipe.tags.includes('gluten-free')) {
      const nonGFItems = detectNonGFIngredients(recipe.ingredients);
      if (nonGFItems.some((item) => item.isGluten)) {
        // Skip unless user allows adaptations
        if (!profile.allowAdaptations) {
          return;
        }
      }
    }

    const missing = getMissingIngredients(recipe, userIngredientSet, pantryStaples);
    const isExact = isExactMatch(recipe, userIngredientSet, pantryStaples);
    const isClose = isCloseMatch(missing, missingLimit);

    if (isExact || isClose) {
      scores.push({
        recipe,
        matchType: isExact ? 'exact' : 'close',
        missing,
        score: calculateScore(missing.length, recipe.timeMinutes),
        timeMinutes: recipe.timeMinutes,
      });
    }
  });

  // Sort and split into exact and close matches
  scores.sort((a, b) => a.score - b.score);

  const exactMatches = scores
    .filter((s) => s.matchType === 'exact')
    .slice(0, maxResults)
    .map((s) =>
      buildRecipeMatch(s.recipe, userIngredientSet, s.missing, pantryStaples, profile),
    );

  const closeMatches = scores
    .filter((s) => s.matchType === 'close')
    .slice(0, maxResults)
    .map((s) =>
      buildRecipeMatch(s.recipe, userIngredientSet, s.missing, pantryStaples, profile),
    );

  return {
    exactMatches,
    closeMatches,
    normalizedInputs: Array.from(userIngredientSet),
  };
}
