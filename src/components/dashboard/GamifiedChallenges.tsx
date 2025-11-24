import React from 'react';
import { View, Text, ScrollView } from 'react-native';

type Badge = { label: string; earned: boolean };
type Requirement = { text: string; met: boolean };

type Props = {
    title?: string;
    subtitle?: string;
    progressPct?: number;
    badges?: Badge[];
    requirements?: Requirement[];
    loading?: boolean;
};

const GamifiedChallenges: React.FC<Props> = ({ subtitle, progressPct, badges = [], requirements = [], loading = false }) => {
    const pct = Math.max(0, Math.min(100, progressPct ?? 0));
    if (loading) {
        // simple skeleton layout while loading
        return (
            <View className="w-full bg-white rounded-3xl shadow-lg p-4">
                <View className="mb-2">
                    <View className="h-4 w-2/3 bg-gray-200 rounded mb-3" />
                    <View className="h-4 w-1/3 bg-gray-200 rounded" />
                </View>

                <View className="mt-3">
                    <View className="h-4 bg-gray-200 rounded mb-2" />
                    <View className="h-4 bg-gray-200 rounded" />
                </View>

                <View className="mt-4 flex-row">
                    <View className="h-8 w-20 bg-gray-200 rounded mr-3" />
                    <View className="h-8 w-20 bg-gray-200 rounded mr-3" />
                    <View className="h-8 w-20 bg-gray-200 rounded" />
                </View>

                <View className="mt-3">
                    <View className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                    <View className="h-3 bg-gray-200 rounded w-2/3" />
                </View>
            </View>
        );
    }

    return (
        <View className="w-full bg-white rounded-3xl shadow-lg p-4">
            {subtitle ? <Text className="text-gray-600 text-md mt-1">Progress to <Text className="text-yellow-500">{subtitle}</Text></Text> : null}

            <View className="mt-3 flex flex-col gap-2">
                <View className='flex-row justify-between font-semibold text-sm w-full'>
                    <Text className="text-black mt-2">Progress</Text>
                    <Text className="text-emerald-500 mt-2">{pct}%</Text>
                </View>
                <View style={{ boxShadow: 'inset 0px 2px 2px 2px rgba(0,0,0,0.1)' }} className="h-4 bg-[#D9D9D9] rounded-full overflow-hidden">
                    <View style={{ width: `${pct}%`, boxShadow: 'inset 2px 2px 2px -4px rgba(0,0,0,0.1)' }} className="h-4 bg-sagenex-emerald" />
                </View>
            </View>

            <ScrollView horizontal className="mt-4" showsHorizontalScrollIndicator={false}>
                {badges.map((b) => (
                    <View key={b.label} className={`mr-3 px-3 py-2 rounded-full ${b.earned ? 'bg-yellow-400' : 'bg-gray-800/50'}`}>
                        <Text className={`text-sm ${b.earned ? 'text-black' : 'text-gray-300'}`}>{b.label}</Text>
                    </View>
                ))}
            </ScrollView>

            {requirements.length ? (
                <View className="mt-3">
                    {requirements.map((r, i) => (
                        <Text key={i} className={`text-sm ${r.met ? 'text-gray-300' : 'text-gray-500'}`}>• {r.text}</Text>
                    ))}
                </View>
            ) : null}
        </View>
    );
};

export default GamifiedChallenges;
