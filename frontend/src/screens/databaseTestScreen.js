
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';

import {
  initDatabase,
  addTrip,
  getTrips,
} from '../database/database';

export default function DatabaseTestScreen() {
  const [trips, setTrips] = useState([]);
  const [message, setMessage] = useState('Initializing database...');

  async function loadTrips() {
    const savedTrips = await getTrips();
    setTrips(savedTrips);
  }

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        await loadTrips();
        setMessage('SQLite is working!');
      } catch (error) {
        console.error('SQLite error:', error);
        setMessage(`Database error: ${error.message}`);
      }
    }

    setup();
  }, []);

  async function handleAddTrip() {
    try {
      await addTrip('Test Trip', 'Tokyo');
      await loadTrips();
      setMessage('Test trip saved successfully!');
    } catch (error) {
      console.error('Insert error:', error);
      setMessage(`Insert error: ${error.message}`);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>SQLite Database Test</Text>
      <Text>{message}</Text>

      <Button title="Add test trip" onPress={handleAddTrip} />

      <Text style={styles.subtitle}>Saved trips</Text>

      {trips.map((trip) => (
        <Text key={trip.id} style={styles.trip}>
          {trip.name} — {trip.destination}
        </Text>
      ))}

      {trips.length === 0 && <Text>No trips saved yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trip: {
    padding: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});