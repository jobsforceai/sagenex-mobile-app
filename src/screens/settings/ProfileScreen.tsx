import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Pressable, TextInput, Modal, Alert, Clipboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import userApi from '../../api/userApi';

interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profilePicture: string;
  referralCode: string;
  originalSponsorId: string | null;
  parentId: string | null;
  isSplitSponsor: boolean;
  packageUSD: number;
  pvPoints: number;
  dateJoined: string;
  status: 'active' | 'inactive';
  isPackageActive: boolean;
  usdtTrc20Address: string | null;
}

interface KycStatus {
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED';
}

const KycStatusBadge = ({ status }: { status: KycStatus['status'] }) => {
  const kycStatusInfo = {
    VERIFIED: {
      text: 'KYC Verified',
      className: 'bg-emerald-50 text-emerald-700',
    },
    PENDING: {
      text: 'KYC Pending',
      className: 'bg-amber-50 text-amber-700',
    },
    REJECTED: {
      text: 'KYC Rejected',
      className: 'bg-red-50 text-red-700',
    },
    NOT_SUBMITTED: {
      text: 'KYC Not Verified',
      className: 'bg-gray-100 text-gray-700',
    },
  };

  const { text, className } = kycStatusInfo[status];

  return (
    <View className={`px-3 py-1.5 rounded-full ${className}`}>
      <Text className={`text-xs font-semibold ${className.split(' ')[1]}`}>{text}</Text>
    </View>
  );
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', usdtTrc20Address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: 'Profile',
      headerShown: true,
    });

    const fetchPageData = async () => {
      try {
        const [profileData, kycData] = await Promise.all([
          userApi.getProfileData(),
          userApi.getKycStatus(),
        ]);

        setProfile(profileData);
        setFormData({
          fullName: profileData.fullName,
          phone: profileData.phone || '',
          usdtTrc20Address: profileData.usdtTrc20Address || '',
        });
        setKycStatus(kycData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [navigation]);

  const handleCopy = () => {
    if (profile?.referralCode) {
      Clipboard.setString(profile.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    }
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    setMessage(null);

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setMessage({ type: 'error', text: 'Full name and phone number cannot be empty.' });
      setIsSubmitting(false);
      return;
    }

    const dataToUpdate: { fullName?: string; phone?: string; usdtTrc20Address?: string } = {};
    if (formData.fullName !== profile?.fullName) {
      dataToUpdate.fullName = formData.fullName;
    }
    if (formData.phone !== (profile?.phone || '')) {
      dataToUpdate.phone = formData.phone;
    }
    if (formData.usdtTrc20Address !== (profile?.usdtTrc20Address || '')) {
      dataToUpdate.usdtTrc20Address = formData.usdtTrc20Address;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      setMessage({ type: 'error', text: 'No changes detected.' });
      setIsSubmitting(false);
      setIsEditing(false);
      return;
    }

    try {
      const result = await userApi.updateUserProfile(dataToUpdate);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile(result.user);
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An unknown error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
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

  if (!profile) return null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-emerald-600 items-center justify-center mb-3">
              <Text className="text-white text-4xl font-bold">
                {profile.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-black">{profile.fullName}</Text>
            <Text className="text-sm text-gray-600 mt-1">{profile.email}</Text>
            <View className="flex-row flex-wrap gap-2 mt-3 justify-center">
              <View className={`px-3 py-1.5 rounded-full ${profile.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                <Text className={`text-xs font-semibold capitalize ${profile.status === 'active' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {profile.status}
                </Text>
              </View>
              <View className={`px-3 py-1.5 rounded-full ${profile.isPackageActive ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-700'}`}>
                <Text className={`text-xs font-semibold ${profile.isPackageActive ? 'text-sky-700' : 'text-gray-700'}`}>
                  Package {profile.isPackageActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              {kycStatus && <KycStatusBadge status={kycStatus.status} />}
            </View>
          </View>

          <Pressable
            onPress={() => setIsEditing(true)}
            className="bg-emerald-600 py-3 rounded-lg mb-4"
          >
            <Text className="text-white font-bold text-center">Edit Profile</Text>
          </Pressable>

          {message && (
            <View className={`p-4 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <Text className={`text-sm ${message.type === 'error' ? 'text-red-700' : 'text-emerald-700'}`}>
                {message.text}
              </Text>
            </View>
          )}
        </View>

        {/* Account Details */}
        <View className="px-4 mb-4">
          <View style={styles.card} className="rounded-2xl p-6">
            <Text className="text-lg font-bold text-black mb-4">Account Details</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-semibold text-gray-700">User ID</Text>
                <Text className="text-base text-gray-900 mt-1">{profile.userId}</Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700">Phone Number</Text>
                <Text className="text-base text-gray-900 mt-1">{profile.phone || 'Not provided'}</Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700">Date Joined</Text>
                <Text className="text-base text-gray-900 mt-1">
                  {new Date(profile.dateJoined).toLocaleDateString()}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700">USDT (TRC20) Address</Text>
                <Text className="text-xs text-gray-600 mt-1 break-all">
                  {profile.usdtTrc20Address || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Package Details */}
        <View className="px-4 mb-4">
          <View style={styles.card} className="rounded-2xl p-6">
            <Text className="text-lg font-bold text-black mb-4">Package Details</Text>
            <View className="flex-row gap-6">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700">Package Value</Text>
                <Text className="text-3xl font-bold text-black mt-2">
                  ${profile.packageUSD.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700">PV Points</Text>
                <Text className="text-3xl font-bold text-black mt-2">{profile.pvPoints}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Referral Information */}
        <View className="px-4 mb-10">
          <View style={styles.card} className="rounded-2xl p-6">
            <Text className="text-lg font-bold text-black mb-4">Referral Information</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Your Referral Code</Text>
                <View className="flex-row items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <Text className="font-mono text-lg flex-1 text-black">{profile.referralCode}</Text>
                  <Pressable
                    onPress={handleCopy}
                    className="bg-emerald-600 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-white text-xs font-semibold">Copy</Text>
                  </Pressable>
                </View>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700">Original Sponsor ID</Text>
                <Text className="text-base text-gray-900 mt-1">{profile.originalSponsorId || 'N/A'}</Text>
              </View>
              <View>
                <Text className="text-sm font-semibold text-gray-700">Placement Parent ID</Text>
                <Text className="text-base text-gray-900 mt-1">{profile.parentId || 'N/A'}</Text>
              </View>
              {profile.isSplitSponsor && (
                <Text className="text-amber-600 text-xs font-semibold">
                  This is a split sponsorship.
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit Modal */}
        <Modal visible={isEditing} transparent animationType="fade" onRequestClose={() => setIsEditing(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setIsEditing(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text className="text-xl font-bold text-black mb-6">Edit Profile</Text>
              <View className="space-y-4 mb-6">
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name</Text>
                  <TextInput
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
                    keyboardType="phone-pad"
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">USDT (TRC20) Address</Text>
                  <TextInput
                    value={formData.usdtTrc20Address}
                    onChangeText={(text) => setFormData({ ...formData, usdtTrc20Address: text })}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-black"
                  />
                </View>
              </View>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-lg border-2 border-gray-300"
                >
                  <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleUpdateProfile}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-lg ${isSubmitting ? 'bg-gray-300' : 'bg-emerald-600'}`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold text-center">Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
});

export default ProfileScreen;
