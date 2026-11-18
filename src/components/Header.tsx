import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  clearAuthSession,
  getAuthSession,
  getProfileImageUri,
  getUserLocation,
} from "@/utils/tokenStorage";

import { unregisterPushTokenFromBackend } from "@/utils/pushToken";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Header = () => {
  const [userName, setUserName] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [greeting] = useState(getGreeting);

  useFocusEffect(
    useCallback(() => {
      const loadHeaderData = async () => {
        const [session, profileImage, location] = await Promise.all([
          getAuthSession(),
          getProfileImageUri(),
          getUserLocation(),
        ]);

        setUserName(session?.user.name ?? "");
        setImageUri(profileImage);
        setLocationLabel(location?.label ?? "");
      };

      void loadHeaderData();
    }, []),
  );

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await unregisterPushTokenFromBackend();
      await clearAuthSession();
      setImageUri(null);
      setUserName("");
      setLocationLabel("");
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userBlock}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        )}

        <View style={styles.textBlock}>
          <Text style={styles.greeting} numberOfLines={1}>
            {greeting}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {userName || "User"}
          </Text>
          {!!locationLabel && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#267138" />
              <Text style={styles.location} numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        disabled={isLoggingOut}
        style={[styles.logoutButton, isLoggingOut && styles.logoutDisabled]}
      >
        <Ionicons name="log-out-outline" size={20} color="#B00020" />
      </Pressable>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#BFDDC6",
  },
  userBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#267138",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    color: "#717171",
    fontSize: 11,
    fontWeight: "500",
  },
  name: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    flex: 1,
    color: "#717171",
    fontSize: 12,
  },
  logoutButton: {
    width: 30,
    height: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F2C0C7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logoutDisabled: {
    opacity: 0.6,
  },
});
