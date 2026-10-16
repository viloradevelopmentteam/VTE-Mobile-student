// components/StudentScreen/StudentTabs.android.tsx
import type { Href } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { Pressable, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, User, type LucideIcon } from 'lucide-react-native';

// Matches the rest of the student screens' indigo accent — staff uses its
// own separate BRAND (#bb1f2d), these are intentionally independent.
const THEME = {
  light: {
    barBg: '#FFFFFF',
    barBorder: 'rgba(15,23,42,0.06)',
    activeBg: '#bb1f2d', // indigo-50
    activeIcon: '#FFFFFF', // indigo-600
    inactiveIcon: '#98A2B3',
    label: '#FFFFFF',
    labelInactive: '#98A2B3',
  },
  dark: {
    barBg: '#1C1C1E',
    barBorder: 'rgba(255,255,255,0.08)',
    activeBg: 'rgba(129,140,248,0.16)', // indigo-400 @ 16%
    activeIcon: '#818CF8', // indigo-400 — lighter, holds contrast on dark bg
    inactiveIcon: '#8E8E93',
    label: '#818CF8',
    labelInactive: '#8E8E93',
  },
} as const;

type TabDef = {
  name: string;
  href: Href;
  label: string;
  icon: LucideIcon;
};

export function StudentTabs() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'light' ? 'dark' : 'light'];

  const tabs: TabDef[] = [
    { name: 'index', href: '/student', label: 'Home', icon: Home },
    { name: 'courses', href: '/student/courses', label: 'Courses', icon: BookOpen },
  ];

  return (
    <Tabs>
      {/* screen content — bottom padding reserves space so content
          doesn't sit under the floating bar */}
      <View style={{ flex: 1, paddingBottom: 64 + insets.bottom }}>
        <TabSlot />
      </View>

      <TabList
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 12 + insets.bottom,
          flexDirection: 'row',
          backgroundColor: theme.barBg,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: theme.barBorder,
          paddingVertical: 6,
          paddingHorizontal: 6,
          // shadow* is ignored on Android — elevation alone draws the shadow
          elevation: 8,
        }}
      >
        {tabs.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
            <StudentTabItem icon={tab.icon} label={tab.label} theme={theme} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

function StudentTabItem({
  icon: Icon,
  label,
  theme,
  isFocused,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  theme: (typeof THEME)[keyof typeof THEME];
  isFocused?: boolean;
  onPress?: () => void;
}) {
  const active = !!isFocused;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${theme.activeIcon}22`, borderless: true }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 22,
        backgroundColor: active ? theme.activeBg : 'transparent',
      }}
    >
      <Icon
        size={20}
        color={active ? theme.activeIcon : theme.inactiveIcon}
        strokeWidth={active ? 2.4 : 2}
      />
      <Text
        style={{
          marginTop: 3,
          fontSize: 10,
          fontWeight: active ? '700' : '500',
          color: active ? theme.label : theme.labelInactive,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}