import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface CardProps {
  title: string;
  children: ReactNode;
}

const Card = ({ children, title }: CardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 14,
    gap: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#BFDDC6",
  },
  title: {
    color: "#222",
    fontSize: 16,
    fontWeight: "600",
  },
  childrenContainer: {
    gap: 12,
  },
});
