import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let inMemoryAccessToken: string | null = null;

export async function setTokens(access: string, refresh?: string) {
  inMemoryAccessToken = access;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  if (refresh) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
  }
}
export async function getTokens() {
  const access = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

  console.log('[ACCESS TOKEN EXISTS]', !!access);
  console.log('[REFRESH TOKEN EXISTS]', !!refresh);

  return {
    access,
    refresh,
  };
}
export async function loadTokens() {
  if (!inMemoryAccessToken) {
    inMemoryAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }
  return inMemoryAccessToken;
}

export async function loadRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  inMemoryAccessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function hasAccessToken(): Promise<boolean> {
  return !!(await loadTokens());
}