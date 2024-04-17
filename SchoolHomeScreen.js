// SchoolHomeScreen.js

import React from 'react';
import { View, StyleSheet, Button } from 'react-native';

const SchoolHomeScreen = ({ navigation }) => {
  const handleEdit = () => {
    // Navigate to the screen for editing studies
    navigation.navigate('SchoolEditScreen');
  };

  const handleViewApplicants = () => {
    // Navigate to the screen for viewing applicants
    navigation.navigate('ViewApplicantsScreen');
  };

  const handleViewStudents = () => {
    // Navigate to the screen for viewing students
    navigation.navigate('ViewStudentsScreen');
  };

  const handleViewTeachers = () => {
    // Navigate to the screen for viewing teachers
    navigation.navigate('ViewTeachersScreen');
  };

  return (
    <View style={styles.container}>
      <Button title="Edit Studies" onPress={handleEdit} />
      <Button title="View Applicants" onPress={handleViewApplicants} />
      <Button title="View Students" onPress={handleViewStudents} />
      <Button title="View Teachers" onPress={handleViewTeachers} />
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

export default SchoolHomeScreen;
