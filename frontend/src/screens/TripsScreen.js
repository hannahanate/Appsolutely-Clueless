import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    } from "react-native";
    import { useFocusEffect } from "@react-navigation/native";

    import styles from "../styles/globalStyles";
    import TripCard from "../components/tripCard";
    import { getTrips } from "../services/tripservice";

    export default function TripsScreen({ navigation }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState("Upcoming");

    // Fetch trips whenever this screen becomes active
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

    // Separate upcoming and past trips based on end date
    const today = new Date().toISOString().slice(0, 10);

    const filteredTrips = trips.filter((trip) => {
        if (selectedTab === "Upcoming") {
        return trip.endDate >= today;
        }

        if (selectedTab === "Past") {
        return trip.endDate < today;
        }

        // Bucket List needs its own backend field later
        return false;
    });

    return (
        <View style={styles.container}>
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={localStyles.header}>
            <Text style={styles.title}>My Trips</Text>

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

            {/* Trip filters */}
            <View style={localStyles.filterRow}>
            {["Upcoming", "Past", "Bucket List"].map((tab) => (
                <Pressable
                key={tab}
                style={[
                    localStyles.filterButton,
                    selectedTab === tab && localStyles.activeFilter,
                ]}
                onPress={() => setSelectedTab(tab)}
                >
                <Text
                    style={[
                    localStyles.filterText,
                    selectedTab === tab && localStyles.activeFilterText,
                    ]}
                >
                    {tab}
                </Text>
                </Pressable>
            ))}
            </View>

            {/* Trip cards */}
            {loading ? (
            <ActivityIndicator size="large" />
            ) : error ? (
            <Text>Failed to load trips: {error}</Text>
            ) : filteredTrips.length === 0 ? (
            <Text style={localStyles.emptyText}>
                {selectedTab === "Bucket List"
                ? "Bucket List is coming soon."
                : `No ${selectedTab.toLowerCase()} trips yet.`}
            </Text>
            ) : (
            filteredTrips.map((trip) => (
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
        marginBottom: 24,
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
        lineHeight: 38,
    },

    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },

    filterButton: {
        flex: 1,
        backgroundColor: "#12BED7",
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: "center",
    },

    activeFilter: {
        backgroundColor: "#0750B6",
    },

    filterText: {
        fontSize: 14,
        color: "#07151A",
    },

    activeFilterText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },

    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
    },
});
