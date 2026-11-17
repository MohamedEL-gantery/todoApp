import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

const Select = ({
  label,
  required = false,
  disabled = false,
  value,
  options,
  onValueChange,
  placeholder,
  style,
}: SelectProps) => {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "";

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <Pressable
        disabled={disabled}
        style={[styles.input, style]}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={selectedLabel ? styles.value : styles.placeholder}>
          {selectedLabel || placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#717171"
        />
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          {options.map((item) => {
            const isSelected = item.value === value;

            return (
              <Pressable
                key={item.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(item.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default Select;

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
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    color: "#222",
    fontSize: 14,
    flex: 1,
  },
  placeholder: {
    color: "#999",
    fontSize: 14,
    flex: 1,
  },
  dropdown: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDDC6",
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0EA",
  },
  optionSelected: {
    backgroundColor: "#F5F8F4",
  },
  optionText: {
    color: "#222",
    fontSize: 14,
  },
  optionTextSelected: {
    color: "#267138",
    fontWeight: "600",
  },
});
