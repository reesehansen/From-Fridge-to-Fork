import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./screens/WelcomeScreen";
import IngredientInputScreen from "./screens/IngredientInputScreen";
import ResultsScreen from "./screens/ResultsScreen";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import FavoritesScreen from "./screens/FavoritesScreen";

export type RootStackParamList = {
  Welcome: undefined;
  IngredientInput: undefined;
  Results: { ingredients: string; isGlutenFree: boolean; starredIngredient?: string };
  RecipeDetail: { id: string; name: string; userIngredients: string; starredIngredient?: string };
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="IngredientInput"
          component={IngredientInputScreen}
          options={{ title: "From Fridge to Fork" }}
        />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: "Results" }} />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favorites" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}