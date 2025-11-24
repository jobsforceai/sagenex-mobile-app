import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import userApi from '../../api/userApi';
import WalletHistory from '../../components/wallet/WalletHistory';

const WalletHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.getWalletData();
      setTransactions(res.ledger || res || []);
    } catch (e) {
      console.warn('Failed to load wallet history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-100">
      <View style={{ flex: 1, padding: 16 }}>
        <WalletHistory transactions={transactions} refreshing={refreshing} onRefresh={onRefresh} />
      </View>
    </SafeAreaView>
  );
};

export default WalletHistoryScreen;
