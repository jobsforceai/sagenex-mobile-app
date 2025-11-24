import React from 'react';
import { View, Text } from 'react-native';
import Skeleton from '../ui/Skeleton';

const WalletSkeleton: React.FC = () => {
  return (
    <View className="flex-1 bg-gray-100">
      <View className="px-4 pt-6 pb-4">
        <Skeleton height={28} width={140} />
        <View style={{ height: 10 }} />
        <Skeleton height={14} width={100} />
      </View>

      <View className="px-4 mb-4">
        <View className="bg-white rounded-xl p-3">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Skeleton height={36} width={'32%'} borderRadius={12} />
            <Skeleton height={36} width={'32%'} borderRadius={12} />
            <Skeleton height={36} width={'32%'} borderRadius={12} />
          </View>

          <View style={{ marginTop: 12 }}>
            <Skeleton height={160} width={'100%'} borderRadius={12} />
          </View>
        </View>
      </View>

      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-4">
          <Skeleton height={18} width={'50%'} />
          <View style={{ height: 12 }} />
          <Skeleton height={12} width={'30%'} />
        </View>
      </View>

      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <Skeleton height={14} width={'40%'} />
              <View style={{ height: 8 }} />
              <Skeleton height={12} width={'70%'} />
            </View>
          ))}
        </View>
      </View>

      <View className="px-4 mb-10">
        <Skeleton height={50} width={'100%'} borderRadius={12} />
      </View>
    </View>
  );
};

export default WalletSkeleton;
