import { ArrowRight, Phone } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoginBlockStore } from './store/loginBlockStore';
import { LoginBlockedScreen } from './LoginBlockedScreen';
import { LoginFieldError, WrongAppError } from './types/loginErrors';
import { TurnstileWebView } from './security/TurnstileWebView';
import { signInStudent } from './loginFlow';

const VTE_LOGO: ImageSourcePropType = require('@/assets/educationLogo/VTE3.png');

const inputStyle = {
  fontSize: 15,
  color: '#111827',
  paddingVertical: 0,
  height: 48,
  ...(Platform.OS === 'android' && {
    textAlignVertical: 'center' as const,
    includeFontPadding: false,
  }),
};

function isValidMobile(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof WrongAppError) return error.message;
  const anyErr = error as any;
  const backendMessage = anyErr?.response?.data?.message;
  if (typeof backendMessage === 'string') return backendMessage;
  return 'Login failed. Please check your credentials.';
}

export function LoginScreen() {
  const blockCode = useLoginBlockStore((s) => s.blockCode);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileFocused, setMobileFocused] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loginError, setLoginError] = useState<unknown>(null);

  if (blockCode) {
    return <LoginBlockedScreen />;
  }

  const errorMessage = loginError ? getErrorMessage(loginError) : null;
  const fieldError = loginError instanceof LoginFieldError ? loginError : null;
  const mobileError = fieldError?.field === 'userName' ? fieldError.message : null;

  const canSubmit =
    isValidMobile(mobileNumber) && !!turnstileToken && !isPending;

  const handleSignIn = async () => {
    if (!canSubmit) return;

    setIsPending(true);
    setLoginError(null);
    try {
      await signInStudent({
        isStaff: false,
        phoneNumber: mobileNumber.replace(/\D/g, ''),
        turnstileToken,
      });
    } catch (error) {
      setLoginError(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          className="flex-1"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 40,
            }}
          >
            <View className="items-center">
              <Image source={VTE_LOGO} className="h-56 w-56" resizeMode="contain" />
            </View>

            <View className="mx-auto w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <Text className="text-2xl font-bold text-gray-900">Welcome back</Text>
              <Text className="mt-1 text-sm leading-5 text-gray-500">
                Sign in with your registered mobile number.
              </Text>

              {errorMessage ? (
                <View className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <Text className="text-sm font-medium text-red-700">{errorMessage}</Text>
                </View>
              ) : null}

              <View className="mt-7">
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Mobile number
                </Text>
                <View
                  className={
                    'h-12 flex-row items-center rounded-xl border px-4 ' +
                    (mobileFocused ? 'border-red-700 bg-white' : 'border-gray-200 bg-gray-50')
                  }
                >
                  <Phone size={18} color={mobileFocused ? '#b91c1c' : '#9ca3af'} />
                  <TextInput
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    onFocus={() => setMobileFocused(true)}
                    onBlur={() => setMobileFocused(false)}
                    placeholder="Registered mobile number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                    editable={!isPending}
                    maxLength={13}
                    className="ml-3 flex-1"
                    style={inputStyle}
                  />
                </View>
                <Text className="mt-2 text-xs text-gray-400">
                  Use the mobile number on your admission form.
                </Text>
                {mobileError ? (
                  <Text className="mt-2 text-xs text-red-600">{mobileError}</Text>
                ) : null}
              </View>

              <View className="mt-4">
                <TurnstileWebView onVerify={(token) => setTurnstileToken(token)} />
              </View>

              <Pressable
                onPress={handleSignIn}
                disabled={!canSubmit}
                className={
                  'mt-6 flex-row items-center justify-center rounded-xl py-3.5 ' +
                  (canSubmit ? 'bg-red-700' : 'bg-gray-200')
                }
              >
                <Text
                  className={
                    'mr-2 text-base font-bold ' + (canSubmit ? 'text-white' : 'text-gray-400')
                  }
                >
                  {isPending ? 'Signing in…' : 'Sign In'}
                </Text>
                <ArrowRight size={18} color={canSubmit ? '#ffffff' : '#9ca3af'} />
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export default LoginScreen;