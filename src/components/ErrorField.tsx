import { type ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

interface ErrorFieldProps {
  children: ReactNode;
}

export const ErrorField = ({ children }: ErrorFieldProps) => {
  return <Text style={styles.container}>{children}</Text>;
};

const styles = StyleSheet.create({
  container: {
    fontSize: 14,
    color: "red",
    fontWeight: "400",
  },
});
