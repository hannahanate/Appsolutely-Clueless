import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import TripsScreen from "../screens/TripsScreen";
import DiaryScreen from "../screens/DiaryScreen";
import CreateTripScreen from "../screens/CreateTripScreen";

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
            options={{ title: "New Trip" }}
            />
        </Stack.Navigator>
        </NavigationContainer>
    );
}