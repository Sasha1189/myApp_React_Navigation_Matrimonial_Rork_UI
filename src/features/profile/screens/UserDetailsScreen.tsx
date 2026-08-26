import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Users,
  UserCheck,
  Calendar,
  ShieldAlert,
  MapPin,
  User,
  HeartHandshake,
  Ruler,
  Scale,
  Zap,
  Link,
  Activity,
  Droplets,
  Sparkles,
  Star,
  MessageCircle,
  Target,
  Church,
  Home,
  Phone,
  Mail,
  UserPlus,
  GraduationCap,
  Briefcase,
  Building,
  DollarSign,
  Utensils,
  Cigarette,
  Wine,
  Dumbbell,
  Brain,
  Heart,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "../context/ProfileContext";
import { useAppNavigation } from "@/navigation/hooks";
import { Profile } from "@/features/profile/types/profile";
import { getDisplayValue } from "@/features/utils/profileLookups";

import { AppTheme } from "@/theme/theme";
import { useStyles } from "@/theme/useStyles";
import { useAppTheme } from "@/theme/ThemeContext";

import { formatDOB, formatTime } from "../../../utils/dateUtils";
import { ProfileCarousel } from "../components/photos/ProfileCarousel";
import {
  DetailSection,
  DetailRow,
} from "../components/profileDetailView/ProfileInfoGrid";
import { Lock } from "lucide-react-native";
import { ProfileActionFooter } from "../components/profileDetailView/ProfileActionFooter";
import { useTranslation } from "react-i18next";
import { useSocialActions } from "../hooks/useSocialActions";
import { usePreventScreenCapture } from "expo-screen-capture";

const { height: screenHeight } = Dimensions.get("window");

export default function UserDetailsScreen({ route }: any) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const navigation = useAppNavigation();
  const { tier } = useAuth();
  const { myProfile } = useMyProfile();
  const profile = route.params?.profile as Profile;
  usePreventScreenCapture();

  const isSelf = myProfile?.uid === profile?.uid;

  const canViewContact = isSelf || tier === "basic" || tier === "premium";

  const canBlock = tier === "basic" || tier === "premium";

  const HOBBIES_LOOKUP = [
    "Reading",
    "Traveling",
    "Cooking",
    "Music",
    "Movies",
    "Sports",
    "Fitness",
    "Dancing",
    "Photography",
    "Gaming",
    "Art & Craft",
    "Other",
  ];

  const { handleBlock } = useSocialActions(profile);

  if (!profile) return null;
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 12, paddingBottom: 52 }}>
        {/* Profile Photos */}
        <View style={styles.carouselCard}>
          <ProfileCarousel profile={profile} />
        </View>

        {/* 1. Personal Info - Parallel Grid */}
        <DetailSection title={t("details.sections.personal")} icon={Users}>
          <DetailRow
            label={t("details.labels.fullName")}
            value={
              `${profile?.fn || ""} ${profile?.ln || ""}`.trim() ||
              "Not Provided"
            }
            icon={UserCheck}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.gender")}
            value={profile.gender}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.dateOfBirth")}
            value={formatDOB(profile?.db, "both")}
            icon={Calendar}
          />
          <DetailRow
            label={t("details.labels.timeOfBirth")}
            value={formatDOB(profile?.tob, "tob")}
            icon={Calendar}
          />
          <DetailRow
            label={t("details.labels.birthPlace")}
            value={profile.pb}
            icon={MapPin}
          />
          <DetailRow
            label={t("details.labels.height")}
            value={profile.ht}
            icon={Ruler}
          />
          <DetailRow
            label={t("details.labels.bodyType")}
            value={getDisplayValue("bt", profile.bt)}
            icon={MapPin}
          />
          <DetailRow
            label={t("details.labels.bloodGroup")}
            value={getDisplayValue("bg", profile.bg)}
            icon={Droplets}
          />
          <DetailRow
            label={t("details.labels.rashi")}
            value={getDisplayValue("rs", profile.rs)}
            icon={Star}
          />
          <DetailRow
            label={t("details.labels.manglik")}
            value={getDisplayValue("mg", profile.mg)}
            icon={Sparkles}
          />
          <DetailRow
            label={t("details.labels.horoscopeRequired")}
            value={getDisplayValue("hr", profile.hr)}
            icon={Sparkles}
          />
          <DetailRow
            label={t("details.labels.maritalStatus")}
            value={getDisplayValue("ms", profile.ms)}
            icon={HeartHandshake}
          />
          <DetailRow
            label={t("details.labels.isReady")}
            value={getDisplayValue("ir", profile.ir)}
            icon={HeartHandshake}
          />
        </DetailSection>

        {/* 2. About Me - Full Width Blocks */}
        <DetailSection title={t("details.sections.about")} icon={Heart}>
          <DetailRow
            label={t("details.labels.shortBio")}
            value={profile.sb}
            icon={MessageCircle}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.goals")}
            value={profile?.as} //aspirations
            icon={Target}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.beliefsValues")}
            value={profile?.bv}
            icon={Church}
            fullWidth
          />
          //added
          <DetailRow
            label={t("details.labels.strengths")}
            value={profile?.st}
            icon={Zap}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.likesDislikesText")}
            value={profile?.ld}
            icon={Heart}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.socialMedia")}
            value={profile?.sm}
            icon={Link}
            fullWidth
          />
        </DetailSection>

        {/* 3. Education & Career - Parallel Grid */}
        <DetailSection
          title={t("details.sections.education")}
          icon={GraduationCap}
        >
          <DetailRow
            label={t("details.labels.qualification")}
            value={getDisplayValue("hq", profile.hq)}
            icon={GraduationCap}
          />
          <DetailRow
            label={t("details.labels.studyField")}
            value={getDisplayValue("fs", profile.fs)}
            icon={GraduationCap}
          />
          <DetailRow
            label={t("details.labels.occupation")}
            value={getDisplayValue("oc", profile.oc)}
            icon={Briefcase}
          />
          <DetailRow
            label={t("details.labels.industry")}
            value={getDisplayValue("ind", profile.ind)}
            icon={Building}
          />
          <DetailRow
            label={t("details.labels.jobTitle")}
            value={profile.jt}
            icon={Building}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.company")}
            value={profile.cn}
            icon={Building}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.workCity")}
            value={profile.wl}
            icon={MapPin}
          />
          <DetailRow
            label={t("details.labels.income")}
            value={getDisplayValue("ai", profile.ai)}
            icon={DollarSign}
          />
        </DetailSection>

        {/* 4. Family Details - Parallel Grid */}
        <DetailSection title={t("details.sections.family")} icon={Home}>
          <DetailRow
            label={t("details.labels.brothers")}
            value={profile.nb !== undefined ? `${profile.nb}` : undefined}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.sisters")}
            value={profile.ns !== undefined ? `${profile.ns}` : undefined}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.fatherOcc")}
            value={profile.fo}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.motherOcc")}
            value={profile.mo}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.siblingsInfo")}
            value={profile.sd}
            icon={Users}
            fullWidth
          />
        </DetailSection>

        {/* 5. Contact Details - Parallel Grid */}
        {canViewContact ? (
          <DetailSection title={t("details.sections.contact")} icon={Phone}>
            <DetailRow
              label={t("details.labels.mobile")}
              value={profile.mn}
              icon={Phone}
            />
            <DetailRow
              label={t("details.labels.currentCity")}
              value={getDisplayValue("ct" as any, profile.cc)}
              icon={MapPin}
            />
            <DetailRow
              label={t("details.labels.nativePlace")}
              value={getDisplayValue("ct" as any, profile.np)}
              icon={Home}
            />
            <DetailRow
              label={t("details.labels.contactPref")}
              value={getDisplayValue("pc", profile.pc)}
              icon={MessageCircle}
            />
            <DetailRow
              label={t("details.labels.createdBy")}
              value={getDisplayValue("cb", profile.cb)}
              icon={UserPlus}
            />
          </DetailSection>
        ) : (
          <DetailSection title={t("details.sections.contact")} icon={Phone}>
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => navigation.navigate("Paywall")}
            >
              <Lock size={24} color={theme.colors.primary} />
              <Text style={styles.upgradeText}>{t("details.upgradeText")}</Text>
            </TouchableOpacity>
          </DetailSection>
        )}

        {/* 6. Lifestyle - Parallel Grid */}
        <DetailSection title={t("details.sections.lifestyle")} icon={Activity}>
          <DetailRow
            label={t("details.labels.diet")}
            value={getDisplayValue("dp", profile.dp)}
            icon={Utensils}
          />
          <DetailRow
            label={t("details.labels.smoking")}
            value={getDisplayValue("sh", profile.sh)}
            icon={Cigarette}
          />
          <DetailRow
            label={t("details.labels.drinking")}
            value={getDisplayValue("dh", profile.dh)}
            icon={Wine}
          />
          <DetailRow
            label={t("details.labels.exercise")}
            value={getDisplayValue("er", profile.er)}
            icon={Dumbbell}
          />
          <DetailRow
            label={t("details.labels.fitness")}
            value={getDisplayValue("fl", profile.fl)}
            icon={Activity}
          />
          <DetailRow
            label={t("details.labels.beliefSystem")}
            value={getDisplayValue("bs", profile.bs)}
            icon={Sparkles}
          />

          {/* Hobbies - Custom Chip Layout */}
          {Array.isArray(profile?.hb) && profile.hb.length > 0 && (
            <View style={styles.hobbiesBox}>
              <Text style={styles.hobbyLabel}>
                {t("details.labels.hobbies")}
              </Text>
              <View style={styles.hobbyList}>
                {profile.hb.map((hobbyIdx: number, i: number) => {
                  // Map numeric list pointers directly to legible tag string rows
                  const legibleLabel =
                    HOBBIES_LOOKUP[hobbyIdx] || `Hobby #${hobbyIdx}`;
                  return (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{legibleLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </DetailSection>

        {/* 7. Partner Preferences - Parallel Grid */}
        <DetailSection title={t("details.sections.preferences")} icon={Star}>
          <DetailRow
            label={t("details.labels.maritalStatus")}
            value={getDisplayValue("ms", profile.pms)}
            icon={HeartHandshake}
          />
          <DetailRow
            label={t("details.labels.education")}
            value={getDisplayValue("hq", profile.pe)}
            icon={GraduationCap}
          />
          <DetailRow
            label={t("details.labels.profession")}
            value={getDisplayValue("oc", profile.pp)}
            icon={Briefcase}
          />
          <DetailRow
            label={t("details.labels.minIncome")}
            value={getDisplayValue("ai", profile.pir)}
            icon={DollarSign}
          />
          <DetailRow
            label={t("details.labels.locationPreference")}
            value={profile?.lp}
            icon={MapPin}
          />
          <DetailRow
            label={t("details.labels.livingWithParents")}
            value={getDisplayValue("lwp", profile.lwp)}
            icon={Home}
            fullWidth
          />
        </DetailSection>
        {/* Block-Share  */}
        {!isSelf && (
          <DetailSection
            title={t("details.actions.blockTitle")}
            icon={ShieldAlert}
          >
            {canBlock ? (
              <ProfileActionFooter onBlock={handleBlock} loading={false} />
            ) : (
              <TouchableOpacity
                style={styles.upgradeCard}
                onPress={() => navigation.navigate("Paywall")}
              >
                <Lock size={24} color={theme.colors.primary} />
                <Text style={styles.upgradeText}>
                  {t("details.upgradeText")}
                </Text>
              </TouchableOpacity>
            )}
          </DetailSection>
        )}
        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <ShieldAlert size={20} color={theme.colors.accent} />
          <Text style={styles.disclaimerText}>{t("details.disclaimer")}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    carouselCard: {
      borderRadius: 20,
      overflow: "hidden",
      elevation: 8,
      marginBottom: 20,
      backgroundColor: "#fff",
      height: screenHeight * 0.73,
    },
    card: {
      borderRadius: 20,
      overflow: "hidden",
      elevation: 5,
      marginBottom: 16,
    },
    hobbiesBox: { width: "100%", padding: 4, marginTop: 8 },
    hobbyLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: "#7F8C8D",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    hobbyList: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
    tag: {
      backgroundColor: "#6B46C115",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: "#6B46C130",
    },
    tagText: { fontSize: 12, color: "#6B46C1", fontWeight: "700" },
    upgradeCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E9D8FD",
      padding: 16,
      borderRadius: 12,
      width: "100%",
      gap: 12,
    },
    upgradeText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: "#6B46C1",
    },
    disclaimerCard: {
      backgroundColor: theme.colors.accent + "20",
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    disclaimerText: {
      flex: 1,
      fontSize: theme.fontSize.xs,
      color: theme.colors.text,
      marginLeft: theme.spacing.md,
    },
  });
