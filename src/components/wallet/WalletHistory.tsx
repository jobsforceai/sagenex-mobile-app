import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface WalletTransaction {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  createdBy: string;
  createdAt: string;
  meta: Record<string, unknown>;
}

interface WalletHistoryProps {
  transactions: WalletTransaction[];
}

const WalletHistory: React.FC<WalletHistoryProps> = ({ transactions }) => {
  return (
    <View style={styles.card} className="rounded-2xl p-6">
      <Text className="text-lg font-bold text-black mb-4">Wallet History</Text>
      
      {transactions.length === 0 ? (
        <Text className="text-gray-500 text-center py-4">No transactions found.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Table Header */}
            <View className="flex-row border-b border-gray-200 pb-2 mb-2">
              <Text className="text-sm font-bold text-gray-700 w-32">Type</Text>
              <Text className="text-sm font-bold text-gray-700 w-24 text-right">Amount</Text>
              <Text className="text-sm font-bold text-gray-700 w-24 text-center">Status</Text>
              <Text className="text-sm font-bold text-gray-700 w-28 text-right">Date</Text>
            </View>
            
            {/* Table Body */}
            {transactions.map((tx) => (
              <View key={tx._id} className="flex-row border-b border-gray-100 py-3">
                <Text className="text-sm text-gray-800 w-32">{tx.type}</Text>
                <Text className={`text-sm w-24 text-right font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${tx.amount.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-700 w-24 text-center">{tx.status}</Text>
                <Text className="text-sm text-gray-600 w-28 text-right">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default WalletHistory;
