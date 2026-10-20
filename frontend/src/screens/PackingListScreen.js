
import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../services/tripservice";

export default function PackingListScreen({ route }) {
    const { tripId, tripName } = route.params;

    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [loading, setLoading] = useState(false);

    //load packing items whenever this screen opens
    const loadItems = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/trips/${tripId}/packing`
            );

            if (!response.ok) {
                throw new Error("Could not load packing list");
            }

            const data = await response.json();
            setItems(data);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [loadItems])
    );

    //add a new item to the packing list
    async function addItem() {
        if (!name.trim()) {
            Alert.alert("Missing name", "Please enter an item name.");
            return;
        }

        const parsedQuantity = Number(quantity);

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            Alert.alert("Invalid quantity", "Enter a whole number greater than 0.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/trips/${tripId}/packing`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        category: category.trim() || null,
                        quantity: parsedQuantity,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not add item");
            }

            setName("");
            setCategory("");
            setQuantity("1");
            await loadItems();
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    }

    //mark an item as packed or unpacked
    async function togglePacked(item) {
        try {
            const response = await fetch(
                `${API_URL}/packing/${item.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        packed: item.packed !== 1,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not update item");
            }

            await loadItems();
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    }

    //delete an item from the packing list
    function confirmDelete(item) {
        Alert.alert(
            "Delete item",
            `Remove "${item.name}" from the packing list?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteItem(item.id),
                },
            ]
        );
    }

    async function deleteItem(itemId) {
        try {
            const response = await fetch(
                `${API_URL}/packing/${itemId}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not delete item");
            }

            await loadItems();
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    }

    function renderItem({ item }) {
        const isPacked = item.packed === 1;

        return (
            <View style={styles.item}>
                <TouchableOpacity
                    style={styles.itemInfo}
                    onPress={() => togglePacked(item)}
                >
                    <Text style={styles.checkbox}>
                        {isPacked ? "☑" : "☐"}
                    </Text>

                    <View style={styles.itemText}>
                        <Text
                            style={[
                                styles.itemName,
                                isPacked && styles.packedName,
                            ]}
                        >
                            {item.name} × {item.quantity}
                        </Text>

                        {item.category ? (
                            <Text style={styles.category}>
                                {item.category}
                            </Text>
                        ) : null}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => confirmDelete(item)}
                    style={styles.deleteButton}
                >
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const packedCount = items.filter(item => item.packed === 1).length;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Packing List</Text>
            <Text style={styles.tripName}>{tripName}</Text>

            <Text style={styles.progress}>
                Packed {packedCount} of {items.length} items
            </Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Item name (For example: Passport)"
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Category (optional)"
                    value={category}
                    onChangeText={setCategory}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Quantity"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                />

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addItem}
                >
                    <Text style={styles.addButtonText}>+ Add item</Text>
                </TouchableOpacity>
            </View>

            {loading && items.length === 0 ? (
                <Text style={styles.message}>Loading packing list...</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.message}>
                            No items yet. Add your first packing item above!
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
    },
    tripName: {
        fontSize: 16,
        color: "#6B7280",
        marginTop: 4,
    },
    progress: {
        fontSize: 15,
        color: "#2563EB",
        marginTop: 12,
        marginBottom: 16,
    },
    form: {
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        gap: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#FFFFFF",
    },
    addButton: {
        backgroundColor: "#2563EB",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    addButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    list: {
        paddingBottom: 30,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    itemInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        fontSize: 25,
        marginRight: 12,
        color: "#2563EB",
    },
    itemText: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    packedName: {
        textDecorationLine: "line-through",
        color: "#9CA3AF",
    },
    category: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 3,
    },
    deleteButton: {
        padding: 8,
    },
    deleteText: {
        color: "#DC2626",
        fontWeight: "600",
    },
    message: {
        textAlign: "center",
        color: "#6B7280",
        padding: 20,
    },
});
