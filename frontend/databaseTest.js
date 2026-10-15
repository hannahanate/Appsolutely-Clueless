
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import {
  initDatabase,
  addTrip,
  getTrips,
} from './database/database';

export default function DatabaseTest() {
  const [message, setMessage] = useState('Testing database...');
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        const savedTrips = await getTrips();
        setTrips(savedTrips);
        setMessage('SQLite database connected!');
      } catch (error) {
        console.error('Database error:', error);
        setMessage('Database error: ' + error.message);
      }
    }

    setup();
  }, []);

  async function testAddTrip() {
    try {
      await addTrip('Test Trip', 'Tokyo');

      const savedTrips = await getTrips();
      setTrips(savedTrips);
      setMessage('Trip saved successfully!');
    } catch (error) {
      console.error('Insert error:', error);
      setMessage('Insert error: ' + error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Test</Text>
      <Text>{message}</Text>

      <Button title="Add test trip" onPress={testAddTrip} />

      <Text style={styles.subtitle}>Saved trips:</Text>

      {trips.map((trip) => (
        <Text key={trip.id}>
          {trip.name} — {trip.destination}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});