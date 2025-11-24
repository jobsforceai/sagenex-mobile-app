import { useMemo } from "react";
import { View, Text, FlatList, Image } from "react-native";
import NumericText from '../../components/ui/NumericText';

type StatItem = { id: string; title: string; amount: string };

type Props = {
    items?: StatItem[];
};

const StatsList: React.FC<Props> = ({ items }) => {
    // Use only provided `items`; do not fall back to hardcoded data here.
    // Callers should pass a populated `items` array when they want content.
    const stats = useMemo(() => items ?? [], [items]);

    const renderItem = ({ item }: { item: StatItem }) => (
        <View style={{ width: 140, height: 140 }} className="mr-4 rounded-2xl bg-gray-900 overflow-hidden">
            <View style={{ padding: 12, flex: 1, justifyContent: 'space-between' }}>
                <View style={{ maxWidth: '100%', flexShrink: 1 }}>
                    <NumericText
                        numberStyle={{ fontSize: 36, fontWeight: '700', color: '#fff', includeFontPadding: false }}
                        // ensure currency symbol and other non-numeric parts are white as well
                        style={{ color: '#fff' }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {item.amount}
                    </NumericText>
                </View>

                <View className="z-10 pl-16">
                    <Text className="text-yellow-300 text-center">{item.title.split(" ")[0]}</Text>
                    <Text className="text-yellow-300 text-center">
                        {(item.title.split(' ')[1] ?? '').replace(/^./, (c) => c.toUpperCase())}
                    </Text>
                </View>
            </View>

            <View className="absolute w-[180px] h-[180px] top-0 right-0 z-0">
                <Image source={require('../../../assets/home/blur.png')} className="w-full h-full object-cover opacity-60"/>
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