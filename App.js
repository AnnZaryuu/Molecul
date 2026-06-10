import React, { useRef, useCallback, useState } from 'react';
import {
  StatusBar, StyleSheet, Animated, TouchableOpacity,
  View, Platform, Text
} from 'react-native';
import { NavigationContainer, DefaultTheme, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import TournamentHubScreen from './src/screens/TournamentHubScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import HeroDatabaseScreen from './src/screens/HeroDatabaseScreen';
import HeroDetailScreen from './src/screens/HeroDetailScreen';
import { PALETTE } from './src/theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Tab transition HOC ────────────────────────────────────────────────────────
const withTabTransition = (ScreenComponent) => {
  const Wrapped = (props) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;
    const hasAnimated = useRef(false);

    useFocusEffect(
      useCallback(() => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, speed: 25, bounciness: 3, useNativeDriver: true }),
        ]).start();
      }, [])
    );

    return (
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        <ScreenComponent {...props} />
      </Animated.View>
    );
  };
  Wrapped.displayName = `TabTransition(${ScreenComponent.name})`;
  return Wrapped;
};

const TournamentHubAnimated = withTabTransition(TournamentHubScreen);
const ScheduleAnimated = withTabTransition(ScheduleScreen);

// ── Hero Stack ────────────────────────────────────────────────────────────────
const forCardExpand = ({ current }) => ({
  cardStyle: {
    opacity: current.progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.7, 1] }),
    transform: [
      { translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [40, 0], extrapolate: 'clamp' }) },
      { scale: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1], extrapolate: 'clamp' }) },
    ],
  },
});

const HeroStackBase = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: false,
      cardStyle: { backgroundColor: '#000' },
      transitionSpec: {
        open: { animation: 'spring', config: { stiffness: 260, damping: 28, mass: 0.9 } },
        close: { animation: 'spring', config: { stiffness: 300, damping: 32, mass: 0.8, overshootClamping: true } },
      },
      cardStyleInterpolator: forCardExpand,
    }}
  >
    <Stack.Screen name="HeroList" component={HeroDatabaseScreen} />
    <Stack.Screen name="HeroDetail" component={HeroDetailScreen} />
  </Stack.Navigator>
);
const HeroStackAnimated = withTabTransition(HeroStackBase);

// ── Mobile Tab Button ─────────────────────────────────────────────────────────
const AnimatedTabButton = ({ children, onPress, accessibilityState = {} }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.82, useNativeDriver: true, speed: 50, bounciness: 8 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }).start();
  return (
    <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={styles.tabButton}>
      <Animated.View style={[styles.tabButtonInner, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

// ── Web Sidebar Item ──────────────────────────────────────────────────────────
const SidebarItem = ({ icon, iconFocused, label, active, onPress }) => {
  const bg = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(bg, { toValue: active ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [active]);

  const backgroundColor = bg.interpolate({ inputRange: [0, 1], outputRange: ['transparent', 'rgba(229,9,20,0.08)'] });
  const borderColor = bg.interpolate({ inputRange: [0, 1], outputRange: ['transparent', PALETTE.redNeon] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[styles.sidebarItem, { backgroundColor, borderLeftColor: borderColor }]}>
        <Ionicons name={active ? iconFocused : icon} size={22} color={active ? PALETTE.redNeon : '#555'} />
        <Text style={[styles.sidebarLabel, { color: active ? PALETTE.redNeon : '#555' }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Web Sidebar ───────────────────────────────────────────────────────────────
const WebSidebar = ({ activeTab, onNavigate }) => (
  <View style={styles.sidebar}>
    {/* Brand */}
    <View style={styles.sidebarBrand}>
      <Text style={styles.brandName}>MOLECUL</Text>
      <Text style={styles.brandSub}>MLBB STATS</Text>
    </View>

    {/* Nav Items */}
    <View style={styles.sidebarNav}>
      <SidebarItem icon="trophy-outline" iconFocused="trophy" label="TOURNEY" active={activeTab === 'TOURNEY'} onPress={() => onNavigate('TOURNEY')} />
      <SidebarItem icon="shield-half-outline" iconFocused="shield-half" label="HEROES" active={activeTab === 'HEROES'} onPress={() => onNavigate('HEROES')} />
      <SidebarItem icon="calendar-outline" iconFocused="calendar" label="SCHEDULE" active={activeTab === 'SCHEDULE'} onPress={() => onNavigate('SCHEDULE')} />
    </View>

    {/* Footer */}
    <View style={styles.sidebarFooter}>
      <View style={styles.sidebarDivider} />
      <Text style={styles.sidebarFooterText}>Mobile Legends{'\n'}Bang Bang Stats</Text>
    </View>
  </View>
);

// ── Dark theme ────────────────────────────────────────────────────────────────
const DarkTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#000', card: '#000', border: '#1A1A1A', text: '#fff', primary: PALETTE.redNeon },
};

// ── App ───────────────────────────────────────────────────────────────────────
const navigationRef = React.createRef();
const isWeb = Platform.OS === 'web';

export default function App() {
  const [activeTab, setActiveTab] = useState('TOURNEY');

  const handleSidebarNavigate = (tabName) => {
    setActiveTab(tabName);
    navigationRef.current?.navigate(tabName);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={DarkTheme}>
          <StatusBar barStyle="light-content" backgroundColor={PALETTE.black} />

          {isWeb ? (
            /* ─── WEB LAYOUT: Sidebar kiri + Konten kanan ─── */
            <View style={styles.webRoot}>
              <WebSidebar activeTab={activeTab} onNavigate={handleSidebarNavigate} />
              <View style={styles.webContent}>
                <Tab.Navigator
                  sceneContainerStyle={{ backgroundColor: '#000' }}
                  screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
                  screenListeners={{ state: (e) => {
                    const routes = e.data.state?.routes;
                    const idx = e.data.state?.index;
                    if (routes && idx !== undefined) setActiveTab(routes[idx].name);
                  }}}
                >
                  <Tab.Screen name="TOURNEY" component={TournamentHubAnimated} />
                  <Tab.Screen name="HEROES" component={HeroStackAnimated} />
                  <Tab.Screen name="SCHEDULE" component={ScheduleAnimated} />
                </Tab.Navigator>
              </View>
            </View>
          ) : (
            /* ─── MOBILE LAYOUT: Bottom Tab Navigator ─── */
            <Tab.Navigator
              sceneContainerStyle={{ backgroundColor: '#000' }}
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: PALETTE.redNeon,
                tabBarInactiveTintColor: '#444',
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabLabel,
                tabBarButton: (props) => <AnimatedTabButton {...props} />,
                tabBarIcon: ({ color, focused }) => {
                  let iconName;
                  if (route.name === 'TOURNEY') iconName = focused ? 'trophy' : 'trophy-outline';
                  else if (route.name === 'SCHEDULE') iconName = focused ? 'calendar' : 'calendar-outline';
                  else if (route.name === 'HEROES') iconName = focused ? 'shield-half' : 'shield-half-outline';
                  return <Ionicons name={iconName} size={20} color={color} />;
                },
              })}
            >
              <Tab.Screen name="TOURNEY" component={TournamentHubAnimated} options={{ tabBarLabel: 'TOURNEY' }} />
              <Tab.Screen name="HEROES" component={HeroStackAnimated} options={{ tabBarLabel: 'HEROES' }} />
              <Tab.Screen name="SCHEDULE" component={ScheduleAnimated} options={{ tabBarLabel: 'SCHEDULE' }} />
            </Tab.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ── Web Layout ──────────────────────────────────────────────────────────────
  webRoot: { flex: 1, flexDirection: 'row', backgroundColor: '#000' },

  sidebar: {
    width: 220,
    backgroundColor: '#070707',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
    paddingTop: 20,
    flexDirection: 'column',
  },
  sidebarBrand: { paddingHorizontal: 24, paddingVertical: 20, marginBottom: 8 },
  brandName: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 4 },
  brandSub: { color: PALETTE.redNeon, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 2 },

  sidebarNav: { flex: 1 },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    marginBottom: 2,
    borderRadius: 10,
    borderLeftWidth: 3,
    gap: 12,
  },
  sidebarLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  sidebarFooter: { paddingHorizontal: 24, paddingBottom: 30 },
  sidebarDivider: { height: 1, backgroundColor: '#1a1a1a', marginBottom: 16 },
  sidebarFooterText: { color: '#2a2a2a', fontSize: 10, fontWeight: '600', lineHeight: 16 },

  webContent: { flex: 1, backgroundColor: '#000' },

  // ── Mobile Tab ─────────────────────────────────────────────────────────────
  tabBar: { backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#1A1A1A', height: 65, paddingBottom: 8, paddingTop: 8 },
  tabLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabButtonInner: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
});