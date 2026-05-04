import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/app_scope.dart';
import '../core/navigation_args.dart';
import '../core/string_extensions.dart';
import '../models/recipe_detail.dart';
import '../models/recipe_ingredient.dart';
import '../widgets/app_background.dart';
import '../widgets/empty_state_view.dart';

class RecipeDetailScreen extends StatefulWidget {
  static const String routeName = '/detail';

  final RecipeDetailRouteArgs args;

  const RecipeDetailScreen({super.key, required this.args});

  @override
  State<RecipeDetailScreen> createState() => _RecipeDetailScreenState();
}

class _RecipeDetailScreenState extends State<RecipeDetailScreen> {
  late Future<RecipeDetail> _future;
  bool _favoriteState = false;
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

  Future<RecipeDetail> _load() async {
    final scope = AppScope.of(context);
    final detail = await scope.mealDbService.fetchRecipeDetail(widget.args.recipeId);
    _favoriteState = scope.controller.isFavorite(detail.id);
    return detail;
  }

  List<String> _parseIngredients(String? csv) {
    if (csv == null || csv.trim().isEmpty) {
      return <String>[];
    }

    final seen = <String>{};
    final parsed = <String>[];
    for (final raw in csv.split(',')) {
      final normalized = _normalize(raw);
      if (normalized.isEmpty || seen.contains(normalized)) {
        continue;
      }
      seen.add(normalized);
      parsed.add(normalized);
    }
    return parsed;
  }

  String _normalize(String value) {
    return value
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\s]'), ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  bool _matchesIngredient(RecipeIngredient ingredient, List<String> userIngredients) {
    final normalizedIngredient = _normalize(ingredient.name);
    if (normalizedIngredient.isEmpty) {
      return false;
    }

    return userIngredients.any((userIngredient) {
      if (normalizedIngredient == userIngredient) {
        return true;
      }

      final userWords = userIngredient.split(' ');
      if (userWords.length == 1) {
        return false;
      }

      return normalizedIngredient.contains(userIngredient);
    });
  }

  Future<void> _toggleFavorite(RecipeDetail detail) async {
    final scope = AppScope.of(context);
    final newValue = await scope.controller.toggleFavorite(detail);
    if (!mounted) {
      return;
    }
    setState(() => _favoriteState = newValue);
  }

  Future<void> _openExternalLink(String url) async {
    final uri = Uri.parse(url);
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open the link.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);

    return Scaffold(
      appBar: AppBar(
        actions: <Widget>[
          FutureBuilder<RecipeDetail>(
            future: _future,
            builder: (context, snapshot) {
              final isSaved = snapshot.hasData ? scope.controller.isFavorite(snapshot.data!.id) : _favoriteState;
              return IconButton(
                tooltip: isSaved ? 'Remove from favorites' : 'Save to favorites',
                onPressed: snapshot.hasData ? () => _toggleFavorite(snapshot.data!) : null,
                icon: Icon(isSaved ? Icons.favorite_rounded : Icons.favorite_border_rounded),
              );
            },
          ),
        ],
      ),
      body: AppBackground(
        child: SafeArea(
          child: FutureBuilder<RecipeDetail>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const Center(child: CircularProgressIndicator());
              }

              if (snapshot.hasError) {
                return EmptyStateView(
                  icon: Icons.receipt_long_rounded,
                  title: 'Could not load recipe',
                  message: snapshot.error.toString(),
                );
              }

              final detail = snapshot.data!;
              final userIngredients = _parseIngredients(widget.args.userIngredientsCsv);
              final have = <RecipeIngredient>[];
              final need = <RecipeIngredient>[];

              for (final ingredient in detail.ingredients) {
                if (userIngredients.isNotEmpty && _matchesIngredient(ingredient, userIngredients)) {
                  have.add(ingredient);
                } else {
                  need.add(ingredient);
                }
              }

              return ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
                children: <Widget>[
                  _HeroCard(
                    detail: detail,
                    fallbackName: widget.args.recipeName,
                    fallbackThumbnailUrl: widget.args.recipeThumbnailUrl,
                  ),
                  const SizedBox(height: 18),
                  if (userIngredients.isEmpty)
                    const _DisclaimerBanner(
                      text:
                          'This recipe was opened from favorites, so ingredient comparison is unavailable until you search with a new fridge list.',
                    )
                  else ...<Widget>[
                    _ComparisonSection(title: 'You have', icon: Icons.check_circle_outline_rounded, ingredients: have),
                    const SizedBox(height: 14),
                    _ComparisonSection(title: 'You might need', icon: Icons.shopping_cart_outlined, ingredients: need),
                  ],
                  const SizedBox(height: 14),
                  _TextSection(
                    title: 'Steps',
                    child: Text(
                      detail.instructions?.trim().isNotEmpty == true
                          ? detail.instructions!.trim()
                          : 'No instructions were provided for this recipe.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.45),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _TextSection(
                    title: 'Ingredients',
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: detail.ingredients
                          .map(
                            (ingredient) => Chip(
                              label: Text(
                                ingredient.measure == null || ingredient.measure!.isEmpty
                                    ? ingredient.name
                                    : '${ingredient.measure} ${ingredient.name}',
                              ),
                              backgroundColor: const Color(0xFFF7F4ED),
                              side: BorderSide(color: Colors.black.withOpacity(0.06)),
                            ),
                          )
                          .toList(growable: false),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: <Widget>[
                      if (detail.sourceUrl != null)
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: () => _openExternalLink(detail.sourceUrl!),
                            icon: const Icon(Icons.open_in_new_rounded),
                            label: const Text('Open source'),
                          ),
                        ),
                      if (detail.sourceUrl != null && detail.youtubeUrl != null) const SizedBox(width: 12),
                      if (detail.youtubeUrl != null)
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _openExternalLink(detail.youtubeUrl!),
                            icon: const Icon(Icons.play_circle_outline_rounded),
                            label: const Text('Open video'),
                          ),
                        ),
                    ],
                  ),
                  if (detail.sourceUrl == null && detail.youtubeUrl == null) ...<Widget>[
                    const SizedBox(height: 12),
                    Text(
                      'No external links were provided for this recipe.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF576A62)),
                    ),
                  ],
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  final RecipeDetail detail;
  final String fallbackName;
  final String? fallbackThumbnailUrl;

  const _HeroCard({required this.detail, required this.fallbackName, required this.fallbackThumbnailUrl});

  @override
  Widget build(BuildContext context) {
    final thumbnailUrl = detail.thumbnailUrl ?? fallbackThumbnailUrl;
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: Container(
        color: Colors.white,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            if (thumbnailUrl != null)
              Image.network(
                thumbnailUrl,
                height: 220,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _thumbnailFallback(context),
              )
            else
              _thumbnailFallback(context),
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    (detail.name.isNotEmpty ? detail.name : fallbackName).toTitleCaseWords(),
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: <Widget>[
                      if (detail.category != null)
                        _MetaChip(text: detail.category!, icon: Icons.category_rounded),
                      if (detail.area != null)
                        _MetaChip(text: detail.area!, icon: Icons.public_rounded),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _thumbnailFallback(BuildContext context) {
    return Container(
      height: 220,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: <Color>[
            Theme.of(context).colorScheme.primary.withOpacity(0.14),
            Theme.of(context).colorScheme.secondary.withOpacity(0.18),
          ],
        ),
      ),
      alignment: Alignment.center,
      child: Icon(Icons.restaurant_menu_rounded, color: Theme.of(context).colorScheme.primary, size: 50),
    );
  }
}

class _TextSection extends StatelessWidget {
  final String title;
  final Widget child;

  const _TextSection({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}

class _ComparisonSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<RecipeIngredient> ingredients;

  const _ComparisonSection({required this.title, required this.icon, required this.ingredients});

  @override
  Widget build(BuildContext context) {
    return _TextSection(
      title: title,
      child: ingredients.isEmpty
          ? Text(
              'Nothing to show here yet.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFF5C7168)),
            )
          : Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ingredients
                  .map(
                    (ingredient) => Chip(
                      avatar: Icon(icon, size: 18),
                      label: Text(
                        ingredient.measure == null || ingredient.measure!.isEmpty
                            ? ingredient.name
                            : '${ingredient.measure} ${ingredient.name}',
                      ),
                      backgroundColor: const Color(0xFFF7F4ED),
                      side: BorderSide(color: Colors.black.withOpacity(0.06)),
                    ),
                  )
                  .toList(growable: false),
            ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final String text;
  final IconData icon;

  const _MetaChip({required this.text, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 18),
      label: Text(text),
      backgroundColor: const Color(0xFFEFF8F2),
      side: BorderSide(color: Theme.of(context).colorScheme.primary.withOpacity(0.12)),
    );
  }
}

class _DisclaimerBanner extends StatelessWidget {
  final String text;

  const _DisclaimerBanner({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Container(
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
      ),
    );
  }
}
