import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const StudentHomeScreen = ({ navigation }) => {
  const handleJournalPress = () => {
    // Navigate to the school journal screen
    navigation.navigate('SchoolJournal');
  };

  const handleEventParticipationPress = () => {
    // Navigate to the event participation screen
    navigation.navigate('EventParticipation');
  };

  const handleCreateEventPress = () => {
    // Navigate to the event creating screen
    navigation.navigate('CreateEvent');
  };

  const handleJoinEventPress = () => {
    // Navigate to the event joining screen
    navigation.navigate('JoinEvent');
  };

  const handleApplyForSchoolPress = () => {
    // Navigate to the apply for school screen
    navigation.navigate('ApplyForSchoolScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Home Screen</Text>
      <Button title="School Journal" onPress={handleJournalPress} />
      <Button title="Event Participation" onPress={handleEventParticipationPress} />
      <Button title="Create Event" onPress={handleCreateEventPress} />
      <Button title="Join Event" onPress={handleJoinEventPress} />
      <Button title="Apply for School" onPress={handleApplyForSchoolPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default StudentHomeScreen;
