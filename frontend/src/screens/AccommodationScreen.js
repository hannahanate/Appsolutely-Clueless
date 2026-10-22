import React, { useState, useEffect, useCallback } from "react";
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

import {
    getAccomodation,
    addAccomodation,
    updateAccomodation,
    deleteAccomodation,
} from "../services/tripservice";

export default function AccommodationScreen({ route }) {
    const { tripId } = route.params;

    const [accomodation, setAccomodation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(false);

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [checkInTime, setCheckInTime] = useState("");
    const [checkOutTime, setCheckOutTime] = useState("");
    const [bookingRef, setBookingRef] = useState("");
    const [notes, setNotes] = useState("");

    // Load saved accommodation information
    const loadAccomodation = useCallback(async () => {
        try {
            setLoading(true);

            const data = await getAccomodation(tripId);

            //this screen uses one accommodation record per trip
            const saved = data.length > 0 ? data[0] : null;

            setAccomodation(saved);

            if (!saved) {
                setShowForm(true);
                setEditing(false);
            } else {
                setShowForm(false);
                setEditing(false);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        loadAccomodation();
    }, [loadAccomodation]);

    //fill the form with the saved information
    function startEditing() {
        setName(accomodation.name || "");
        setAddress(accomodation.address || "");
        setCity(accomodation.city || "");
        setCheckInDate(accomodation.checkInDate || "");
        setCheckOutDate(accomodation.checkOutDate || "");
        setCheckInTime(accomodation.checkInTime || "");
        setCheckOutTime(accomodation.checkOutTime || "");
        setBookingRef(accomodation.bookingRef || "");
        setNotes(accomodation.notes || "");

        setEditing(true);
        setShowForm(true);
    }

    // Save new or edited accommodation information
    async function handleSave() {
        const accommodationData = {
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            checkInDate: checkInDate.trim(),
            checkOutDate: checkOutDate.trim(),
            checkInTime: checkInTime.trim(),
            checkOutTime: checkOutTime.trim(),
            bookingRef: bookingRef.trim(),
            notes: notes.trim(),
        };

        if (
            !accommodationData.name ||
            !accommodationData.address ||
            !accommodationData.city ||
            !accommodationData.checkInDate ||
            !accommodationData.checkOutDate ||
            !accommodationData.checkInTime ||
            !accommodationData.checkOutTime
        ) {
            Alert.alert(
                "Missing information",
                "Please fill in all required fields."
            );
            return;
        }

        if (accommodationData.checkOutDate < accommodationData.checkInDate) {
            Alert.alert(
                "Invalid dates",
                "Check-out date cannot be before check-in date."
            );
            return;
        }

        try {
            setSaving(true);

            if (editing && accomodation) {
                await updateAccomodation(
                    accomodation.id,
                    accommodationData
                );
            } else {
                await addAccomodation(tripId, accommodationData);
            }

            await loadAccomodation();
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSaving(false);
        }
    }

    // Delete saved accommodation information
    function handleDelete() {
        Alert.alert(
            "Delete accommodation",
            "Are you sure you want to delete this accommodation information?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAccomodation(accomodation.id);
                            setAccomodation(null);
                            setName("");
                            setAddress("");
                            setCity("");
                            setCheckInDate("");
                            setCheckOutDate("");
                            setCheckInTime("");
                            setCheckOutTime("");
                            setBookingRef("");
                            setNotes("");
                            setEditing(false);
                            setShowForm(true);
                        } catch (error) {
                            Alert.alert("Error", error.message);
                        }
                    },
                },
            ]
        );
    }

    // Reusable input field
    function renderInput(label, value, setter, placeholder, required = true) {
        return (
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    {label}{required ? " *" : ""}
                </Text>

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

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>
                    Loading accommodation...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.heading}>Accommodation</Text>

            {!showForm && accomodation && (
                <View style={styles.card}>
                    <Text style={styles.accommodationName}>
                        {accomodation.name}
                    </Text>

                    <Text style={styles.detail}>
                        Address: {accomodation.address}
                    </Text>

                    <Text style={styles.detail}>
                        City: {accomodation.city}
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Check-in</Text>
                    <Text style={styles.detail}>
                        {accomodation.checkInDate}
                    </Text>
                    <Text style={styles.detail}>
                        {accomodation.checkInTime}
                    </Text>

                    <Text style={styles.sectionTitle}>Check-out</Text>
                    <Text style={styles.detail}>
                        {accomodation.checkOutDate}
                    </Text>
                    <Text style={styles.detail}>
                        {accomodation.checkOutTime}
                    </Text>

                    {accomodation.bookingRef ? (
                        <Text style={styles.detail}>
                            Booking reference: {accomodation.bookingRef}
                        </Text>
                    ) : null}

                    {accomodation.notes ? (
                        <Text style={styles.detail}>
                            Notes: {accomodation.notes}
                        </Text>
                    ) : null}

                    <Pressable
                        style={styles.primaryButton}
                        onPress={startEditing}
                    >
                        <Text style={styles.primaryButtonText}>
                            Edit Accommodation
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.deleteButton}
                        onPress={handleDelete}
                    >
                        <Text style={styles.deleteButtonText}>
                            Delete Accommodation
                        </Text>
                    </Pressable>
                </View>
            )}

            {showForm && (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        {editing ? "Edit Accommodation" : "Add Accommodation"}
                    </Text>

                    {renderInput(
                        "Accommodation name",
                        name,
                        setName
                    )}

                    {renderInput(
                        "Address",
                        address,
                        setAddress
                    )}

                    {renderInput(
                        "City",
                        city,
                        setCity
                    )}

                    {renderInput(
                        "Check-in date",
                        checkInDate,
                        setCheckInDate
                    )}

                    {renderInput(
                        "Check-in time",
                        checkInTime,
                        setCheckInTime
                    )}

                    {renderInput(
                        "Check-out date",
                        checkOutDate,
                        setCheckOutDate
                    )}

                    {renderInput(
                        "Check-out time",
                        checkOutTime,
                        setCheckOutTime
                    )}

                    {renderInput(
                        "Booking reference",
                        bookingRef,
                        setBookingRef,
                        "Optional",
                        false
                    )}

                    {renderInput(
                        "Notes",
                        notes,
                        setNotes,
                        false
                    )}

                    <Pressable
                        style={[
                            styles.primaryButton,
                            saving && styles.disabledButton,
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.primaryButtonText}>
                            {saving
                                ? "Saving..."
                                : editing
                                ? "Save Changes"
                                : "Save Accommodation"}
                        </Text>
                    </Pressable>

                    {editing && (
                        <Pressable
                            style={styles.secondaryButton}
                            onPress={() => {
                                setShowForm(false);
                                setEditing(false);
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Cancel
                            </Text>
                        </Pressable>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
    },
    loadingText: {
        marginTop: 12,
        color: "#6B7280",
    },
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: "#6B7280",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    accommodationName: {
        fontSize: 21,
        fontWeight: "bold",
        color: "#059669",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginTop: 12,
        marginBottom: 6,
    },
    detail: {
        fontSize: 15,
        color: "#4B5563",
        marginBottom: 6,
        lineHeight: 21,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 12,
    },
    inputGroup: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },
    primaryButton: {
        backgroundColor: "#059669",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 16,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    disabledButton: {
        opacity: 0.6,
    },
    secondaryButton: {
        backgroundColor: "#F3F4F6",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    secondaryButtonText: {
        color: "#374151",
        fontWeight: "600",
    },
    deleteButton: {
        backgroundColor: "#FEE2E2",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    deleteButtonText: {
        color: "#B91C1C",
        fontSize: 15,
        fontWeight: "600",
    },
});