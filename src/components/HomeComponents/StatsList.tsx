import { useMemo } from "react";
import { View, Text, FlatList, Image } from "react-native";

type StatItem = { id: string; title: string; amount: string };

type Props = {
    items?: StatItem[];
};

const StatsList: React.FC<Props> = ({ items }) => {
    const stats = useMemo(
        () =>
            items ?? [
                { id: '1', title: 'Invested principal', amount: '$1,200' },
                { id: '2', title: 'Monthly incentive', amount: '$120' },
                { id: '3', title: 'Bonus income', amount: '$45' },
                { id: '4', title: 'Referral income', amount: '$30' },
            ],
        [items],
    );

    const renderItem = ({ item }: { item: StatItem }) => (
        <View style={{ width: 140, height: 140 }} className="relative mr-4 rounded-2xl bg-gray-900 items-center justify-center overflow-hidden">
            <Text className="absolute top-0 p-4 left-0 text-white font-bold text-4xl">{item.amount}</Text>
            <View className="absolute bottom-0 text-xl right-0 p-4 flex items-start z-10">
                <Text className="text-yellow-300 text-center">{item.title.split(" ")[0]}</Text>
                <Text className="text-yellow-300 text-center">
                    {(item.title.split(' ')[1] ?? '').replace(/^./, (c) => c.toUpperCase())}
                </Text>
            </View>
            <View className="absolute w-[180px] h-[180px] top-0 right-0 z-0">
                <Image source={require('../../../assets/home/blur.png')} className="w-full h-full object-cover"/>
            </View>
        </View>
    );

    return (
        <FlatList
            data={stats}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 8 }}
            style={{ marginTop: 4 }}
        />
    );
};

export default StatsList;