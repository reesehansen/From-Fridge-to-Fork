/**
 * Configuration and environment utilities
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  defaultMissingLimit: parseInt(process.env.DEFAULT_MISSING_LIMIT || '2', 10),
  maxResults: parseInt(process.env.MAX_RESULTS || '5', 10),
  pantryStaples: (process.env.PANTRY_STAPLES || 'salt,pepper,oil,water,butter')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0),
};

/**
 * Get pantry staples as a Set for efficient lookup
 */
export function getPantryStaplesSet(): Set<string> {
  return new Set(config.pantryStaples);
}

/**
 * Validate search request parameters
 */
export function validateSearchRequest(request: any): { valid: boolean; error?: string } {
  if (!request.ingredients) {
    return { valid: false, error: 'ingredients are required' };
  }

  if (!request.profile || typeof request.profile !== 'object') {
    return { valid: false, error: 'profile object is required' };
  }

  if (typeof request.profile.glutenFree !== 'boolean') {
    return { valid: false, error: 'profile.glutenFree must be boolean' };
  }

  return { valid: true };
}
