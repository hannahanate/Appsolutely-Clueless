import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import TripsScreen from "../screens/TripsScreen";
import DiaryScreen from "../screens/DiaryScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import PackingListScreen from "../screens/PackingListScreen";
import ActivitiesScreen from "../screens/ActivitiesScreen";
import FlightsScreen from "../screens/FlightsScreen";
import BudgetScreen from "../screens/BudgetScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#2563EB",
            tabBarInactiveTintColor: "#6B7280",
        }}
        >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Trips" component={TripsScreen} />
        <Tab.Screen name="Diary" component={DiaryScreen} />
        </Tab.Navigator>
    );
    }

    export default function AppNavigator() {
    return (
        <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
            />
            <Stack.Screen
            name="CreateTrip"
            component={CreateTripScreen}
            options={({ route }) => ({
            title: route.params?.tripId ? "Edit Trip" : "New Trip",
            })} 
            />
            <Stack.Screen
            name="TripDetails"
            component={TripDetailsScreen}
            options={{ title: "Trip Details" }}
            />
            <Stack.Screen
            name="Flights"
            component={FlightsScreen}
            options={{ title: "Flights" }}
            />
            <Stack.Screen
            name="PackingList"
            component={PackingListScreen}
            options={{ title: "Packing List" }}
            />
            <Stack.Screen
            name="Activities"
            component={ActivitiesScreen}
            options={{ title: "Activities" }}
            />
            <Stack.Screen
            name="Budget"
            component={BudgetScreen}
            options={{ title: "Budget" }}
            />
        </Stack.Navigator>
        </NavigationContainer>
    );
}