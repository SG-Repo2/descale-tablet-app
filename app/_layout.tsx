import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { KIOSK_CONFIG } from '@/constants/kioskConfig';

/**
 * Root navigation for the trade-show kiosk.
 * The app stays on a single fullscreen route with no stack chrome.
 */
export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(KIOSK_CONFIG.colors.background).catch(() => {
      // Ignore platform-specific failures; the in-app background color still applies.
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar hidden style="light" translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: KIOSK_CONFIG.colors.background,
          },
        }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}
