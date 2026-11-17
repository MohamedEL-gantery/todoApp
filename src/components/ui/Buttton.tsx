import { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button = ({
  children,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[styles.container, (loading || disabled) && styles.loading, style]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text style={[styles.text, textStyle]}>
        {loading ? "loading..." : children}
      </Text>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#267138",
    height: 30,
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#BFDDC6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  loading: {
    opacity: 0.6,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
  },
});
