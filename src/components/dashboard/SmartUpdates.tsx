import React from 'react';
import { View, Text } from 'react-native';

const SmartUpdates: React.FC = () => {
  return (
    <View className="w-full bg-gray-900 rounded-2xl p-4">
      <Text className="text-white font-bold mb-2">Smart Updates</Text>
      <Text className="text-gray-400 text-sm">Recent notifications and updates will appear here.</Text>
    </View>
  );
};

export default SmartUpdates;
