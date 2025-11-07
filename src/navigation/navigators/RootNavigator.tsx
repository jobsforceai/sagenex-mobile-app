import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import { RootRoutes } from '../routes';
import MainNavigator from './MainNavigator';
import useAuthStore from '../../store/authStore';

const Stack = createNativeStackNavigator();
const RootNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isLoggedIn)

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {isAuthenticated ? (
        <Stack.Screen name={RootRoutes.MainTabs} component={MainNavigator} />
      ) : (
        <Stack.Screen name={RootRoutes.AuthStack} component={AuthNavigator} />
      )}
    </Stack.Navigator>
  )
}

export default RootNavigator

const styles = StyleSheet.create({})