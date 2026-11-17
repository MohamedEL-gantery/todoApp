import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface DatePickerProps {
  label?: ReactNode;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const DatePicker = ({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  style,
}: DatePickerProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    setShowPicker(false);
    onChange(formatDate(selectedDate));
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
        style={[styles.input, style]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display="default"
          onValueChange={handleValueChange}
          onDismiss={() => setShowPicker(false)}
        />
      )}
    </View>
  );
};

export default DatePicker;

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
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  value: {
    color: "#222",
    fontSize: 14,
  },
  placeholder: {
    color: "#717171",
    fontSize: 14,
  },
});
