import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

const LoadingScreen = () => {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 3,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );
    loopAnimation.start();
    return () => loopAnimation.stop();
  }, []);

  const dots = [0, 1, 2].map((index) => {
    const opacity = dotAnim.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [
        index === 0 ? 1 : 0.3,
        index === 1 ? 1 : 0.3,
        index === 2 ? 1 : 0.3,
        1,
      ],
    });

    return (
      <Animated.Text key={index} style={[styles.dot, { opacity }]}>
        •
      </Animated.Text>
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Getting things ready</Text>
      <View style={styles.dots}>{dots}</View>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    marginBottom: 20,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    fontSize: 36,
    color: "#007AFF",
    marginHorizontal: 4,
  },
});
