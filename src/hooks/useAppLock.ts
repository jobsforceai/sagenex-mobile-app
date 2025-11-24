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

  // Guards & timers to avoid re-entrant native auth loops on iOS
  const authInProgress = useRef<boolean>(false);
  const lastAuthAttemptAt = useRef<number | null>(null);
  const lastAuthSuccessAt = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);

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
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current as unknown as number);
      }
    };
  }, [defaultEnabled]);

  useEffect(() => {
    const handler = (nextState: AppStateStatus) => {
      // Debounce AppState changes to avoid native auth modal lifecycle re-triggers
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (!enabled) {
          appState.current = nextState;
          return;
        }

        // clear any existing timer
        if (resumeTimer.current) {
          clearTimeout(resumeTimer.current as unknown as number);
        }

        // schedule a deferred check
        resumeTimer.current = (setTimeout(async () => {
          const now = Date.now();

          // skip if a successful auth happened recently (grace)
          const successGraceMs = 5000;
          if (lastAuthSuccessAt.current && now - lastAuthSuccessAt.current < successGraceMs) {
            appState.current = nextState;
            return;
          }

          // backoff after a recent attempt (avoid immediate re-tries)
          const attemptBackoffMs = 10000;
          if (lastAuthAttemptAt.current && now - lastAuthAttemptAt.current < attemptBackoffMs) {
            appState.current = nextState;
            return;
          }

          // if an auth is already in progress, don't start another
          if (authInProgress.current) {
            appState.current = nextState;
            return;
          }

          // finally trigger lock/auth
          triggerLock();
          appState.current = nextState;
        }, 300) as unknown) as number;
      } else {
        appState.current = nextState;
      }
    };

    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [enabled]);

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
    // prevent concurrent auth attempts
    if (authInProgress.current) return false;
    lastAuthAttemptAt.current = Date.now();
    authInProgress.current = true;
    const available = await isBiometricAvailable();
    if (!available) {
      // If biometrics are not available, don't lock the UI (optionally could fallback to passcode)
      authInProgress.current = false;
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
        lastAuthSuccessAt.current = Date.now();
        setLocked(false);
        return true;
      }
    } catch (err) {
      // ignore
    }
    authInProgress.current = false;
    setLocked(true);
    return false;
  };

  const setLockEnabled = async (value: boolean) => {
    await SecureStore.setItemAsync(LOCK_KEY, value ? 'true' : 'false');
    setEnabled(value);
  };

  return { locked, enabled, setLockEnabled, triggerLock, isBiometricAvailable };
}
