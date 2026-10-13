import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { getTrips } from "../services/tripservice";

export default function TripsScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      setError("");

      // Get trips from the backend API
        const savedTrips = await getTrips();
        setTrips(savedTrips);
    } catch (err) {
      console.error("Failed to load local trips:", err);
      setError("Could not load your saved trips.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading your trips...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Trips</Text>

      {trips.length === 0 ? (
        <Text>No saved trips yet.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <Text style={styles.tripName}>{item.name}</Text>
              <Text>Destination: {item.destinationCity}, {item.destinationCountry}</Text>
              {item.startDate ? (
                <Text>Start date: {item.startDate}</Text>
              ) : null}
              {item.endDate ? (
                <Text>End date: {item.endDate}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  tripCard: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },
  tripName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
