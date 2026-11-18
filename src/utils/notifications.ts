import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type TaskNotificationData = {
  type:
    | "task_created"
    | "task_updated"
    | "task_deleted"
    | "task_overdue"
    | "task_reminder";
  taskId: string;
  status: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const granted = await setupNotifications();
  if (!granted) return null;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("Missing EAS projectId");
      return null;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log("Expo Push Token:", data);
    return data;
  } catch (error) {
    console.log("getExpoPushToken error:", error);
    return null;
  }
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  try {
    // Keep options minimal — Expo Go can crash on some channel fields (NPE).
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  } catch (error) {
    console.log("setNotificationChannelAsync failed (Expo Go):", error);
  }
}

export async function setupNotifications() {
  await ensureAndroidChannel();

  if (!Device.isDevice) {
    console.warn("Notifications work best on a physical device");
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    return true;
  } catch (error) {
    console.log("setupNotifications error:", error);
    return false;
  }
}

export async function sendLocalTaskNotification(input: {
  type: TaskNotificationData["type"];
  taskId: string;
  title: string;
  status: string;
}) {
  try {
    const granted = await setupNotifications();
    if (!granted) return;

    const titles = {
      task_created: "New task",
      task_updated: "Task updated",
      task_deleted: "Task deleted",
      task_overdue: "Task Overdue",
      task_reminder: "Task Reminder",
    };

    const bodies = {
      task_created: `${input.title} was created`,
      task_updated: `${input.title} is now ${input.status}`,
      task_deleted: `${input.title} was deleted`,
      task_overdue: `${input.title} due time finished`,
      task_reminder: `${input.title} is due soon`,
    };

    // trigger: null avoids Expo Go channel manager crashes
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titles[input.type],
        body: bodies[input.type],
        sound: true,
        data: {
          type: input.type,
          taskId: input.taskId,
          status: input.status,
        } satisfies TaskNotificationData,
      },
      trigger: null,
    });
  } catch (error) {
    console.log("sendLocalTaskNotification error:", error);
  }
}
