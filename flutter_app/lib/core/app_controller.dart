import 'package:flutter/foundation.dart';

import '../models/favorite_entry.dart';
import '../models/recipe_detail.dart';
import '../services/favorites_store.dart';

class AppController extends ChangeNotifier {
  AppController({required this.favoritesStore});

  final FavoritesStore favoritesStore;

  final List<FavoriteEntry> _favorites = <FavoriteEntry>[];
  bool _favoritesLoaded = false;

  List<FavoriteEntry> get favorites => List.unmodifiable(_favorites);
  bool get favoritesLoaded => _favoritesLoaded;
  bool get hasFavorites => _favorites.isNotEmpty;

  bool isFavorite(String recipeId) => _favorites.any((entry) => entry.id == recipeId);

  FavoriteEntry? favoriteById(String recipeId) {
    for (final entry in _favorites) {
      if (entry.id == recipeId) {
        return entry;
      }
    }
    return null;
  }

  Future<void> loadFavorites() async {
    final loaded = await favoritesStore.loadFavorites();
    _favorites
      ..clear()
      ..addAll(loaded);
    _favoritesLoaded = true;
    notifyListeners();
  }

  Future<bool> toggleFavorite(RecipeDetail detail) async {
    if (isFavorite(detail.id)) {
      await removeFavorite(detail.id);
      return false;
    }
    await addFavorite(FavoriteEntry.fromDetail(detail));
    return true;
  }

  Future<void> addFavorite(FavoriteEntry entry) async {
    if (isFavorite(entry.id)) {
      return;
    }
    _favorites.insert(0, entry);
    await favoritesStore.saveFavorites(_favorites);
    notifyListeners();
  }

  Future<void> removeFavorite(String recipeId) async {
    final before = _favorites.length;
    _favorites.removeWhere((entry) => entry.id == recipeId);
    if (_favorites.length != before) {
      await favoritesStore.saveFavorites(_favorites);
      notifyListeners();
    }
  }
}