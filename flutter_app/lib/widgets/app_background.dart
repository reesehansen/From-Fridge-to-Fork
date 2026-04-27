import 'package:flutter/material.dart';

class AppBackground extends StatelessWidget {
  final Widget child;

  const AppBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: <Color>[
            Color(0xFFF3FBF6),
            Color(0xFFEAF8F0),
            Color(0xFFCBF5DD),
          ],
        ),
      ),
      child: Stack(
        children: <Widget>[
          Positioned(
            right: -60,
            top: -40,
            child: _GlowBubble(color: const Color(0xFF8CE0B1).withOpacity(0.18), size: 180),
          ),
          Positioned(
            left: -80,
            top: 140,
            child: _GlowBubble(color: const Color(0xFFF2CFA3).withOpacity(0.18), size: 220),
          ),
          child,
        ],
      ),
    );
  }
}

class _GlowBubble extends StatelessWidget {
  final Color color;
  final double size;

  const _GlowBubble({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}
