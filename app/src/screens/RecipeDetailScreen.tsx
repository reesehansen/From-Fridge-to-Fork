import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";
import { getMealDetailById, MealDetail } from "../services/themealdb";
import { toggleFavorite, isFavorite } from "../services/favorites";

type Props = NativeStackScreenProps<RootStackParamList, "RecipeDetail">;

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitUserIngredients(csv: string): string[] {
  return csv
    .split(",")
    .map((x) => normalize(x))
    .filter(Boolean);
}

export default function RecipeDetailScreen({ route, navigation }: Props) {
  const { id, userIngredients, name, starredIngredient } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [fav, setFav] = useState(false);

  const onToggleFavorite = async () => {
    const newState = await toggleFavorite({
      id,
      name,
      thumb: undefined,
    });
    setFav(newState);
  };

  // 🤍 when not favorited, 💚 when favorited
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={onToggleFavorite} style={{ paddingHorizontal: 10 }}>
          <Text style={{ fontSize: 22 }}>{fav ? "💚" : "🤍"}</Text>
        </Pressable>
      ),
    });
  }, [navigation, fav]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const detail = await getMealDetailById(id);
        const favoriteNow = await isFavorite(id);

        if (!cancelled) {
          setMeal(detail);
          setFav(favoriteNow);
        }
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
  }, [id]);

  const userList = useMemo(() => splitUserIngredients(userIngredients), [userIngredients]);

  const { haveList, needList } = useMemo(() => {
    const have: { name: string; measure?: string }[] = [];
    const need: { name: string; measure?: string }[] = [];

    if (!meal) return { haveList: have, needList: need };

    for (const ing of meal.ingredients) {
      const ingNorm = normalize(ing.name);
      const matches = userList.some((u) => u && ingNorm.includes(u));
      if (matches) have.push(ing);
      else need.push(ing);
    }

    return { haveList: have, needList: need };
  }, [meal, userList]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.small}>Loading recipe…</Text>
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Couldn’t load recipe</Text>
        <Text style={styles.small}>{error ?? "No data"}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{meal.name}</Text>

      {!!meal.category && <Text style={styles.meta}>Category: {meal.category}</Text>}
      {!!meal.area && <Text style={styles.meta}>Cuisine: {meal.area}</Text>}

      <Text style={styles.section}>✅ You have</Text>
      {haveList.length === 0 ? (
        <Text style={styles.small}>No ingredient matches found from your list.</Text>
      ) : (
        haveList.map((ing, idx) => (
          <Text key={`have-${idx}`} style={styles.item}>
            • {ing.measure ? `${ing.measure} ` : ""}
            {ing.name}
          </Text>
        ))
      )}

      <Text style={styles.section}>🛒 You might need</Text>
      {needList.length === 0 ? (
        <Text style={styles.small}>Looks like you have everything already!</Text>
      ) : (
        needList.map((ing, idx) => (
          <Text key={`need-${idx}`} style={styles.item}>
            • {ing.measure ? `${ing.measure} ` : ""}
            {ing.name}
          </Text>
        ))
      )}

      <Text style={styles.section}>Instructions</Text>
      <Text style={styles.body}>{meal.instructions || "No instructions provided."}</Text>

      <View style={styles.linksRow}>
        {meal.sourceUrl ? (
          <Pressable
            style={styles.linkBtn}
            onPress={() => {
              if (meal.sourceUrl) Linking.openURL(meal.sourceUrl);
            }}
          >
            <Text style={styles.linkText}>Open source</Text>
          </Pressable>
        ) : null}

        {meal.youtubeUrl ? (
          <Pressable
            style={styles.linkBtnAlt}
            onPress={() => {
              if (meal.youtubeUrl) Linking.openURL(meal.youtubeUrl);
            }}
          >
            <Text style={styles.linkTextAlt}>YouTube</Text>
          </Pressable>
        ) : null}
      </View>

      {!meal.sourceUrl && !meal.youtubeUrl ? (
        <Text style={styles.small}>No external links available for this recipe.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: "800" },
  meta: { color: "#444" },
  section: { fontSize: 18, fontWeight: "700", marginTop: 12 },
  item: { fontSize: 16, marginTop: 4 },
  body: { fontSize: 16, lineHeight: 22, marginTop: 6 },
  small: { color: "#444", marginTop: 10 },

  linksRow: { flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" },
  linkBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  linkText: { color: "white", fontWeight: "700" },
  linkBtnAlt: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  linkTextAlt: { color: "#111827", fontWeight: "800" },
});