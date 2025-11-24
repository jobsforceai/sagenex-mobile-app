import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  onAttemptUnlock: () => Promise<boolean>;
};

export default function LockScreen({ onAttemptUnlock }: Props) {
  const tryUnlock = async () => {
    try {
      await onAttemptUnlock();
    } catch (err) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Locked</Text>
        <Text style={styles.subtitle}>Authenticate with your device to continue</Text>
        <TouchableOpacity style={styles.button} onPress={tryUnlock} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    width: '86%',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 18,
    color: '#444',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
