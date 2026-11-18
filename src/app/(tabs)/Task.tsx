import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AlertModal from "@/components/AlertModal";
import Card from "@/components/Card";
import { ErrorField } from "@/components/ErrorField";
import { Feild } from "@/components/Feild";
import { Button, DatePicker, Input, Select, TextArea } from "@/components/ui";
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useGetTodosQuery,
  useUpdateTodoMutation,
} from "@/redux";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
  type Todo,
} from "@/types";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

import { sendLocalTaskNotification } from "@/utils/notifications";

type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

const statusOptions = [
  { label: "All", value: "" },
  ...TASK_STATUSES.map((status) => ({ label: status, value: status })),
];

const formStatusOptions = TASK_STATUSES.map((status) => ({
  label: status,
  value: status,
}));

const priorityOptions = TASK_PRIORITIES.map((priority) => ({
  label: priority,
  value: priority,
}));

const STATUS_BADGE: Record<
  TaskStatus,
  { backgroundColor: string; color: string }
> = {
  "To Do": { backgroundColor: "#EEF1F4", color: "#5B6B7A" },
  "In Progress": { backgroundColor: "#FFF4E5", color: "#C47A12" },
  Done: { backgroundColor: "#EAF5EC", color: "#267138" },
};

const PRIORITY_BADGE: Record<
  TaskPriority,
  { backgroundColor: string; color: string }
> = {
  Low: { backgroundColor: "#EAF5EC", color: "#267138" },
  Medium: { backgroundColor: "#FFF4E5", color: "#C47A12" },
  High: { backgroundColor: "#FDECEC", color: "#B00020" },
};

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "",
};

const Task = () => {
  const { status: statusParam } = useLocalSearchParams<{ status?: string }>();
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Todo | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const lastLoadedPage = useRef(0);
  const limit = 10;

  useEffect(() => {
    if (typeof statusParam === "string" && statusParam) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  const queryArgs = {
    page,
    limit,
    ...(statusFilter ? { status: statusFilter as TaskStatus } : {}),
  };

  const { data, isLoading, isFetching, isSuccess, refetch } =
    useGetTodosQuery(queryArgs);

  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation();
  const [updateTodo, { isLoading: isUpdating }] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();

  const { control, handleSubmit, reset } = useForm<TaskFormValues>({
    defaultValues,
  });

  const hasMore = page < totalPages;
  const isLoadingMore = isFetching && page > 1;

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate.slice(0, 10),
      });
      setShowForm(true);
    }
  }, [editingTask, reset]);

  useEffect(() => {
    setPage(1);
    setTodos([]);
    setTotalPages(1);
    lastLoadedPage.current = 0;
  }, [statusFilter]);

  useEffect(() => {
    if (!isSuccess || isFetching || !data?.data) return;

    // Ignore stale response from another page
    if (typeof data.page === "number" && data.page !== page) return;
    if (lastLoadedPage.current === page) return;

    lastLoadedPage.current = page;
    if (typeof data.totalPages === "number") {
      setTotalPages(data.totalPages);
    } else if (data.data.length < limit) {
      setTotalPages(page);
    } else {
      setTotalPages(page + 1);
    }

    setTodos((prev) => {
      if (page === 1) return data.data;

      const existingIds = new Set(prev.map((todo) => todo._id));
      const nextItems = data.data.filter((todo) => !existingIds.has(todo._id));
      return [...prev, ...nextItems];
    });
  }, [data, page, isFetching, isSuccess, limit]);

  const loadMore = () => {
    if (isFetching || !hasMore || lastLoadedPage.current !== page) return;
    setPage((p) => p + 1);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    lastLoadedPage.current = 0;
    try {
      const result = await refetch();
      if (result.data?.data) {
        setTodos(result.data.data);
        if (typeof result.data.totalPages === "number") {
          setTotalPages(result.data.totalPages);
        }
        lastLoadedPage.current = 1;
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    reset(defaultValues);
  };

  const openCreateForm = () => {
    setEditingTask(null);
    reset(defaultValues);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTodo(taskToDelete._id).unwrap();

      setTaskToDelete(null);
      showSuccessToast({
        title: "Success",
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.log("et", error);
      showErrorToast({
        title: "Error",
        message: "Could not delete task",
      });
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    try {
      if (editingTask) {
        await updateTodo({
          id: editingTask._id,
          data: values,
        }).unwrap();
        showSuccessToast({
          title: "Success",
          message: "Task updated successfully",
        });
      } else {
        const res = await createTodo(values).unwrap();
        showSuccessToast({
          title: "Success",
          message: "Task created successfully",
        });

        void sendLocalTaskNotification({
          type: "task_created",
          taskId: res._id,
          title: res.title,
          status: res.status ?? values.status,
        });
      }

      closeForm();
    } catch (error) {
      console.log("et", error);
      showErrorToast({
        title: "Error",
        message: editingTask
          ? "Could not update task"
          : "Could not create task",
      });
    }
  };

  const showInitialLoader = isLoading && !data;

  return (
    <View style={styles.container}>
      <Select
        label="Filter by status"
        value={statusFilter}
        options={statusOptions}
        onValueChange={setStatusFilter}
        placeholder="All"
      />

      {showInitialLoader ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#267138" />
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.list,
            todos.length === 0 && styles.emptyList,
          ]}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                color="#267138"
                style={{ marginVertical: 12 }}
              />
            ) : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#267138"
              colors={["#267138"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="briefcase-outline" size={32} color="#267138" />
              </View>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyText}>
                Create a task to get started, or change the status filter.
              </Text>
              <Button onPress={openCreateForm} style={styles.emptyButton}>
                Create new task
              </Button>
            </View>
          }
          renderItem={({ item }) => {
            const statusStyle = STATUS_BADGE[item.status];
            const priorityStyle = PRIORITY_BADGE[item.priority];

            return (
              <View style={styles.taskCard}>
                <Pressable
                  style={styles.deleteIcon}
                  hitSlop={10}
                  onPress={() => setTaskToDelete(item)}
                >
                  <Ionicons name="trash-outline" size={20} color="#B00020" />
                </Pressable>

                <Pressable onPress={() => setEditingTask(item)}>
                  <Card title={item.title}>
                    <Text style={styles.meta} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: statusStyle.backgroundColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: statusStyle.color },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: priorityStyle.backgroundColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: priorityStyle.color },
                          ]}
                        >
                          {item.priority}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dueRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#717171"
                      />
                      <Text style={styles.dueText}>
                        {item.dueDate.slice(0, 10)}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              </View>
            );
          }}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={openCreateForm}
        accessibilityRole="button"
        accessibilityLabel="Create new task"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showForm} transparent onRequestClose={closeForm}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Card title={editingTask ? "Update task" : "Create new task"}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field, fieldState }) => (
                    <Feild>
                      <Input
                        label="Title"
                        required
                        placeholder="Enter title"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                      />
                      <ErrorField>{fieldState.error?.message}</ErrorField>
                    </Feild>
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field, fieldState }) => (
                    <Feild>
                      <TextArea
                        label="Description"
                        required
                        placeholder="Enter description"
                        value={field.value}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                      />
                      <ErrorField>{fieldState.error?.message}</ErrorField>
                    </Feild>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field, fieldState }) => (
                    <Feild>
                      <Select
                        label="Status"
                        required
                        value={field.value}
                        options={formStatusOptions}
                        onValueChange={field.onChange}
                      />
                      <ErrorField>{fieldState.error?.message}</ErrorField>
                    </Feild>
                  )}
                />

                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: "Priority is required" }}
                  render={({ field, fieldState }) => (
                    <Feild>
                      <Select
                        label="Priority"
                        required
                        value={field.value}
                        options={priorityOptions}
                        onValueChange={field.onChange}
                      />
                      <ErrorField>{fieldState.error?.message}</ErrorField>
                    </Feild>
                  )}
                />

                <Controller
                  name="dueDate"
                  control={control}
                  rules={{ required: "Due date is required" }}
                  render={({ field, fieldState }) => (
                    <Feild>
                      <DatePicker
                        label="Due date"
                        required
                        placeholder="Select due date"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <ErrorField>{fieldState.error?.message}</ErrorField>
                    </Feild>
                  )}
                />

                <View style={styles.formActions}>
                  <Button
                    onPress={closeForm}
                    style={[styles.formActionButton, styles.cancelButton]}
                    textStyle={styles.cancelButtonText}
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={isCreating || isUpdating}
                    onPress={handleSubmit(onSubmit)}
                    style={styles.formActionButton}
                  >
                    {editingTask ? "Update task" : "Create task"}
                  </Button>
                </View>
              </Card>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AlertModal
        visible={!!taskToDelete}
        title="Delete task"
        message={`Delete "${taskToDelete?.title ?? ""}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        style={styles.alertCard}
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        confirmButtonStyle={styles.alertConfirmButton}
        cancelButtonStyle={styles.alertCancelButton}
      />
    </View>
  );
};

export default Task;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: 12,
    paddingBottom: 88,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  meta: {
    color: "#717171",
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueText: {
    color: "#717171",
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAF5EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: "#222",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#717171",
    fontSize: 13,
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: 8,
    width: "auto",
    paddingHorizontal: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#267138",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
  },
  formActionButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderColor: "#BFDDC6",
  },
  cancelButtonText: {
    color: "#267138",
  },
  taskCard: {
    position: "relative",
  },
  deleteIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    maxHeight: "90%",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalScroll: {
    paddingBottom: 16,
  },
  alertCard: {
    borderColor: "#F2C0C7",
  },
  alertTitle: {
    color: "#B00020",
  },
  alertMessage: {
    color: "#555",
  },
  alertConfirmButton: {
    backgroundColor: "#B00020",
    borderColor: "#B00020",
  },
  alertCancelButton: {
    backgroundColor: "#717171",
    borderColor: "#717171",
  },
});
