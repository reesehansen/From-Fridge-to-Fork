class RecipeSummary {
  final String id;
  final String name;
  final String? thumbnailUrl;
  final int matchCount;
  final int totalUserIngredients;
  final List<String> matchedIngredients;

  const RecipeSummary({
    required this.id,
    required this.name,
    required this.thumbnailUrl,
    required this.matchCount,
    required this.totalUserIngredients,
    this.matchedIngredients = const <String>[],
  });

  double get matchRatio {
    if (totalUserIngredients == 0) {
      return 0;
    }
    return matchCount / totalUserIngredients;
  }

  RecipeSummary copyWith({
    String? id,
    String? name,
    String? thumbnailUrl,
    int? matchCount,
    int? totalUserIngredients,
    List<String>? matchedIngredients,
  }) {
    return RecipeSummary(
      id: id ?? this.id,
      name: name ?? this.name,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      matchCount: matchCount ?? this.matchCount,
      totalUserIngredients: totalUserIngredients ?? this.totalUserIngredients,
      matchedIngredients: matchedIngredients ?? this.matchedIngredients,
    );
  }
}