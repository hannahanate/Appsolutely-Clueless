import React from "react";
import { View, Text } from "react-native";
import styles from "../styles/globalStyles";

export default function DiaryScreen() {
    // ============= NÄKYMÄ - VIEW =============
    return (
        <View style={styles.container}>
        <Text style={styles.title}>Travel Diary</Text>
        <Text> Travel Diary is coming soon!</Text>
        </View>
    );
}