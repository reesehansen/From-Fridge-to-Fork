/**
 * Recipe search routes and controllers
 */

import { Request, Response, Router } from 'express';
import { SearchRequest, SearchResult } from '../models/types';
import { getAllRecipes, getRecipeById, getDatasetStats } from '../services/dataLoader';
import { searchRecipes } from '../services/recipeSearch';
import { config, getPantryStaplesSet, validateSearchRequest } from '../utils/config';

const router = Router();

/**
 * POST /api/recipes/search
 * Search recipes by ingredients and dietary profile
 */
router.post('/search', (req: Request, res: Response) => {
  try {
    const searchReq: SearchRequest = req.body;

    // Validate request
    const validation = validateSearchRequest(searchReq);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Normalize ingredients to string array
    const ingredientsList = Array.isArray(searchReq.ingredients)
      ? searchReq.ingredients
      : [searchReq.ingredients];

    // Get configuration
    const missingLimit = searchReq.missingLimit ?? config.defaultMissingLimit;
    const maxResults = config.maxResults;
    const pantryStaples = getPantryStaplesSet();

    // Load recipes
    const recipes = getAllRecipes();

    // Perform search
    const { exactMatches, closeMatches, normalizedInputs } = searchRecipes(
      recipes,
      ingredientsList,
      missingLimit,
      pantryStaples,
      searchReq.profile,
      maxResults,
    );

    const result: SearchResult = {
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
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/recipes/:id
 * Get a single recipe by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const recipe = getRecipeById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    console.error('Fetch recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const stats = getDatasetStats();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      datasetSize: stats.totalRecipes,
      stats,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
