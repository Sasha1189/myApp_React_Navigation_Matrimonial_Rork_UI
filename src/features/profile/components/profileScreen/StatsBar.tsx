import React, { useMemo, memo } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

interface StatsBarProps {
  isLoading: boolean;
  isSubscribed: boolean;
  sentCount: number | string;
  receivedCount: number | string;
  matchesCount: number | string;
  styles: any;
}

export const StatsBar = memo<StatsBarProps>(
  ({
    isLoading,
    isSubscribed,
    sentCount,
    receivedCount,
    matchesCount,
    styles,
  }) => {
    const { t } = useTranslation();

    const statItems = useMemo(
      () => [
        {
          id: "sent",
          label: t("profile.stats.sent"),
          value: isLoading ? "—" : sentCount,
        },
        {
          id: "received",
          label: t("profile.stats.received"),
          value: isLoading ? "—" : receivedCount,
        },
        {
          id: "matches",
          label: t("profile.stats.matches"),
          value: isLoading ? "—" : matchesCount,
        },
      ],
      [isLoading, sentCount, receivedCount, matchesCount, t],
    );

    return (
      <View style={styles.statsBar}>
        {statItems.map((s, i) => (
          <React.Fragment key={s.id}>
            <View style={styles.statItem}>
              {!isSubscribed ? (
                <Text
                  style={
                    styles.upgradeText || {
                      fontSize: 10,
                      fontWeight: "700",
                      color: "#3B82F6",
                      textAlign: "center",
                    }
                  }
                >
                  {t("profile.stats.upgrade")}
                </Text>
              ) : (
                <Text style={styles.statVal}>{s.value}</Text>
              )}
              <Text style={styles.statLab}>{s.label}</Text>
            </View>
            {i < statItems.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>
    );
  },
);

StatsBar.displayName = "StatsBar";
