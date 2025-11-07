import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Clipboard } from 'react-native';
import userApi from '../../api/userApi';

interface Invoice {
  id: number;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
}

const CryptoDeposit: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [originalAmount, setOriginalAmount] = useState(0);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    setError(null);
    setInvoice(null);

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Please enter a valid amount.');
      setIsLoading(false);
      return;
    }

    setOriginalAmount(depositAmount);

    try {
      const result = await userApi.createCryptoDepositInvoice(depositAmount);
      setInvoice(result.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  return (
    <View style={styles.card} className="rounded-2xl p-6">
      <Text className="text-lg font-bold text-black mb-4">Crypto Deposit (USDT TRC20)</Text>

      {!invoice ? (
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Amount (USD)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount to deposit"
            keyboardType="decimal-pad"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black mb-4"
          />
          <Pressable
            onPress={handleCreateInvoice}
            disabled={isLoading}
            className={`py-4 rounded-lg ${isLoading ? 'bg-gray-300' : 'bg-emerald-600'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center">Generate Deposit Address</Text>
            )}
          </Pressable>
          {error && <Text className="text-red-600 text-sm mt-2">{error}</Text>}
        </View>
      ) : (
        <View>
          <Text className="text-base font-semibold text-center mb-4">Complete Your Deposit</Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            To credit your account with ${originalAmount.toFixed(2)} USD, please send the exact crypto amount to the address below.
          </Text>

          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Amount to Send</Text>
            <Text className="font-mono text-base text-black mb-2">
              {invoice.pay_amount} {invoice.pay_currency.toUpperCase()}
            </Text>
            <Pressable
              onPress={() => handleCopy(invoice.pay_amount.toString(), 'Amount')}
              className="bg-emerald-600 py-2 rounded-lg"
            >
              <Text className="text-white text-center font-semibold text-sm">Copy Amount</Text>
            </Pressable>
          </View>

          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Send to Address</Text>
            <Text className="font-mono text-xs text-black mb-2 break-all">
              {invoice.pay_address}
            </Text>
            <Pressable
              onPress={() => handleCopy(invoice.pay_address, 'Address')}
              className="bg-emerald-600 py-2 rounded-lg"
            >
              <Text className="text-white text-center font-semibold text-sm">Copy Address</Text>
            </Pressable>
          </View>

          <View className="bg-amber-50 rounded-lg p-4 mb-4">
            <Text className="text-xs text-amber-800">
              Note: The crypto amount includes processing fees and is calculated based on the current exchange rate. Your wallet will be credited automatically after confirmation.
            </Text>
          </View>

          <Pressable
            onPress={() => setInvoice(null)}
            className="py-3 rounded-lg border-2 border-gray-300"
          >
            <Text className="text-gray-700 font-semibold text-center">Create New Deposit</Text>
          </Pressable>
        </View>
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

export default CryptoDeposit;
