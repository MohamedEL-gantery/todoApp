import { type ReactNode } from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

interface TextAreaProps extends TextInputProps {
  label?: ReactNode;
  required?: boolean;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

const TextArea = ({
  label,
  required,
  placeholder,
  style,
  ...props
}: TextAreaProps) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TextInput
        style={[styles.input, style]}
        placeholder={placeholder}
        multiline
        textAlignVertical="top"
        {...props}
      />
    </View>
  );
};

export default TextArea;

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
  input: {
    backgroundColor: "#fff",
    minHeight: 56,
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#BFDDC6",
    color: "#222",
    fontSize: 14,
    fontWeight: "400",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
