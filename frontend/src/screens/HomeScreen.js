
import React from "react";
import {
    View,
    Text,
    ScrollView,
    } from "react-native";

    import styles from "../styles/globalStyles";

    export default function HomeScreen() {
    return (
        <View style={styles.container}>
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.title}>Home</Text>

            <Text style={styles.subtitle}>
            Your travel dashboard
            </Text>

            <Text style={styles.sectionTitle}>
            Upcoming Trips
            </Text>

            <Text style={styles.sectionTitle}>
            My Trips
            </Text>
        </ScrollView>

        </View>
    );
}
