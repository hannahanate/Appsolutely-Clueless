import React from "react";
import { Pressable, Text, StyleSheet, Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../services/tripservice";

// Kuvien osoite backendistä - Image URL from backend
const IMAGE_BASE_URL = API_URL.replace(/\/api$/, "");

// Muuttaa päivämäärän muodosta YYYY-MM-DD muotoon DD.MM.YYYY
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");

    return `${day}.${month}.${year}`;
}

// Laske matkan kesto - Calculate trip duration
function getTripDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export default function TripCard({ trip, onPress }) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            {trip.destinationPicture && (
                <Image
                    source={{ uri: IMAGE_BASE_URL + trip.destinationPicture }}
                    style={styles.picture}
                    resizeMode="cover"
                />
            )}

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>
                        {trip.destinationCountry}
                    </Text>

                    {trip.destinationFlag && (
                        <Image
                            source={{ uri: IMAGE_BASE_URL + trip.destinationFlag }}
                            style={styles.flag}
                            resizeMode="contain"
                        />
                    )}
                </View>

                <Text style={styles.dates}>
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                </Text>

                <View style={styles.bottomRow}>
                    <View style={styles.info}>
                        <Ionicons name="airplane" size={18} color="#64748B" />
                        <Text style={styles.destination}>
                            {trip.destinationCity}
                        </Text>

                        <Ionicons name="layers-outline" size={18} color="#64748B" />
                        <Text style={styles.duration}>
                            {getTripDuration(trip.startDate, trip.endDate)} days
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
    },

    picture: {
        width: "100%",
        height: 125,
    },

    content: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 14,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },

    title: {
        fontSize: 21,
        fontWeight: "bold",
        color: "#111827",
        marginRight: 10,
    },

    flag: {
        width: 25,
        height: 19,
    },

    dates: {
        fontSize: 15,
        color: "#475569",
        marginBottom: 12,
    },

    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    info: {
        flexDirection: "row",
        alignItems: "center",
    },

    destination: {
        fontSize: 14,
        color: "#64748B",
        marginLeft: 7,
        marginRight: 24,
    },

    duration: {
        fontSize: 14,
        color: "#64748B",
        marginLeft: 7,
    },
});
