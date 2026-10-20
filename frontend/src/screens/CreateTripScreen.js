import React, { useState, useEffect } from "react";
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
    import {
        createTrip,
        getTrip,
        updateTrip
    } from "../services/tripservice";

    // Näyttää päivämäärän muodossa DD.MM.YYYY - display date as DD.MM.YYYY
    function formatDisplayDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
    }

    // Muuttaa päivämäärän backendille muotoon YYYY-MM-DD - change date to YYYY-MMM-DD for backend
    function formatApiDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
    }

    // Muuttaa backendin päivämäärän JavaScriptin Date-muotoon
    function parseApiDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    export default function CreateTripScreen({ navigation, route }) {
    const tripId = route.params?.tripId;
    const isEditing = tripId !== undefined && tripId !== null;

    // Lomakkeen tiedot
    const [name, setName] = useState("");
    const [destinationCity, setDestinationCity] = useState("");
    const [destinationCountry, setDestinationCountry] = useState("");

    // Matkan päivämäärät - trip dates 
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Kalenterin ja tallennuksen tila - calendar and save status
    const [activePicker, setActivePicker] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEditing);

    // Haetaan olemassa olevan matkan tiedot muokkausta varten
    useEffect(() => {
        if (!isEditing) return;

        let active = true;

        async function loadTrip() {
            try {
                const trip = await getTrip(tripId);

                if (!active) return;

                setName(trip.name || "");
                setDestinationCity(trip.destinationCity || "");
                setDestinationCountry(trip.destinationCountry || "");
                setStartDate(parseApiDate(trip.startDate));
                setEndDate(parseApiDate(trip.endDate));
            } catch (error) {
                Alert.alert("Error", error.message);
                navigation.goBack();
            } finally {
                if (active) setLoading(false);
            }
        }

        loadTrip();

        return () => {
            active = false;
        };
    }, [tripId, isEditing, navigation]);

    // Tallentaa kalenterista valitun päivämäärän - saved date picked from calendar
    function handleDateChange(event, selectedDate) {
        if (event?.type === "dismissed" || !selectedDate) {
            setActivePicker(null);
            return;
        }

        if (activePicker === "start") {
        setStartDate(selectedDate);

        // Tyhjennetään paluupäivä, jos se on ennen lähtöpäivää - clear end date if its before start date
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

    // Tarkistaa tiedot ja tallentaa uuden matkan tai päivittää olemassa olevan matkan
    async function handleCreateTrip() {
        // Tarkistetaan, että kaikki kentät on täytetty - check all fields are filled
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

        // Paluupäivä ei saa olla ennen lähtöpäivää - end date cant be before start date
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
        const tripData = {
            name: name.trim(),
            destinationCity: destinationCity.trim(),
            destinationCountry: destinationCountry.trim(),
            startDate: formatApiDate(startDate),
            endDate: formatApiDate(endDate),
        };

        if (isEditing) {
            await updateTrip(tripId, tripData);
            Alert.alert("Success", "Trip updated successfully.");
        } else {
            await createTrip(tripData);
        }

        // Palataan edelliselle sivulle tallennuksen jälkeen - return to previous page when saved 
        navigation.goBack();
        } catch (error) {
        Alert.alert("Error", error.message);
        } finally {
        setSaving(false);
        }
    }

    // ============= NÄKYMÄ - VIEW =============
    if (loading) {
        return (
            <ScrollView contentContainerStyle={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </ScrollView>
        );
    }

    return (
        <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>
            {isEditing ? "Edit Trip" : "Create Trip"}
        </Text>

        {/* Matkan nimi  - trip name */}
        <Text style={styles.label}>Trip name</Text>
        <TextInput
            style={styles.input}
            placeholder="e.g. Summer Holiday"
            value={name}
            onChangeText={setName}
        />

        {/* Kohdekaupunki - destination city*/}
        <Text style={styles.label}>Destination city</Text>
        <TextInput
            style={styles.input}
            placeholder="e.g. Rome"
            value={destinationCity}
            onChangeText={setDestinationCity}
        />

        {/* Kohdemaa - destination country */}
        <Text style={styles.label}>Destination country</Text>
        <TextInput
            style={styles.input}
            placeholder="e.g. Italy"
            value={destinationCountry}
            onChangeText={setDestinationCountry}
        />

        {/* Lähtöpäivän valinta - pick start date */}
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

        {/* Paluupäivän valinta - end date */}
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

        {/* Avataan kalenteri, kun päivämääräkenttää painetaan - open clander when date is pressed*/}
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

        {/* Matkan tallennuspainike - trip saving button */}
        <Pressable
            style={[styles.button, saving && styles.disabledButton]}
            onPress={handleCreateTrip}
            disabled={saving}
        >
            {saving ? (
            <ActivityIndicator color="#FFFFFF" />
            ) : (
            <Text style={styles.buttonText}>
                {isEditing ? "Save Changes" : "Create Trip"}
            </Text>
            )}
        </Pressable>
        </ScrollView>
    );
    }

    // Lomakkeen tyylit - styles
    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    content: {
        padding: 24,
        paddingBottom: 40,
    },

    loadingContainer: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
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
