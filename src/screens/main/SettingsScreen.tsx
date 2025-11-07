import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/routes';
import useAuthStore from '../../store/authStore';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const SettingsScreen = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const logout = useAuthStore((s) => s.logout);

  const menuItems = [
    { title: 'Profile', description: 'View and edit your profile details', screen: 'Profile' as keyof MainStackParamList },
    { title: 'Rewards', description: 'View your rewards and achievements', screen: 'Rewards' as keyof MainStackParamList },
    { title: 'KYC Verification', description: 'Complete your KYC verification', screen: 'KYC' as keyof MainStackParamList },
    { title: 'Payouts', description: 'View your payout history', screen: 'Payouts' as keyof MainStackParamList },
  ];

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
          } catch (e) {
            console.error('Logout error', e);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView className="flex-1">
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-black">Settings</Text>
          <Text className="text-sm text-gray-600 mt-1">Manage your account and preferences</Text>
        </View>

        <View className="px-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.screen as any)}
              style={styles.card}
              className="rounded-2xl p-6 mb-3"
              activeOpacity={0.7}
            >
              <Text className="text-lg font-bold text-black mb-1">{item.title}</Text>
              <Text className="text-sm text-gray-600">{item.description}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={[styles.card, styles.logoutButton]} 
            onPress={handleLogout} 
            disabled={isLoggingOut}
            className="rounded-2xl p-6 mt-4"
            activeOpacity={0.7}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">Log Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F6F8'
  },
  card: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
})