import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

import PushNotificationManager from "@/components/PushNotificationManager";

import { store } from "@/store";
import "@/utils/background";
import { registerDueTasksBackgroundTask } from "@/utils/background";
import "@/utils/notifications";
import { getAuthSession } from "@/utils/tokenStorage";

function RootNavigator() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAuthSession();

        if (token) {
          try {
            await registerDueTasksBackgroundTask();
          } catch (error) {
            console.log("background task register failed:", error);
          }
          router.replace("/(tabs)/Home");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.replace("/login");
      }
    };

    void checkAuth();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PushNotificationManager>
          <RootNavigator />
          <Toast topOffset={50} />
        </PushNotificationManager>
      </Provider>
    </SafeAreaProvider>
  );
}
