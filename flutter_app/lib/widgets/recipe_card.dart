import 'package:flutter/material.dart';

import '../core/string_extensions.dart';
import '../models/recipe_summary.dart';

class RecipeCard extends StatelessWidget {
  final RecipeSummary recipe;
  final VoidCallback onTap;
  final bool showMatches;

  const RecipeCard({super.key, required this.recipe, required this.onTap, this.showMatches = true});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              _Thumbnail(url: recipe.thumbnailUrl),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      recipe.name.toTitleCaseWords(),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    if (showMatches)
                      Text(
                        recipe.matchedIngredients.isEmpty
                            ? 'Matches ${recipe.matchCount} of ${recipe.totalUserIngredients}: none'
                            : 'Matches ${recipe.matchCount} of ${recipe.totalUserIngredients}: ${recipe.matchedIngredients.join(', ')}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: const Color(0xFF35564A),
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    const SizedBox(height: 6),
                    Text(
                      'Tap for ingredients, directions, and external links.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: const Color(0xFF667A72),
                            height: 1.35,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Thumbnail extends StatelessWidget {
  final String? url;

  const _Thumbnail({required this.url});

  @override
  Widget build(BuildContext context) {
    final fallback = DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: <Color>[
            Theme.of(context).colorScheme.primary.withOpacity(0.14),
            Theme.of(context).colorScheme.secondary.withOpacity(0.18),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const SizedBox(width: 88, height: 88),
    );

    if (url == null || url!.isEmpty) {
      return fallback;
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Image.network(
        url!,
        width: 88,
        height: 88,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => fallback,
        loadingBuilder: (context, child, progress) {
          if (progress == null) {
            return child;
          }
          return fallback;
        },
      ),
    );
  }
}
