/**
 * Core types and interfaces for the recipe assistant
 */
export interface Ingredient {
    name: string;
    quantity?: number;
    unit?: string;
    optional?: boolean;
}
export interface Recipe {
    id: string;
    title: string;
    cuisine?: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    timeMinutes: number;
    difficulty: 'easy' | 'medium' | 'hard';
    ingredients: Ingredient[];
    instructions: string[];
    tags: string[];
}
export interface Substitution {
    ingredient: string;
    suggestion: string;
}
export interface RecipeMatch {
    recipeSummary: {
        id: string;
        title: string;
        timeMinutes: number;
        mealType: string;
        difficulty: string;
        tags: string[];
    };
    haveIngredients: string[];
    missingIngredients: string[];
    substitutions: Substitution[];
    assistantText: string;
}
export interface SearchResult {
    exactMatches: RecipeMatch[];
    closeMatches: RecipeMatch[];
    meta: {
        missingLimit: number;
        staplesUsed: string[];
        normalizedInputs: string[];
        gfProfileApplied: boolean;
    };
}
export interface DietaryProfile {
    glutenFree: boolean;
    allowAdaptations?: boolean;
}
export interface SearchRequest {
    ingredients: string | string[];
    profile: DietaryProfile;
    missingLimit?: number;
}
//# sourceMappingURL=types.d.ts.map