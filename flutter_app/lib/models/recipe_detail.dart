import 'recipe_ingredient.dart';
import 'recipe_summary.dart';

class RecipeDetail {
  final String id;
  final String name;
  final String? thumbnailUrl;
  final String? category;
  final String? area;
  final String? instructions;
  final String? sourceUrl;
  final String? youtubeUrl;
  final List<RecipeIngredient> ingredients;

  const RecipeDetail({
    required this.id,
    required this.name,
    required this.thumbnailUrl,
    required this.category,
    required this.area,
    required this.instructions,
    required this.sourceUrl,
    required this.youtubeUrl,
    required this.ingredients,
  });

  factory RecipeDetail.fromApi(Map<String, dynamic> json) {
    final ingredients = <RecipeIngredient>[];
    for (var index = 1; index <= 20; index += 1) {
      final ingredient = RecipeIngredient.fromApi(json, index);
      if (ingredient.name.trim().isNotEmpty) {
        ingredients.add(ingredient);
      }
    }

    return RecipeDetail(
      id: (json['idMeal'] ?? '').toString(),
      name: (json['strMeal'] ?? '').toString(),
      thumbnailUrl: _clean(json['strMealThumb']),
      category: _clean(json['strCategory']),
      area: _clean(json['strArea']),
      instructions: _clean(json['strInstructions']),
      sourceUrl: _clean(json['strSource']),
      youtubeUrl: _clean(json['strYoutube']),
      ingredients: ingredients,
    );
  }

  RecipeSummary toSummary({int matchCount = 0, int totalUserIngredients = 0}) {
    return RecipeSummary(
      id: id,
      name: name,
      thumbnailUrl: thumbnailUrl,
      matchCount: matchCount,
      totalUserIngredients: totalUserIngredients,
    );
  }

  static String? _clean(dynamic value) {
    final text = value?.toString().trim() ?? '';
    return text.isEmpty ? null : text;
  }
}