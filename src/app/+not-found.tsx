import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import Card from "@/components/Card";
import { Button } from "@/components/ui";

const NotFound = () => {
  return (
    <>
      <View style={styles.container}>
        <Card title="Page not found">
          <Text style={styles.message}>
            This screen does not exist. Check the URL or go back home.
          </Text>

          <Button onPress={() => router.replace("/(tabs)/Home")}>
            Go to Home
          </Button>
        </Card>
      </View>
    </>
  );
};

export default NotFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F8F4",
  },
  message: {
    color: "#717171",
    fontSize: 14,
    lineHeight: 20,
  },
});
