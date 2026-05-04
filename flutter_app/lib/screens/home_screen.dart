import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_scope.dart';
import '../core/navigation_args.dart';
import '../widgets/app_background.dart';
import '../widgets/app_logo.dart';
import 'favorites_screen.dart';
import 'results_screen.dart';

class HomeScreen extends StatefulWidget {
  static const String routeName = '/';

  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _ingredientController = TextEditingController();
  final FocusNode _ingredientFocusNode = FocusNode();
  final List<String> _ingredients = <String>[];
  String? _mustUseIngredient;
  bool _isUpdatingIngredientController = false;
  String? _ingredientError;
  bool _glutenFreeOnly = true;

  @override
  void dispose() {
    _ingredientController.dispose();
    _ingredientFocusNode.dispose();
    super.dispose();
  }

  void _searchRecipes() {
    _commitIngredientInput(commitTrailingText: true);
    if (_ingredients.isEmpty) {
      setState(() => _ingredientError = 'Add at least one ingredient');
      return;
    }

    Navigator.of(context).pushNamed(
      ResultsScreen.routeName,
      arguments: SearchRouteArgs(
        ingredientsCsv: _ingredients.join(', '),
        glutenFreeOnly: _glutenFreeOnly,
        mustUseIngredient: _mustUseIngredient,
      ),
    );
  }

  void _handleIngredientChanged(String value) {
    if (_isUpdatingIngredientController) {
      return;
    }

    if (!value.contains(',')) {
      if (_ingredientError != null) {
        setState(() => _ingredientError = null);
      }
      return;
    }

    _commitIngredientInput(commitTrailingText: false);
  }

  void _commitIngredientInput({required bool commitTrailingText}) {
    final rawText = _ingredientController.text;
    final parts = rawText.split(',');
    final partsToAdd = commitTrailingText ? parts : parts.take(parts.length - 1);
    final additions = <String>[];

    for (final part in partsToAdd) {
      final ingredient = _normalizeIngredient(part);
      if (ingredient.isEmpty) {
        continue;
      }

      final exists = _ingredients.any((currentIngredient) => currentIngredient.toLowerCase() == ingredient.toLowerCase()) ||
          additions.any((currentIngredient) => currentIngredient.toLowerCase() == ingredient.toLowerCase());
      if (!exists) {
        additions.add(ingredient);
      }
    }

    final remainder = commitTrailingText ? '' : _normalizeIngredient(parts.last);

    if (additions.isNotEmpty || _ingredientError != null) {
      setState(() {
        if (additions.isNotEmpty) {
          _ingredients.addAll(additions);
        }
        _ingredientError = null;
      });
    }

    if (rawText != remainder) {
      _setIngredientText(remainder);
    }
  }

  void _setIngredientText(String text) {
    _isUpdatingIngredientController = true;
    _ingredientController.value = TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
    _isUpdatingIngredientController = false;
  }

  void _removeIngredient(String ingredient) {
    setState(() {
      _ingredients.removeWhere((currentIngredient) => currentIngredient.toLowerCase() == ingredient.toLowerCase());
      if (_mustUseIngredient?.toLowerCase() == ingredient.toLowerCase()) {
        _mustUseIngredient = null;
      }
    });
  }

  void _clearIngredients() {
    setState(() {
      _ingredients.clear();
      _ingredientError = null;
    });
    _setIngredientText('');
  }

  String _normalizeIngredient(String value) {
    return value.trim().replaceAll(RegExp(r'\s+'), ' ');
  }

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context).controller;
    const bodyBlack = Color(0xFF101514);

    return Scaffold(
      appBar: AppBar(
        actions: <Widget>[
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton.icon(
              onPressed: () => Navigator.of(context).pushNamed(FavoritesScreen.routeName),
              icon: Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: <Widget>[
                  const Icon(Icons.favorite_border_rounded, size: 22),
                  if (controller.hasFavorites)
                    Positioned(
                      right: 1,
                      top: 1,
                      child: Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.error,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              label: const Text('My Favorites'),
              style: TextButton.styleFrom(
                foregroundColor: bodyBlack,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                textStyle: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
      body: AppBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
            children: <Widget>[
              const SizedBox(height: 12),
              Center(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: <Widget>[
                      const AppLogo(size: 58),
                      const SizedBox(width: 12),
                      Text.rich(
                        TextSpan(
                          style: GoogleFonts.lilitaOne(
                            fontSize: Theme.of(context).textTheme.displayMedium?.fontSize ?? 68,
                            height: 0.95,
                            letterSpacing: 0.2,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                          children: const <TextSpan>[
                            TextSpan(text: 'From Fridge to Fork'),
                          ],
                        ),
                        maxLines: 1,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Fridge ingredients in, fork-ready meals out. Add your ingredients and get dinner ideas fast!',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: bodyBlack,
                      fontWeight: FontWeight.w400,
                      height: 1.38,
                    ),
              ),
              const SizedBox(height: 14),
              _SurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Text(
                          'Ingredients',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                                color: bodyBlack,
                              ),
                        ),
                        const Spacer(),
                        // Dropdown pinned to the far right.
                        SizedBox(
                          width: 180,
                          child: DropdownButtonFormField<String?>(
                            value: _mustUseIngredient,
                            isExpanded: true,
                            items: <DropdownMenuItem<String?>>[
                              const DropdownMenuItem<String?>(value: null, child: Text('None')),
                            ]
                                .followedBy(_ingredients.map((ing) => DropdownMenuItem<String?>(value: ing, child: Text(ing))))
                                .toList(),
                            onChanged: (value) {
                              setState(() => _mustUseIngredient = value);
                            },
                            decoration: InputDecoration(
                              labelText: 'Must use now (optional)',
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ),
                        if (_ingredients.isNotEmpty)
                          TextButton.icon(
                            onPressed: _clearIngredients,
                            icon: const Icon(Icons.clear_all_rounded, size: 18),
                            label: const Text('Clear all'),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              visualDensity: VisualDensity.compact,
                              foregroundColor: bodyBlack,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    if (_ingredients.isNotEmpty)
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _ingredients
                            .map(
                              (ingredient) => InputChip(
                                label: Text(ingredient),
                                onDeleted: () => _removeIngredient(ingredient),
                                deleteIcon: const Icon(Icons.close_rounded, size: 18),
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                              ),
                            )
                            .toList(),
                      ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _ingredientController,
                      focusNode: _ingredientFocusNode,
                      onChanged: _handleIngredientChanged,
                      onSubmitted: (_) => _commitIngredientInput(commitTrailingText: true),
                      textInputAction: TextInputAction.done,
                      decoration: InputDecoration(
                        hintText: 'Try: chicken, rice, garlic',
                        filled: true,
                        fillColor: const Color(0xFFF8F7F2),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: BorderSide(color: Colors.black.withOpacity(0.08)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: BorderSide(color: Colors.black.withOpacity(0.08)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(18),
                          borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 1.5),
                        ),
                        contentPadding: const EdgeInsets.all(16),
                      ),
                    ),
                    if (_ingredientError != null) ...<Widget>[
                      const SizedBox(height: 8),
                      Row(
                        children: <Widget>[
                          Icon(Icons.error_outline_rounded, size: 18, color: Theme.of(context).colorScheme.error),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _ingredientError!,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: Theme.of(context).colorScheme.error,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 14),
                    SwitchListTile.adaptive(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        'Gluten-free',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: bodyBlack,
                            ),
                      ),
                      value: _glutenFreeOnly,
                      onChanged: (value) => setState(() => _glutenFreeOnly = value),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Icon(Icons.info_outline_rounded, size: 18, color: Theme.of(context).colorScheme.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Best-effort filter—always double-check ingredients.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.38, color: bodyBlack),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: _searchRecipes,
                        icon: const Icon(Icons.search_rounded),
                        label: const Text('Find recipes'),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(54),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                          textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                        ),
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

class _SurfaceCard extends StatelessWidget {
  final Widget child;

  const _SurfaceCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: child,
      ),
    );
  }
}
