import React from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import TournamentHubScreen from './src/screens/TournamentHubScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import HeroDatabaseScreen from './src/screens/HeroDatabaseScreen';
import HeroDetailScreen from './src/screens/HeroDetailScreen';
import { PALETTE } from './src/theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Hero Database to allow Detail navigation
const HeroStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HeroList" component={HeroDatabaseScreen} />
    <Stack.Screen name="HeroDetail" component={HeroDetailScreen} />
  </Stack.Navigator>
);

// Placeholder Coming Soon Screen
const ComingSoonScreen = () => (
  <SafeAreaProvider>
    <StatusBar barStyle="light-content" />
    <StatusBar barStyle="light-content" backgroundColor="#000" />
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="construct-outline" size={60} color={PALETTE.redNeon} />
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', marginTop: 20, letterSpacing: 2 }}>COMING SOON</Text>
      <Text style={{ color: '#444', fontSize: 12, marginTop: 10, fontWeight: 'bold' }}>SECTOR UNDER CONSTRUCTION</Text>
    </View>
  </SafeAreaProvider>
);

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
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'TOURNEY') iconName = 'trophy-outline';
              else if (route.name === 'TEAMS') iconName = 'people-outline';
              else if (route.name === 'NEWS') iconName = 'newspaper-outline';
              else if (route.name === 'SCHEDULE') iconName = 'calendar-outline';
              else if (route.name === 'HEROES') iconName = 'shield-half-outline';

              return <Ionicons name={iconName} size={20} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="TOURNEY"
            component={TournamentHubScreen}
            options={{ tabBarLabel: 'TOURNEY' }}
          />

          <Tab.Screen
            name="HEROES"
            component={HeroStack}
            options={{ tabBarLabel: 'HEROES' }}
          />

          <Tab.Screen
            name="TEAMS"
            component={ComingSoonScreen}
            options={{ tabBarLabel: 'TEAMS' }}
          />

          <Tab.Screen
            name="NEWS"
            component={ComingSoonScreen}
            options={{ tabBarLabel: 'NEWS' }}
          />

          <Tab.Screen
            name="SCHEDULE"
            component={ScheduleScreen}
            options={{ tabBarLabel: 'SCHEDULE' }}
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
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 5,
  }
});