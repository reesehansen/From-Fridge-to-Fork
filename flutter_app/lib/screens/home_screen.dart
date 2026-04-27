import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/app_scope.dart';
import '../core/navigation_args.dart';
import '../widgets/app_background.dart';
import 'favorites_screen.dart';
import 'results_screen.dart';

class HomeScreen extends StatefulWidget {
  static const String routeName = '/';

  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _ingredientsController = TextEditingController();
  bool _glutenFreeOnly = true;

  @override
  void dispose() {
    _ingredientsController.dispose();
    super.dispose();
  }

  void _searchRecipes() {
    final ingredients = _ingredientsController.text.trim();
    Navigator.of(context).pushNamed(
      ResultsScreen.routeName,
      arguments: SearchRouteArgs(
        ingredientsCsv: ingredients,
        glutenFreeOnly: _glutenFreeOnly,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = AppScope.of(context).controller;

    return Scaffold(
      appBar: AppBar(
        actions: <Widget>[
          IconButton(
            tooltip: 'Open favorites',
            onPressed: () => Navigator.of(context).pushNamed(FavoritesScreen.routeName),
            icon: Stack(
              alignment: Alignment.center,
              children: <Widget>[
                const Icon(Icons.favorite_border_rounded, size: 26),
                if (controller.hasFavorites)
                  Positioned(
                    right: 2,
                    top: 2,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.error,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: AppBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
            children: <Widget>[
              const SizedBox(height: 18),
              Center(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    'From Fridge to Fork',
                    maxLines: 1,
                    softWrap: false,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.lilitaOne(
                      fontSize: Theme.of(context).textTheme.displaySmall?.fontSize ?? 54,
                      height: 0.98,
                      letterSpacing: 0.4,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Type what is on hand, and we will rank the closest matches first so dinner starts faster.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: const Color(0xFF35564A),
                      height: 1.45,
                    ),
              ),
              const SizedBox(height: 20),
              _SurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'What is in the fridge?',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _ingredientsController,
                      minLines: 3,
                      maxLines: 5,
                      textInputAction: TextInputAction.search,
                      onSubmitted: (_) => _searchRecipes(),
                      decoration: InputDecoration(
                        hintText: 'Chicken, rice, garlic, lemon',
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
                    const SizedBox(height: 14),
                    SwitchListTile.adaptive(
                      contentPadding: EdgeInsets.zero,
                      title: Text(
                        'Best-effort gluten-free filter',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      subtitle: Text(
                        'Keyword based only. Not medical advice.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: const Color(0xFF5F7269)),
                      ),
                      value: _glutenFreeOnly,
                      onChanged: (value) => setState(() => _glutenFreeOnly = value),
                    ),
                    const SizedBox(height: 6),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: _searchRecipes,
                        icon: const Icon(Icons.search_rounded),
                        label: const Text('Find recipes'),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const _NoteCard(
                icon: Icons.lock_outline_rounded,
                title: 'Privacy note',
                message: 'Favorites stay on this device only. No extra account or profile data is stored.',
              ),
              const SizedBox(height: 12),
              const _NoteCard(
                icon: Icons.info_outline_rounded,
                title: 'Cooking note',
                message: 'Gluten-free filtering is a best-effort keyword heuristic and should not be treated as medical advice.',
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

class _NoteCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;

  const _NoteCard({required this.icon, required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white.withOpacity(0.82),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    message,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.42),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
