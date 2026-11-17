import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthUser } from "@/types";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const PROFILE_IMAGE_KEY = "profileImageUri";
const LOCATION_KEY = "userLocation";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type StoredLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

const canUseSecureStore = Platform.OS !== "web";

export async function saveAuthSession(session: AuthSession) {
  if (!canUseSecureStore) return;

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
}

export async function getAuthSession(): Promise<AuthSession | null> {
  if (!canUseSecureStore) return null;

  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  const userJson = await SecureStore.getItemAsync(USER_KEY);

  if (!accessToken || !refreshToken || !userJson) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user: JSON.parse(userJson) as AuthUser,
  };
}

export async function saveProfileImage(sourceUri: string) {
  if (!canUseSecureStore || !FileSystem.documentDirectory) return null;

  const previousUri = await SecureStore.getItemAsync(PROFILE_IMAGE_KEY);
  if (previousUri) {
    try {
      await FileSystem.deleteAsync(previousUri, { idempotent: true });
    } catch {
      // ignore missing previous file
    }
  }

  const extension = sourceUri.split(".").pop()?.split("?")[0] || "jpg";
  const destination = `${FileSystem.documentDirectory}profile-${Date.now()}.${extension}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destination,
  });

  await SecureStore.setItemAsync(PROFILE_IMAGE_KEY, destination);
  return destination;
}

export async function getProfileImageUri() {
  if (!canUseSecureStore) return null;
  return SecureStore.getItemAsync(PROFILE_IMAGE_KEY);
}

export async function saveUserLocation(location: StoredLocation) {
  if (!canUseSecureStore) return;
  await SecureStore.setItemAsync(LOCATION_KEY, JSON.stringify(location));
}

export async function getUserLocation(): Promise<StoredLocation | null> {
  if (!canUseSecureStore) return null;

  const value = await SecureStore.getItemAsync(LOCATION_KEY);
  if (!value) return null;

  return JSON.parse(value) as StoredLocation;
}

export async function clearAuthSession() {
  if (!canUseSecureStore) return;

  const imageUri = await SecureStore.getItemAsync(PROFILE_IMAGE_KEY);
  if (imageUri) {
    try {
      await FileSystem.deleteAsync(imageUri, { idempotent: true });
    } catch {
      // ignore missing file
    }
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  await SecureStore.deleteItemAsync(PROFILE_IMAGE_KEY);
  await SecureStore.deleteItemAsync(LOCATION_KEY);
}
