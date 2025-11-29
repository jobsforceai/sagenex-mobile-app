import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { registerUser } from '../api/authApi'
import { useNavigation } from '@react-navigation/native'
import { AuthRoutes } from '../navigation/routes'

const RegisterScreen = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sponsorId, setSponsorId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigation = useNavigation<any>()

  const handleRegister = async () => {
    if (!fullName || !email) {
      Alert.alert('Validation', 'Full name and email are required.')
      return
    }
    setIsLoading(true)
    try {
      const data: any = await registerUser(fullName, email, phone, sponsorId)
      if (data.error) {
        Alert.alert('Error', data.error)
      } else {
        // Navigate to Login and open OTP view with prefilled email and message
        navigation.navigate(AuthRoutes.Login as any, { initialView: 'otp', email, message: data.message || 'Registration successful. Enter the OTP sent to your email.' })
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-black items-center justify-center px-4">
      <View className="w-full max-w-md bg-[#0b0b0b] p-6 rounded-xl">
        <Text className="text-2xl font-bold text-white mb-4 text-center">Create an Account</Text>
        <TextInput value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor="#9ca3af" className="bg-[#111] text-white p-3 rounded mb-3" />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" className="bg-[#111] text-white p-3 rounded mb-3" />
        <TextInput value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#9ca3af" keyboardType="phone-pad" className="bg-[#111] text-white p-3 rounded mb-3" />
        <TextInput value={sponsorId} onChangeText={setSponsorId} placeholder="Referral Code (optional)" placeholderTextColor="#9ca3af" className="bg-[#111] text-white p-3 rounded mb-4" />

        <TouchableOpacity className="py-3 rounded-full bg-emerald-400 items-center" onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#000" /> : <Text className="font-semibold text-black">Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 items-center" onPress={() => navigation.navigate(AuthRoutes.Login)}>
          <Text className="text-sm text-[#EADFC1]">Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default RegisterScreen