import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FormDataProvider } from "../hooks/FormDataConextApi";

export default function RootLayout() {
  useFonts({
    outfit: require("./../assets/fonts/Outfit-Regular.ttf"),
    "outfit-medium": require("./../assets/fonts/Outfit-Medium.ttf"),
    "outfit-bold": require("./../assets/fonts/Outfit-Bold.ttf"),
  });
  return (
    <FormDataProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="records/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="search-record/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="service-operator/index" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </FormDataProvider>
  );
}
