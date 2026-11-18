import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, type PropsWithChildren } from "react";

import {
  setupNotifications,
  type TaskNotificationData,
} from "@/utils/notifications";
import { showSuccessToast } from "@/utils/toast";

function handleNotificationData(data: TaskNotificationData) {
  if (!data?.type) return;

  router.push({
    pathname: "/(tabs)/Task",
    params: data.status ? { status: data.status } : undefined,
  });
}

const PushNotificationManager = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    void setupNotifications();

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const content = notification.request.content;
        const data = content.data as TaskNotificationData;

        console.log("Notification Received:", data);

        // Foreground fallback: Expo Go often skips the system banner while app is open.
        showSuccessToast({
          title: content.title ?? "Notification",
          message: content.body ?? undefined,
        });
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content
          .data as TaskNotificationData;

        console.log("Notification Tapped:", data);
        handleNotificationData(data);
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return <>{children}</>;
};

export default PushNotificationManager;
