/**
 * Ingredient normalization utilities
 * Handles lowercasing, punctuation removal, singularization, and synonym mapping
 */
import { Ingredient } from '../models/types';
/**
 * Simple singularization - handles common English plurals
 */
export declare function singularize(word: string): string;
/**
 * Normalize ingredient name for matching
 * - Lowercase
 * - Remove punctuation and modifiers
 * - Trim whitespace
 * - Apply synonym mapping (does not singularize compound nouns)
 */
export declare function normalizeIngredientName(ingredient: string): string;
/**
 * Parse a raw ingredient string (e.g., "2 cups flour") into components
 */
export declare function parseIngredientString(raw: string): Ingredient;
/**
 * Normalize a list of ingredient names for matching
 */
export declare function normalizeIngredients(ingredients: string[]): string[];
//# sourceMappingURL=normalization.d.ts.map