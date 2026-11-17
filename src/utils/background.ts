import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

import { setupNotifications } from "@/utils/notifications";
const TASK_NAME = "CHECK_DUE_TASKS";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Todo = {
  _id: string;
  title: string;
  status: string;
  dueDate: string;
};

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const ok = await setupNotifications();
    if (!ok) return BackgroundTask.BackgroundTaskResult.Failed;

    const token = await SecureStore.getItemAsync("accessToken");
    if (!token || !API_URL) {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const res = await fetch(`${API_URL}/todos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    const todos: Todo[] = json?.data ?? [];
    const now = Date.now();

    for (const todo of todos) {
      if (todo.status === "Done") continue;

      const due = new Date(todo.dueDate).getTime();
      if (Number.isNaN(due) || due > now) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task overdue",
          body: `${todo.title} due time finished`,
          data: {
            type: "task_overdue",
            taskId: todo._id,
            status: todo.status,
          },
        },
        trigger: null,
      });
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    console.log("background task error", e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerDueTasksBackgroundTask() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (isRegistered) return;

  await BackgroundTask.registerTaskAsync(TASK_NAME, {
    minimumInterval: 15,
  });
}
