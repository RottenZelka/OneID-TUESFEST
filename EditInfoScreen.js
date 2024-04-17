import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const EditInfoScreen = () => {
  const [schoolInfo, setSchoolInfo] = useState('');
  const [editedInfo, setEditedInfo] = useState('');

  useEffect(() => {
    fetchSchoolInfo();
  }, []);

  const fetchSchoolInfo = async () => {
    try {
      const response = await axios.get('http://192.168.0.104:3000/school/info');
      setSchoolInfo(response.data.info);
    } catch (error) {
      console.error('Error fetching school info:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('http://192.168.0.104:3000/school/info', { info: editedInfo });
      Alert.alert('Success', 'Information updated successfully');
      setSchoolInfo(editedInfo); // Update the displayed info
    } catch (error) {
      Alert.alert('Error', 'Failed to update information');
      console.error('Error updating school info:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Information:</Text>
      <Text>{schoolInfo}</Text>
      <Text style={styles.label}>Edit Information:</Text>
      <TextInput
        style={styles.input}
        value={editedInfo}
        onChangeText={setEditedInfo}
        placeholder="Enter new information"
        multiline
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 100,
  },
});

export default EditInfoScreen;
