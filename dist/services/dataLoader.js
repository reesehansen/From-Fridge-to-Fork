"use strict";
/**
 * Data loader service for recipes
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRecipes = loadRecipes;
exports.getRecipeById = getRecipeById;
exports.getAllRecipes = getAllRecipes;
exports.getDatasetStats = getDatasetStats;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let recipesCache = null;
/**
 * Load recipes from JSON file (cached after first load)
 */
function loadRecipes() {
    if (recipesCache) {
        return recipesCache;
    }
    try {
        const dataPath = path.join(__dirname, '../../data/recipes.json');
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        recipesCache = JSON.parse(fileContent);
        return recipesCache;
    }
    catch (error) {
        console.error('Failed to load recipes:', error);
        return [];
    }
}
/**
 * Get a single recipe by ID
 */
function getRecipeById(id) {
    const recipes = loadRecipes();
    return recipes.find((r) => r.id === id);
}
/**
 * Get all recipes
 */
function getAllRecipes() {
    return loadRecipes();
}
/**
 * Get dataset statistics
 */
function getDatasetStats() {
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
        avgTimeMinutes: recipes.reduce((sum, r) => sum + r.timeMinutes, 0) / recipes.length,
    };
}
//# sourceMappingURL=dataLoader.js.map