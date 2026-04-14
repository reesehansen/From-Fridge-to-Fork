/**
 * Configuration and environment utilities
 */
export declare const config: {
    port: number;
    nodeEnv: string;
    logLevel: string;
    defaultMissingLimit: number;
    maxResults: number;
    pantryStaples: string[];
};
/**
 * Get pantry staples as a Set for efficient lookup
 */
export declare function getPantryStaplesSet(): Set<string>;
/**
 * Validate search request parameters
 */
export declare function validateSearchRequest(request: any): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=config.d.ts.map