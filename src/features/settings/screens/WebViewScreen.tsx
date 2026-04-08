import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { AppStackScreenProps } from "src/navigation/types";

const WebViewScreen = ({ route }: AppStackScreenProps<"WebView">) => {
  const { url, title } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
        title={title}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default WebViewScreen;
