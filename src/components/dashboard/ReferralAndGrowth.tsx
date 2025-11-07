import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  referralLink?: string;
  onCopy?: () => void;
  totalReferrals?: number;
  activeAgents?: number;
  investedAgents?: number;
  downlineVolumeLabel?: string;
};

const ReferralAndGrowth: React.FC<Props> = ({ referralLink, onCopy, totalReferrals, activeAgents, investedAgents, downlineVolumeLabel }) => {
  return (
    <View className="w-full bg-gray-900 rounded-2xl p-4">
      <Text className="text-white font-bold mb-2">Referral & Growth</Text>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-gray-300">Total referrals</Text>
          <Text className="text-white font-bold">{totalReferrals ?? 0}</Text>
        </View>
        <View>
          <Text className="text-gray-300">Active</Text>
          <Text className="text-white font-bold">{activeAgents ?? 0}</Text>
        </View>
        <View>
          <Text className="text-gray-300">Invested</Text>
          <Text className="text-white font-bold">{investedAgents ?? 0}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row justify-between items-center">
        <Text className="text-gray-400 text-sm">Downline: {downlineVolumeLabel ?? '-'}</Text>
        <Pressable onPress={onCopy} className="bg-sagenex-emerald px-3 py-2 rounded-md">
          <Text className="text-black font-semibold">Copy Link</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ReferralAndGrowth;
