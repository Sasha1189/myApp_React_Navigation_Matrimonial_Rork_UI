import React from "react";
import { View, StyleSheet } from "react-native";
import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";

interface CarouselPaginationProps {
  activeIndex: number;
  totalSlides: number;
}

export const CarouselPagination: React.FC<CarouselPaginationProps> = ({
  activeIndex,
  totalSlides,
}) => {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.paginationRow}>
      {/* 🎯 PURE CENTRED DOTS INDICATOR TRACK */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIndex
                    ? styles.dotActive.backgroundColor
                    : styles.dotInactive.backgroundColor,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    paginationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 30,
      width: "100%",
    },
    dotsRow: {
      flexDirection: "row",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    dotActive: {
      backgroundColor: theme.colors.text || "#111122",
    },
    dotInactive: {
      backgroundColor: theme.colors.border || "#E1E8ED",
    },
  });
