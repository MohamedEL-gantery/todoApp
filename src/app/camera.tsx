import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { saveProfileImage } from "@/utils/tokenStorage";

const CameraScreen = () => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        showErrorToast({
          title: "Capture failed",
          message: "Could not take profile photo",
        });
        return;
      }

      const savedUri = await saveProfileImage(photo.uri);
      if (!savedUri) {
        showErrorToast({
          title: "Save failed",
          message: "Could not save profile photo",
        });
        return;
      }

      showSuccessToast({
        title: "Photo saved",
        message: "Profile photo updated",
      });
      router.replace("/(tabs)/Home");
    } catch (error) {
      console.log("camera capture error", error);
      showErrorToast({
        title: "Capture failed",
        message: "Could not take profile photo",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionScreen, { paddingTop: insets.top + 24 }]}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={36} color="#267138" />
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            Allow camera access to take your profile photo.
          </Text>
          <Button onPress={requestPermission}>Grant permission</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mirror={facing === "front"}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Profile photo</Text>
        <Pressable
          style={styles.flipButton}
          onPress={() =>
            setFacing((current) => (current === "back" ? "front" : "back"))
          }
        >
          <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          style={[styles.shutter, isCapturing && styles.shutterDisabled]}
          onPress={handleCapture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#267138" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>
        <Text style={styles.hint}>Take a clear photo for your profile</Text>
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    ...StyleSheet.absoluteFill,
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: "#F5F8F4",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  permissionCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#BFDDC6",
    borderRadius: 12,
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  permissionTitle: {
    color: "#222",
    fontSize: 18,
    fontWeight: "600",
  },
  permissionText: {
    color: "#717171",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    gap: 12,
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  shutterDisabled: {
    opacity: 0.7,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  hint: {
    color: "#fff",
    fontSize: 13,
  },
});
