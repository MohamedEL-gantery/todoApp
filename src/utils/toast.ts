import Toast from "react-native-toast-message";

type ToastOptions = {
  title: string;
  message?: string;
};

export const showSuccessToast = ({ title, message }: ToastOptions) => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 2500,
  });
};

export const showErrorToast = ({ title, message }: ToastOptions) => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 3000,
  });
};
