import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDatabase } from "@/db/context/DatabaseContext";

export function DatabaseErrorModal() {
  const { migrationError, handleRetry, handleReset, isResetting } =
    useDatabase();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!migrationError) return null;

  const onRetryPress = async () => {
    try {
      setIsRetrying(true);
      await handleRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const onResetPress = () => {
    Alert.alert(
      "Reset Local Storage?",
      "This will clear locally stored profile feeds and cached offline data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Data",
          style: "destructive",
          onPress: handleReset,
        },
      ],
    );
  };

  const isBusy = isResetting || isRetrying;

  return (
    <Modal visible={!!migrationError} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Database Sync Issue</Text>
          <Text style={styles.body}>
            We encountered a problem setting up local storage. You can retry
            reconnecting or reset local storage to clear cached data.
          </Text>

          {__DEV__ && migrationError?.message && (
            <Text style={styles.errorDetails}>
              Debug Error: {migrationError.message}
            </Text>
          )}

          <View style={styles.actions}>
            {isBusy ? (
              <ActivityIndicator size="small" color="#d9534f" />
            ) : (
              <>
                <Button
                  title="Retry Reload"
                  onPress={onRetryPress}
                  disabled={isBusy}
                />
                <View style={styles.spacer} />
                <Button
                  title="Reset Local Storage"
                  color="#d9534f"
                  onPress={onResetPress}
                  disabled={isBusy}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  body: { fontSize: 14, color: "#444", marginBottom: 20 },
  errorDetails: {
    fontSize: 12,
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  actions: { marginTop: 10 },
  spacer: { height: 10 },
});
