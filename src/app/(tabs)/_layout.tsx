import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Header from "@/components/Header";
import { useGetTodosQuery } from "@/redux";

const RootTabs = () => {
  const insets = useSafeAreaInsets();
  const { data } = useGetTodosQuery();
  const tasksCount = data?.data?.length ?? 0;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Header />
      <View style={styles.screen}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#267138",
            tabBarInactiveTintColor: "#717171",
            tabBarStyle: {
              backgroundColor: "#fff",
              borderTopColor: "#BFDDC6",
              borderTopWidth: 1,
              height: 54,
              paddingTop: 6,
              paddingBottom: 6,
              marginBottom: insets.bottom,
            },
            tabBarItemStyle: {
              justifyContent: "center",
              alignItems: "center",
            },
            tabBarIconStyle: {
              marginTop: 0,
              marginBottom: 0,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: "500",
              marginTop: 2,
              marginBottom: 0,
            },
          }}
        >
          <Tabs.Screen
            name="Home"
            options={{
              title: "Home",
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={24}
                  color={focused ? "#267138" : "#717171"}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="Task"
            options={{
              title: "My Tasks",
              tabBarBadge: tasksCount > 0 ? tasksCount : undefined,
              tabBarBadgeStyle: {
                backgroundColor: "#267138",
                color: "#fff",
                fontSize: 10,
                minWidth: 16,
                height: 16,
                lineHeight: 15,
                borderRadius: 8,
              },
              tabBarIcon: ({ focused }) => (
                <Ionicons
                  name={focused ? "briefcase" : "briefcase-outline"}
                  size={24}
                  color={focused ? "#267138" : "#717171"}
                />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
};

export default RootTabs;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F8F4",
  },
});
