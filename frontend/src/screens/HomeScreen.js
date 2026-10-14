import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Pressable,
    StyleSheet,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import styles from "../styles/globalStyles";
import TripCard from "../components/tripCard";
import { getTrips } from "../services/tripservice";

export default function HomeScreen({ navigation }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadTrips() {
                setLoading(true);
                setError(null);

                try {
                    const data = await getTrips();

                    if (active) {
                        setTrips(data);
                    }
                } catch (err) {
                    if (active) {
                        setError(err.message);
                    }
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            }

            loadTrips();

            return () => {
                active = false;
            };
        }, [])
    );

    // Näytetään vain matkat, joiden päättymispäivä ei ole mennyt
    const today = new Date();
    const todayString =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}-` +
        `${String(today.getDate()).padStart(2, "0")}`;

    const upcomingTrips = trips.filter(
        (trip) => trip.endDate >= todayString
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={localStyles.header}>
                    <Text style={styles.title}>Home</Text>

                    <Pressable
                        style={localStyles.addButton}
                        onPress={() =>
                            navigation.getParent()?.navigate("CreateTrip")
                        }
                        accessibilityRole="button"
                        accessibilityLabel="Create a new trip"
                    >
                        <Text style={localStyles.addButtonText}>+</Text>
                    </Pressable>
                </View>

                <Text style={styles.subtitle}>
                    Your travel dashboard
                </Text>

                <Text style={styles.sectionTitle}>
                    Upcoming Trips
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" />
                ) : error ? (
                    <Text>Failed to load trips: {error}</Text>
                ) : upcomingTrips.length === 0 ? (
                    <Text>No upcoming trips.</Text>
                ) : (
                    upcomingTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const localStyles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#92969B",
        alignItems: "center",
        justifyContent: "center",
    },

    addButtonText: {
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "400",
        lineHeight: 38,
    },
});