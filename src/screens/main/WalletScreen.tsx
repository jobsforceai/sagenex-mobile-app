import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet, Animated, Easing, LayoutChangeEvent, Dimensions } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MainStackParamList, MainRoutes } from '../../navigation/routes';
import IonIcons from '@react-native-vector-icons/ionicons';
import userApi from '../../api/userApi';
import Skeleton from '../../components/ui/Skeleton';
import WalletSkeleton from '../../components/wallet/WalletSkeleton';
import FundTransfer from '../../components/wallet/FundTransfer';
import CryptoDeposit from '../../components/wallet/CryptoDeposit';
import WithdrawalRequest from '../../components/wallet/WithdrawalRequest';
import LockedBonuses from '../../components/wallet/LockedBonuses';
import WalletHistory from '../../components/wallet/WalletHistory';
import { Pressable } from 'react-native';

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
  const [activeTab, setActiveTab] = useState<'transfer' | 'withdraw' | 'crypto'>('transfer');
  const [tabsWidth, setTabsWidth] = useState(0);
  const indicatorTranslate = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;
  const { height: windowHeight } = Dimensions.get('window');
  const MIN_PANEL_HEIGHT = Math.round(windowHeight * 0.45);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const handleTabPress = useCallback((tab: 'transfer' | 'withdraw' | 'crypto') => {
    const idx = tab === 'transfer' ? 0 : tab === 'withdraw' ? 1 : 2;
    setActiveTab(tab);

    if (tabsWidth > 0) {
      const tabW = tabsWidth / 3;
      Animated.spring(indicatorTranslate, {
        toValue: idx * tabW,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();

      Animated.timing(contentTranslate, {
        toValue: -idx * tabsWidth,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [tabsWidth, indicatorTranslate, contentTranslate]);

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
          <WalletSkeleton />
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

      

        {/* Top Tabs: Transfer | Withdraw | Crypto (animated) */}
        <View className="px-4 mb-4">
          <View
            className="bg-white rounded-xl p-1"
            onLayout={(e: LayoutChangeEvent) => setTabsWidth(e.nativeEvent.layout.width)}
          >
            <View style={{ position: 'relative' }}>
              {tabsWidth > 0 && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: tabsWidth / 3 - 12,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: '#ECFDF5',
                    transform: [{ translateX: indicatorTranslate }],
                    zIndex: 0,
                  }}
                />
              )}

              <View className='justify-between py-3 flex-row items-center'>
                <Pressable
                  onPress={() => handleTabPress('transfer')}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.tabText, activeTab === 'transfer' ? styles.tabActiveText : undefined]}>Transfer</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleTabPress('withdraw')}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.tabText, activeTab === 'withdraw' ? styles.tabActiveText : undefined]}> Withdrawal</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleTabPress('crypto')}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.tabText, activeTab === 'crypto' ? styles.tabActiveText : undefined]}> Deposit</Text>
                </Pressable>
              </View>

            </View>
          </View>

          {/* Animated content slider */}
              <View style={{ marginTop: 12, overflow: 'hidden' }}>
            {tabsWidth > 0 ? (
              <Animated.View
                style={{
                  flexDirection: 'row',
                  width: tabsWidth * 3,
                  transform: [{ translateX: contentTranslate }],
                }}
              >
                <View style={{ width: tabsWidth, minHeight: MIN_PANEL_HEIGHT }}>
                  <FundTransfer currentBalance={dashboardData?.wallet.availableBalance ?? 0} onTransferComplete={load} />
                </View>

                <View style={{ width: tabsWidth, minHeight: MIN_PANEL_HEIGHT }}>
                  <WithdrawalRequest
                    currentBalance={dashboardData?.wallet.availableBalance ?? 0}
                    kycStatus={kycStatus}
                    onWithdrawalComplete={load}
                  />
                </View>

                <View style={{ width: tabsWidth, minHeight: MIN_PANEL_HEIGHT }}>
                  <CryptoDeposit />
                </View>
              </Animated.View>
            ) : (
              <View>
                {/* fallback until layout measured */}
                <FundTransfer currentBalance={dashboardData?.wallet.availableBalance ?? 0} onTransferComplete={load} />
              </View>
            )}
          </View>
        </View>

        

        {/* Locked Bonuses (render only when present) */}
        {Array.isArray(dashboardData?.wallet?.bonuses) && dashboardData!.wallet!.bonuses.length > 0 ? (
          <View className="px-4 mb-4">
            <LockedBonuses bonuses={dashboardData!.wallet!.bonuses} />
          </View>
        ) : null}

        {/* Wallet History button (navigates to full page) */}
        <View className="px-4 mb-16">
          <Pressable onPress={() => navigation.navigate(MainRoutes.WalletHistory)} className="w-full rounded-xl overflow-hidden">
            <View className="bg-white px-4 py-6 rounded-xl items-center flex-row justify-between">
              <Text className="text-black font-bold text-md">Wallet History</Text>
              <IonIcons name="chevron-forward" size={20} color="#000" />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  tabActiveText: {
    color: '#065f46',
  },
});

export default WalletScreen;