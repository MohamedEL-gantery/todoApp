export const TASK_STATUSES = ["To Do", "In Progress", "Done"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Todo {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status?: TaskStatus;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface GetTodosParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page?: number;
  limit?: number;
}

export interface GetTodosResponse {
  status: string;
  data: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
