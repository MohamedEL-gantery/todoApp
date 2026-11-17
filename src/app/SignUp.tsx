import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

import Card from "@/components/Card";
import { ErrorField } from "@/components/ErrorField";
import { Feild } from "@/components/Feild";
import { Button, Input, PasswordInput } from "@/components/ui";
import { useRegisterMutation } from "@/redux";
import type { RegisterRequest } from "@/types";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

type SignUpForm = RegisterRequest & {
  passwordConfirm: string;
};

const SignUp = () => {
  const { control, handleSubmit, getValues } = useForm<SignUpForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const [register, { isLoading }] = useRegisterMutation();

  const onSubmit = async ({ passwordConfirm: _, ...data }: SignUpForm) => {
    try {
      await register(data).unwrap();
      showSuccessToast({
        title: "Success",
        message: "User registered successfully",
      });
      router.replace("/login");
    } catch (error) {
      console.log("e", error);
      showErrorToast({
        title: "Sign up failed",
        message: "Could not create account",
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
        <Card title="Create account">
          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field, fieldState }) => (
              <Feild>
                <Input
                  label="Name"
                  required
                  placeholder="Enter your name"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                />
                <ErrorField>{fieldState.error?.message}</ErrorField>
              </Feild>
            )}
          />

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
                />
                <ErrorField>{fieldState.error?.message}</ErrorField>
              </Feild>
            )}
          />

          <Controller
            name="passwordConfirm"
            control={control}
            rules={{
              required: "Password confirm is required",
              validate: (value) =>
                value === getValues("password") || "Passwords do not match",
            }}
            render={({ field, fieldState }) => (
              <Feild>
                <PasswordInput
                  label="Confirm Password"
                  required
                  placeholder="Confirm your password"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                />
                <ErrorField>{fieldState.error?.message}</ErrorField>
              </Feild>
            )}
          />

          <Button loading={isLoading} onPress={handleSubmit(onSubmit)}>
            Sign Up
          </Button>
        </Card>

        <Link href="/login" style={styles.link}>
          Already have an account? Sign In
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

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
  link: {
    color: "#267138",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
});
