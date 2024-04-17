import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SchoolDetailScreen = ({ route }) => {
  const { school, countryName, typeName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{school.school_name}</Text>
      <Text style={styles.subtitle}>Abbreviation: {school.abbreviation}</Text>
      <Text style={styles.subtitle}>Country: {countryName}</Text>
      <Text style={styles.subtitle}>Type: {typeName}</Text>
      <Text style={styles.subtitle}>Info: {school.info}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default SchoolDetailScreen;