"use strict";
/**
 * Configuration and environment utilities
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
exports.config = void 0;
exports.getPantryStaplesSet = getPantryStaplesSet;
exports.validateSearchRequest = validateSearchRequest;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });
exports.config = {
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
function getPantryStaplesSet() {
    return new Set(exports.config.pantryStaples);
}
/**
 * Validate search request parameters
 */
function validateSearchRequest(request) {
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
//# sourceMappingURL=config.js.map