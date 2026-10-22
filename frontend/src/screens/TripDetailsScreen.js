
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getTrip, deleteTrip } from "../services/tripservice";

export default function TripDetailsScreen({ route, navigation }) {
  const { tripId } = route.params;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //load the latest trip information whenever this screen opens.
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

  // Reusable card for trip features.
  function FeatureCard({
    title,
    subtitle,
    icon,
    color,
    backgroundColor,
    onPress,
  }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.featureCard,
          { backgroundColor },
          pressed && styles.pressedCard,
        ]}
        onPress={onPress}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: "#FFFFFF" },
          ]}
        >
          <Ionicons name={icon} size={25} color={color} />
        </View>

        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>

        <View style={styles.cardArrow}>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={color}
          />
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || "Trip not found."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        {/* Trip information */}
        <Text style={styles.title}>{trip.name}</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={19}
            color="#64748B"
          />
          <Text style={styles.destination}>
            {[trip.destinationCity, trip.destinationCountry]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={19}
            color="#64748B"
          />
          <Text style={styles.dateText}>
            {trip.startDate} – {trip.endDate}
          </Text>
        </View>

        {trip.bookingRef ? (
          <View style={styles.bookingBox}>
            <Text style={styles.bookingLabel}>
              Booking reference
            </Text>
            <Text style={styles.bookingValue}>
              {trip.bookingRef}
            </Text>
          </View>
        ) : null}

        {/* Trip feature cards */}

        <View style={styles.featureGrid}>
          <FeatureCard
            title="Activities"
            icon="calendar"
            color="#2563EB"
            backgroundColor="#EFF6FF"
            onPress={() =>
              navigation.navigate("Activities", {
                tripId: trip.id,
                tripName: trip.name,
              })
            }
          />

          <FeatureCard
            title="Flights"
            icon="airplane"
            color="#7C3AED"
            backgroundColor="#F5F3FF"
            onPress={() =>
               navigation.navigate("Flights", {
                tripId: trip.id,
                tripName: trip.name,
              })
            }
          />

          <FeatureCard
            title="Accommodation"
            icon="bed"
            color="#059669"
            backgroundColor="#ECFDF5"
            onPress={() =>
              navigation.navigate("Accommodation", {
                tripId: trip.id,
                tripName: trip.name,
    })
}
          />

          <FeatureCard
            title="Budget"
            icon="wallet"
            color="#EA580C"
            backgroundColor="#FFF7ED"
            onPress={() =>
             navigation.navigate("Budget", {
                tripId: trip.id,
                tripName: trip.name,
                })
            }
          />

          <FeatureCard
            title="Packing list"
            icon="briefcase"
            color="#475569"
            backgroundColor="#F1F5F9"
            onPress={() =>
              navigation.navigate("PackingList", {
                tripId: trip.id,
                tripName: trip.name,
              })
            }
          />
        </View>
      </ScrollView>

      {/* actions stay at the bottom */}
      <View style={styles.bottomActions}>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressedButton,
          ]}
          onPress={() =>
            navigation.navigate("CreateTrip", {
              tripId: trip.id,
            })
          }
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="#374151"
          />
          <Text style={styles.editButtonText}>Edit trip</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleDelete}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#DC2626"
          />
          <Text style={styles.deleteButtonText}>Delete trip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 22,
    paddingBottom: 28,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
  },
  title: {
    fontSize: 29,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  destination: {
    fontSize: 16,
    color: "#475569",
    flexShrink: 1,
  },
  dateText: {
    fontSize: 15,
    color: "#64748B",
  },
  bookingBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  bookingLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  bookingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 5,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  featureCard: {
    width: "48%",
    minHeight: 158,
    padding: 14,
    borderRadius: 16,
    marginBottom: 0,
  },
  pressedCard: {
    opacity: 0.75,
  },
  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  featureSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
  },
  cardArrow: {
    position: "absolute",
    right: 13,
    bottom: 13,
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
  pressedButton: {
    opacity: 0.7,
  },
});
