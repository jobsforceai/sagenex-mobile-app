import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const LOCK_KEY = 'appLockEnabled';

type UseAppLockReturn = {
  locked: boolean;
  enabled: boolean | null;
  setLockEnabled: (v: boolean) => Promise<void>;
  triggerLock: () => Promise<boolean>;
  isBiometricAvailable: () => Promise<boolean>;
};

export function useAppLock(defaultEnabled = true): UseAppLockReturn {
  const [locked, setLocked] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const appState = useRef<string>(AppState.currentState);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(LOCK_KEY).then((value) => {
      if (!mounted) return;
      if (value === null) {
        // first run: persist default
        SecureStore.setItemAsync(LOCK_KEY, defaultEnabled ? 'true' : 'false');
        setEnabled(defaultEnabled);
      } else {
        setEnabled(value === 'true');
      }
    });
    return () => {
      mounted = false;
    };
  }, [defaultEnabled]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [enabled]);

  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextState === 'active') {
      if (enabled) {
        // when coming back to foreground, require unlock
        triggerLock();
      }
    }
    appState.current = nextState;
  };

  const isBiometricAvailable = async () => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && enrolled && types.length > 0;
    } catch (err) {
      return false;
    }
  };

  const triggerLock = async () => {
    const available = await isBiometricAvailable();
    if (!available) {
      // If biometrics are not available, don't lock the UI (optionally could fallback to passcode)
      setLocked(false);
      return false;
    }

    setLocked(true);
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      if (res.success) {
        setLocked(false);
        return true;
      }
    } catch (err) {
      // ignore
    }
    setLocked(true);
    return false;
  };

  const setLockEnabled = async (value: boolean) => {
    await SecureStore.setItemAsync(LOCK_KEY, value ? 'true' : 'false');
    setEnabled(value);
  };

  return { locked, enabled, setLockEnabled, triggerLock, isBiometricAvailable };
}
