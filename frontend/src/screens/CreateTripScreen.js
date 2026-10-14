import React, { useState } from "react";
import {
    Text,
    TextInput,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Alert,
    StyleSheet,
    } from "react-native";

    import DateTimePicker from "@react-native-community/datetimepicker";
    import { createTrip } from "../services/tripservice";

    // Näyttää päivämäärän muodossa DD.MM.YYYY
    function formatDisplayDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
    }

    // Muuttaa päivämäärän backendille muotoon YYYY-MM-DD
    function formatApiDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
    }

    export default function CreateTripScreen({ navigation }) {
    // Lomakkeen tiedot
    const [name, setName] = useState("");
    const [destinationCity, setDestinationCity] = useState("");
    const [destinationCountry, setDestinationCountry] = useState("");

    // Matkan päivämäärät
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Kalenterin ja tallennuksen tila
    const [activePicker, setActivePicker] = useState(null);
    const [saving, setSaving] = useState(false);

    // Tallentaa kalenterista valitun päivämäärän
    function handleDateChange(event, selectedDate) {
        if (!selectedDate) return;

        if (activePicker === "start") {
        setStartDate(selectedDate);

        // Tyhjennetään paluupäivä, jos se on ennen lähtöpäivää
        if (
            endDate &&
            formatApiDate(selectedDate) > formatApiDate(endDate)
        ) {
            setEndDate(null);
        }
        } else if (activePicker === "end") {
        setEndDate(selectedDate);
        }

        setActivePicker(null);
    }

    // Tarkistaa tiedot ja tallentaa uuden matkan
    async function handleCreateTrip() {
        // Tarkistetaan, että kaikki kentät on täytetty
        if (
        !name.trim() ||
        !destinationCity.trim() ||
        !destinationCountry.trim() ||
        !startDate ||
        !endDate
        ) {
        Alert.alert(
            "Missing information",
            "Please fill in all fields."
        );
        return;
        }

        // Paluupäivä ei saa olla ennen lähtöpäivää
        if (formatApiDate(endDate) < formatApiDate(startDate)) {
        Alert.alert(
            "Invalid dates",
            "End date cannot be before start date."
        );
        return;
        }

        setSaving(true);

        try {
        // Lähetetään matkan tiedot backendille
        await createTrip({
            name: name.trim(),
            destinationCity: destinationCity.trim(),
            destinationCountry: destinationCountry.trim(),
            startDate: formatApiDate(startDate),
            endDate: formatApiDate(endDate),
        });

        // Palataan edelliselle sivulle tallennuksen jälkeen
        navigation.goBack();
        } catch (error) {
        Alert.alert("Error", error.message);
        } finally {
        setSaving(false);
        }
    }

    return (
        <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>Create Trip</Text>

        {/* Matkan nimi */}
        <Text style={styles.label}>Trip name</Text>
        <TextInput
            style={styles.input}
            placeholder="e.g. Summer Holiday"
            value={name}
            onChangeText={setName}
        />

        {/* Kohdekaupunki */}
        <Text style={styles.label}>Destination city</Text>
        <TextInput
            style={styles.input}
            placeholder="e.g. Rome"
            value={destinationCity}
            onChangeText={setDestinationCity}
        />

        {/* Kohdemaa */}
        <Text style={styles.label}>Destination country</Text>
        <TextInput
            style={styles.input}
            placeholder="e.g. Italy"
            value={destinationCountry}
            onChangeText={setDestinationCountry}
        />

        {/* Lähtöpäivän valinta */}
        <Text style={styles.label}>Start date</Text>
        <Pressable
            style={styles.dateInput}
            onPress={() => setActivePicker("start")}
            accessibilityRole="button"
            accessibilityLabel="Select start date"
        >
            <Text
            style={startDate ? styles.dateText : styles.placeholderText}
            >
            {startDate
                ? formatDisplayDate(startDate)
                : "Select start date"}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
        </Pressable>

        {/* Paluupäivän valinta */}
        <Text style={styles.label}>End date</Text>
        <Pressable
            style={styles.dateInput}
            onPress={() => setActivePicker("end")}
            accessibilityRole="button"
            accessibilityLabel="Select end date"
        >
            <Text
            style={endDate ? styles.dateText : styles.placeholderText}
            >
            {endDate
                ? formatDisplayDate(endDate)
                : "Select end date"}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
        </Pressable>

        {/* Avataan kalenteri, kun päivämääräkenttää painetaan */}
        {activePicker !== null && (
            <DateTimePicker
            value={
                activePicker === "start"
                ? startDate || new Date()
                : endDate || startDate || new Date()
            }
            mode="date"
            display="default"
            minimumDate={
                activePicker === "end" && startDate
                ? startDate
                : undefined
            }
            onChange={handleDateChange}
            />
        )}

        {/* Matkan tallennuspainike */}
        <Pressable
            style={[styles.button, saving && styles.disabledButton]}
            onPress={handleCreateTrip}
            disabled={saving}
        >
            {saving ? (
            <ActivityIndicator color="#FFFFFF" />
            ) : (
            <Text style={styles.buttonText}>Create Trip</Text>
            )}
        </Pressable>
        </ScrollView>
    );
    }

    // Lomakkeen tyylit
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

    button: {
        backgroundColor: "#2563EB",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: 12,
    },

    disabledButton: {
        opacity: 0.6,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
