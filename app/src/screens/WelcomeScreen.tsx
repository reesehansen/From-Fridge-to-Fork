import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            {/* Logo at the top */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/icon.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Main content */}
            <View style={styles.contentContainer}>
                <Text style={styles.title}>From Fridge to Fork</Text>

                <Text style={styles.description}>
                    Turn the ingredients you already have into tasty, fork-ready meals. Instead of staring
                    into the fridge and feeling stuck, you can type in what's on hand and get recipe ideas
                    that make the most of what you've got, so food doesn't go to waste and dinner doesn't
                    require another trip to the grocery store. It's designed to make cooking feel easier,
                    faster, and more fun, whether you're working with a full fridge or just a few odds and
                    ends.
                </Text>
            </View>

            {/* Arrow button */}
            <Pressable
                style={styles.arrowButton}
                onPress={() => navigation.navigate("IngredientInput")}
            >
                <Text style={styles.arrowText}>→</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#6EE7B7", // pastel mint
        padding: 20,
        justifyContent: "space-between",
        alignItems: "center",
    },

    logoContainer: {
        marginTop: 40,
        marginBottom: 20,
    },

    logo: {
        width: 100,
        height: 100,
    },

    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
    },

    title: {
        fontSize: 36,
        fontWeight: "900",
        textAlign: "center",
        color: "white",
        letterSpacing: 0.5,
    },

    description: {
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
        color: "white",
        lineHeight: 26,
        paddingHorizontal: 12,
    },

    arrowButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },

    arrowText: {
        fontSize: 32,
        color: "white",
        fontWeight: "700",
    },
});
