import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LockedBonus {
  level: number;
  name: string;
  lockedAmount: number;
  isUnlocked: boolean;
  unlockRequirement: string;
  progress: {
    current: number;
    required: number;
  };
}

interface LockedBonusesProps {
  bonuses: LockedBonus[] | undefined;
}

const LockedBonuses: React.FC<LockedBonusesProps> = ({ bonuses }) => {
  const visible = (bonuses ?? []).filter(b => (b.lockedAmount ?? 0) > 0);

  // If there are no visible locked bonuses, render nothing (avoid empty containers)
  if (!visible || visible.length === 0) return null;

  return (
    <View style={styles.card} className="rounded-2xl p-6">
      <Text className="text-lg font-bold text-black mb-4">Locked Bonuses</Text>

      <View>
        {visible.map(bonus => {
          const progressPercentage = (bonus.progress.current / bonus.progress.required) * 100;
          return (
            <View key={bonus.level} className="p-4 rounded-lg bg-gray-50 border border-gray-200 mb-3">
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-gray-800 font-semibold flex-1">{bonus.name}</Text>
                <Text className="font-bold text-lg text-amber-600">
                  ${bonus.lockedAmount.toFixed(2)}
                </Text>
              </View>
              <View>
                <View className="w-full bg-gray-200 rounded-full h-2">
                  <View 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-xs text-gray-500">{bonus.unlockRequirement}</Text>
                  <Text className="text-xs text-gray-600 font-medium">
                    {bonus.progress.current} / {bonus.progress.required}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    // shadows removed for flat design
  },
});

export default LockedBonuses;
