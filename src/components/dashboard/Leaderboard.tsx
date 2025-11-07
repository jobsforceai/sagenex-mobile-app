import React from 'react';
import { View, Text, Image } from 'react-native';
import { LeaderboardEntry } from '../../types/types';

type Props = { leaderboardData: LeaderboardEntry[]; currentUserId?: string; variant?: 'light' | 'dark' };

const formatMoney = (v: number) => `$${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const Row: React.FC<{ item: LeaderboardEntry; variant: 'light' | 'dark' }> = ({ item, variant }) => (
  <View className={`flex-row items-center justify-between py-3 ${variant === 'dark' ? 'border-gray-800' : 'border-gray-200'} border-b`}>
    <View className="flex-row items-center flex-1">
      <Text className={`${variant === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-8`}>#{item.rank}</Text>
      <Image source={{ uri: item.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}` }} className="w-10 h-10 rounded-full bg-gray-200" />
      <View className="ml-3 flex-1">
        <Text className={`${variant === 'dark' ? 'text-white' : 'text-black'} font-medium`}>{item.fullName}</Text>
        <Text className={`${variant === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs mt-0.5`}>{item.packagesSold} packages</Text>
      </View>
    </View>
    <Text className={`${variant === 'dark' ? 'text-gray-200' : 'text-gray-800'} font-semibold`}>{formatMoney(item.earnings)}</Text>
  </View>
);

const Leaderboard: React.FC<Props> = ({ leaderboardData, variant = 'light' }) => {
  return (
    <View className={`w-full rounded-2xl p-0 ${variant === 'dark' ? 'bg-gray-900' : 'bg-transparent'}`}>
      {/* Title is omitted so parent can own the card header */}
      {leaderboardData.map((item) => (
        <Row key={item.rank} item={item} variant={variant} />
      ))}
    </View>
  );
};

export default Leaderboard;
