import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: ReactNode;
  placeholder?: string;
  required?: boolean;
  style?: StyleProp<TextStyle>;
}

const Input = ({
  label,
  required,
  style,
  placeholder,
  ...props
}: InputProps) => {
  return (
    <>
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
          {...props}
        />
      </View>
    </>
  );
};

export default Input;

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
    height: 30,
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#BFDDC6",
    color: "#222",
    fontSize: 14,
    fontWeight: "400",
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
});
