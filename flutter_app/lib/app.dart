import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/app_controller.dart';
import 'core/app_scope.dart';
import 'core/navigation_args.dart';
import 'screens/favorites_screen.dart';
import 'screens/home_screen.dart';
import 'screens/recipe_detail_screen.dart';
import 'screens/results_screen.dart';
import 'screens/welcome_screen.dart';
import 'services/favorites_store.dart';
import 'services/ranking_service.dart';
import 'services/themealdb_service.dart';

class FromFridgeToForkApp extends StatefulWidget {
  const FromFridgeToForkApp({super.key});

  @override
  State<FromFridgeToForkApp> createState() => _FromFridgeToForkAppState();
}

class _FromFridgeToForkAppState extends State<FromFridgeToForkApp> {
  late final ThemealdbService _themealdbService;
  late final FavoritesStore _favoritesStore;
  late final RankingService _rankingService;
  late final AppController _controller;

  @override
  void initState() {
    super.initState();
    _themealdbService = ThemealdbService();
    _favoritesStore = FavoritesStore();
    _rankingService = RankingService(_themealdbService);
    _controller = AppController(favoritesStore: _favoritesStore);
    unawaited(_controller.loadFavorites());
  }

  @override
  void dispose() {
    _controller.dispose();
    _themealdbService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFCBF5DD),
      brightness: Brightness.light,
    ).copyWith(
      primary: const Color(0xFFCBF5DD),
      secondary: const Color(0xFF8DCFB2),
      tertiary: const Color(0xFFF2D9B8),
      surface: const Color(0xFFF8FCF9),
      surfaceContainerHighest: const Color(0xFFE8F7EE),
      onPrimary: const Color(0xFF123827),
      onSecondary: const Color(0xFF123827),
      onSurface: const Color(0xFF16392E),
    );

    return AppScope(
      controller: _controller,
      mealDbService: _themealdbService,
      rankingService: _rankingService,
      favoritesStore: _favoritesStore,
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'From Fridge to Fork',
        theme: ThemeData(
          colorScheme: colorScheme,
          scaffoldBackgroundColor: const Color(0xFFF7FCF9),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(
            centerTitle: false,
            elevation: 0,
            scrolledUnderElevation: 0,
            backgroundColor: Colors.transparent,
            foregroundColor: Color(0xFF16392E),
          ),
          cardTheme: CardThemeData(
            color: Colors.white,
            elevation: 0,
            surfaceTintColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          ),
          textTheme: GoogleFonts.fredokaTextTheme(
            Typography.material2021().black,
          ).copyWith(
                headlineLarge: Typography.material2021().black.headlineLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                    ),
                headlineMedium: Typography.material2021().black.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                    ),
                titleLarge: Typography.material2021().black.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                titleMedium: Typography.material2021().black.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                bodyLarge: Typography.material2021().black.bodyLarge?.copyWith(
                      height: 1.35,
                    ),
              ),
        ),
        initialRoute: WelcomeScreen.routeName,
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case WelcomeScreen.routeName:
              return MaterialPageRoute<void>(builder: (_) => const WelcomeScreen());
            case HomeScreen.routeName:
              return MaterialPageRoute<void>(builder: (_) => const HomeScreen());
            case ResultsScreen.routeName:
              return MaterialPageRoute<void>(
                builder: (_) => ResultsScreen(args: settings.arguments! as SearchRouteArgs),
              );
            case RecipeDetailScreen.routeName:
              return MaterialPageRoute<void>(
                builder: (_) => RecipeDetailScreen(args: settings.arguments! as RecipeDetailRouteArgs),
              );
            case FavoritesScreen.routeName:
              return MaterialPageRoute<void>(builder: (_) => const FavoritesScreen());
            default:
              return MaterialPageRoute<void>(builder: (_) => const HomeScreen());
          }
        },
      ),
    );
  }
}
