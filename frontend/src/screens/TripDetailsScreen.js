
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getTrip, deleteTrip } from "../services/tripservice";

export default function TripDetailsScreen({ route, navigation }) {
  const { tripId } = route.params;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the latest trip information whenever this screen opens.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadTrip() {
        setLoading(true);
        setError(null);

        try {
          const data = await getTrip(tripId);
          if (active) setTrip(data);
        } catch (err) {
          if (active) setError(err.message);
        } finally {
          if (active) setLoading(false);
        }
      }

      loadTrip();

      return () => {
        active = false;
      };
    }, [tripId])
  );

  function handleDelete() {
    Alert.alert(
      "Delete trip?",
      "This trip will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrip(tripId);
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.center}>
        <Text>{error || "Trip not found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{trip.name}</Text>
      <Text style={styles.destination}>
        {trip.destinationCity}, {trip.destinationCountry}
      </Text>

      <Text style={styles.label}>Start date</Text>
      <Text style={styles.value}>{trip.startDate}</Text>

      <Text style={styles.label}>End date</Text>
      <Text style={styles.value}>{trip.endDate}</Text>

      {trip.bookingRef ? (
        <>
          <Text style={styles.label}>Booking reference</Text>
          <Text style={styles.value}>{trip.bookingRef}</Text>
        </>
      ) : null}

      <Pressable
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("CreateTrip", { tripId: trip.id })
        }
      >
        <Text style={styles.buttonText}>Edit trip</Text>
      </Pressable>
         <Pressable
        style={styles.packingButton}
        onPress={() =>
          navigation.navigate("PackingList", {
            tripId: trip.id,
            tripName: trip.name,
          })
        }
      >
        <Text style={styles.buttonText}>Packing List</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>Delete trip</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  destination: {
    fontSize: 18,
    marginBottom: 28,
    color: "#374151",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 14,
  },
  value: {
    fontSize: 17,
    color: "#111827",
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#0750B6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 32,
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
    packingButton: {
    backgroundColor: "#059669",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
});
