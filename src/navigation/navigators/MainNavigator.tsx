import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainRoutes } from '../routes';
import MainTabNavigator from './MainTabNavigator';
import ProfileScreen from '../../screens/settings/ProfileScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs"
        component={MainTabNavigator}
        options={{}}
      />
      <Stack.Screen 
        name={MainRoutes.Profile}
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          presentation: 'card',
        }}
      />
      {/* <Stack.Screen 
        name="Rewards"
        component={RewardsScreen}
        options={{
          headerShown: true,
          title: 'Rewards',
          presentation: 'card',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="KYC"
        component={KYCScreen}
        options={{
          headerShown: true,
          title: 'KYC Verification',
          presentation: 'card',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Payouts"
        component={PayoutsScreen}
        options={{
          headerShown: true,
          title: 'Payouts',
          presentation: 'card',
          headerBackTitleVisible: false,
        }}
      /> */}
    </Stack.Navigator>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({});