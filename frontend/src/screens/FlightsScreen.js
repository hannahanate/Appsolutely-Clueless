
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../services/tripservice";

// Convert DD.MM.YYYY to YYYY-MM-DD for the backend.
function formatApiDate(date) {
  const parts = date.split(".");

  if (parts.length !== 3) {
    return date;
  }

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}

// Check that the date is a real calendar date.
function isValidDate(date) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
    return false;
  }

  const [day, month, year] = date.split(".").map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
}

export default function FlightsScreen({ route }) {
  const { tripId } = route.params;

  const [flights, setFlights] = useState([]);

  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [layoverCity, setLayoverCity] = useState("");
  const [layoverAirport, setLayoverAirport] = useState("");
  const [layoverDuration, setLayoverDuration] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load flights for this trip.
  const loadFlights = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/trips/${tripId}/flights`
      );

      if (!response.ok) {
        throw new Error("Could not load flights.");
      }

      const data = await response.json();
      setFlights(data);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadFlights();
    }, [loadFlights])
  );

  // Add a flight.
  async function addFlight() {
    if (
      !airline.trim() ||
      !flightNumber.trim() ||
      !departureCity.trim() ||
      !departureAirport.trim() ||
      !departureDate.trim() ||
      !departureTime.trim() ||
      !arrivalCity.trim() ||
      !arrivalAirport.trim() ||
      !arrivalDate.trim() ||
      !arrivalTime.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please fill in all required flight fields."
      );
      return;
    }

    if (
      !isValidDate(departureDate.trim()) ||
      !isValidDate(arrivalDate.trim())
    ) {
      Alert.alert(
        "Invalid date",
        "Enter both dates in DD.MM.YYYY format, for example 15.11.2026."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/trips/${tripId}/flights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            airline: airline.trim(),
            flightNumber: flightNumber.trim(),
            departureCity: departureCity.trim(),
            departureAirport: departureAirport.trim(),
            departureDate: formatApiDate(departureDate.trim()),
            departureTime: departureTime.trim(),
            arrivalCity: arrivalCity.trim(),
            arrivalAirport: arrivalAirport.trim(),
            arrivalDate: formatApiDate(arrivalDate.trim()),
            arrivalTime: arrivalTime.trim(),
            layoverCity: layoverCity.trim() || null,
            layoverAirport: layoverAirport.trim() || null,
            layoverDuration: layoverDuration.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add flight.");
      }

      // Clear the form after saving.
      setAirline("");
      setFlightNumber("");
      setDepartureCity("");
      setDepartureAirport("");
      setDepartureDate("");
      setDepartureTime("");
      setArrivalCity("");
      setArrivalAirport("");
      setArrivalDate("");
      setArrivalTime("");
      setLayoverCity("");
      setLayoverAirport("");
      setLayoverDuration("");

      // Refresh flights so the new flight appears above the form.
      await loadFlights();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  }

  // Display one saved flight.
  function renderFlight(item) {
    return (
      <View key={item.id} style={styles.flightCard}>
        <Text style={styles.flightTitle}>
          {item.airline} · {item.flightNumber}
        </Text>

        <Text style={styles.route}>
          {item.departureCity} → {item.arrivalCity}
        </Text>

        <Text style={styles.details}>
          Departure: {item.departureDate} at {item.departureTime}
        </Text>

        <Text style={styles.details}>
          From: {item.departureAirport}
        </Text>

        <Text style={styles.details}>
          Arrival: {item.arrivalDate} at {item.arrivalTime}
        </Text>

        <Text style={styles.details}>
          To: {item.arrivalAirport}
        </Text>

        {item.layoverCity ? (
          <Text style={styles.details}>
            Layover: {item.layoverCity}
            {item.layoverAirport
              ? ` (${item.layoverAirport})`
              : ""}
            {item.layoverDuration
              ? ` · ${item.layoverDuration}`
              : ""}
          </Text>
        ) : null}
      </View>
    );
  }

  // Reusable text input.
  function field(label, value, setter, placeholder = "") {
    return (
      <View key={label}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setter}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="sentences"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Flights</Text>

      {/* Saved flights appear first. */}
      {loading ? (
        <ActivityIndicator
          size="large"
          style={styles.loader}
        />
      ) : flights.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>
            Your Flights
          </Text>

          {flights.map((flight) => renderFlight(flight))}
        </View>
      ) : null}

      {/* The form appears below the flights, or immediately
          if no flights have been added yet. */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {flights.length > 0
            ? "Add Another Flight"
            : "Flight Information"}
        </Text>

        {field(
          "Airline *",
          airline,
          setAirline
        )}

        {field(
          "Flight number *",
          flightNumber,
          setFlightNumber
        )}

        {field(
          "Departure city *",
          departureCity,
          setDepartureCity
        )}

        {field(
          "Departure airport *",
          departureAirport,
          setDepartureAirport
        )}

        {field(
          "Departure date *",
          departureDate,
          setDepartureDate
        )}

        {field(
          "Departure time *",
          departureTime,
          setDepartureTime
        )}

        {field(
          "Arrival city *",
          arrivalCity,
          setArrivalCity
        )}

        {field(
          "Arrival airport *",
          arrivalAirport,
          setArrivalAirport,
        )}

        {field(
          "Arrival date *",
          arrivalDate,
          setArrivalDate
        )}

        {field(
          "Arrival time *",
          arrivalTime,
          setArrivalTime,
        )}

        <Text style={styles.sectionTitle}>
          Layover (optional)
        </Text>

        {field(
          "Layover city",
          layoverCity,
          setLayoverCity
        )}

        {field(
          "Layover airport",
          layoverAirport,
          setLayoverAirport
        )}

        {field(
          "Layover duration",
          layoverDuration,
          setLayoverDuration
        )}

        <Pressable
          style={[
            styles.addButton,
            saving && styles.disabledButton,
          ]}
          onPress={addFlight}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Add Flight
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 16,
    color: "#111827",
  },
  formSection: {
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#0750B6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 28,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  flightCard: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  flightTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  route: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: "#0750B6",
  },
  details: {
    marginTop: 5,
    color: "#4B5563",
  },
  loader: {
    marginVertical: 20,
  },
});
