import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import userApi from '../../api/userApi';
import FundTransfer from '../../components/wallet/FundTransfer';
import CryptoDeposit from '../../components/wallet/CryptoDeposit';
import WithdrawalRequest from '../../components/wallet/WithdrawalRequest';
import LockedBonuses from '../../components/wallet/LockedBonuses';
import WalletHistory from '../../components/wallet/WalletHistory';

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

interface LockedBonus {
  level: number;
  name: string;
  lockedAmount: number;
  isUnlocked: boolean;
  unlockRequirement: string;
  progress: {
    current: number;
    required: number;
  };
}

interface DashboardData {
  package: {
    packageUSD: number;
  };
  wallet: {
    availableBalance: number;
    bonuses: LockedBonus[];
  };
}

const WalletScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [kycStatus, setKycStatus] = useState<string | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletRes, dashboardRes, kycData] = await Promise.all([
        userApi.getWalletData(),
        userApi.getDashboardData(),
        userApi.getKycStatus(),
      ]);

      setTransactions(walletRes.ledger || walletRes || []);
      setDashboardData(dashboardRes);
      setKycStatus(kycData.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-black">My Wallet</Text>
          <Text className="text-sm text-gray-600 mt-1">Manage your funds, view transactions, and more.</Text>
        </View>

      

        {/* Fund Transfer & Withdrawal */}
        <View className="px-4 mb-4">
          <FundTransfer currentBalance={dashboardData?.wallet.availableBalance ?? 0} onTransferComplete={load} />
        </View>

        <View className="px-4 mb-4">
          <WithdrawalRequest 
            currentBalance={dashboardData?.wallet.availableBalance ?? 0}
            kycStatus={kycStatus}
            onWithdrawalComplete={load}
          />
        </View>

        {/* Crypto Deposit */}
        <View className="px-4 mb-4">
          <CryptoDeposit />
        </View>

        {/* Locked Bonuses */}
        <View className="px-4 mb-4">
          <LockedBonuses bonuses={dashboardData?.wallet.bonuses} />
        </View>

        {/* Wallet History */}
        <View className="px-4 mb-10">
          <WalletHistory transactions={transactions} />
        </View>
      </ScrollView>
    </SafeAreaView>
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

export default WalletScreen;