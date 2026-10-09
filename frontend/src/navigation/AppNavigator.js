
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import TripsScreen from "../screens/TripsScreen";
import DiaryScreen from "../screens/DiaryScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
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
        </NavigationContainer>
    );
}
