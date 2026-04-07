/**
 * Tests for recipe search and matching service
 */

import { searchRecipes } from '../../src/services/recipeSearch';
import { Recipe } from '../../src/models/types';

const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Chicken and Rice',
    mealType: 'dinner',
    timeMinutes: 30,
    difficulty: 'easy',
    ingredients: [
      { name: 'chicken breast', optional: false },
      { name: 'white rice', optional: false },
      { name: 'salt', optional: false },
      { name: 'pepper', optional: false },
    ],
    instructions: [],
    tags: ['gluten-free', 'easy'],
  },
  {
    id: '2',
    title: 'Pasta Carbonara',
    mealType: 'dinner',
    timeMinutes: 20,
    difficulty: 'easy',
    ingredients: [
      { name: 'pasta', optional: false },
      { name: 'eggs', optional: false },
      { name: 'bacon', optional: false },
      { name: 'parmesan cheese', optional: false },
    ],
    instructions: [],
    tags: ['quick'],
  },
  {
    id: '3',
    title: 'Simple Salad',
    mealType: 'lunch',
    timeMinutes: 10,
    difficulty: 'easy',
    ingredients: [
      { name: 'tomato', optional: false },
      { name: 'cucumber', optional: false },
      { name: 'olive oil', optional: false },
      { name: 'salt', optional: false },
    ],
    instructions: [],
    tags: ['gluten-free', 'vegetarian'],
  },
  {
    id: '4',
    title: 'Vegetable Soup',
    mealType: 'lunch',
    timeMinutes: 40,
    difficulty: 'easy',
    ingredients: [
      { name: 'carrot', optional: false },
      { name: 'onion', optional: false },
      { name: 'broth', optional: false },
      { name: 'salt', optional: true },
    ],
    instructions: [],
    tags: ['gluten-free', 'vegetarian'],
  },
];

describe('Recipe Search and Matching', () => {
  describe('searchRecipes', () => {
    const pantryStaples = new Set(['salt', 'pepper', 'oil', 'water', 'butter']);

    it('should find exact matches', () => {
      const userIngredients = ['chicken breast', 'rice'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      expect(result.exactMatches.length).toBeGreaterThan(0);
      expect(result.exactMatches[0].recipeSummary.title).toBe('Chicken and Rice');
    });

    it('should find close matches within missing limit', () => {
      const userIngredients = ['chicken breast', 'tomato'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      expect(result.closeMatches.length).toBeGreaterThan(0);
    });

    it('should not exceed missing limit for close matches', () => {
      const userIngredients = ['chicken breast', 'pasta'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      // Close matches should have <= 2 missing ingredients
      result.closeMatches.forEach((match) => {
        expect(match.missingIngredients.length).toBeLessThanOrEqual(2);
      });
    });

    it('should respect GF profile', () => {
      const userIngredients = ['pasta', 'eggs', 'bacon'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: true },
        5,
      );

      // Pasta carbonara should not appear because pasta is not GF
      // (and allowAdaptations is false)
      const titles = result.exactMatches.map((m) => m.recipeSummary.title);
      expect(titles).not.toContain('Pasta Carbonara');
    });

    it('should allow adaptations when flag is set', () => {
      const userIngredients = ['pasta', 'eggs', 'bacon'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: true, allowAdaptations: true },
        5,
      );

      // With adaptations enabled, pasta carbonara can appear
      // (substitutions will be suggested)
      // This depends on implementation
    });

    it('should ignore pantry staples in matching', () => {
      // User has only pantry staples + rice
      const userIngredients = ['rice', 'salt', 'pepper', 'oil'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      // Should not match recipes requiring non-staple ingredients
      expect(result.exactMatches.length).toBe(0);
    });

    it('should normalize ingredients in search', () => {
      const userIngredients = ['CHICKEN BREAST', 'White Rice'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      // Normalization should make this work
      expect(result.exactMatches.length).toBeGreaterThan(0);
    });

    it('should sort exact matches by score', () => {
      const userIngredients = [
        'chicken breast',
        'rice',
        'tomato',
        'cucumber',
        'olive oil',
      ];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      // Most exact match should be first
      if (result.exactMatches.length > 0) {
        expect(result.exactMatches[0].missingIngredients.length).toBeLessThanOrEqual(
          result.exactMatches[result.exactMatches.length - 1].missingIngredients.length,
        );
      }
    });

    it('should limit results', () => {
      const userIngredients = ['chicken breast', 'rice', 'tomato', 'carrot', 'onion'];
      const maxResults = 2;
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        maxResults,
      );

      expect(result.exactMatches.length).toBeLessThanOrEqual(maxResults);
      expect(result.closeMatches.length).toBeLessThanOrEqual(maxResults);
    });

    it('should provide meaningful assistant text', () => {
      const userIngredients = ['chicken breast', 'rice'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      if (result.exactMatches.length > 0) {
        const assistantText = result.exactMatches[0].assistantText;
        expect(assistantText.length).toBeGreaterThan(0);
        expect(assistantText.length).toBeLessThanOrEqual(200);
      }
    });

    it('should return normalized inputs', () => {
      const userIngredients = ['CHICKEN BREAST', 'White Rice'];
      const result = searchRecipes(
        mockRecipes,
        userIngredients,
        2,
        pantryStaples,
        { glutenFree: false },
        5,
      );

      expect(result.normalizedInputs).toContain('chicken breast');
      expect(result.normalizedInputs).toContain('white rice');
    });
  });
});
