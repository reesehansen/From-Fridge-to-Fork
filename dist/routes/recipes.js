"use strict";
/**
 * Recipe search routes and controllers
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataLoader_1 = require("../services/dataLoader");
const recipeSearch_1 = require("../services/recipeSearch");
const config_1 = require("../utils/config");
const router = (0, express_1.Router)();
/**
 * POST /api/recipes/search
 * Search recipes by ingredients and dietary profile
 */
router.post('/search', (req, res) => {
    try {
        const searchReq = req.body;
        // Validate request
        const validation = (0, config_1.validateSearchRequest)(searchReq);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        // Normalize ingredients to string array
        const ingredientsList = Array.isArray(searchReq.ingredients)
            ? searchReq.ingredients
            : [searchReq.ingredients];
        // Get configuration
        const missingLimit = searchReq.missingLimit ?? config_1.config.defaultMissingLimit;
        const maxResults = config_1.config.maxResults;
        const pantryStaples = (0, config_1.getPantryStaplesSet)();
        // Load recipes
        const recipes = (0, dataLoader_1.getAllRecipes)();
        // Perform search
        const { exactMatches, closeMatches, normalizedInputs } = (0, recipeSearch_1.searchRecipes)(recipes, ingredientsList, missingLimit, pantryStaples, searchReq.profile, maxResults);
        const result = {
            exactMatches,
            closeMatches,
            meta: {
                missingLimit,
                staplesUsed: Array.from(pantryStaples),
                normalizedInputs,
                gfProfileApplied: searchReq.profile.glutenFree,
            },
        };
        res.json(result);
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * GET /api/recipes/:id
 * Get a single recipe by ID
 */
router.get('/:id', (req, res) => {
    try {
        const recipe = (0, dataLoader_1.getRecipeById)(req.params.id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    }
    catch (error) {
        console.error('Fetch recipe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    try {
        const stats = (0, dataLoader_1.getDatasetStats)();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            datasetSize: stats.totalRecipes,
            stats,
        });
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=recipes.js.map