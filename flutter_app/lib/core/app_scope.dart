import 'package:flutter/widgets.dart';

import '../services/favorites_store.dart';
import '../services/ranking_service.dart';
import '../services/themealdb_service.dart';
import 'app_controller.dart';

class AppScope extends InheritedNotifier<AppController> {
  final AppController controller;
  final ThemealdbService mealDbService;
  final RankingService rankingService;
  final FavoritesStore favoritesStore;

  const AppScope({
    super.key,
    required this.controller,
    required this.mealDbService,
    required this.rankingService,
    required this.favoritesStore,
    required super.child,
  }) : super(notifier: controller);

  static AppScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope not found in widget tree');
    return scope!;
  }
}