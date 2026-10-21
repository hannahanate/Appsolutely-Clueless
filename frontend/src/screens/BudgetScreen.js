import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getBudget,
  addBudgetExpense,
  deleteBudgetExpense,
  getTripBudget,
  saveTripBudget,
} from "../services/tripservice";

export default function BudgetScreen({ route }) {
  //get the trip name passed from tripdetailsscreen
  const { tripId, tripName } = route.params;

  // Store the budget, expenses, and new expense form values.
  const [totalBudget, setTotalBudget] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [savingBudget, setSavingBudget] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Other");
  const [loading, setLoading] = useState(true);

  // Load saved expenses when the screen opens
  useEffect(() => {
    async function loadExpenses() {
      try {
        // Load the expenses and saved total budget
        const [data, budgetData] = await Promise.all([
          getBudget(tripId),
          getTripBudget(tripId),
        ]);

        setExpenses(data);

        //shows the saved budget or leave the field empty if its zero
        setTotalBudget(
          Number(budgetData.totalBudget) > 0
            ? String(budgetData.totalBudget)
            : ""
        );
      } catch (error) {
        Alert.alert("Error", "Could not load budget information.");
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, [tripId]);

  //calculate the total amount spent on all expenses.
  const spent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  //calculate how much of the budget is left
  const remaining = (Number(totalBudget.replace(",", ".")) || 0) - spent;

  // Save the total budget for this trip
  async function saveTotalBudget() {
    const amount = Number(totalBudget.replace(",", "."));

    if (
      totalBudget.trim() === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      Alert.alert("Invalid budget", "Please enter a valid budget amount.");
      return;
    }

    try {
      setSavingBudget(true);

      // Save the budget in the database
      const result = await saveTripBudget(tripId, amount);

      // Update the displayed value
      setTotalBudget(String(result.totalBudget));

      Alert.alert("Success", "Total budget saved.");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Could not save total budget."
      );
    } finally {
      setSavingBudget(false);
    }
  }

  //validate and add a new expense to the list
  async function addExpense() {
    //allow users to enter either a dot or comma as decimal
    const amount = Number(expenseAmount.replace(",", "."));

    if (!expenseName.trim() || !expenseAmount.trim()) {
      Alert.alert(
        "Missing information",
        "Enter an expense name and amount."
      );
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Enter an amount greater than zero."
      );
      return;
    }

    try {
      //add the new expense to existing expenses
      const newExpense = await addBudgetExpense(tripId, {
        description: expenseName.trim(),
        amount,
        currency: "€",
        category: expenseCategory,
        date: new Date().toISOString().slice(0, 10),
      });

      setExpenses((current) => [newExpense, ...current]);

      //clear the form after adding expense
      setExpenseName("");
      setExpenseAmount("");
      setExpenseCategory("Other");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Could not save expense."
      );
    }
  }

  //delete an expense from the database
  function confirmDeleteExpense(expense) {
    Alert.alert(
      "Delete expense",
      `Are you sure you want to delete "${expense.description}"?`,
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
              await deleteBudgetExpense(expense.id);

              setExpenses((current) =>
                current.filter((item) => item.id !== expense.id)
              );
            } catch (error) {
              Alert.alert("Error", "Could not delete expense.");
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* display the selected trips name and the page heading */}
      <Text style={styles.tripName}>{tripName}</Text>
      <Text style={styles.heading}>Trip budget</Text>

      {/* show the total budget, spending and remaining money */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total budget</Text>

        <TextInput
          style={styles.budgetInput}
          value={totalBudget}
          onChangeText={setTotalBudget}
          keyboardType="decimal-pad"
          placeholder="Enter budget"
        />

        {/* Save the total budget to the database */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBudgetButton,
            pressed && styles.pressedButton,
            savingBudget && styles.disabledButton,
          ]}
          onPress={saveTotalBudget}
          disabled={savingBudget}
        >
          <Text style={styles.saveBudgetButtonText}>
            {savingBudget ? "Saving..." : "Save budget"}
          </Text>
        </Pressable>

         <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.spentAmount}>
              €{spent.toFixed(2)}
            </Text>
          </View>

          <View>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text
              style={[
                styles.remainingAmount,
                remaining < 0 && styles.overBudget,
              ]}
            >
              €{remaining.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* display expenses that have already been added */}
      <Text style={styles.sectionTitle}>Expenses</Text>

      {loading ? (
        //show a message while expenses are loading
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Loading expenses...
          </Text>
        </View>
      ) : expenses.length === 0 ? (
        //show a message when there are no expenses
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No expenses added yet
          </Text>
        </View>
      ) : (
        //create a separate row for each expense.
        expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseCard}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseName}>
                {expense.description}
              </Text>

              <Text style={styles.expenseCategory}>
                {expense.category}, {expense.date}
              </Text>
            </View>

            <Text style={styles.expenseAmount}>
              {expense.currency || "€"}
              {Number(expense.amount).toFixed(2)}
            </Text>

            <Pressable
              onPress={() => confirmDeleteExpense(expense)}
              style={styles.deleteButton}
              accessibilityLabel={`Delete ${expense.description}`}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="#DC2626"
              />
            </Pressable>
          </View>
        ))
      )}

      {/* form for adding a new expense */}
      <Text style={styles.sectionTitle}>Add expense</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Expense name</Text>
        <TextInput
          style={styles.input}
          value={expenseName}
          onChangeText={setExpenseName}
        />

        <Text style={styles.label}>Amount (€)</Text>
        <TextInput
          style={styles.input}
          value={expenseAmount}
          onChangeText={setExpenseAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Category</Text>

        {/* lets user select a category for the expense */}
        <View style={styles.categoryRow}>
          {["Food", "Transport", "Accommodation", "Activities", "Other"].map(
            (category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  expenseCategory === category &&
                    styles.selectedCategory,
                ]}
                onPress={() => setExpenseCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    expenseCategory === category &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            )
          )}
        </View>

        {/* validate the form and add the expense when pressed */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressedButton,
          ]}
          onPress={addExpense}
        >
          <Ionicons name="add" size={21} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add expense</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// styles for the budget summary, expense list and the form
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  tripName: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  heading: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  budgetInput: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    paddingVertical: 8,
  },
  saveBudgetButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#EA580C",
    marginTop: 6,
  },
  saveBudgetButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: "#FED7AA",
    marginVertical: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spentAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EA580C",
    marginTop: 5,
  },
  remainingAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#15803D",
    marginTop: 5,
  },
  overBudget: {
    color: "#DC2626",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  emptyCard: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    marginBottom: 28,
  },
  emptyText: {
    color: "#64748B",
    marginTop: 8,
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 10,
  },
  expenseIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  expenseCategory: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  formCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 7,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
    marginBottom: 18,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedCategory: {
    backgroundColor: "#EA580C",
    borderColor: "#EA580C",
  },
  categoryText: {
    fontSize: 13,
    color: "#475569",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#EA580C",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  pressedButton: {
    opacity: 0.75,
  },
});