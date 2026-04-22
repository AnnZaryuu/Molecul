import React from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import Screen
import TournamentHubScreen from './src/screens/TournamentHubScreen';
import TeamProfileScreen from './src/screens/TeamProfileScreen'; // Screen baru
import { PALETTE } from './src/theme/theme';
import TransfersScreen from './src/screens/TransfersScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';

// Placeholder untuk screen lainnya
const PlaceholderScreen = ({ name }) => (
  <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ padding: 20, borderWidth: 1, borderColor: '#333' }}>
      <Text style={{ color: '#888' }}>{name} Screen (Coming Soon)</Text>
    </View>
  </View>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={PALETTE.black} />

        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: PALETTE.redNeon,
            tabBarInactiveTintColor: '#555',
            tabBarShowLabel: true,
            tabBarLabelStyle: styles.tabLabel,
            // Logika penentuan Ikon
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'TOURNEY') iconName = 'trophy-outline';
              else if (route.name === 'TEAMS') iconName = 'people-outline';
              else if (route.name === 'TRANSFERS') iconName = 'swap-horizontal-outline';
              else if (route.name === 'SYSTEM') iconName = 'settings-outline';

              return <Ionicons name={iconName} size={20} color={color} />;
            },
          })}
        >
          {/* 1. Tournament Hub */}
          <Tab.Screen
            name="TOURNEY"
            component={TournamentHubScreen}
            options={{ tabBarLabel: 'TOURNEY' }}
          />

          {/* 2. Team Profile (Sudah dihubungkan) */}
          <Tab.Screen
            name="TEAMS"
            component={TeamProfileScreen}
            options={{ tabBarLabel: 'TEAMS' }}
          />

          <Tab.Screen
            name="NEWS"
            component={TransfersScreen}
            options={{tabBarLabel: 'NEWS&TRANSFERS'}}
          />

          {/* 3. Menu Lainnya */}
          <Tab.Screen
            name="SCHEDULE"
            component={ScheduleScreen}
            options={{tabBarLabel:'SCHEDULE'}}
          />

          <Tab.Screen
            name="SYSTEM"
            component={() => <PlaceholderScreen name="System" />}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    height: 85,
    paddingBottom: 25,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 5,
  }
});