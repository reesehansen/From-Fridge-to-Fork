class SearchRouteArgs {
  final String ingredientsCsv;
  final bool glutenFreeOnly;
  final String? mustUseIngredient;

  const SearchRouteArgs({required this.ingredientsCsv, required this.glutenFreeOnly, this.mustUseIngredient});
}

class RecipeDetailRouteArgs {
  final String recipeId;
  final String recipeName;
  final String? recipeThumbnailUrl;
  final String? userIngredientsCsv;

  const RecipeDetailRouteArgs({
    required this.recipeId,
    required this.recipeName,
    required this.recipeThumbnailUrl,
    required this.userIngredientsCsv,
  });
}