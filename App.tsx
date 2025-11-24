import "./global.css";
import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import RootNavigator from "./src/navigation/navigators/RootNavigator";
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from 'expo-font';
import { useAppLock } from './src/hooks/useAppLock';
import LockScreen from './src/screens/auth/LockScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    SquadaOne: require('./assets/fonts/SquadaOne-Regular.ttf'),
  });

  const { locked, enabled, triggerLock } = useAppLock(true);

  useEffect(() => {
    // When fonts are loaded and lock setting is known, trigger lock immediately
    if (fontsLoaded && enabled === true) {
      // Attempt authentication when app starts
      triggerLock();
    }
  }, [fontsLoaded, enabled]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootNavigator />
        {locked && <LockScreen onAttemptUnlock={triggerLock} />}
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
