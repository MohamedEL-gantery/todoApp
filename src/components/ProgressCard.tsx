import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProgressCardProps {
  title: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
}

const ProgressCard = ({
  value,
  title,
  icon,
  color = "#267138",
  backgroundColor = "#EAF5EC",
  onPress,
}: ProgressCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { borderColor: color },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor }]}>
        {icon ? <Ionicons name={icon} size={16} color={color} /> : null}
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
};

export default ProgressCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#717171",
    fontSize: 12,
    fontWeight: "500",
  },
  value: {
    color: "#222",
    fontSize: 24,
    fontWeight: "700",
  },
});
