
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

// Muuttaa päivämäärän muodosta YYYY-MM-DD muotoon DD.MM.YYYY
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");

    return `${day}.${month}.${year}`;
}

export default function TripCard({ trip, onPress }) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Text style={styles.title}>
                {trip.name}
            </Text>

            <Text style={styles.destination}>
                {trip.destinationCity}, {trip.destinationCountry}
            </Text>

            <Text style={styles.dates}>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#111827",
    },

    destination: {
        fontSize: 16,
        marginBottom: 6,
        color: "#374151",
    },

    dates: {
        fontSize: 14,
        color: "#6B7280",
    },
});
