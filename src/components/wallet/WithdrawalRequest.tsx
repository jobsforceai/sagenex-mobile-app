import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import userApi from '../../api/userApi';

interface WithdrawalRequestProps {
  currentBalance: number;
  kycStatus: string | undefined;
  onWithdrawalComplete: () => void;
}

type WithdrawalType = 'crypto' | 'upi' | 'bank';

const WithdrawalRequest: React.FC<WithdrawalRequestProps> = ({ currentBalance, kycStatus, onWithdrawalComplete }) => {
  const [amount, setAmount] = useState('');
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('crypto');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    holderName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await userApi.getProfileData();
        if (profileData && profileData.usdtTrc20Address) {
          setWithdrawalAddress(profileData.usdtTrc20Address);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleAmountChange = (text: string) => {
    setAmount(text);
    setError(null);
    setMessage(null);

    const withdrawalAmount = parseFloat(text);
    if (!isNaN(withdrawalAmount) && withdrawalAmount > currentBalance) {
      setError('Withdrawal amount cannot exceed your available balance.');
    } else if (withdrawalType === 'upi' && !isNaN(withdrawalAmount) && withdrawalAmount > 50) {
      setError('UPI withdrawal amount cannot exceed $50.');
    }
  };

  const handleWithdrawalRequest = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid amount.');
      setIsLoading(false);
      return;
    }

    if (withdrawalAmount > currentBalance) {
      setError('Withdrawal amount cannot exceed your available balance.');
      setIsLoading(false);
      return;
    }

    if (withdrawalType === 'upi' && withdrawalAmount > 50) {
      setError('UPI withdrawal amount cannot exceed $50.');
      setIsLoading(false);
      return;
    }

    const payload: any = { amount: withdrawalAmount };

    if (withdrawalType === 'crypto') {
      if (!withdrawalAddress) {
        setError('Please enter your USDT (TRC20) withdrawal address.');
        setIsLoading(false);
        return;
      }
      payload.withdrawalAddress = withdrawalAddress;
    } else if (withdrawalType === 'upi') {
      if (!upiId) {
        setError('Please enter your UPI ID.');
        setIsLoading(false);
        return;
      }
      payload.upiId = upiId;
    } else if (withdrawalType === 'bank') {
      if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.holderName) {
        setError('Please fill in all bank details.');
        setIsLoading(false);
        return;
      }
      payload.bankDetails = bankDetails;
    }

    try {
      const result = await userApi.requestWithdrawal(payload);
      setMessage(result.message);
      setAmount('');
      setUpiId('');
      setBankDetails({ bankName: '', accountNumber: '', ifscCode: '', holderName: '' });
      onWithdrawalComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (kycStatus !== 'VERIFIED') {
    return (
      <View style={styles.card} className="rounded-2xl p-6">
        <Text className="text-lg font-bold text-black mb-4">Request Withdrawal</Text>
        <View className="bg-amber-50 rounded-lg p-4">
          <Text className="text-amber-800 text-sm font-medium">
            Your KYC must be verified before you can make a withdrawal.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card} className="rounded-2xl p-6">
      <Text className="text-lg font-bold text-black mb-4">Request Withdrawal</Text>

      <View className="flex-row gap-2 mb-4 border-b border-gray-200 pb-2">
        <Pressable
          onPress={() => setWithdrawalType('crypto')}
          className={`px-4 py-2 rounded-lg ${withdrawalType === 'crypto' ? 'bg-emerald-600' : 'bg-gray-100'}`}
        >
          <Text className={`font-semibold ${withdrawalType === 'crypto' ? 'text-white' : 'text-gray-700'}`}>
            Crypto
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setWithdrawalType('upi')}
          className={`px-4 py-2 rounded-lg ${withdrawalType === 'upi' ? 'bg-emerald-600' : 'bg-gray-100'}`}
        >
          <Text className={`font-semibold ${withdrawalType === 'upi' ? 'text-white' : 'text-gray-700'}`}>
            UPI
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setWithdrawalType('bank')}
          className={`px-4 py-2 rounded-lg ${withdrawalType === 'bank' ? 'bg-emerald-600' : 'bg-gray-100'}`}
        >
          <Text className={`font-semibold ${withdrawalType === 'bank' ? 'text-white' : 'text-gray-700'}`}>
            Bank
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Amount (USD)</Text>
          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            placeholder={`Available: $${currentBalance.toFixed(2)}`}
            keyboardType="decimal-pad"
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
          />
          {withdrawalType === 'upi' && parseFloat(amount) > 50 && (
            <Text className="text-red-600 text-sm mt-1">UPI withdrawal amount cannot exceed $50.</Text>
          )}
        </View>

        {withdrawalType === 'crypto' && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">USDT (TRC20) Address</Text>
            <TextInput
              value={withdrawalAddress}
              onChangeText={setWithdrawalAddress}
              placeholder="Enter withdrawal address"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
            />
            <Text className="text-xs text-gray-500 mt-1">Pre-filled from your profile if available.</Text>
          </View>
        )}

        {withdrawalType === 'upi' && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">UPI ID</Text>
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@oksbi"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
            />
          </View>
        )}

        {withdrawalType === 'bank' && (
          <View className="space-y-4 mb-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Account Holder Name</Text>
              <TextInput
                value={bankDetails.holderName}
                onChangeText={(text) => setBankDetails({ ...bankDetails, holderName: text })}
                placeholder="John Doe"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black mb-3"
              />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Account Number</Text>
              <TextInput
                value={bankDetails.accountNumber}
                onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
                placeholder="1234567890"
                keyboardType="number-pad"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black mb-3"
              />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">IFSC Code</Text>
              <TextInput
                value={bankDetails.ifscCode}
                onChangeText={(text) => setBankDetails({ ...bankDetails, ifscCode: text })}
                placeholder="SBIN0001234"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black mb-3"
              />
            </View>
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Bank Name</Text>
              <TextInput
                value={bankDetails.bankName}
                onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
                placeholder="State Bank of India"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
              />
            </View>
          </View>
        )}

        <Pressable
          onPress={handleWithdrawalRequest}
          disabled={isLoading}
          className={`py-4 rounded-lg mb-4 ${isLoading ? 'bg-gray-300' : 'bg-emerald-600'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-center">Request Withdrawal</Text>
          )}
        </Pressable>

        {error && <Text className="text-red-600 text-sm mt-2">{error}</Text>}
        {message && <Text className="text-emerald-600 text-sm mt-2">{message}</Text>}
      </ScrollView>
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

export default WithdrawalRequest;
