import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

interface StatsBarProps {
  isLoading: boolean;
  sentCount: number | string;
  receivedCount: number | string;
  matchesCount: number | string;
  styles: any;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  isLoading,
  sentCount,
  receivedCount,
  matchesCount,
  styles,
}) => {
  const { t } = useTranslation();

  const statItems = [
    {
      l: t("profile.stats.sent"),
      v: isLoading ? "—" : sentCount,
      requiredTier: "BASIC",
    },
    {
      l: t("profile.stats.received"),
      v: isLoading ? "—" : receivedCount,
      requiredTier: "PREMIUM",
    },
    {
      l: t("profile.stats.matches"),
      v: isLoading ? "—" : matchesCount,
      requiredTier: "PREMIUM",
    },
  ];

  return (
    <View style={styles.statsBar}>
      {statItems.map((s, i) => {
        const isLocked = s.v === "Upgrade to see";
        return (
          <React.Fragment key={i}>
            <View style={styles.statItem}>
              {isLocked ? (
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "600",
                      color:
                        s.requiredTier === "PREMIUM" ? "#FFD700" : "#3B82F6",
                      textTransform: "lowercase",
                      lineHeight: 6,
                    }}
                  >
                    Upgrade to
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "900",
                      letterSpacing: 0.5,
                      lineHeight: 11,
                      color:
                        s.requiredTier === "PREMIUM" ? "#FFD700" : "#3B82F6",
                    }}
                  >
                    {s.requiredTier}
                  </Text>
                </View>
              ) : (
                <Text style={styles.statVal}>{s.v}</Text>
              )}
              <Text style={styles.statLab}>{s.l}</Text>
            </View>
            {i < 2 && <View style={styles.statDivider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};
