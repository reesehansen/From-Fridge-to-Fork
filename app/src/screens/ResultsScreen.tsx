import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";
import {
  searchMealsCloseMatch,
  getMealDetailById,
  isLikelyGlutenFree,
  getMatchedIngredients,
} from "../services/themealdb";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

type RankedMeal = {
  id: string;
  name: string;
  thumb?: string;
  matchCount: number;
  totalIngredients: number;
  matchedIngredientList?: string[];
  hasStarred?: boolean;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ResultsScreen({ route, navigation }: Props) {
  const { ingredients, isGlutenFree, starredIngredient } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meals, setMeals] = useState<RankedMeal[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        // 1) Get ranked close matches fast
        const ranked = (await searchMealsCloseMatch(ingredients, 30)) as RankedMeal[];

        // 2) If GF toggle is OFF, show everything immediately
        if (!isGlutenFree) {
          // Fetch details to get matched ingredients
          const MAX_FETCH = 20;
          const toFetch = ranked.slice(0, MAX_FETCH);

          const mealsWithDetails = await Promise.all(
            toFetch.map(async (m) => {
              try {
                const detail = await getMealDetailById(m.id);
                const matched = getMatchedIngredients(ingredients, detail.ingredients);
                const starredNorm = starredIngredient ? normalize(starredIngredient) : null;
                const hasStarred = matched.some((ing) => normalize(ing) === starredNorm);

                const matched = getMatchedIngredients(ingredients, detail.ingredients);
                const starredNorm = starredIngredient ? normalize(starredIngredient) : null;
                const hasStarred = matched.some((ing) => normalize(ing) === starredNorm);

                return {
                  meal: m,
                  ok: isLikelyGlutenFree(detail),
                  matchedIngredientList: matched,
                  hasStarred: hasStarred && !!starredNorm,
                };
              } catch {
                return { meal: m, ok: false };
              }
            })
          );

          const gfMeals = details
            .filter((d) => d.ok)
            .map((d) => ({
              ...d.meal,
              matchedIngredientList: d.matchedIngredientList,
              hasStarred: d.hasStarred,
            }))
            .sort((a, b) => {
              if (a.hasStarred && !b.hasStarred) return -1;
              if (!a.hasStarred && b.hasStarred) return 1;
              if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
              return a.name.localeCompare(b.name);
            }
            );

          // Sort: starred first, then by matchCount
          const sorted = mealsWithDetails.sort((a, b) => {
            if (a.hasStarred && !b.hasStarred) return -1;
            if (!a.hasStarred && b.hasStarred) return 1;
            if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
            return a.name.localeCompare(b.name);
          });

          if (!cancelled) setMeals(sorted);
          return;
        }

        // 3) GF toggle ON: check only top N to avoid timeouts
        const MAX_TO_CHECK = 12;
        const toCheck = ranked.slice(0, MAX_TO_CHECK);

        const details = await Promise.all(
          toCheck.map(async (m) => {
            try {
              const detail = await getMealDetailById(m.id);
              return { meal: m, ok: isLikelyGlutenFree(detail) };
            } catch {
              // If we can't verify, exclude when GF is ON (safer)
              return { meal: m, ok: false };
            }
          })
        );

        const gfMeals = details.filter((d) => d.ok).map((d) => d.meal);

        if (!cancelled) setMeals(gfMeals);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ingredients, isGlutenFree, starredIngredient]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.small}>Finding recipes…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Couldn’t load recipes</Text>
        <Text style={styles.small}>{error}</Text>
        <Text style={styles.small}>
          If it says “522”, TheMealDB is timing out. Try again or use fewer ingredients.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Results {isGlutenFree ? "(Gluten-Free filter ON)" : ""}
      </Text>
      <Text style={styles.small}>Ingredients: {ingredients}</Text>
      <Text style={styles.small}>Tap a recipe to view full details + links.</Text>

      {isGlutenFree ? (
        <Text style={styles.small}>
          Gluten-free is best-effort (filters common gluten ingredients). Not medical advice.
        </Text>
      ) : null}

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("RecipeDetail", {
                id: item.id,
                name: item.name,
                userIngredients: ingredients,
                starredIngredient,
              })
            }
            style={styles.card}
          >
            {item.thumb ? <Image source={{ uri: item.thumb }} style={styles.image} /> : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.small}>
                Matches {item.matchCount} of {item.totalIngredients}: {item.matchedIngredientList?.join(", ") || "none"}
              </Text>
              <Text style={styles.small}>Tap to view “you have” vs “you need”</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ paddingTop: 30 }}>
            <Text style={styles.title}>
              {isGlutenFree ? "No gluten-free matches found" : "No matches"}
            </Text>
            <Text style={styles.small}>
              Try different ingredients, or turn off the gluten-free filter.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  small: { color: "#444", marginTop: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },

  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "white",
  },
  image: { width: 90, height: 90, borderRadius: 12, backgroundColor: "#f3f4f6" },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
});