import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ProgressCard from "@/components/ProgressCard";
import { useGetTodosQuery } from "@/redux";
import type { TaskStatus } from "@/types";
import { showErrorToast } from "@/utils/toast";

const STATUS_CARDS: {
  title: string;
  status: TaskStatus;
  icon: "list-outline" | "time-outline" | "checkmark-done-outline";
  color: string;
  backgroundColor: string;
}[] = [
  {
    title: "To Do",
    status: "To Do",
    icon: "list-outline",
    color: "#5B6B7A",
    backgroundColor: "#EEF1F4",
  },
  {
    title: "In Progress",
    status: "In Progress",
    icon: "time-outline",
    color: "#C47A12",
    backgroundColor: "#FFF4E5",
  },
  {
    title: "Done",
    status: "Done",
    icon: "checkmark-done-outline",
    color: "#267138",
    backgroundColor: "#EAF5EC",
  },
];

const Home = () => {
  const { data, isLoading, refetch } = useGetTodosQuery();
  const [refreshing, setRefreshing] = useState(false);

  const todos = data?.data ?? [];
  const totalTasks = todos.length;
  const doneTasks = todos.filter((todo) => todo.status === "Done").length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const getCountByStatus = (status: TaskStatus) =>
    todos.filter((todo) => todo.status === status).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCardPress = (status: TaskStatus, title: string) => {
    const count = getCountByStatus(status);

    if (count === 0) {
      showErrorToast({
        title: "No tasks",
        message: `There are no "${title}" tasks yet.`,
      });
      return;
    }

    router.push({
      pathname: "/(tabs)/Task",
      params: { status },
    });
  };

  if (isLoading && !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#267138" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#267138"
          colors={["#267138"]}
        />
      }
    >
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressMeta}>
          {doneTasks} of {totalTasks} tasks done
        </Text>
      </View>

      <View style={styles.statusRow}>
        {STATUS_CARDS.map((card) => (
          <ProgressCard
            key={card.status}
            title={card.title}
            value={String(getCountByStatus(card.status))}
            icon={card.icon}
            color={card.color}
            backgroundColor={card.backgroundColor}
            onPress={() => handleCardPress(card.status, card.title)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 16,
  },
  progressCard: {
    width: "100%",
    padding: 14,
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#BFDDC6",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTitle: {
    color: "#717171",
    fontSize: 13,
    fontWeight: "500",
  },
  progressPercent: {
    color: "#267138",
    fontSize: 22,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E8F0EA",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#267138",
  },
  progressMeta: {
    color: "#717171",
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
