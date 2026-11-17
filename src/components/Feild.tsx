import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface FeildProps {
  children: ReactNode;
}

export const Feild = ({ children }: FeildProps) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
