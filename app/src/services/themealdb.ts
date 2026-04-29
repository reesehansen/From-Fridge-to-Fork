// app/src/services/themealdb.ts

export type MealSummary = {
  id: string;
  name: string;
  thumb?: string;
};

export type MealDetail = {
  id: string;
  name: string;
  category?: string;
  area?: string;
  instructions?: string;
  sourceUrl?: string;
  youtubeUrl?: string;
  ingredients: { name: string; measure?: string }[];
};

const BASE = "https://www.themealdb.com/api/json/v1/1";

/**
 * Normalize a string for comparison (lowercase, remove special chars, trim).
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Get matched ingredients from user input that appear in the recipe.
 * Returns an array of matched ingredient names from the user's list.
 */
export function getMatchedIngredients(
  userIngredientsCsv: string,
  recipeIngredients: { name: string; measure?: string }[]
): string[] {
  const userList = userIngredientsCsv
    .split(",")
    .map((s) => normalize(s))
    .filter(Boolean);

  const matched: string[] = [];

  for (const userIng of userList) {
    for (const recipeIng of recipeIngredients) {
      const recipeIngNorm = normalize(recipeIng.name);
      if (recipeIngNorm.includes(userIng)) {
        matched.push(userIngredientsCsv.split(",").find((s) => normalize(s) === userIng) || userIng);
        break;
      }
    }
  }

  return matched;
}

/**
 * Fetch meals that contain ONE ingredient (TheMealDB free endpoint supports single ingredient).
 */
async function fetchMealsForSingleIngredient(ingredient: string): Promise<MealSummary[]> {
  const url = `${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`TheMealDB error ${res.status}`);

  const data = await res.json();
  const meals = (data?.meals ?? []) as any[];

  return meals.map((m) => ({
    id: m.idMeal,
    name: m.strMeal,
    thumb: m.strMealThumb,
  }));
}

/**
 * CLOSE MATCH SEARCH:
 * Query each ingredient separately and rank meals by how many ingredient-lists they appear in.
 */
export async function searchMealsCloseMatch(
  ingredientsCsv: string,
  maxResults = 30
): Promise<Array<MealSummary & { matchCount: number; totalIngredients: number }>> {
  const ingredients = ingredientsCsv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (ingredients.length === 0) return [];

  // Limit requests to avoid timeouts
  const limited = ingredients.slice(0, 6);

  const lists = await Promise.all(limited.map(fetchMealsForSingleIngredient));

  const counts = new Map<string, { meal: MealSummary; count: number }>();

  for (const list of lists) {
    for (const meal of list) {
      const existing = counts.get(meal.id);
      if (existing) existing.count += 1;
      else counts.set(meal.id, { meal, count: 1 });
    }
  }

  const ranked = Array.from(counts.values())
    .map(({ meal, count }) => ({
      ...meal,
      matchCount: count,
      totalIngredients: limited.length,
    }))
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return a.name.localeCompare(b.name);
    });

  return ranked.slice(0, maxResults);
}

/**
 * Fetch full meal details by ID (instructions, ingredients, and links).
 */
export async function getMealDetailById(id: string): Promise<MealDetail> {
  const url = `${BASE}/lookup.php?i=${encodeURIComponent(id)}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`TheMealDB error ${res.status}`);

  const data = await res.json();
  const meal = data?.meals?.[0];
  if (!meal) throw new Error("Meal not found");

  const ingredients: { name: string; measure?: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && String(name).trim()) {
      ingredients.push({
        name: String(name).trim(),
        measure: String(measure ?? "").trim(),
      });
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: meal.strInstructions,
    sourceUrl: meal.strSource,
    youtubeUrl: meal.strYoutube,
    ingredients,
  };
}

// --- Gluten-free (Level A) helper ---
// Best-effort keyword filter based on ingredient names.
// Not medical advice; does not account for cross-contamination.
const GLUTEN_KEYWORDS = [
  "wheat",
  "flour",
  "bread",
  "pasta",
  "spaghetti",
  "noodle",
  "noodles",
  "soy sauce",
  "teriyaki",
  "breadcrumbs",
  "cracker",
  "barley",
  "rye",
  "beer",
  "seitan",
  "couscous",
  "tortilla",
  "wrap",
  "bun",
  "breading",
];

export function isLikelyGlutenFree(detail: MealDetail): boolean {
  const allIngredients = detail.ingredients.map((i) => i.name.toLowerCase()).join(" | ");
  return !GLUTEN_KEYWORDS.some((k) => allIngredients.includes(k));
}