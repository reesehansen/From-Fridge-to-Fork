import 'package:flutter/material.dart';

import '../core/app_scope.dart';
import '../core/navigation_args.dart';
import '../models/recipe_summary.dart';
import '../widgets/app_background.dart';
import '../widgets/empty_state_view.dart';
import '../widgets/recipe_card.dart';
import 'favorites_screen.dart';
import 'recipe_detail_screen.dart';
import '../services/ranking_service.dart';

class ResultsScreen extends StatefulWidget {
  static const String routeName = '/results';

  final SearchRouteArgs args;

  const ResultsScreen({super.key, required this.args});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  late Future<_ResultsData> _future;
  bool _futureInitialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_futureInitialized) {
      return;
    }
    _future = _load();
    _futureInitialized = true;
  }

  Future<_ResultsData> _load() async {
    final scope = AppScope.of(context);
    final result = await scope.rankingService.searchRecipes(
      widget.args.ingredientsCsv,
      glutenFreeOnly: widget.args.glutenFreeOnly,
    );
    return _ResultsData(result: result);
  }

  void _openDetail(RecipeSummary recipe) {
    Navigator.of(context).pushNamed(
      RecipeDetailScreen.routeName,
      arguments: RecipeDetailRouteArgs(
        recipeId: recipe.id,
        recipeName: recipe.name,
        recipeThumbnailUrl: recipe.thumbnailUrl,
        userIngredientsCsv: widget.args.ingredientsCsv,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: <Widget>[
          IconButton(
            tooltip: 'Open favorites',
            onPressed: () => Navigator.of(context).pushNamed(FavoritesScreen.routeName),
            icon: const Icon(Icons.favorite_border_rounded),
          ),
        ],
      ),
      body: AppBackground(
        child: SafeArea(
          child: FutureBuilder<_ResultsData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const Center(child: CircularProgressIndicator());
              }

              if (snapshot.hasError) {
                return EmptyStateView(
                  icon: Icons.cloud_off_rounded,
                  title: 'Could not load recipes',
                  message: snapshot.error.toString(),
                  action: FilledButton(
                    onPressed: () => setState(() => _future = _load()),
                    child: const Text('Try again'),
                  ),
                );
              }

              final data = snapshot.data!;
              final recipes = data.result.recipes;
              final ingredients = data.result.normalizedIngredients;

              if (recipes.isEmpty) {
                return EmptyStateView(
                  icon: Icons.restaurant_menu_rounded,
                  title: widget.args.glutenFreeOnly ? 'No gluten-free close matches' : 'No close matches yet',
                  message: ingredients.isEmpty
                      ? 'Add a few comma-separated ingredients on the home screen and try again.'
                      : 'Try fewer ingredients, different spellings, or switch off the gluten-free filter for a broader search.',
                );
              }

              return ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                children: <Widget>[
                  Text(
                    widget.args.glutenFreeOnly ? 'Ranked results · gluten-free best effort' : 'Ranked results',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    ingredients.isEmpty
                        ? 'No ingredients were entered.'
                        : 'Searching for: ${ingredients.join(', ')}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF576A62)),
                  ),
                  const SizedBox(height: 12),
                  if (widget.args.glutenFreeOnly)
                    const _DisclaimerBanner(
                      text: 'Gluten-free filtering is best-effort keyword matching only. It is not medical advice.',
                    ),
                  const SizedBox(height: 10),
                  ...recipes.map(
                    (recipe) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: RecipeCard(
                        recipe: recipe,
                        onTap: () => _openDetail(recipe),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _DisclaimerBanner extends StatelessWidget {
  final String text;

  const _DisclaimerBanner({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7E8),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE9D6A8)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(Icons.info_outline_rounded, size: 20, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}

class _ResultsData {
  final RankedSearchResult result;

  const _ResultsData({required this.result});
}
