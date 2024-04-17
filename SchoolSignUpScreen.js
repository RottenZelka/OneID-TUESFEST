import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';

const SchoolSignUpScreen = ({ navigation }) => {
  const [abbreviation, setAbbreviation] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [typeName, setTypeName] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [filteredSchoolTypes, setFilteredSchoolTypes] = useState([]);
  const [schoolTypes, setSchoolTypes] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://192.168.0.104:3000/countries');
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Handle error fetching countries
      }
    };

    const fetchSchoolTypes = async () => {
      try {
        const response = await axios.get('http://192.168.0.104:3000/school_types');
        setSchoolTypes(response.data);
      } catch (error) {
        console.error('Error fetching school types:', error);
        // Handle error fetching school types
      }
    };

    fetchCountries();
    fetchSchoolTypes();
  }, []);

  const handleCountryChange = (text) => {
    // Filter countries based on input text
    const filtered = countries.filter((country) =>
      country.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCountries(filtered);
    setCountryName(text); // Update country name in state
  };

  const selectCountry = (country) => {
    setCountryName(country);
    setFilteredCountries([]); // Clear filtered countries
  };

  const handleSchoolTypeChange = (text) => {
    // Filter school types based on input text
    const filtered = schoolTypes.filter((type) =>
      type.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSchoolTypes(filtered);
    setTypeName(text); // Update school type ID in state
  };

  const selectSchoolType = (type) => {
    setTypeName(type);
    setFilteredSchoolTypes([]); // Clear filtered school types
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://192.168.0.104:3000/signupSchool', {
        abbreviation,
        password,
        school_name: schoolName,
        country_name: countryName,
        type_name: typeName,
      });
      navigation.navigate('SchoolHomeScreen');
    } catch (error) {
      Alert.alert('Error', 'Error signing up');
      console.error('Error signing up:', error);
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
      <TextInput
        placeholder="School Name"
        value={schoolName}
        onChangeText={setSchoolName}
        style={styles.input}
      />
      <TextInput
        placeholder="Country Name"
        value={countryName}
        onChangeText={handleCountryChange}
        style={styles.input}
      />
      <FlatList
        data={filteredCountries}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectCountry(item)}>
            <Text style={styles.countryItem}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        style={styles.countryList}
      />
      <TextInput
        placeholder="School Type Name"
        value={typeName}
        onChangeText={handleSchoolTypeChange}
        style={styles.input}
      />
      <FlatList
        data={filteredSchoolTypes}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectSchoolType(item)}>
            <Text style={styles.schoolTypeItem}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        style={styles.schoolTypeList}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
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
  countryList: {
    width: '80%',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  countryItem: {
    paddingVertical: 5,
  },
  schoolTypeList: {
    width: '80%',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  schoolTypeItem: {
    paddingVertical: 5,
  },
});

export default SchoolSignUpScreen;
