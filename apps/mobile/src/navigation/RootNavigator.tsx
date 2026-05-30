import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';

// Screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CitySelectionScreen from '../screens/CitySelectionScreen';
import InterestsSelectionScreen from '../screens/InterestsSelectionScreen';
import VibeBudgetScreen from '../screens/VibeBudgetScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import GuideDetailScreen from '../screens/GuideDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Saved" component={SavedScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="GuideDetail" component={GuideDetailScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CitySelection" component={CitySelectionScreen} />
    <Stack.Screen name="InterestsSelection" component={InterestsSelectionScreen} />
    <Stack.Screen name="VibeBudget" component={VibeBudgetScreen} />
  </Stack.Navigator>
);

export const RootNavigator = () => {
  const { session, profile, loading } = useAuthStore();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : !profile?.onboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="Main" component={MainStack} />
      )}
    </Stack.Navigator>
  );
};
