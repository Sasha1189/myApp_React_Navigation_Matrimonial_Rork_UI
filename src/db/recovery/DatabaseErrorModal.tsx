import React, { useState } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { useDatabase } from "@/context/DatabaseContext";

export function DatabaseErrorModal() {
  const { migrationError, handleRetry, handleReset } = useDatabase();
  const [retryCount, setRetryCount] = useState(0);

  if (!migrationError) return null;

  const onRetry = async () => {
    setRetryCount((prev) => prev + 1);
    await handleRetry();
  };

  const hasAttemptedRetry = retryCount > 0;

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Database Sync Issue</Text>
          <Text style={styles.body}>
            {hasAttemptedRetry
              ? "Retry attempt failed. You can try again or reset local storage to re-sync your data from the server."
              : "We encountered a problem setting up local offline storage. Please tap Retry to reconnect."}
          </Text>

          <View style={styles.actions}>
            <Button
              title={hasAttemptedRetry ? "Try Again" : "Retry"}
              onPress={onRetry}
            />

            {hasAttemptedRetry && (
              <>
                <View style={styles.spacer} />
                <Button
                  title="Reset Local Storage"
                  color="#d9534f"
                  onPress={handleReset}
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
  actions: { marginTop: 10 },
  spacer: { height: 10 },
});
