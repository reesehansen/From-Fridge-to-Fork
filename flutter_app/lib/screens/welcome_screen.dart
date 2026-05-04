import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../widgets/app_logo.dart';
import '../widgets/app_background.dart';
import 'home_screen.dart';

class WelcomeScreen extends StatelessWidget {
  static const String routeName = '/welcome';

  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final bg = Theme.of(context).colorScheme.primary; // pastel mint
    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: AppBackground(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                const SizedBox(height: 8),
                Center(child: AppLogo(size: 92)),
                const SizedBox(height: 18),
                Center(
                  child: Text(
                    'From Fridge to Fork',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.lilitaOne(
                      fontSize: 36,
                      color: Theme.of(context).colorScheme.onSurface,
                      height: 1.02,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Expanded(
                  child: SingleChildScrollView(
                    child: Text(
                      'Turn the ingredients you already have into tasty, fork-ready meals. Instead of staring into the fridge and feeling stuck, you can type in what’s on hand and get recipe ideas that make the most of what you’ve got, so food doesn’t go to waste and dinner doesn’t require another trip to the grocery store. It’s designed to make cooking feel easier, faster, and more fun, whether you’re working with a full fridge or just a few odds and ends.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onSurface,
                            fontSize: 18,
                            height: 1.45,
                          ),
                      textAlign: TextAlign.left,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      shape: const CircleBorder(),
                      padding: const EdgeInsets.all(14),
                      backgroundColor: Colors.white,
                      foregroundColor: bg,
                    ),
                    onPressed: () => Navigator.of(context).pushReplacementNamed(HomeScreen.routeName),
                    child: const Icon(Icons.arrow_forward_rounded, size: 28),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
