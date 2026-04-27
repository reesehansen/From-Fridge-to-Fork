import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_app/app.dart';

void main() {
  testWidgets('shows the home screen', (tester) async {
    await tester.pumpWidget(const FromFridgeToForkApp());
    await tester.pumpAndSettle();

    expect(find.text('From Fridge\nTo Fork'), findsOneWidget);
    expect(find.text('Find recipes'), findsOneWidget);
  });
}
