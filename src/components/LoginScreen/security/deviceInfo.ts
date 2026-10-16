import { Platform, Dimensions } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';
import * as Application from 'expo-application';

const DEVICE_ID_KEY = 'deviceId';

export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  let id: string;
  if (Platform.OS === 'android') {
    id = Application.getAndroidId() ?? generateUuid();
  } else {
    id = (await Application.getIosIdForVendorAsync()) ?? generateUuid();
  }

  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}

function generateUuid(): string {
  try {
    const Crypto = require('expo-crypto');
    if (Crypto?.randomUUID) return Crypto.randomUUID();
  } catch {
    // fall through
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Mirrors the shape of your web app's login payload (deviceId, date,
 * time, userAgent, platform, language, timeZone, screen) using RN/Expo
 * equivalents instead of navigator/window/Bowser.
 */
export async function getDeviceContext() {
  const now = new Date();
  const { width, height } = Dimensions.get('window');
  const deviceId = await getDeviceId();

  return {
    deviceId,
    date: now.toLocaleDateString('en-GB'),
    time: now.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }),
    userAgent: `${Device.modelName ?? 'mobile'} / ${Device.osName ?? Platform.OS} ${Device.osVersion ?? ''}`.trim(),
    platform: Platform.OS,
    language: Localization.getLocales()[0]?.languageTag ?? 'en-US',
    timeZone: Localization.getCalendars()[0]?.timeZone ?? 'UTC',
    screen: `${Math.round(width)}x${Math.round(height)}`,
  };
}