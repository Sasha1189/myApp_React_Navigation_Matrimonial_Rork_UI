import React from "react";
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDatabase } from "@/db/context/DatabaseContext";

export function DatabaseErrorModal() {
  const { migrationError, handleRetry, handleReset, isResetting } =
    useDatabase();

  if (!migrationError) return null;

  return (
    <Modal visible={!!migrationError} transparent animationType="slide">
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
            {isResetting ? (
              <ActivityIndicator size="small" color="#d9534f" />
            ) : (
              <>
                <Button
                  title="Retry Reload"
                  onPress={handleRetry}
                  disabled={isResetting}
                />
                <View style={styles.spacer} />
                <Button
                  title="Reset Local Storage"
                  color="#d9534f"
                  onPress={handleReset}
                  disabled={isResetting}
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
    fontFamily: "monospace",
  },
  actions: { marginTop: 10 },
  spacer: { height: 10 },
});
