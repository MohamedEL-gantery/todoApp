import { useState, type ReactNode } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps extends TextInputProps {
  label?: ReactNode;
  required?: boolean;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
}

const PasswordInput = ({
  label,
  required,
  style,
  placeholder,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, style]}
          placeholder={placeholder}
          secureTextEntry={!showPassword}
          {...props}
        />

        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.toggle}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#717171"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 4,
  },
  label: {
    color: "#222",
    fontSize: 14,
    fontWeight: "500",
  },
  required: {
    color: "red",
  },
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    height: 30,
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#BFDDC6",
    color: "#222",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingRight: 40,
    paddingVertical: 0,
  },
  toggle: {
    position: "absolute",
    right: 12,
    top: 7,
  },
});
