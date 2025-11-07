import React from 'react';
import { View, Text, Image } from 'react-native';
import { Profile } from '../../types/types';

type Props = {
  name?: string;
  avatarUrl?: string;
  currentLevel?: string | null;
  nextLevelLabel?: string;
  progressPct?: number;
  packageUSD?: number;
};

const AgentOverview: React.FC<Props> = ({ name, avatarUrl, currentLevel, nextLevelLabel, progressPct, packageUSD }) => {
  const pct = Math.max(0, Math.min(100, progressPct ?? 0));

  return (
    <View className="w-full bg-gray-900 rounded-2xl p-4">
      <View className="flex-row items-center">
        <Image source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}` }} className="w-16 h-16 rounded-full bg-gray-200" />
        <View className="ml-4 flex-1">
          <Text className="text-white text-lg font-bold">{name ?? 'User'}</Text>
          <Text className="text-gray-300 text-sm">Level: {currentLevel ?? 'Member'}</Text>
          {nextLevelLabel ? <Text className="text-gray-400 text-xs mt-1">Next: {nextLevelLabel}</Text> : null}
        </View>
        <View className="items-end">
          <Text className="text-white font-bold">${packageUSD ?? 0}</Text>
          <Text className="text-gray-400 text-xs">Package USD</Text>
        </View>
      </View>

      <View className="mt-4">
        <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <View style={{ width: `${pct}%` }} className="h-2 bg-sagenex-emerald" />
        </View>
        <Text className="text-gray-300 text-xs mt-2">Progress: {pct}%</Text>
      </View>
    </View>
  );
};

export default AgentOverview;
