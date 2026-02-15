import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const TypingIndicator = ({ name }: { name: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name} is typing...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 15, paddingVertical: 5, marginBottom: 5 },
  text: { fontSize: 12, fontStyle: "italic", color: "gray" },
});
