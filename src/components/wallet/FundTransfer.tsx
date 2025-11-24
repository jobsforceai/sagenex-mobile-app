import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import userApi from '../../api/userApi';

interface Recipient {
  userId: string;
  fullName: string;
}

type TransferType = 'TO_AVAILABLE_BALANCE' | 'TO_PACKAGE';

interface FundTransferProps {
  currentBalance: number;
  onTransferComplete: () => void;
}

const FundTransfer: React.FC<FundTransferProps> = ({ currentBalance, onTransferComplete }) => {
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [otp, setOtp] = useState('');
  const [transferType, setTransferType] = useState<TransferType>('TO_AVAILABLE_BALANCE');
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const isAmountInvalid = useMemo(() => numericAmount > currentBalance, [numericAmount, currentBalance]);
  const remainingBalance = useMemo(() => currentBalance - numericAmount, [currentBalance, numericAmount]);

  const filteredRecipients = useMemo(() => {
    if (!searchTerm) return [];
    return allRecipients.filter(r =>
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allRecipients]);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const data = await userApi.getTransferRecipients();
        setAllRecipients(data);
      } catch (error) {
        console.error('Failed to fetch recipients', error);
      }
    };
    fetchRecipients();
  }, []);

  const handleRecipientSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setSearchTerm(`${recipient.fullName} (${recipient.userId})`);
    setIsDropdownVisible(false);
  };

  const handleInitiateTransfer = async () => {
    if (isAmountInvalid || numericAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }
    if (!selectedRecipient) {
      setMessage({ type: 'error', text: 'Please select a valid recipient.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await userApi.sendTransferOtp();
      setMessage({ type: 'success', text: result.message });
      setStep(2);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteTransfer = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit OTP.' });
      return;
    }
    if (!selectedRecipient) {
      setMessage({ type: 'error', text: 'Recipient not selected.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await userApi.executeTransfer(selectedRecipient.userId, numericAmount, otp, transferType);
      setMessage({ type: 'success', text: `${result.message} Transaction ID: ${result.transactionId}` });
      setStep(1);
      setSelectedRecipient(null);
      setSearchTerm('');
      setAmount('');
      setOtp('');
      setTransferType('TO_AVAILABLE_BALANCE');
      onTransferComplete();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Transfer failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card} className="rounded-2xl p-6">
      <Text className="text-lg font-bold text-black mb-4">Transfer Funds</Text>
      <Text className="text-sm text-gray-600 mb-6">
        Securely send funds to another user. An OTP will be sent to your email.
      </Text>

      {message && (
        <View className={`p-4 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <Text className={`text-sm ${message.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
            {message.text}
          </Text>
        </View>
      )}

      {step === 1 ? (
        <View>
          <View className="p-4 rounded-lg bg-gray-50 mb-4">
            <Text className="text-sm text-gray-600">Available Balance</Text>
            <Text className="text-xl font-bold text-black">${currentBalance.toFixed(2)}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Recipient</Text>
            <TextInput
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                setSelectedRecipient(null);
                setIsDropdownVisible(true);
              }}
              onFocus={() => setIsDropdownVisible(true)}
              placeholder="Search by name or user ID"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
            />
            {isDropdownVisible && filteredRecipients.length > 0 && (
              <View className="border border-gray-300 rounded-lg mt-1 bg-white max-h-48">
                <ScrollView>
                  {filteredRecipients.map(r => (
                    <Pressable
                      key={r.userId}
                      onPress={() => handleRecipientSelect(r)}
                      className="px-4 py-3 border-b border-gray-200"
                    >
                      <Text className="text-black font-medium">{r.fullName}</Text>
                      <Text className="text-gray-500 text-xs">{r.userId}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Amount (USD)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className={`bg-gray-50 border ${isAmountInvalid ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-black`}
            />
            {numericAmount > 0 && !isAmountInvalid && (
              <Text className="text-xs text-gray-500 mt-1">
                Remaining: ${remainingBalance.toFixed(2)}
              </Text>
            )}
            {isAmountInvalid && (
              <Text className="text-xs text-red-600 mt-1">Amount exceeds balance</Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Transfer Destination</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setTransferType('TO_AVAILABLE_BALANCE')}
                className={`flex-1 p-4 rounded-lg border-2 ${transferType === 'TO_AVAILABLE_BALANCE' ? 'bg-emerald-50 border-emerald-600' : 'bg-gray-50 border-gray-300'}`}
              >
                <Text className={`font-semibold text-center ${transferType === 'TO_AVAILABLE_BALANCE' ? 'text-emerald-700' : 'text-gray-700'}`}>
                  To Balance
                </Text>
                <Text className="text-xs text-center text-gray-500 mt-1">For spending</Text>
              </Pressable>
              <Pressable
                onPress={() => setTransferType('TO_PACKAGE')}
                className={`flex-1 p-4 rounded-lg border-2 ${transferType === 'TO_PACKAGE' ? 'bg-emerald-50 border-emerald-600' : 'bg-gray-50 border-gray-300'}`}
              >
                <Text className={`font-semibold text-center ${transferType === 'TO_PACKAGE' ? 'text-emerald-700' : 'text-gray-700'}`}>
                  To Package
                </Text>
                <Text className="text-xs text-center text-gray-500 mt-1">For upgrades</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleInitiateTransfer}
            disabled={isLoading || isAmountInvalid || numericAmount <= 0 || !selectedRecipient}
            className={`py-4 rounded-lg ${isLoading || isAmountInvalid || numericAmount <= 0 || !selectedRecipient ? 'bg-gray-300' : 'bg-emerald-600'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center">Send OTP</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Enter OTP</Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
            />
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => { setStep(1); setMessage(null); }}
              className="flex-1 py-4 rounded-lg bg-gray-300"
            >
              <Text className="text-gray-700 font-bold text-center">Back</Text>
            </Pressable>
            <Pressable
              onPress={handleExecuteTransfer}
              disabled={isLoading}
              className={`flex-1 py-4 rounded-lg ${isLoading ? 'bg-gray-300' : 'bg-emerald-600'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-center">Complete</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    // shadows removed for flat design
  },
});

export default FundTransfer;
