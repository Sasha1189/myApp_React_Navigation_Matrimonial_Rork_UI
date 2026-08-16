import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Svg, { Circle } from "react-native-svg";
import { RefreshCw } from "lucide-react-native";
import { formatDOB } from "../../../../utils/dateUtils";
import { useTranslation } from "react-i18next";
import { resolvePhotoUri } from "../../../../utils/photoUtils";

interface SlimHeaderProps {
  profile: any;
  completionPercent: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  theme: any;
  styles: any;
}

export const SlimHeader: React.FC<SlimHeaderProps> = ({
  profile,
  completionPercent,
  isRefreshing,
  onRefresh,
  theme,
  styles,
}) => {
  const { t } = useTranslation();
  const size = 85;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (circumference * completionPercent) / 100;

  const age = profile?.db ? formatDOB(profile.db, "age") : "18";
  const imageUri =
    resolvePhotoUri(profile?.photos?.[0].downloadURL, profile.uid) ||
    profile?.photos?.[0].localUrl ||
    "";

  return (
    <View style={styles.headerCard}>
      <View style={styles.imageContainer}>
        <Svg width={size} height={size} style={styles.progressSvg}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <Image
          source={{ uri: imageUri }}
          placeholder={require("../../../../../assets/images/profile.webp")}
          placeholderContentFit="cover"
          style={styles.profileImage}
          contentFit="cover"
          cachePolicy="disk"
        />
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <RefreshCw size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.nameText}>
        {profile?.fn || "My Name"}, {age}
      </Text>
      <Text style={styles.completionText}>
        {t("profile.completion", { percent: completionPercent })}
      </Text>
    </View>
  );
};
