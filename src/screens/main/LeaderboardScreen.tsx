import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import userApi from '../../api/userApi';
import { LeaderboardEntry } from '../../types/types';
import Leaderboard from '../../components/dashboard/Leaderboard';

// Helper to format currency-like values (earnings). Adjust currency if backend returns other units.
const formatMoney = (v: number) => `$${Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

// Simplified podium using actual LeaderboardEntry (rank, fullName, earnings)
const Podium: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
  if (!entries?.length) return null;
  const podium = [...entries].sort((a, b) => (b.earnings ?? 0) - (a.earnings ?? 0)).slice(0, 3);
  const barHeights = [70, 100, 60];
  const colors = [
    { circleBg: '#FEF3C7', bar: '#FBBF24', text: '#92400E' }, // Gold (2nd)
    { circleBg: '#E6FBF3', bar: '#41DA93', text: '#065F46' }, // Emerald (1st)
    { circleBg: '#F3F4F6', bar: '#D1D5DB', text: '#374151' }, // Silver (3rd)
  ];
  return (
    <View style={styles.card} className="rounded-2xl p-4 mb-4">
      <Text className="text-base font-semibold mb-3 text-black">Top Performers</Text>
      <View className="flex-row items-end justify-between">
        {podium.map((p, idx) => {
          const barHeight = barHeights[idx] || 60;
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
          const initials = p.fullName?.split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase();
          const c = colors[idx];
          return (
            <View key={p.rank} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginBottom: 6 }}>{medal}</Text>
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: c.circleBg }}>
                <Text style={{ color: c.text, fontWeight: '600' }}>{initials}</Text>
              </View>
              <View style={{ backgroundColor: c.bar, height: barHeight }} className="w-14 rounded-t-lg items-center justify-end mt-2">
                <Text className="text-white text-xs mb-2 font-semibold">{formatMoney(p.earnings)}</Text>
              </View>
              <Text numberOfLines={1} className="text-xs mt-2 text-gray-600 max-w-[90px]">{p.fullName}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Card summarizing current user's position if present.
const MyPosition: React.FC<{ entries: LeaderboardEntry[] | null; userId?: string | null }> = ({ entries, userId }) => {
  if (!entries || !entries.length || !userId) return null;
  const idx = entries.findIndex(e => e.userId && userId && String(e.userId) === String(userId));
  if (idx === -1) return null;
  const row = entries[idx];
  return (
    <View style={styles.card} className="rounded-2xl p-4 mb-4">
      <Text className="text-sm font-medium text-gray-600">Your Rank</Text>
      <Text className="text-3xl font-extrabold mt-1 text-black">#{row.rank}</Text>
      <View className="flex-row mt-3 items-center justify-between">
        <View>
          <Text className="text-xs text-gray-600">Earnings</Text>
          <Text className="text-sm font-semibold text-black">{formatMoney(row.earnings)}</Text>
        </View>
        <View>
          <Text className="text-xs text-gray-600">Packages Sold</Text>
          <Text className="text-sm font-semibold text-black">{row.packagesSold}</Text>
        </View>
      </View>
    </View>
  );
};

const LeaderboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null);
  const [dashboard, setDashboard] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, lbRes] = await Promise.all([
        userApi.getDashboardData(),
        userApi.getLeaderboard(),
      ]);
      
      // DEBUG: Log raw API responses
      // console.log('=== LEADERBOARD DEBUG ===');
      // console.log('Raw leaderboard response:', JSON.stringify(lbRes, null, 2));
      // console.log('First entry detail:', lbRes?.[0]);
      // console.log('========================');
      
      if (dashRes?.error) setError(dashRes.error); else setDashboard(dashRes);
      if ((lbRes as any)?.error) setError((lbRes as any).error); else setLeaderboardData(lbRes as LeaderboardEntry[]);
    } catch (e) {
      console.error(e);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  const sorted = useMemo(() => (leaderboardData ? [...leaderboardData].sort((a, b) => (b.earnings ?? 0) - (a.earnings ?? 0)) : []), [leaderboardData]);
  const userId = dashboard?.profile?.userId || null;

  return (
    <ScrollView className="bg-gray-100" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={'#41DA93'} /> } showsVerticalScrollIndicator={false}>
      <SafeAreaView className="bg-gray-100">
        <View className="px-4 pt-5 pb-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-black">Leaderboard</Text>
          {/* <Pressable className="px-3 py-2 rounded-full bg-white" style={styles.shadowSm} onPress={load}>
            <Text className="text-lg">↻</Text>
          </Pressable> */}
        </View>

        {/* Podium */}
        {!loading && !error && sorted.length > 0 && <View className="px-4"><Podium entries={sorted} /></View>}

        {/* My position */}
        <View className="px-4">{!loading && !error && <MyPosition entries={sorted} userId={userId} />}</View>


        {/* Leaderboard list */}
        <View className="px-4 mb-10">
          <View style={styles.card} className="rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-black">All Rankings</Text>
              {loading && <ActivityIndicator size="small" color={'#41DA93'} />}
            </View>
            {error ? (
              <View className="py-6 items-center">
                <Text className="text-red-600">{error}</Text>
                <Pressable onPress={load} className="mt-3 px-3 py-2 rounded-lg bg-black">
                  <Text className="text-white text-xs font-semibold">Retry</Text>
                </Pressable>
              </View>
            ) : !leaderboardData || leaderboardData.length === 0 ? (
              <Text className="text-sm text-gray-600">No data</Text>
            ) : (
              <Leaderboard leaderboardData={leaderboardData} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  shadowSm: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  card: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
});

export default LeaderboardScreen;
