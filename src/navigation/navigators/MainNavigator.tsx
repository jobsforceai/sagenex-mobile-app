import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainRoutes } from '../routes';
import MainTabNavigator from './MainTabNavigator';
import ProfileScreen from '../../screens/settings/ProfileScreen';
import WalletHistoryScreen from '../../screens/main/WalletHistoryScreen';
import CourseScreen from '../../screens/main/CourseScreen';
import PayoutsScreen from '../../screens/main/PayoutsScreen';

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
      <Stack.Screen
        name={MainRoutes.WalletHistory}
        component={WalletHistoryScreen}
        options={{
          headerShown: true,
          title: 'Wallet History',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name={MainRoutes.Course}
        component={CourseScreen}
        options={{
          headerShown: true,
          title: 'Course',
          presentation: 'card',
        }}
      />
        <Stack.Screen 
          name="Payouts"
          component={PayoutsScreen}
          options={{
            headerShown: true,
            title: 'Payouts',
            presentation: 'card',
          }}
        />
    </Stack.Navigator>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({});