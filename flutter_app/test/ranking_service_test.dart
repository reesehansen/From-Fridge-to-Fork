import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:flutter_app/models/recipe_detail.dart';
import 'package:flutter_app/models/recipe_ingredient.dart';
import 'package:flutter_app/services/ranking_service.dart';
import 'package:flutter_app/services/themealdb_service.dart';

void main() {
  test('ranks by match count then ratio then name', () async {
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/filter.php')) {
        final ingredient = request.url.queryParameters['i'];
        if (ingredient == 'chicken') {
          return http.Response(
            '{"meals":[{"idMeal":"1","strMeal":"Alpha Chicken","strMealThumb":"https://example.com/a.jpg"},{"idMeal":"2","strMeal":"Beta Bowl","strMealThumb":"https://example.com/b.jpg"}]}',
            200,
          );
        }
        if (ingredient == 'garlic') {
          return http.Response(
            '{"meals":[{"idMeal":"1","strMeal":"Alpha Chicken","strMealThumb":"https://example.com/a.jpg"},{"idMeal":"3","strMeal":"Carrot Curry","strMealThumb":"https://example.com/c.jpg"}]}',
            200,
          );
        }
        return http.Response('{"meals":[]}', 200);
      }

      throw UnsupportedError('Unexpected request: ${request.url}');
    });

    final service = ThemealdbService(client: client);
    final ranking = RankingService(service);

    final result = await ranking.searchRecipes('chicken, garlic', glutenFreeOnly: false);

    expect(result.normalizedIngredients, ['chicken', 'garlic']);
    expect(result.recipes, hasLength(3));
    expect(result.recipes.first.id, '1');
    expect(result.recipes.first.matchCount, 2);
    expect(result.recipes.first.totalUserIngredients, 2);
    expect(result.recipes[1].name, 'Beta Bowl');
    expect(result.recipes[2].name, 'Carrot Curry');
  });

  test('gluten-free keyword detection is best-effort', () {
    final service = ThemealdbService(client: MockClient((request) async {
      throw UnsupportedError('not used');
    }));

    final glutenFree = service.isLikelyGlutenFree(
      const RecipeDetail(
        id: '1',
        name: 'Soup',
        thumbnailUrl: null,
        category: null,
        area: null,
        instructions: null,
        sourceUrl: null,
        youtubeUrl: null,
        ingredients: <RecipeIngredient>[
          RecipeIngredient(name: 'rice'),
        ],
      ),
    );

    final notGlutenFree = service.isLikelyGlutenFree(
      const RecipeDetail(
        id: '2',
        name: 'Bread',
        thumbnailUrl: null,
        category: null,
        area: null,
        instructions: null,
        sourceUrl: null,
        youtubeUrl: null,
        ingredients: <RecipeIngredient>[
          RecipeIngredient(name: 'wheat flour'),
        ],
      ),
    );

    expect(glutenFree, isTrue);
    expect(notGlutenFree, isFalse);
  });
}
