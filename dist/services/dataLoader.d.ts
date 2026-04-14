/**
 * Data loader service for recipes
 */
import { Recipe } from '../models/types';
/**
 * Load recipes from JSON file (cached after first load)
 */
export declare function loadRecipes(): Recipe[];
/**
 * Get a single recipe by ID
 */
export declare function getRecipeById(id: string): Recipe | undefined;
/**
 * Get all recipes
 */
export declare function getAllRecipes(): Recipe[];
/**
 * Get dataset statistics
 */
export declare function getDatasetStats(): {
    totalRecipes: number;
    mealTypeBreakdown: {
        breakfast: number;
        lunch: number;
        dinner: number;
        snack: number;
    };
    glutenFreeCount: number;
    avgTimeMinutes: number;
};
//# sourceMappingURL=dataLoader.d.ts.map