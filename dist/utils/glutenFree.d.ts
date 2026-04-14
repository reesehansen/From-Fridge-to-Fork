/**
 * Gluten-free rules, detection, and substitution suggestions
 */
import { Substitution } from '../models/types';
export declare const GF_SUBSTITUTIONS: Record<string, string>;
/**
 * Check if an ingredient is known to contain gluten
 */
export declare function isGlutenIngredient(ingredientName: string): boolean;
/**
 * Check if an ingredient might contain gluten (subject to product verification)
 */
export declare function mightContainGluten(ingredientName: string): boolean;
/**
 * Get suggested gluten-free substitution for an ingredient
 */
export declare function getGFSubstitution(ingredientName: string): string | null;
/**
 * Detect non-GF-safe ingredients in a recipe and generate substitutions
 */
export declare function detectNonGFIngredients(ingredients: Array<{
    name: string;
    optional?: boolean;
}>): Array<{
    ingredient: string;
    isGluten: boolean;
    substitution: string | null;
}>;
/**
 * Check if a recipe is naturally gluten-free
 */
export declare function isRecipeNaturallyGF(ingredients: Array<{
    name: string;
    optional?: boolean;
}>): boolean;
/**
 * Generate substitution suggestions for non-GF ingredients
 */
export declare function generateSubstitutions(ingredients: Array<{
    name: string;
    optional?: boolean;
}>): Substitution[];
//# sourceMappingURL=glutenFree.d.ts.map