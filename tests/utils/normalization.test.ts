/**
 * Tests for ingredient normalization utilities
 */

import {
  singularize,
  normalizeIngredientName,
  normalizeIngredients,
  parseIngredientString,
} from '../../src/utils/normalization';

describe('Normalization', () => {
  describe('singularize', () => {
    it('should singularize regular plurals', () => {
      expect(singularize('tomatoes')).toBe('tomato');
      expect(singularize('carrots')).toBe('carrot');
      expect(singularize('onions')).toBe('onion');
    });

    it('should handle -ies to -y', () => {
      expect(singularize('berries')).toBe('berry');
      expect(singularize('cherries')).toBe('cherry');
    });

    it('should handle -ves to -f/-fe', () => {
      expect(singularize('olives')).toBe('olive');
      expect(singularize('leaves')).toBe('leaf');
    });

    it('should return singular words unchanged', () => {
      expect(singularize('salt')).toBe('salt');
      expect(singularize('pepper')).toBe('pepper');
      expect(singularize('oil')).toBe('oil');
    });
  });

  describe('normalizeIngredientName', () => {
    it('should lowercase and trim', () => {
      expect(normalizeIngredientName('  TOMATO  ')).toBe('tomato');
      expect(normalizeIngredientName('Garlic')).toBe('garlic');
    });

    it('should remove punctuation', () => {
      expect(normalizeIngredientName('salt,')).toBe('salt');
      expect(normalizeIngredientName('pepper!')).toBe('pepper');
      expect(normalizeIngredientName('oil (extra)')).toBe('oil extra');
    });

    it('should singularize', () => {
      expect(normalizeIngredientName('tomatoes')).toBe('tomato');
      expect(normalizeIngredientName('Carrots')).toBe('carrot');
    });

    it('should apply synonym mapping', () => {
      expect(normalizeIngredientName('scallions')).toBe('green onion');
      expect(normalizeIngredientName('garbanzo beans')).toBe('chickpea');
      expect(normalizeIngredientName('bell pepper')).toBe('pepper');
    });

    it('should handle complex cases', () => {
      expect(normalizeIngredientName('  CHERRY TOMATOES  ')).toBe('tomato');
      expect(normalizeIngredientName('Green Onion, fresh')).toBe('green onion');
    });
  });

  describe('normalizeIngredients', () => {
    it('should normalize array of ingredients', () => {
      const result = normalizeIngredients(['Tomatoes', 'Garlic', 'Salt']);
      expect(result).toEqual(['tomato', 'garlic', 'salt']);
    });

    it('should apply synonyms', () => {
      const result = normalizeIngredients(['scallions', 'garbanzo beans']);
      expect(result).toEqual(['green onion', 'chickpea']);
    });

    it('should filter empty strings', () => {
      const result = normalizeIngredients(['tomato', '', 'garlic']);
      expect(result).toEqual(['tomato', 'garlic']);
    });
  });

  describe('parseIngredientString', () => {
    it('should parse quantity and unit', () => {
      const result = parseIngredientString('2 cups flour');
      expect(result.quantity).toBe(2);
      expect(result.unit).toBe('cup');
      expect(result.name).toBe('flour');
    });

    it('should parse decimal quantities', () => {
      const result = parseIngredientString('0.5 tbsp salt');
      expect(result.quantity).toBe(0.5);
      expect(result.unit).toBe('tbsp');
    });

    it('should handle missing quantity', () => {
      const result = parseIngredientString('garlic');
      expect(result.quantity).toBeUndefined();
      expect(result.unit).toBeUndefined();
      expect(result.name).toBe('garlic');
    });

    it('should normalize ingredient name in parsed result', () => {
      const result = parseIngredientString('2 cups TOMATOES');
      expect(result.name).toBe('tomato');
    });
  });
});
