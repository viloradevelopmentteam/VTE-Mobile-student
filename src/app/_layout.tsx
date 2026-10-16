import { Stack } from 'expo-router';
import '../../global.css';

import { QueryProvider } from '@/providers/QueryClient';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider, DefaultTheme } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SocketProvider } from '@/providers/socket/SocketProvider';

import { useSessionStore } from '@/providers/store/useSessionStore';

// STUDENT APP: only the login screen and the student area are registered.
export default function RootLayout() {
  const hasToken = useSessionStore((s) => s.hasToken);

  return (
    <ThemeProvider value={DefaultTheme}>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <SafeAreaProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={!hasToken}>
                  <Stack.Screen name="login" />
                </Stack.Protected>

                <Stack.Protected guard={hasToken}>
                  <Stack.Screen name="student" />
                </Stack.Protected>

                <Stack.Screen
                  name="unauthorized"
                  options={{ presentation: 'modal' }}
                />
              </Stack>
            </SafeAreaProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
