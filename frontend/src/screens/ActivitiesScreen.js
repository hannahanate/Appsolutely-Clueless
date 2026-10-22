import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "../services/tripservice";

//show the date as DD.MM.YYYY
function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

//convert the date to YYYY-MM-DD for the backend
function formatApiDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

export default function ActivitiesScreen({ route }) {
  const { tripId } = route.params;

  const [activities, setActivities] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [activePicker, setActivePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  //load activities when screen opens.
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/trips/${tripId}/activities`
      );

      if (!response.ok) {
        throw new Error("Could not load activities.");
      }

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [loadActivities])
  );

  //handle a date selected in the calendar.
  function handleDateChange(event, selectedDate) {
    if (event?.type === "dismissed" || !selectedDate) {
      setActivePicker(false);
      return;
    }

    setDate(selectedDate);
    setActivePicker(false);
  }

  //save a new activity to the backend.
  async function addActivity() {
    if (!name.trim() || !date) {
      Alert.alert(
        "Missing information",
        "Enter an activity name and date."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/trips/${tripId}/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            date: formatApiDate(date),
            time: time.trim() || null,
            location: location.trim() || null,
            notes: notes.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not add activity."
        );
      }

      //clear the form after saving.
      setName("");
      setDate(null);
      setTime("");
      setLocation("");
      setNotes("");

      await loadActivities();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  }

  //show each activity in the list
  function renderActivity({ item }) {
    return (
      <View style={styles.activityCard}>
        <Text style={styles.activityName}>{item.name}</Text>

        <Text style={styles.activityDetails}>
          {item.date}
          {item.time ? ` at ${item.time}` : ""}
        </Text>

        {item.location ? (
          <Text style={styles.activityDetails}>
            {item.location}
          </Text>
        ) : null}

        {item.notes ? (
          <Text style={styles.notes}>{item.notes}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Trip Activities</Text>

      <Text style={styles.label}>Activity name</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Activity date</Text>
      <Pressable
        style={styles.dateInput}
        onPress={() => setActivePicker(true)}
        accessibilityRole="button"
        accessibilityLabel="Select activity date"
      >
        <Text
          style={date ? styles.dateText : styles.placeholderText}
        >
          {date ? formatDisplayDate(date) : "Select activity date"}
        </Text>

        <Text style={styles.calendarIcon}>📅</Text>
      </Pressable>

      {activePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Time (optional)</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
      />

      <Text style={styles.label}>Location (optional)</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Add any details..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable
        style={[styles.addButton, saving && styles.disabledButton]}
        onPress={addActivity}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Add Activity</Text>
        )}
      </Pressable>

      <Text style={styles.sectionTitle}>Your Activities</Text>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderActivity}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No activities yet.
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      )}
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
  dateInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: "#111827",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  calendarIcon: {
    fontSize: 20,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 14,
  },
  activityCard: {
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  activityDetails: {
    marginTop: 5,
    color: "#4B5563",
  },
  notes: {
    marginTop: 8,
    color: "#374151",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
  list: {
    paddingBottom: 20,
  },
});