import 'package:flutter/material.dart';

import '../core/app_scope.dart';
import '../core/navigation_args.dart';
import '../models/favorite_entry.dart';
import '../widgets/app_background.dart';
import '../widgets/empty_state_view.dart';
import '../widgets/recipe_card.dart';
import 'recipe_detail_screen.dart';

class FavoritesScreen extends StatelessWidget {
  static const String routeName = '/favorites';

  const FavoritesScreen({super.key});

  void _openDetail(BuildContext context, FavoriteEntry favorite) {
    Navigator.of(context).pushNamed(
      RecipeDetailScreen.routeName,
      arguments: RecipeDetailRouteArgs(
        recipeId: favorite.id,
        recipeName: favorite.name,
        recipeThumbnailUrl: favorite.thumbnailUrl,
        userIngredientsCsv: null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context).controller;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Favorites'),
      ),
      body: AppBackground(
        child: AnimatedBuilder(
          animation: controller,
          builder: (context, _) {
            if (!controller.favoritesLoaded) {
              return const Center(child: CircularProgressIndicator());
            }

            if (controller.favorites.isEmpty) {
              return const EmptyStateView(
                icon: Icons.favorite_border_rounded,
                title: 'No favorites yet',
                message: 'Open a recipe and tap the heart to save it locally on this device.',
              );
            }

            return SafeArea(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                children: <Widget>[
                  Text(
                    'Saved recipes',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'These stay on this device only.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF576A62)),
                  ),
                  const SizedBox(height: 16),
                  ...controller.favorites.map(
                    (favorite) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: RecipeCard(
                        recipe: favorite.toSummary(),
                        onTap: () => _openDetail(context, favorite),
                        showMatches: false,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
