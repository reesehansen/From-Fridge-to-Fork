import '../models/recipe_summary.dart';
import 'themealdb_service.dart';

class RankedSearchResult {
  final List<String> normalizedIngredients;
  final List<RecipeSummary> recipes;
  final bool glutenFreeOnly;

  const RankedSearchResult({
    required this.normalizedIngredients,
    required this.recipes,
    required this.glutenFreeOnly,
  });
}

class RankingService {
  RankingService(this.themealdbService);

  final ThemealdbService themealdbService;

  Future<RankedSearchResult> searchRecipes(
    String ingredientsCsv, {
    required bool glutenFreeOnly,
    String? mustUseIngredient,
    int candidateCap = 30,
    int glutenFreeCheckCap = 12,
  }) async {
    final normalizedIngredients = _parseIngredients(ingredientsCsv);
    if (normalizedIngredients.isEmpty) {
      return RankedSearchResult(
        normalizedIngredients: const <String>[],
        recipes: const <RecipeSummary>[],
        glutenFreeOnly: glutenFreeOnly,
      );
    }

    final responses = await Future.wait(
      normalizedIngredients.map(themealdbService.searchByIngredient),
    );

    final merged = <String, _RankedCandidate>{};
    for (var ingredientIndex = 0; ingredientIndex < normalizedIngredients.length; ingredientIndex += 1) {
      final ingredient = normalizedIngredients[ingredientIndex];
      for (final recipe in responses[ingredientIndex]) {
        final candidate = merged.putIfAbsent(
          recipe.id,
          () => _RankedCandidate(recipe: recipe),
        );
        candidate.matchCount += 1;
        candidate.matchedIngredients.add(ingredient);
      }
    }

    final mustUseNormalized = mustUseIngredient?.trim().toLowerCase();

    final ranked = merged.values
        .map((candidate) {
          final hasMustUse = mustUseNormalized != null && candidate.matchedIngredients.contains(mustUseNormalized);
          return candidate.recipe.copyWith(
            matchCount: candidate.matchCount,
            totalUserIngredients: normalizedIngredients.length,
            matchedIngredients: candidate.matchedIngredients.toList(growable: false),
          );
        })
        .toList(growable: false);
    ranked.sort((a, b) {
      final aHasMust = mustUseNormalized != null && a.matchedIngredients.contains(mustUseNormalized);
      final bHasMust = mustUseNormalized != null && b.matchedIngredients.contains(mustUseNormalized);
      if (aHasMust != bHasMust) {
        return aHasMust ? -1 : 1;
      }
      return _compareSummaries(a, b);
    });

    final limited = ranked.take(candidateCap).toList(growable: false);

    if (!glutenFreeOnly) {
      return RankedSearchResult(
        normalizedIngredients: normalizedIngredients,
        recipes: limited,
        glutenFreeOnly: false,
      );
    }

    final toCheck = limited.take(glutenFreeCheckCap).toList(growable: false);
    final keepById = <String, bool>{};

    await Future.wait(
      toCheck.map((recipe) async {
        try {
          final detail = await themealdbService.fetchRecipeDetail(recipe.id);
          keepById[recipe.id] = themealdbService.isLikelyGlutenFree(detail);
        } catch (_) {
          keepById[recipe.id] = false;
        }
      }),
    );

    final filtered = limited.where((recipe) => keepById[recipe.id] ?? false).toList(growable: false);

    return RankedSearchResult(
      normalizedIngredients: normalizedIngredients,
      recipes: filtered,
      glutenFreeOnly: true,
    );
  }

  List<String> _parseIngredients(String csv) {
    final seen = <String>{};
    final parsed = <String>[];
    for (final raw in csv.split(',')) {
      final ingredient = raw.trim().toLowerCase();
      if (ingredient.isEmpty || seen.contains(ingredient)) {
        continue;
      }
      seen.add(ingredient);
      parsed.add(ingredient);
    }
    return parsed;
  }

  static int _compareSummaries(RecipeSummary a, RecipeSummary b) {
    if (b.matchCount != a.matchCount) {
      return b.matchCount.compareTo(a.matchCount);
    }

    final ratioComparison = b.matchRatio.compareTo(a.matchRatio);
    if (ratioComparison != 0) {
      return ratioComparison;
    }

    return a.name.toLowerCase().compareTo(b.name.toLowerCase());
  }
}

class _RankedCandidate {
  _RankedCandidate({required this.recipe});

  final RecipeSummary recipe;
  final Set<String> matchedIngredients = <String>{};
  int matchCount = 0;
}