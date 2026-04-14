"use strict";
/**
 * Gluten-free rules, detection, and substitution suggestions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GF_SUBSTITUTIONS = void 0;
exports.isGlutenIngredient = isGlutenIngredient;
exports.mightContainGluten = mightContainGluten;
exports.getGFSubstitution = getGFSubstitution;
exports.detectNonGFIngredients = detectNonGFIngredients;
exports.isRecipeNaturallyGF = isRecipeNaturallyGF;
exports.generateSubstitutions = generateSubstitutions;
const normalization_1 = require("./normalization");
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
exports.GF_SUBSTITUTIONS = {
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
function isGlutenIngredient(ingredientName) {
    const normalized = (0, normalization_1.normalizeIngredientName)(ingredientName);
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
function mightContainGluten(ingredientName) {
    const normalized = (0, normalization_1.normalizeIngredientName)(ingredientName);
    return MIGHT_CONTAIN_GLUTEN.has(normalized);
}
/**
 * Get suggested gluten-free substitution for an ingredient
 */
function getGFSubstitution(ingredientName) {
    const normalized = (0, normalization_1.normalizeIngredientName)(ingredientName);
    if (exports.GF_SUBSTITUTIONS[normalized]) {
        return exports.GF_SUBSTITUTIONS[normalized];
    }
    // Check for partial matches
    for (const [key, value] of Object.entries(exports.GF_SUBSTITUTIONS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }
    return null;
}
/**
 * Detect non-GF-safe ingredients in a recipe and generate substitutions
 */
function detectNonGFIngredients(ingredients) {
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
function isRecipeNaturallyGF(ingredients) {
    return !ingredients.some((ing) => !ing.optional && isGlutenIngredient(ing.name));
}
/**
 * Generate substitution suggestions for non-GF ingredients
 */
function generateSubstitutions(ingredients) {
    const substitutions = [];
    ingredients.forEach((ing) => {
        if (ing.optional)
            return;
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
//# sourceMappingURL=glutenFree.js.map