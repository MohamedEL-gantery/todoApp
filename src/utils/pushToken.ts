import { getExpoPushToken } from "@/utils/notifications";
import { getAuthSession } from "@/utils/tokenStorage";
import { Platform } from "react-native";

export async function registerPushTokenWithBackend() {
  const token = await getExpoPushToken();
  if (!token) return;

  const authToken = await getAuthSession();
  console.log("authToken", authToken);
  console.log("authToken-token", token);
  try {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/push/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken?.accessToken}`,
      },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch (error) {
    console.log("registerPushToken failed:", error);
  }
}

export async function unregisterPushTokenFromBackend() {
  const token = await getExpoPushToken();
  if (!token) return;

  const authToken = await getAuthSession();

  console.log("authToken-delete", authToken);
  console.log("authToken-token-delete", token);
  await fetch(`${process.env.EXPO_PUBLIC_API_URL}/push/token`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken?.accessToken}`,
    },
    body: JSON.stringify({ token }),
  });
  console.log("succes Delete");
}
