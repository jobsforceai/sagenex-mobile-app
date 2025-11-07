import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthRoutes } from '../routes';
import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false , animation: 'slide_from_right'}}>
      <Stack.Screen
        name={AuthRoutes.Login}
        component={LoginScreen}
        options={{}}
      />
      <Stack.Screen
        name={AuthRoutes.Register}
        component={RegisterScreen}
        options={{}}
      />

    </Stack.Navigator>
  )
}

export default AuthNavigator

const styles = StyleSheet.create({})