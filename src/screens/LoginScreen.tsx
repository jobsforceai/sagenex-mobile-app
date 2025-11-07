import React, { useEffect, useState } from 'react'
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { loginOtp, verifyEmail } from '../api/authApi'
import useAuthStore from '../store/authStore'
import { useNavigation } from '@react-navigation/native'
import { AuthRoutes } from '../navigation/routes'

type ViewMode = 'main' | 'email-login' | 'otp'

const LoginScreen = () => {
    const [view, setView] = useState<ViewMode>('main')
    const [previousView, setPreviousView] = useState<ViewMode>('main')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')

    const login = useAuthStore((s) => s.login)
    const navigation = useNavigation<any>()

    useEffect(() => {
        // placeholder: if you want to auto-fill sponsor from deep link, add logic here
    }, [])

    const changeView = (newView: ViewMode) => {
        setPreviousView(view)
        setView(newView)
    }

    const handleSignUpSubmit = async () => {
        // Redirect to Register screen for signup
        navigation.navigate(AuthRoutes.Register)
    }

    const handleEmailLoginSubmit = async () => {
        setError(null)
        setMessage(null)
        setIsLoading(true)

        if (!email) {
            setError('Email is required.')
            setIsLoading(false)
            return
        }

        try {
            const data: any = await loginOtp(email)
            if (data.error) {
                setError(data.error)
            } else {
                setMessage(data.message || 'Login OTP has been sent to your email.')
                changeView('otp')
            }
        } catch (err: any) {
            setError(err?.message || 'An unknown error occurred.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpSubmit = async () => {
        setError(null)
        setIsLoading(true)

        if (!otp || !email) {
            setError('Email and OTP are required.')
            setIsLoading(false)
            return
        }

        try {
            const data: any = await verifyEmail(email, otp)
            if (data.error) {
                setError(data.error)
            } else {
                // assume API returns { token }
                const token = data.token
                if (token) {
                    await login(token)
                } else {
                    setError('No token returned from server.')
                }
            }
        } catch (err: any) {
            setError(err?.message || 'An unknown error occurred.')
        } finally {
            setIsLoading(false)
        }
    }

        const renderMainView = () => (
            <View className="w-full">
                <TouchableOpacity className="py-3 rounded-full bg-sagenex-emerald items-center" onPress={() => changeView('email-login')} disabled={isLoading}>
                    <Text className="font-semibold text-black">Continue with Email</Text>
                </TouchableOpacity>
            </View>
        )

        const renderEmailLoginView = () => (
            <View>
                <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#9ca3af" className="bg-[#111] text-white p-3 rounded mb-3" editable={!isLoading} keyboardType="email-address" autoCapitalize="none" />
                <TouchableOpacity className={`py-3 rounded-full items-center ${isLoading ? 'opacity-60 bg-sagenex-emerald' : 'bg-sagenex-emerald'}`} onPress={handleEmailLoginSubmit} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#000" /> : <Text className="font-semibold text-black">Send OTP</Text>}
                </TouchableOpacity>
            </View>
        )

    // Signup moved to separate Register screen.

        const renderOtpView = () => (
            <View>
                <TextInput value={otp} onChangeText={setOtp} placeholder="6-Digit OTP" placeholderTextColor="#9ca3af" className="bg-[#111] text-white p-3 rounded mb-3 text-center tracking-widest" editable={!isLoading} keyboardType="number-pad" maxLength={6} />
                <TouchableOpacity className={`py-3 rounded-full items-center ${isLoading ? 'opacity-60 bg-sagenex-emerald' : 'bg-sagenex-emerald'}`} onPress={handleOtpSubmit} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#000" /> : <Text className="font-semibold text-black">Verify</Text>}
                </TouchableOpacity>
            </View>
        )

    const renderView = () => {
        switch (view) {
            case 'email-login':
                return renderEmailLoginView()
            case 'otp':
                return renderOtpView()
            case 'main':
            default:
                return renderMainView()
        }
    }

        return (
            <KeyboardAvoidingView className="flex-1 bg-black items-center justify-center px-4" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View className="w-full max-w-md bg-sagenex-black p-6 rounded-xl">
                    <Text className="text-2xl font-bold text-white mb-4 text-center">{view === 'main' ? 'Welcome to Sagenex' : view === 'otp' ? 'Enter OTP' : 'Sign In'}</Text>
                    {renderView()}
                    {view !== 'main' && (
                        <TouchableOpacity onPress={() => changeView(view === 'otp' ? previousView : 'main')} disabled={isLoading} className="mt-3 items-center">
                            <Text className="text-sagenex-beige">Back</Text>
                        </TouchableOpacity>
                    )}
                    {view === 'main' && (
                        <TouchableOpacity onPress={() => navigation.navigate(AuthRoutes.Register)} disabled={isLoading} className="mt-3 items-center">
                            <Text className="text-sagenex-beige">Don't have an Account? Sign up</Text>
                        </TouchableOpacity>
                    )}
                    {error && <Text className="text-red-400 text-center mt-3">{error}</Text>}
                    {message && <Text className="text-emerald-400 text-center mt-3">{message}</Text>}
                </View>
            </KeyboardAvoidingView>
        )
}

export default LoginScreen