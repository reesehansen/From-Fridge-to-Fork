import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/favorite_entry.dart';

class FavoritesStore {
  static const String _storageKey = 'fff_favorites_v1';

  Future<List<FavoriteEntry>> loadFavorites() async {
    final preferences = await SharedPreferences.getInstance();
    final raw = preferences.getString(_storageKey);
    if (raw == null || raw.trim().isEmpty) {
      return <FavoriteEntry>[];
    }

    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded
            .whereType<Map<String, dynamic>>()
            .map(FavoriteEntry.fromJson)
            .where((entry) => entry.id.isNotEmpty && entry.name.isNotEmpty)
            .toList(growable: false);
      }

      if (decoded is Map<String, dynamic>) {
        final items = (decoded['items'] as List<dynamic>?) ?? const <dynamic>[];
        return items
            .whereType<Map<String, dynamic>>()
            .map(FavoriteEntry.fromJson)
            .where((entry) => entry.id.isNotEmpty && entry.name.isNotEmpty)
            .toList(growable: false);
      }
    } catch (_) {
      return <FavoriteEntry>[];
    }

    return <FavoriteEntry>[];
  }

  Future<void> saveFavorites(List<FavoriteEntry> favorites) async {
    final preferences = await SharedPreferences.getInstance();
    final payload = <String, dynamic>{
      'version': 1,
      'items': favorites.map((entry) => entry.toJson()).toList(growable: false),
    };
    await preferences.setString(_storageKey, jsonEncode(payload));
  }
}