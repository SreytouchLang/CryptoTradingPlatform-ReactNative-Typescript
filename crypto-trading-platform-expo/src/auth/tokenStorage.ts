import * as SecureStore from "expo-secure-store";

const KEY = "auth_token_v1";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
