import { ThemeProvider, DefaultTheme } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';


const BRAND = '#bb1f2d';

export function StudentTabs() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <NativeTabs
        tintColor={BRAND}
        backgroundColor="#FFFFFF"
        iconColor={{ default: '#98a2b3', selected: BRAND }}
        labelStyle={{ fontSize: 11, fontWeight: '600', color: '#98a2b3' }}
        blurEffect="systemMaterial"
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="courses">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'book', selected: 'book.fill' }}
            md="menu_book"
          />
          <NativeTabs.Trigger.Label>Courses</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        
      </NativeTabs>
    </ThemeProvider>
  );
}