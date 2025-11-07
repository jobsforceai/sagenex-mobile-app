import React from 'react';
import { View, Text } from 'react-native';
import { Wallet } from '../../types/types';

type Props = {
  bonuses?: Wallet['bonuses'];
};

const LockedBonuses: React.FC<Props> = ({ bonuses }) => {
  return (
    <View className="w-full bg-gray-900 rounded-2xl p-4">
      <Text className="text-white font-bold mb-3">Locked Bonuses</Text>
      {bonuses && bonuses.length ? (
        bonuses.map((b) => (
          <View key={b.level} className="flex-row justify-between items-center py-2 border-b border-gray-800">
            <View>
              <Text className="text-white">{b.name}</Text>
              <Text className="text-gray-400 text-sm">Level {b.level} • {b.unlockRequirement}</Text>
            </View>
            <View className="items-end">
              <Text className="text-white font-bold">${b.lockedAmount}</Text>
              <Text className="text-xs text-gray-400">{b.isUnlocked ? 'Unlocked' : 'Locked'}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text className="text-gray-400">No bonuses found</Text>
      )}
    </View>
  );
};

export default LockedBonuses;
