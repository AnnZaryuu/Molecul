import React, { useRef, useCallback, useState } from 'react';
import {
  StatusBar, StyleSheet, Animated, TouchableOpacity,
  View, Platform, Text, useWindowDimensions, Image
} from 'react-native';
import { NavigationContainer, DefaultTheme, useFocusEffect } from '@react-navigation/native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import { ActivityIndicator } from 'react-native';
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
const ScheduleAnimated       = withTabTransition(ScheduleScreen);

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
      cardStyle: { backgroundColor: PALETTE.black },
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
const SidebarItem = ({ icon, iconFocused, label, active, onPress, isCollapsed }) => {
  const bg = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(bg, { toValue: active ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [active]);

  const backgroundColor = bg.interpolate({ inputRange: [0, 1], outputRange: ['transparent', PALETTE.accentDim] });
  const borderColor = bg.interpolate({ inputRange: [0, 1], outputRange: ['transparent', PALETTE.accent] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[
        styles.sidebarItem,
        isCollapsed && styles.sidebarItemCollapsed,
        { backgroundColor, borderLeftColor: borderColor }
      ]}>
        <Ionicons name={active ? iconFocused : icon} size={20} color={active ? PALETTE.accent : PALETTE.textDark} />
        {!isCollapsed && <Text style={[styles.sidebarLabel, { color: active ? PALETTE.accent : PALETTE.textDark }]}>{label}</Text>}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Web Sidebar ───────────────────────────────────────────────────────────────
const WebSidebar = ({ activeTab, onNavigate, isCollapsed, isAdmin }) => (
  <View style={[styles.sidebar, isCollapsed && styles.sidebarCollapsed]}>
    {/* Brand */}
    <View style={[styles.sidebarBrand, isCollapsed && styles.sidebarBrandCollapsed]}>
      {isCollapsed ? (
        <Text style={styles.brandNameCollapsed}>M</Text>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={require('./assets/molecul.png')} style={{ width: 28, height: 28, backgroundColor: 'transparent' }} resizeMode="contain" />
            <Text style={styles.brandName}>MOLECUL</Text>
          </View>
          <Text style={styles.brandSub}>CULTURE</Text>
        </>
      )}
    </View>

    {/* Nav Items */}
    <View style={styles.sidebarNav}>
      <SidebarItem icon="trophy-outline" iconFocused="trophy" label="TOURNEY" active={activeTab === 'TOURNEY'} onPress={() => onNavigate('TOURNEY')} isCollapsed={isCollapsed} />
      <SidebarItem icon="shield-half-outline" iconFocused="shield-half" label="HEROES" active={activeTab === 'HEROES'} onPress={() => onNavigate('HEROES')} isCollapsed={isCollapsed} />
      <SidebarItem icon="calendar-outline" iconFocused="calendar" label="SCHEDULE" active={activeTab === 'SCHEDULE'} onPress={() => onNavigate('SCHEDULE')} isCollapsed={isCollapsed} />
      <SidebarItem icon="person-outline" iconFocused="person" label="PROFILE" active={activeTab === 'PROFILE'} onPress={() => onNavigate('PROFILE')} isCollapsed={isCollapsed} />
      {isAdmin && (
        <SidebarItem icon="shield-checkmark-outline" iconFocused="shield-checkmark" label="ADMIN" active={activeTab === 'ADMIN'} onPress={() => onNavigate('ADMIN')} isCollapsed={isCollapsed} />
      )}
    </View>

    {/* Footer */}
    {!isCollapsed && (
      <View style={styles.sidebarFooter}>
        <View style={styles.sidebarDivider} />
        <Text style={styles.sidebarFooterText}>Mobile Legends{'\n'}Culture</Text>
      </View>
    )}
  </View>
);

// ── Dark theme ────────────────────────────────────────────────────────────────
const DarkTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: PALETTE.black, card: PALETTE.black, border: PALETTE.lightGray, text: PALETTE.textMain, primary: PALETTE.accent },
};

// ── App ───────────────────────────────────────────────────────────────────────
const navigationRef = React.createRef();
const isWeb = Platform.OS === 'web';

function MainApp() {
  const [activeTab, setActiveTab] = useState('TOURNEY');
  const { width } = useWindowDimensions();
  const { userInfo } = React.useContext(AuthContext);

  const isAdmin = userInfo?.role === 'admin';

  // Responsive breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const handleSidebarNavigate = (tabName) => {
    setActiveTab(tabName);
    navigationRef.current?.navigate(tabName);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: PALETTE.black }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={DarkTheme}>
          <StatusBar barStyle="light-content" backgroundColor={PALETTE.black} />

          {(isWeb && !isMobile) ? (
            /* ─── WEB LAYOUT: Sidebar kiri + Konten kanan ─── */
            <View style={styles.webRoot}>
              <WebSidebar activeTab={activeTab} onNavigate={handleSidebarNavigate} isCollapsed={isTablet} isAdmin={isAdmin} />
              <View style={styles.webContent}>
                <Tab.Navigator
                  sceneContainerStyle={{ backgroundColor: PALETTE.black }}
                  screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
                  screenListeners={{ state: (e) => {
                    const routes = e.data.state?.routes;
                    const idx = e.data.state?.index;
                    if (routes && idx !== undefined) setActiveTab(routes[idx].name);
                  }}}
                >
                  <Tab.Screen name="TOURNEY" component={TournamentHubAnimated} />
                  <Tab.Screen name="HEROES"  component={HeroStackAnimated} />
                  <Tab.Screen name="SCHEDULE" component={ScheduleAnimated} />
                  <Tab.Screen name="PROFILE" component={ProfileStack} />
                  {isAdmin && <Tab.Screen name="ADMIN" component={AdminDashboardScreen} />}
                </Tab.Navigator>
              </View>
            </View>
          ) : (
            /* ─── MOBILE LAYOUT: Bottom Tab Navigator ─── */
            <Tab.Navigator
              sceneContainerStyle={{ backgroundColor: PALETTE.black }}
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: PALETTE.accent,
                tabBarInactiveTintColor: PALETTE.textDark,
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabLabel,
                tabBarButton: (props) => <AnimatedTabButton {...props} />,
                tabBarIcon: ({ color, focused }) => {
                  let iconName;
                  if (route.name === 'TOURNEY')  iconName = focused ? 'trophy' : 'trophy-outline';
                  else if (route.name === 'SCHEDULE') iconName = focused ? 'calendar' : 'calendar-outline';
                  else if (route.name === 'HEROES')   iconName = focused ? 'shield-half' : 'shield-half-outline';
                  else if (route.name === 'PROFILE')  iconName = focused ? 'person' : 'person-outline';
                  else if (route.name === 'ADMIN')    iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
                  return <Ionicons name={iconName} size={22} color={color} />;
                },
              })}
            >
              <Tab.Screen name="TOURNEY"  component={TournamentHubAnimated}  options={{ tabBarLabel: 'TOURNEY' }} />
              <Tab.Screen name="HEROES"   component={HeroStackAnimated}      options={{ tabBarLabel: 'HEROES' }} />
              <Tab.Screen name="SCHEDULE" component={ScheduleAnimated}       options={{ tabBarLabel: 'SCHEDULE' }} />
              <Tab.Screen name="PROFILE"  component={ProfileStack}           options={{ tabBarLabel: 'PROFILE' }} />
              {isAdmin && (
                <Tab.Screen name="ADMIN" component={AdminDashboardScreen} options={{ tabBarLabel: 'ADMIN' }} />
              )}
            </Tab.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ── Web Layout ──────────────────────────────────────────────────────────────
  webRoot: { flex: 1, flexDirection: 'row', backgroundColor: PALETTE.black },

  sidebar: {
    width: 220,
    backgroundColor: '#060910',
    borderRightWidth: 1,
    borderRightColor: PALETTE.lightGray,
    paddingTop: 0,
    flexDirection: 'column',
  },
  sidebarCollapsed: {
    width: 64,
    alignItems: 'center',
  },
  sidebarBrand: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24, marginBottom: 0, borderBottomWidth: 1, borderBottomColor: PALETTE.lightGray },
  sidebarBrandCollapsed: {
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandAccentLine: { width: 32, height: 3, backgroundColor: PALETTE.accent, marginBottom: 12 },
  brandName: { color: PALETTE.textMain, fontSize: 18, fontWeight: '900', letterSpacing: 6 },
  brandNameCollapsed: { color: PALETTE.accent, fontSize: 22, fontWeight: '900' },
  brandSub: { color: PALETTE.accent, fontSize: 8, fontWeight: '700', letterSpacing: 3, marginTop: 4 },

  sidebarNav: { flex: 1, width: '100%', paddingTop: 12 },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,          // ← SHARP: no rounding
    borderLeftWidth: 3,
    gap: 14,
  },
  sidebarItemCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  sidebarLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  sidebarFooter: { paddingHorizontal: 24, paddingBottom: 24 },
  sidebarDivider: { height: 1, backgroundColor: PALETTE.lightGray, marginBottom: 16 },
  sidebarFooterText: { color: PALETTE.textDark, fontSize: 9, fontWeight: '600', lineHeight: 16, letterSpacing: 1 },

  webContent: { flex: 1, backgroundColor: PALETTE.black },

  // ── Mobile Tab ─────────────────────────────────────────────────────────────
  tabBar: {
    backgroundColor: '#060910',
    borderTopWidth: 2,
    borderTopColor: PALETTE.lightGray,
    height: 66,
    paddingBottom: 8,
    paddingTop: 8,
    borderRadius: 0,           // ← SHARP
  },
  tabLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabButtonInner: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
});

const ProfileStackNav = createStackNavigator();

function ProfileStack() {
  const { userToken } = React.useContext(AuthContext);
  
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      {userToken && userToken !== 'GUEST' ? (
        <ProfileStackNav.Screen name="ProfileScreen" component={ProfileScreen} />
      ) : (
        <>
          <ProfileStackNav.Screen name="Login" component={LoginScreen} />
          <ProfileStackNav.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </ProfileStackNav.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}