import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const SchoolLogInScreen = ({ navigation }) => {
  const [abbreviation, setAbbreviation] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.0.104:3000/loginSchool', {
        abbreviation,
        password,
      });
      navigation.navigate('SchoolHomeScreen');
    } catch (error) {
      Alert.alert('Error', 'Error logging in to school');
      console.error('Error logging in to school:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Abbreviation"
        value={abbreviation}
        onChangeText={setAbbreviation}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Log In" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
});

export default SchoolLogInScreen;
