/**
 * Tests for gluten-free utilities
 */

import {
  isGlutenIngredient,
  getGFSubstitution,
  isRecipeNaturallyGF,
  generateSubstitutions,
  detectNonGFIngredients,
} from '../../src/utils/glutenFree';

describe('Gluten-Free Utilities', () => {
  describe('isGlutenIngredient', () => {
    it('should detect gluten-containing ingredients', () => {
      expect(isGlutenIngredient('wheat')).toBe(true);
      expect(isGlutenIngredient('flour')).toBe(true);
      expect(isGlutenIngredient('bread')).toBe(true);
      expect(isGlutenIngredient('pasta')).toBe(true);
      expect(isGlutenIngredient('soy sauce')).toBe(true);
      expect(isGlutenIngredient('barley')).toBe(true);
    });

    it('should not flag non-gluten ingredients', () => {
      expect(isGlutenIngredient('rice')).toBe(false);
      expect(isGlutenIngredient('egg')).toBe(false);
      expect(isGlutenIngredient('chicken')).toBe(false);
      expect(isGlutenIngredient('salt')).toBe(false);
    });

    it('should handle case-insensitivity and normalization', () => {
      expect(isGlutenIngredient('WHEAT')).toBe(true);
      expect(isGlutenIngredient('Flour')).toBe(true);
      expect(isGlutenIngredient('  PASTA  ')).toBe(true);
    });
  });

  describe('getGFSubstitution', () => {
    it('should provide substitutions for gluten items', () => {
      const sub1 = getGFSubstitution('flour');
      expect(sub1).toBeDefined();
      expect(sub1).toContain('GF');

      const sub2 = getGFSubstitution('soy sauce');
      expect(sub2).toContain('tamari');

      const sub3 = getGFSubstitution('pasta');
      expect(sub3).toContain('GF pasta');
    });

    it('should return null for non-gluten items', () => {
      expect(getGFSubstitution('rice')).toBeNull();
      expect(getGFSubstitution('egg')).toBeNull();
    });

    it('should handle case-insensitive lookup', () => {
      const sub1 = getGFSubstitution('FLOUR');
      expect(sub1).toBeDefined();

      const sub2 = getGFSubstitution('Soy Sauce');
      expect(sub2).toBeDefined();
    });
  });

  describe('isRecipeNaturallyGF', () => {
    it('should recognize naturally GF recipes', () => {
      const gfRecipe = [
        { name: 'chicken', optional: false },
        { name: 'rice', optional: false },
        { name: 'salt', optional: false },
      ];
      expect(isRecipeNaturallyGF(gfRecipe)).toBe(true);
    });

    it('should detect recipes with gluten', () => {
      const notGFRecipe = [
        { name: 'pasta', optional: false },
        { name: 'tomato', optional: false },
      ];
      expect(isRecipeNaturallyGF(notGFRecipe)).toBe(false);
    });

    it('should ignore optional gluten items', () => {
      const recipeWithOptionalGluten = [
        { name: 'chicken', optional: false },
        { name: 'bread', optional: true }, // optional, so doesn't count
      ];
      expect(isRecipeNaturallyGF(recipeWithOptionalGluten)).toBe(true);
    });
  });

  describe('generateSubstitutions', () => {
    it('should generate substitutions for gluten items', () => {
      const ingredients = [
        { name: 'flour', optional: false },
        { name: 'soy sauce', optional: false },
      ];
      const subs = generateSubstitutions(ingredients);
      expect(subs.length).toBe(2);
      expect(subs[0].ingredient).toBe('flour');
      expect(subs[1].ingredient).toBe('soy sauce');
    });

    it('should skip optional ingredients', () => {
      const ingredients = [
        { name: 'flour', optional: true },
        { name: 'rice', optional: false },
      ];
      const subs = generateSubstitutions(ingredients);
      expect(subs.length).toBe(0);
    });

    it('should skip non-gluten items', () => {
      const ingredients = [
        { name: 'chicken', optional: false },
        { name: 'rice', optional: false },
      ];
      const subs = generateSubstitutions(ingredients);
      expect(subs.length).toBe(0);
    });
  });

  describe('detectNonGFIngredients', () => {
    it('should detect gluten-containing items', () => {
      const ingredients = [
        { name: 'flour', optional: false },
        { name: 'soy sauce', optional: false },
      ];
      const detected = detectNonGFIngredients(ingredients);
      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some((d) => d.isGluten)).toBe(true);
    });

    it('should include substitution suggestions', () => {
      const ingredients = [
        { name: 'pasta', optional: false },
      ];
      const detected = detectNonGFIngredients(ingredients);
      expect(detected[0].substitution).toBeDefined();
    });

    it('should skip optional ingredients', () => {
      const ingredients = [
        { name: 'wheat', optional: true },
        { name: 'chicken', optional: false },
      ];
      const detected = detectNonGFIngredients(ingredients);
      expect(detected.length).toBe(0);
    });
  });
});
