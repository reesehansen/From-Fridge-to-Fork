import 'recipe_detail.dart';
import 'recipe_summary.dart';

class FavoriteEntry {
  final String id;
  final String name;
  final String? thumbnailUrl;
  final String? category;
  final String? area;
  final String? sourceUrl;
  final String? youtubeUrl;
  final String savedAtIso;

  const FavoriteEntry({
    required this.id,
    required this.name,
    required this.thumbnailUrl,
    required this.category,
    required this.area,
    required this.sourceUrl,
    required this.youtubeUrl,
    required this.savedAtIso,
  });

  factory FavoriteEntry.fromDetail(RecipeDetail detail) {
    return FavoriteEntry(
      id: detail.id,
      name: detail.name,
      thumbnailUrl: detail.thumbnailUrl,
      category: detail.category,
      area: detail.area,
      sourceUrl: detail.sourceUrl,
      youtubeUrl: detail.youtubeUrl,
      savedAtIso: DateTime.now().toUtc().toIso8601String(),
    );
  }

  factory FavoriteEntry.fromJson(Map<String, dynamic> json) {
    return FavoriteEntry(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      thumbnailUrl: _clean(json['thumbnailUrl']),
      category: _clean(json['category']),
      area: _clean(json['area']),
      sourceUrl: _clean(json['sourceUrl']),
      youtubeUrl: _clean(json['youtubeUrl']),
      savedAtIso: _clean(json['savedAtIso']) ?? DateTime.now().toUtc().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'thumbnailUrl': thumbnailUrl,
      'category': category,
      'area': area,
      'sourceUrl': sourceUrl,
      'youtubeUrl': youtubeUrl,
      'savedAtIso': savedAtIso,
    };
  }

  RecipeSummary toSummary() {
    return RecipeSummary(
      id: id,
      name: name,
      thumbnailUrl: thumbnailUrl,
      matchCount: 0,
      totalUserIngredients: 0,
    );
  }

  static String? _clean(dynamic value) {
    final text = value?.toString().trim() ?? '';
    return text.isEmpty ? null : text;
  }
}