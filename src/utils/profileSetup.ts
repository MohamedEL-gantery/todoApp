import * as Location from "expo-location";

import {
  saveUserLocation,
  type StoredLocation,
} from "@/utils/tokenStorage";

export async function captureCurrentLocation(): Promise<StoredLocation | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Location permission is required");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const places = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  const place = places[0];
  const label =
    [place?.city || place?.subregion, place?.country]
      .filter(Boolean)
      .join(", ") || "Current location";

  const location: StoredLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    label,
  };

  await saveUserLocation(location);
  return location;
}
