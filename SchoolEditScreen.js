// SchoolEditScreen.js

import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const SchoolEditScreen = ({ navigation }) => {
  const handleEditInfo = () => {
    // Navigate to the screen for editing information
    navigation.navigate('EditInfoScreen');
  };

  const handleEditStudies = () => {
    // Navigate to the screen for editing studies
    navigation.navigate('EditStudiesScreen');
  };

  return (
    <View style={styles.container}>
      <Button title="Edit Information" onPress={handleEditInfo} />
      <Button title="Edit Studies" onPress={handleEditStudies} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SchoolEditScreen;
