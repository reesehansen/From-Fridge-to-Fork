import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/recipe_detail.dart';
import '../models/recipe_summary.dart';

class ThemealdbService {
  ThemealdbService({http.Client? client}) : _client = client ?? http.Client();

  static const String _baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  final http.Client _client;
  final Map<String, Future<List<RecipeSummary>>> _searchCache = <String, Future<List<RecipeSummary>>>{};
  final Map<String, Future<RecipeDetail>> _detailCache = <String, Future<RecipeDetail>>{};

  Future<List<RecipeSummary>> searchByIngredient(String ingredient) {
    final normalized = ingredient.trim().toLowerCase();
    if (normalized.isEmpty) {
      return Future<List<RecipeSummary>>.value(const <RecipeSummary>[]);
    }

    return _searchCache.putIfAbsent(normalized, () async {
      final response = await _client.get(Uri.parse('$_baseUrl/filter.php?i=${Uri.encodeComponent(normalized)}'));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception('TheMealDB filter request failed (${response.statusCode}).');
      }

      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      final meals = (decoded['meals'] as List<dynamic>?) ?? const <dynamic>[];

      return meals
          .whereType<Map<String, dynamic>>()
          .map(
            (meal) => RecipeSummary(
              id: (meal['idMeal'] ?? '').toString(),
              name: (meal['strMeal'] ?? '').toString(),
              thumbnailUrl: _clean(meal['strMealThumb']),
              matchCount: 0,
              totalUserIngredients: 0,
            ),
          )
          .where((summary) => summary.id.isNotEmpty && summary.name.isNotEmpty)
          .toList(growable: false);
    });
  }

  Future<RecipeDetail> fetchRecipeDetail(String recipeId) {
    final normalized = recipeId.trim();
    if (normalized.isEmpty) {
      return Future<RecipeDetail>.error(ArgumentError.value(recipeId, 'recipeId', 'Cannot be empty'));
    }

    return _detailCache.putIfAbsent(normalized, () async {
      final response = await _client.get(Uri.parse('$_baseUrl/lookup.php?i=${Uri.encodeComponent(normalized)}'));
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception('TheMealDB lookup request failed (${response.statusCode}).');
      }

      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      final meals = (decoded['meals'] as List<dynamic>?) ?? const <dynamic>[];
      if (meals.isEmpty || meals.first is! Map<String, dynamic>) {
        throw Exception('Recipe not found.');
      }

      return RecipeDetail.fromApi(meals.first as Map<String, dynamic>);
    });
  }

  bool isLikelyGlutenFree(RecipeDetail detail) {
    final haystack = detail.ingredients.map((ingredient) => ingredient.name.toLowerCase()).join(' | ');
    return !_glutenKeywords.any(haystack.contains);
  }

  void dispose() {
    _client.close();
  }

  static String? _clean(dynamic value) {
    final text = value?.toString().trim() ?? '';
    return text.isEmpty ? null : text;
  }

  static const List<String> _glutenKeywords = <String>[
    'wheat',
    'flour',
    'bread',
    'pasta',
    'spaghetti',
    'noodle',
    'noodles',
    'soy sauce',
    'teriyaki',
    'breadcrumbs',
    'cracker',
    'barley',
    'rye',
    'beer',
    'seitan',
    'couscous',
    'tortilla',
    'wrap',
    'bun',
    'breading',
  ];
}