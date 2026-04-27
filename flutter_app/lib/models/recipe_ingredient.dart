class RecipeIngredient {
  final String name;
  final String? measure;

  const RecipeIngredient({required this.name, this.measure});

  factory RecipeIngredient.fromApi(Map<String, dynamic> json, int index) {
    final name = (json['strIngredient$index'] ?? '').toString().trim();
    final measure = (json['strMeasure$index'] ?? '').toString().trim();
    return RecipeIngredient(
      name: name,
      measure: measure.isEmpty ? null : measure,
    );
  }
}