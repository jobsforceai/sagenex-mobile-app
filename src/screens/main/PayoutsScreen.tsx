import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Pressable, Modal, FlatList, ActivityIndicator } from 'react-native';
import userApi from '../../api/userApi';

const formatCurrency = (amount: number) => `$${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

const FuturePayoutsModal: React.FC<{ visible: boolean; nextPayoutDate?: string | null; onClose: () => void }> = ({ visible, nextPayoutDate, onClose }) => {
  const futureDates = useMemo(() => {
    if (!nextPayoutDate) return [];
    const dates: string[] = [];
    const startDate = new Date(nextPayoutDate);
    for (let i = 0; i < 12; i++) {
      const future = new Date(startDate);
      future.setDate(startDate.getDate() + 30 * i);
      dates.push(future.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
    return dates;
  }, [nextPayoutDate]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Future Payout Dates</Text>
        <Text style={styles.modalSub}>Estimated payout dates for the next 12 months</Text>
        <View style={{ marginTop: 12 }}>
          {futureDates.map((d, i) => (
            <View key={i} style={styles.futureRow}>
              <Text style={styles.futureText}>{d}</Text>
            </View>
          ))}
        </View>
        <Pressable style={styles.modalCloseButton} onPress={onClose}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const PayoutsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nextPayoutDate, setNextPayoutDate] = useState<string | null>(null);
  const [currentPayout, setCurrentPayout] = useState<any | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [listRes, currentRes] = await Promise.all([
          userApi.getPayouts(),
          userApi.getCurrentPayoutProgress(),
        ]);

        // handle list response
        if (listRes?.error) {
          setError(listRes.error);
          setPayouts([]);
        } else if (Array.isArray(listRes)) {
          setPayouts(listRes);
        } else if (listRes?.payouts) {
          setPayouts(listRes.payouts);
        } else {
          setPayouts(listRes?.data || []);
        }

        // handle current payout response
        if (currentRes?.error) {
          // don't override list error, but capture
          if (!error) setError(currentRes.error);
        } else if (currentRes) {
          setCurrentPayout(currentRes);
          if (currentRes.nextPayoutDate) setNextPayoutDate(currentRes.nextPayoutDate);
          else if (currentRes.currentPayout?.nextPayoutDate) setNextPayoutDate(currentRes.currentPayout.nextPayoutDate);
        }
      } catch (err: any) {
        setError('Failed to load payouts');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Countdown & progress effect (from currentPayout.nextPayoutDate)
  useEffect(() => {
    if (!currentPayout && !nextPayoutDate) {
      setCountdown(null);
      setProgressPercentage(0);
      return;
    }

    const nextDateStr = (currentPayout?.nextPayoutDate) || nextPayoutDate;
    if (!nextDateStr) {
      setCountdown('Not started');
      setProgressPercentage(0);
      return;
    }

    const nextDate = new Date(nextDateStr);
    const cycleDurationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cycleStart = new Date(nextDate.getTime() - cycleDurationMs);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextDate.getTime() - now.getTime();

      const elapsedTime = now.getTime() - cycleStart.getTime();
      let calculatedProgress = (elapsedTime / cycleDurationMs) * 100;
      calculatedProgress = Math.max(0, Math.min(100, calculatedProgress));
      setProgressPercentage(calculatedProgress);

      if (diff <= 0) {
        setCountdown('Processing...');
        setProgressPercentage(100);
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPayout, nextPayoutDate]);

  const renderHeader = () => (
    <View style={{ padding: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 6 }}>Payouts</Text>
      <Text style={{ color: '#6b7280', marginBottom: 12 }}>Track your current earnings and review your payout history.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Estimated Payout</Text>
        <Text style={styles.cardValue}>{loading ? '—' : formatCurrency(currentPayout?.estimatedPayout ?? payouts?.[0]?.totalMonthlyIncome ?? 0)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Payout Countdown</Text>
        <Text style={{ marginTop: 6, color: '#374151' }}>{nextPayoutDate ? new Date(nextPayoutDate).toLocaleDateString() : 'N/A'}</Text>
        <View style={{ marginTop: 8, height: 10, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progressPercentage}%`, backgroundColor: '#10b981' }} />
        </View>
        <Text style={{ marginTop: 6, color: '#6b7280' }}>{progressPercentage.toFixed(1)}% of current cycle completed</Text>
        <Text style={{ marginTop: 6, color: '#6b7280' }}>{countdown ?? '—'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => setModalVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>View Future Payouts</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Payout History</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { marginBottom: 10, marginHorizontal: 12 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontWeight: '700' }}>{item.month || item.label || 'Month'}</Text>
        <Text style={{ color: '#10b981', fontWeight: '800' }}>{formatCurrency(item.totalMonthlyIncome || item.total || 0)}</Text>
      </View>
      <View style={{ marginTop: 8 }}>
        <Text style={{ color: '#6b7280' }}>ROI: {formatCurrency(item.roiPayout || 0)}</Text>
      </View>
    </View>
  );

  const listEmpty = () => (
    <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={{ color: 'red' }}>{error}</Text>
      ) : (
        <Text style={{ color: '#6b7280' }}>No payout history found.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F6F8' }}>
      <FlatList
        data={payouts}
        keyExtractor={(i, idx) => String(i?.month || i?.id || idx)}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <FuturePayoutsModal visible={modalVisible} nextPayoutDate={nextPayoutDate} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

export default PayoutsScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  cardTitle: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
  cardValue: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  primaryButton: { marginTop: 12, backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { position: 'absolute', left: 16, right: 16, top: '20%', backgroundColor: '#111827', padding: 16, borderRadius: 12 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modalSub: { color: '#9CA3AF', marginTop: 6 },
  futureRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  futureText: { color: '#e5e7eb' },
  modalCloseButton: { marginTop: 12, backgroundColor: '#065f46', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
});
