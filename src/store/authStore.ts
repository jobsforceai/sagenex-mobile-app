import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setAuthToken } from '../api/authApi'

type AuthState = {
    token: string | null
    isLoggedIn: boolean
    rehydrated?: boolean
    login: (token: string) => Promise<void>
    logout: () => Promise<void>
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            isLoggedIn: false,
            rehydrated: false,
            login: async (token: string) => {
                set({ token, isLoggedIn: true })
                try {
                    setAuthToken(token)
                } catch (e) {
                    // ignore
                }
            },
            logout: async () => {
                set({ token: null, isLoggedIn: false })
                try {
                    setAuthToken(null)
                } catch (e) {
                    // ignore
                }
            },
        }),
        {
            name: 'sagenex-auth',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                try {
                    if (state?.token) {
                        setAuthToken(state.token);
                        // mark rehydrated
                        // we can't call set directly here, return function will be called after rehydrate
                    }
                } catch (e) {
                    // ignore
                }
                return (state?: any, err?: any) => {
                    // final callback after rehydration
                    // set rehydrated flag so UI can wait on it
                    if (err) {
                        console.error('Rehydrate error', err)
                    }
                    // Note: use set via persisted state setter is not available here,
                    // so we rely on the store to update rehydrated via a small trick: use setTimeout to access store
                    setTimeout(() => {
                        // direct set through the store
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const useStore = require('./authStore').default
                        useStore.setState({ rehydrated: true })
                    }, 0)
                }
            }
        }
    )
)

export default useAuthStore
