import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import Card from "@/components/Card";
import { ErrorField } from "@/components/ErrorField";
import { Feild } from "@/components/Feild";
import { Button, Input, PasswordInput } from "@/components/ui";
import { useLoginMutation } from "@/redux";
import type { LoginRequest } from "@/types";
import { captureCurrentLocation } from "@/utils/profileSetup";
import { registerPushTokenWithBackend } from "@/utils/pushToken";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { saveAuthSession } from "@/utils/tokenStorage";

const Login = () => {
  const { control, handleSubmit } = useForm<LoginRequest>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (data: LoginRequest) => {
    try {
      const result = await login(data).unwrap();

      await saveAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });

      await registerPushTokenWithBackend();

      try {
        await captureCurrentLocation();
      } catch (locationError) {
        console.log("location error", locationError);
      }

      showSuccessToast({
        title: "Welcome",
        message: "Take a profile photo to continue",
      });

      router.replace("/camera");
    } catch (error) {
      console.log("login error", error);
      showErrorToast({
        title: "Login failed",
        message:
          error instanceof Error ? error.message : "Invalid email or password",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Card title="Welcome again">
          <Text style={styles.hint}>
            After login, take a profile photo with the camera and allow location
            for your header.
          </Text>

          <Controller
            name="email"
            control={control}
            rules={{ required: "Email is required" }}
            render={({ field, fieldState }) => (
              <Feild>
                <Input
                  label="Email"
                  required
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  returnKeyType="next"
                />
                <ErrorField>{fieldState.error?.message}</ErrorField>
              </Feild>
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: "Password is required" }}
            render={({ field, fieldState }) => (
              <Feild>
                <PasswordInput
                  label="Password"
                  required
                  placeholder="Enter your password"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  returnKeyType="next"
                />
                <ErrorField>{fieldState.error?.message}</ErrorField>
              </Feild>
            )}
          />

          <Button loading={isLoading} onPress={handleSubmit(onSubmit)}>
            Login
          </Button>
        </Card>

        <Link href="/SignUp" style={styles.link}>
          Don't have an account? Sign Up
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F5F8F4",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  hint: {
    color: "#717171",
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: "#267138",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
