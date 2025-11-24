import React from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem, Pressable } from 'react-native';

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
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
}

const formatDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
};

const formatCurrency = (value: number) => {
  return `$${Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status?.toLowerCase() ?? '';
  const bg = s === 'completed' || s === 'success' ? '#ECFDF5' : s === 'pending' ? '#FFFBEB' : '#FEF2F2';
  const color = s === 'completed' || s === 'success' ? '#065f46' : s === 'pending' ? '#92400E' : '#991B1B';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}> 
      <Text style={[styles.badgeText, { color }]}>{status}</Text>
    </View>
  );
};

const WalletHistory: React.FC<WalletHistoryProps> = ({ transactions, refreshing, onRefresh }) => {
  const renderItem: ListRenderItem<WalletTransaction> = ({ item }) => (
    <Pressable style={styles.row} onPress={() => { /* future: navigate to tx detail */ }}>
      <View style={styles.rowLeft}>
        <Text style={styles.txType}>{item.type}</Text>
        <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={[styles.amount, { color: item.amount > 0 ? '#065f46' : '#991B1B' }]}>{formatCurrency(item.amount)}</Text>
        <StatusBadge status={item.status} />
      </View>
    </Pressable>
  );

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Wallet History</Text>
        <Text style={styles.empty}>No transactions found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wallet History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t._id}
        renderItem={renderItem}
        refreshing={!!refreshing}
        onRefresh={onRefresh as any}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    // shadows removed for flat design
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  empty: {
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  rowRight: {
    alignItems: 'flex-end',
    minWidth: 110,
  },
  txType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  txDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});

export default WalletHistory;
