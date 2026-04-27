extension StringTitleCase on String {
  String toTitleCaseWords() {
    final trimmed = trim();
    if (trimmed.isEmpty) {
      return trimmed;
    }

    return trimmed.split(RegExp(r'\s+')).map((word) {
      if (word.isEmpty) {
        return word;
      }
      final first = word[0].toUpperCase();
      final rest = word.length > 1 ? word.substring(1).toLowerCase() : '';
      return '$first$rest';
    }).join(' ');
  }
}