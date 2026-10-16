import { ShieldAlert } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useLoginBlockStore } from './store/loginBlockStore';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const COPY: Record<string, { title: string; body: string }> = {
  YOUR_ACCOUNT_IS_LOCKED: {
    title: 'Account Locked',
    body: 'Your account has been locked due to multiple failed login attempts.',
  },
  DEVICE_REJECTED: {
    title: 'Device Blocked',
    body: 'This device has been rejected by the system administrator.',
  },
  UNAUTHORIZED_DEVICE: {
    title: 'Unauthorized Device',
    body: 'This device is not registered in the system.',
  },
  CONTACT_ADMINISTRATION: {
    title: 'Account Disabled',
    body: 'Your account is currently inactive, so you cannot log in at this time.',
  },
  UNKNOWN_BLOCK: {
    title: 'Login Blocked',
    body: 'Something went wrong during login.',
  },
};

export function LoginBlockedScreen() {
  const { blockCode, retryAfter, clearBlock } = useLoginBlockStore();
  if (!blockCode) return null;

  const isRateLimit = blockCode === 'RATE_LIMIT';
  const copy = COPY[blockCode];

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-sm items-center gap-5 rounded-3xl border border-red-100 bg-white p-8">
        <View className="rounded-full bg-red-100 p-4">
          <ShieldAlert size={32} color="#dc2626" strokeWidth={2.5} />
        </View>

        <Text className="text-center text-xl font-bold text-gray-800">
          {isRateLimit ? 'Too Many Attempts' : copy.title}
        </Text>

        {isRateLimit ? (
          <Text className="font-semibold text-red-600">
            Try again in {formatTime(retryAfter)}
          </Text>
        ) : (
          <Text className="text-center text-gray-600">{copy.body}</Text>
        )}

        {!isRateLimit && (
          <View className="w-full rounded-xl border border-red-200 bg-red-50 p-4">
            <Text className="text-center text-sm font-medium text-red-700">
              Please contact your administrator to resolve this issue.
            </Text>
          </View>
        )}

        {!isRateLimit && (
          <Pressable onPress={clearBlock}>
            <Text className="text-sm font-extrabold text-blue-800">Back to Login</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}