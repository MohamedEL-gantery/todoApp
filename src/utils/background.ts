import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

import { setupNotifications } from "@/utils/notifications";

const TASK_NAME = "CHECK_DUE_TASKS";
const SENT_KEY = "dueNotificationSent";
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const REMINDER_WINDOW_MS = 60 * 60 * 1000; // 1 hour before due

type Todo = {
  _id: string;
  title: string;
  status: string;
  dueDate: string;
};

type SentMap = Record<string, "task_reminder" | "task_overdue">;

export type DueCheckResult = {
  ok: boolean;
  reason?: string;
  reminderCount: number;
  overdueCount: number;
  todosChecked: number;
};

async function getSentMap(): Promise<SentMap> {
  const raw = await SecureStore.getItemAsync(SENT_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as SentMap;
  } catch {
    return {};
  }
}

async function markSent(
  sent: SentMap,
  taskId: string,
  type: "task_reminder" | "task_overdue",
) {
  sent[`${type}:${taskId}`] = type;
  await SecureStore.setItemAsync(SENT_KEY, JSON.stringify(sent));
}

function alreadySent(
  sent: SentMap,
  taskId: string,
  type: "task_reminder" | "task_overdue",
) {
  return !!sent[`${type}:${taskId}`];
}

export async function runDueTasksCheck(options?: {
  ignoreSent?: boolean;
}): Promise<DueCheckResult> {
  const ignoreSent = options?.ignoreSent ?? false;

  const ok = await setupNotifications();
  if (!ok) {
    return {
      ok: false,
      reason: "Notification permission not granted",
      reminderCount: 0,
      overdueCount: 0,
      todosChecked: 0,
    };
  }

  const token = await SecureStore.getItemAsync("accessToken");
  if (!token) {
    return {
      ok: false,
      reason: "No access token",
      reminderCount: 0,
      overdueCount: 0,
      todosChecked: 0,
    };
  }

  if (!API_URL) {
    return {
      ok: false,
      reason: "Missing EXPO_PUBLIC_API_URL",
      reminderCount: 0,
      overdueCount: 0,
      todosChecked: 0,
    };
  }

  const res = await fetch(`${API_URL}/todos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return {
      ok: false,
      reason: `Todos API failed (${res.status})`,
      reminderCount: 0,
      overdueCount: 0,
      todosChecked: 0,
    };
  }

  const json = await res.json();
  const todos: Todo[] = json?.data ?? [];
  const now = Date.now();
  const sent = ignoreSent ? {} : await getSentMap();

  let reminderCount = 0;
  let overdueCount = 0;

  console.log(
    "Due check todos:",
    todos.length,
    "now:",
    new Date(now).toISOString(),
  );

  for (const todo of todos) {
    if (todo.status === "Done") continue;

    const due = new Date(todo.dueDate).getTime();
    if (Number.isNaN(due)) {
      console.log("Invalid dueDate:", todo._id, todo.dueDate);
      continue;
    }

    console.log(
      "Todo:",
      todo.title,
      "due:",
      todo.dueDate,
      "status:",
      todo.status,
    );

    // 1) Overdue
    if (due <= now) {
      if (!ignoreSent && alreadySent(sent, todo._id, "task_overdue")) {
        console.log("Skip overdue already sent:", todo._id);
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Overdue",
          body: `${todo.title} due time finished`,
          data: {
            type: "task_overdue",
            taskId: todo._id,
            status: todo.status,
          },
        },
        trigger: null,
      });

      await markSent(sent, todo._id, "task_overdue");
      overdueCount++;
      continue;
    }

    // 2) Reminder within 1 hour
    if (due - now <= REMINDER_WINDOW_MS) {
      if (!ignoreSent && alreadySent(sent, todo._id, "task_reminder")) {
        console.log("Skip reminder already sent:", todo._id);
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Reminder",
          body: `${todo.title} is due soon`,
          data: {
            type: "task_reminder",
            taskId: todo._id,
            status: todo.status,
          },
        },
        trigger: null,
      });

      await markSent(sent, todo._id, "task_reminder");
      reminderCount++;
    }
  }

  return {
    ok: true,
    reminderCount,
    overdueCount,
    todosChecked: todos.length,
    reason:
      reminderCount + overdueCount === 0
        ? "No tasks due soon or overdue (or already notified)"
        : undefined,
  };
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const result = await runDueTasksCheck();
    console.log("Background due check result:", result);
    return result.ok
      ? BackgroundTask.BackgroundTaskResult.Success
      : BackgroundTask.BackgroundTaskResult.Failed;
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
