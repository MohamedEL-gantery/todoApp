import { type ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Button } from "@/components/ui";

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  confirmButtonStyle?: StyleProp<ViewStyle>;
  cancelButtonStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const AlertModal = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  style,
  titleStyle,
  messageStyle,
  confirmButtonStyle,
  cancelButtonStyle,
  children,
}: AlertModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={[styles.card, style]} onPress={() => undefined}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, messageStyle]}>{message}</Text>
          ) : null}
          {children}
          <View style={styles.actions}>
            <Button
              onPress={onCancel}
              style={[
                styles.actionButton,
                styles.cancelButton,
                cancelButtonStyle,
              ]}
            >
              {cancelText}
            </Button>
            <Button
              loading={loading}
              onPress={onConfirm}
              style={[
                styles.actionButton,
                styles.confirmButton,
                confirmButtonStyle,
              ]}
            >
              {confirmText}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDDC6",
    padding: 20,
    gap: 12,
  },
  title: {
    color: "#222",
    fontSize: 18,
    fontWeight: "600",
  },
  message: {
    color: "#717171",
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#717171",
    borderColor: "#717171",
  },
  confirmButton: {
    backgroundColor: "#B00020",
    borderColor: "#B00020",
  },
});
