// components/Header/AppHeader.tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  Image,
  Platform,
  ImageSourcePropType,
} from 'react-native';
import {
  ChevronLeft,
  GraduationCap,
  User,
} from 'lucide-react-native';

import { useAuthStore } from '@/components/LoginScreen/store/useAuthStore';
import { API_URL } from '@/constants/ENV';
const BRAND_RED = '#E8202A';
const BRAND_CYAN = '#1FB6E8';
const BRAND_NAVY = '#2B2A7A';
const BRAND = '#bb1f2d';
const VTE_LOGO: ImageSourcePropType = require('@/assets/educationLogo/VTE3.png');
type Props = {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
};

export function AppHeader({
  title,
  showBack = false,
  onBackPress,
  rightAction,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const isProfileScreen = pathname === '/profile/ProfileScreen';

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: '#FFFFFF',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: Platform.OS === 'android' ? 4 : 0,
      }}
    >
      <View className="h-20 px-4 flex-row items-center justify-between relative">

  <View className="flex-1 flex-row items-center">
    {showBack ? (
      <Pressable
        onPress={onBackPress ?? (() => router.back())}
        hitSlop={12}
        className="w-10 h-10 rounded-full items-center justify-center active:bg-neutral-100"
      >
        <ChevronLeft size={26} color="#1A1A1A" />
      </Pressable>
    ) : (
      <View className="w-24 h-24 rounded-2xl items-center justify-center overflow-hidden">
        <Image
          source={VTE_LOGO}
          className="w-24 h-24"
          resizeMode="contain"
        />
      </View>
    )}
  </View>

<View
  className="absolute left-6 right-0 items-center justify-center mb-2"
  pointerEvents="none"
>
 <View style={{ alignSelf: 'center', alignItems: 'stretch' }}>
    <View className="flex-row items-baseline justify-center">
      <Text
        className="text-[20px] font-black"
        style={{ color: BRAND_RED, letterSpacing: -0.5 }}
      >
        VILORA
      </Text>
      <Text
        className="text-[20px] font-black"
        style={{ color: BRAND_CYAN, letterSpacing: -0.5 }}
      >
        TECH
      </Text>
    </View>

 
    <View
      className="mt-1 py-[3px] items-center justify-center"
      style={{ backgroundColor: BRAND_NAVY }}
    >
      <Text
        className="text-[9px] font-semibold uppercase"
        style={{
          color: '#FFFFFF',
          letterSpacing: 5,
          paddingLeft: 5, 
        }}
      >
        EDUCATION Pvt,.Ltd.
      </Text>
    </View>
  </View> 
</View>

  <View className="flex-row items-center">
    {rightAction ??
      (!isProfileScreen && (
        <Pressable
          onPress={() => router.push('/profile/ProfileScreen')}
          hitSlop={8}
          className="active:opacity-70"
        >
          {user?.photoName ? (
            <Image
              source={{
                uri: `${API_URL}uploads/profile/${user.photoName}`,
              }}
              className="w-12 h-12 rounded-full border border-neutral-200"
            />
          ) : (
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: BRAND }}
            >
              <User
                size={20}
                color="#FFFFFF"
                strokeWidth={2.25}
              />
            </View>
          )}
        </Pressable>
      ))}
  </View>

</View>
    </View>
  );
}