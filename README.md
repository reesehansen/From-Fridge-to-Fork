# From Fridge to Fork - Recipe Assistant Backend

A fast, modular recipe search API that matches user ingredients to recipes while respecting dietary restrictions (starting with gluten-free).

## Features

- **Ingredient-based recipe matching**: Find exact and close matches based on available ingredients
- **Gluten-free profile support**: Detect non-GF ingredients and suggest substitutions
- **Smart normalization**: Handle ingredient synonyms, plurals, and common variations
- **Pantry-aware**: Ignore common staples (salt, pepper, oil, water, butter) by default
- **Chatbot-style output**: Each recipe includes friendly, practical cooking guidance
- **Fast & simple**: Local JSON dataset, no external API calls required
- **Tested core logic**: Unit tests for normalization, GF rules, and matching

## Project Structure

```
.
├── src/
│   ├── index.ts                 # Express app entry point
│   ├── models/
│   │   └── types.ts            # TypeScript interfaces
│   ├── routes/
│   │   └── recipes.ts          # API routes
│   ├── services/
│   │   ├── dataLoader.ts       # Recipe data loading
│   │   └── recipeSearch.ts     # Matching & scoring logic
│   └── utils/
│       ├── normalization.ts    # Ingredient normalization
│       ├── glutenFree.ts       # GF detection & substitutions
│       └── config.ts           # Configuration & validation
├── data/
│   ├── recipes.json            # 30+ recipe dataset
│   └── sample_inputs.json      # 6 example search inputs
├── tests/
│   ├── utils/
│   │   ├── normalization.test.ts
│   │   └── glutenFree.test.ts
│   └── services/
│       └── recipeSearch.test.ts
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
└── README.md
```

## Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/From-Fridge-to-Fork
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file from the example:**
   ```bash
   cp .env.example .env
   ```
   (Optional: Customize port, missing limit, max results, or pantry staples in `.env`)

## Running the Server

### Development Mode
```bash
npm run dev
```
Server will start on `http://localhost:3000`

### Production Mode
```bash
npm run build
npm start
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## API Endpoints

### 1. Search Recipes (`POST /api/recipes/search`)

Find recipes based on available ingredients and dietary profile.

**Request Body:**
```json
{
  "ingredients": ["chicken breast", "rice", "olive oil"],
  "profile": {
    "glutenFree": true,
    "allowAdaptations": false
  },
  "missingLimit": 2
}
```

**Parameters:**
- `ingredients` (required): String or array of ingredient names
- `profile.glutenFree` (required): Boolean; if true, filters for GF recipes or suggests GF substitutions
- `profile.allowAdaptations` (optional): Boolean; if true with glutenFree=true, includes recipes that can be adapted
- `missingLimit` (optional): Max missing ingredients for "close matches" (default: 2)

**Response:**
```json
{
  "exactMatches": [
    {
      "recipeSummary": {
        "id": "1",
        "title": "Chicken and Rice",
        "timeMinutes": 30,
        "mealType": "dinner",
        "difficulty": "easy",
        "tags": ["gluten-free", "easy"]
      },
      "haveIngredients": ["chicken breast", "rice"],
      "missingIngredients": [],
      "substitutions": [],
      "assistantText": "✓ Naturally gluten-free! You have all ingredients! Prep ingredients before starting—it'll speed you up."
    }
  ],
  "closeMatches": [],
  "meta": {
    "missingLimit": 2,
    "staplesUsed": ["salt", "pepper", "oil", "water", "butter"],
    "normalizedInputs": ["chicken breast", "rice", "olive oil"],
    "gfProfileApplied": true
  }
}
```

### 2. Get Recipe Details (`GET /api/recipes/:id`)

Retrieve a single recipe by ID.

**Request:**
```bash
curl http://localhost:3000/api/recipes/1
```

**Response:**
```json
{
  "id": "1",
  "title": "Grilled Chicken Tacos with Corn Tortillas",
  "cuisine": "Mexican",
  "mealType": "lunch",
  "timeMinutes": 25,
  "difficulty": "easy",
  "ingredients": [
    {
      "name": "chicken breast",
      "quantity": 1.5,
      "unit": "lb"
    },
    {
      "name": "corn tortillas",
      "quantity": 8
    },
    ...
  ],
  "instructions": [...],
  "tags": ["gluten-free", "easy", "weeknight"]
}
```

### 3. Health Check (`GET /api/health`)

Check API status and dataset stats.

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-07T10:30:00.000Z",
  "datasetSize": 30,
  "stats": {
    "totalRecipes": 30,
    "mealTypeBreakdown": {
      "breakfast": 5,
      "lunch": 12,
      "dinner": 10,
      "snack": 3
    },
    "glutenFreeCount": 18,
    "avgTimeMinutes": 32.5
  }
}
```

## Example Usage

### Example 1: Quick Weeknight Dinner (Gluten-Free)
```bash
curl -X POST http://localhost:3000/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["chicken breast", "rice", "salt", "pepper"],
    "profile": { "glutenFree": true },
    "missingLimit": 2
  }'
```

**Expected Result:**
- Returns "Chicken and Rice" as exact match (all ingredients available)
- Close matches might include recipes with 1-2 missing non-staple ingredients

### Example 2: What Can I Make? (Vegetarian, No Restrictions)
```bash
curl -X POST http://localhost:3000/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["eggs", "tomato", "cheese", "spinach", "olive oil"],
    "profile": { "glutenFree": false },
    "missingLimit": 3
  }'
```

**Expected Result:**
- "Veggie Frittata" as exact or close match
- Salads and other egg-based dishes as close matches

### Example 3: Seafood Night (Gluten-Free)
```bash
curl -X POST http://localhost:3000/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["shrimp", "garlic", "lime juice", "cilantro"],
    "profile": { "glutenFree": true }
  }'
```

**Expected Result:**
- "Garlic Butter Shrimp" or "Tacos de Camarones" as exact matches
- Other seafood recipes as close matches

## Testing

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

**Test Coverage:**
- **Normalization** (`tests/utils/normalization.test.ts`):
  - Singularization of plurals
  - Synonym mapping
  - Lowercasing and punctuation removal
  - Full ingredient name normalization

- **Gluten-Free Rules** (`tests/utils/glutenFree.test.ts`):
  - Detection of gluten-containing ingredients
  - Substitution suggestions
  - Recipe GF status checking
  - Ingredients to flag

- **Recipe Matching** (`tests/services/recipeSearch.test.ts`):
  - Exact vs. close match logic
  - Missing limit enforcement
  - GF profile filtering
  - Pantry staples behavior
  - Result sorting and limiting

## Configuration

### Environment Variables (`.env`)

```bash
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Search
DEFAULT_MISSING_LIMIT=2
MAX_RESULTS=5

# Pantry Staples (always available)
PANTRY_STAPLES=salt,pepper,oil,water,butter
```

### Pantry Staples

By default, the following ingredients are treated as "always available" and don't count toward matching:
- salt
- pepper
- oil
- water
- butter

Customize via the `PANTRY_STAPLES` environment variable.

## Data

### Recipe Dataset (`data/recipes.json`)

Includes 30+ recipes with:
- Breakfast, lunch, dinner, and snack options
- 18 naturally gluten-free recipes
- A mix of cuisines: Mexican, Italian, Asian, American, Middle Eastern, etc.
- Prep times from 10 to 75 minutes
- Difficulty: easy, medium, hard

### Sample Inputs (`data/sample_inputs.json`)

6 pre-built example searches for quick testing:
1. Quick Weeknight Dinner
2. Gluten-Free Breakfast
3. Vegetarian Lunch
4. GF Mexican Flavors
5. Seafood Dinner
6. Pantry Raider

## Core Features Explained

### Ingredient Normalization

Handles:
- **Plurals**: "tomatoes" → "tomato"
- **Synonyms**: "scallions" → "green onion", "garbanzo beans" → "chickpea"
- **Case**: "CHICKEN" → "chicken"
- **Whitespace**: "  salt  " → "salt"
- **Punctuation**: "salt," → "salt"

### Matching Logic

**Exact Match**: User has all non-optional, non-staple ingredients from the recipe.

**Close Match**: User is missing ≤ `missingLimit` (default 2) non-optional, non-staple ingredients.

**Scoring** (lowest = best):
1. Fewer missing ingredients
2. Shorter cook time (tiebreaker)

**Result Limits**: Top 5 exact + top 5 close matches by default (configurable).

### Gluten-Free Support

**Detection**: Flags recipes containing:
- wheat, barley, rye, malt
- flour, bread, pasta, noodles
- standard soy sauce (not tamari)
- breadcrumbs

**Substitutions**: Suggests GF alternatives:
- "flour" → "almond flour, GF flour blend"
- "soy sauce" → "tamari"
- "pasta" → "GF pasta (rice, chickpea, corn-based)"
- etc.

**Filtering**: When `glutenFree: true`:
- Exact/close match recipes must be GF-safe
- OR recipes must be adaptable (with `allowAdaptations: true`)
- Substitution suggestions are included in response

### Assistant Text

Each recipe includes a brief, friendly explanation (~80 words) that:
- Confirms GF safety or lists required substitutions
- Notes missing ingredients (if close match)
- Provides 1–2 quick cooking tips (prep order, time-saver, flavor boost, etc.)

## Roadmap (Future)

**Stage B** (not yet implemented):
- Optional external recipe API adapter (e.g., Spoonacular)
- User accounts and saved preferences
- Dietary profiles beyond gluten-free (dairy-free, keto, vegan, etc.)
- Recipe ratings and reviews
- Grocery list generation
- Meal planning

## Troubleshooting

### No recipes returned?
- Check that ingredients are spelled correctly (or use synonyms)
- Try increasing `missingLimit`
- If using GF profile, try `allowAdaptations: true`
- Verify dataset is loaded: `GET /api/health`

### Wrong recipes returned?
- Check ingredient normalization: ensure synonyms are mapped
- Review pantry staples configuration
- Use exact ingredient names from the dataset

### Tests failing?
- Ensure `data/recipes.json` exists and is valid
- Check Node.js version (14+)
- Reinstall dependencies: `npm install`

## Performance

- **Dataset load**: ~1ms (in-memory JSON)
- **Search**: ~5–15ms for 30 recipes (scales linearly)
- **Response time**: <50ms (p95) on typical hardware

## License

MIT
