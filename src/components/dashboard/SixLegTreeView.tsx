import React from 'react';
import { View, Text } from 'react-native';
import { View as RNView } from 'react-native';

type Leg = {
  id: string;
  head: { id: string; name: string; volumeLabel?: string; active?: boolean };
  children?: { id: string; name: string; volumeLabel?: string; active?: boolean }[];
};

type Props = { legs?: Leg[] };

const SixLegTreeView: React.FC<Props> = ({ legs }) => {
  if (!legs || !legs.length) {
    return (
      <View className="w-full bg-gray-900 rounded-2xl p-4">
        <Text className="text-gray-400">No tree data</Text>
      </View>
    );
  }

  return (
    <View className="w-full bg-gray-900 rounded-2xl p-4">
      <Text className="text-white font-bold mb-2">Team Structure</Text>
      {legs.map((leg) => (
        <View key={leg.id} className="py-2 border-b border-gray-800">
          <Text className="text-white">{leg.head.name} • {leg.head.volumeLabel}</Text>
          {leg.children?.map((c) => (
            <Text key={c.id} className="text-gray-400 text-sm">- {c.name} • {c.volumeLabel}</Text>
          ))}
        </View>
      ))}
    </View>
  );
};

export default SixLegTreeView;
