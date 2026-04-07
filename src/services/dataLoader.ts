/**
 * Data loader service for recipes
 */

import * as fs from 'fs';
import * as path from 'path';
import { Recipe } from '../models/types';

let recipesCache: Recipe[] | null = null;

/**
 * Load recipes from JSON file (cached after first load)
 */
export function loadRecipes(): Recipe[] {
  if (recipesCache) {
    return recipesCache;
  }

  try {
    const dataPath = path.join(__dirname, '../../data/recipes.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    recipesCache = JSON.parse(fileContent) as Recipe[];
    return recipesCache;
  } catch (error) {
    console.error('Failed to load recipes:', error);
    return [];
  }
}

/**
 * Get a single recipe by ID
 */
export function getRecipeById(id: string): Recipe | undefined {
  const recipes = loadRecipes();
  return recipes.find((r) => r.id === id);
}

/**
 * Get all recipes
 */
export function getAllRecipes(): Recipe[] {
  return loadRecipes();
}

/**
 * Get dataset statistics
 */
export function getDatasetStats() {
  const recipes = loadRecipes();
  return {
    totalRecipes: recipes.length,
    mealTypeBreakdown: {
      breakfast: recipes.filter((r) => r.mealType === 'breakfast').length,
      lunch: recipes.filter((r) => r.mealType === 'lunch').length,
      dinner: recipes.filter((r) => r.mealType === 'dinner').length,
      snack: recipes.filter((r) => r.mealType === 'snack').length,
    },
    glutenFreeCount: recipes.filter((r) => r.tags.includes('gluten-free')).length,
    avgTimeMinutes:
      recipes.reduce((sum, r) => sum + r.timeMinutes, 0) / recipes.length,
  };
}
