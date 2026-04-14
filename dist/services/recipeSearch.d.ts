/**
 * Recipe matching and scoring service
 * Handles exact/close matching, scoring, and sorting logic
 */
import { Recipe, RecipeMatch, DietaryProfile } from '../models/types';
/**
 * Search and match recipes
 */
export declare function searchRecipes(recipes: Recipe[], userIngredients: string[], missingLimit: number, pantryStaples: Set<string>, profile: DietaryProfile, maxResults: number): {
    exactMatches: RecipeMatch[];
    closeMatches: RecipeMatch[];
    normalizedInputs: string[];
};
//# sourceMappingURL=recipeSearch.d.ts.map