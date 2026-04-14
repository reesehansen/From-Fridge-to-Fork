"use strict";
/**
 * Main Express application
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const config_1 = require("./utils/config");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging (simple)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    });
    next();
});
// Routes
app.use('/api/recipes', recipes_1.default);
// Health check at root
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
const port = config_1.config.port;
app.listen(port, () => {
    console.log(`🍳 Recipe Assistant API running on http://localhost:${port}`);
    console.log(`Environment: ${config_1.config.nodeEnv}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map