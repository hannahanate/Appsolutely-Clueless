
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    } from "react-native";

    import styles from "../styles/globalStyles";
    import TripCard from "../components/tripCard";
    import { getTrips } from "../services/tripservice";

    export default function HomeScreen() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadTrips() {
        try {
            const data = await getTrips();
            setTrips(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        }

        loadTrips();
    }, []);

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

            {loading ? (
            <ActivityIndicator size="large" />
            ) : error ? (
            <Text>Failed to load trips: {error}</Text>
            ) : trips.length === 0 ? (
            <Text>No trips yet.</Text>
            ) : (
            trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
            ))
            )}
        </ScrollView>
        </View>
    );
}
