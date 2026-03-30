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
  Timer,
  MapPin,
  User,
  HeartHandshake,
  Ruler,
  Scale,
  Activity,
  Droplets,
  Sparkles,
  Star,
  Zap,
  HeartPulse,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useAppNavigation } from "@/navigation/hooks";
import { useAppTheme } from "@/theme/ThemeContext";
import { formatDOB } from "../../../utils/dateUtils";
import { ProfileCarousel } from "../components/photos/ProfileCarousel";
import {
  DetailSection,
  DetailRow,
} from "../components/profileDetailView/ProfileInfoGrid";
import { Lock } from "lucide-react-native";
import { ProfileActionFooter } from "../components/profileDetailView/ProfileActionFooter";
import { useTranslation } from "react-i18next";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function UserDetailsScreen({ route }: any) {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { profile: myProfile } = useAuth();
  const profile = route.params?.profile;

  // Hook for Share/Block logic
  // const { generateAndSharePDF, handleBlock } = useProfileActions(profile);

  const isSelf = myProfile?.uid === profile?.uid;
  const canViewContact =
    isSelf ||
    (myProfile?.subscription?.plan && myProfile.subscription.plan !== "trial");
  if (!profile) return null;
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: insets.bottom + 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 12, marginBottom: 20 }}>
        {/* Profile Photos */}
        <View style={styles.carouselCard}>
          <ProfileCarousel profile={profile} />
        </View>

        {/* 1. Personal Info - Parallel Grid */}
        <DetailSection title={t("details.sections.personal")} icon={Users}>
          <DetailRow
            label={t("details.labels.fullName")}
            value={profile.fullName}
            icon={UserCheck}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.gender")}
            value={profile.gender}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.age")}
            value={formatDOB(profile?.dateOfBirth, "age")}
            icon={Calendar}
          />
          <DetailRow
            label={t("details.labels.height")}
            value={profile.height}
            icon={Ruler}
          />
          <DetailRow
            label={t("details.labels.weight")}
            value={profile.weight}
            icon={Scale}
          />
          <DetailRow
            label={t("details.labels.maritalStatus")}
            value={profile.maritalStatus}
            icon={HeartHandshake}
          />
          <DetailRow
            label={t("details.labels.bloodGroup")}
            value={profile.bloodGroup}
            icon={Droplets}
          />
          <DetailRow
            label={t("details.labels.rashi")}
            value={profile.rashi}
            icon={Star}
          />
          <DetailRow
            label={t("details.labels.manglik")}
            value={profile.manglikStatus}
            icon={Sparkles}
          />
          <DetailRow
            label={t("details.labels.birthPlace")}
            value={profile.placeOfBirth}
            icon={MapPin}
            fullWidth
          />
        </DetailSection>

        {/* 2. About Me - Full Width Blocks */}
        <DetailSection title={t("details.sections.about")} icon={Heart}>
          <DetailRow
            label={t("details.labels.shortBio")}
            value={profile.shortBio}
            icon={MessageCircle}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.goals")}
            value={profile?.aspirations}
            icon={Target}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.beliefsValues")}
            value={profile?.beliefsValues}
            icon={Church}
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
            value={profile.highestQualification}
            icon={GraduationCap}
          />
          <DetailRow
            label={t("details.labels.studyField")}
            value={profile.fieldOfStudy}
            icon={GraduationCap}
          />
          <DetailRow
            label={t("details.labels.occupation")}
            value={profile.occupation}
            icon={Briefcase}
          />
          <DetailRow
            label={t("details.labels.industry")}
            value={profile.industry}
            icon={Building}
          />
          <DetailRow
            label={t("details.labels.company")}
            value={profile.companyName}
            icon={Building}
            fullWidth
          />
          <DetailRow
            label={t("details.labels.workCity")}
            value={profile.workLocation}
            icon={MapPin}
          />
          <DetailRow
            label={t("details.labels.income")}
            value={profile.annualIncome}
            icon={DollarSign}
          />
        </DetailSection>

        {/* 4. Family Details - Parallel Grid */}
        <DetailSection title={t("details.sections.family")} icon={Home}>
          <DetailRow
            label={t("details.labels.familyType")}
            value={profile.familyType}
            icon={Home}
          />
          <DetailRow
            label={t("details.labels.values")}
            value={profile.familyValues}
            icon={Heart}
          />
          <DetailRow
            label={t("details.labels.brothers")}
            value={profile.numberOfBrothers}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.sisters")}
            value={profile.numberOfSisters}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.fatherOcc")}
            value={profile.fatherOccupation}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.motherOcc")}
            value={profile.motherOccupation}
            icon={User}
          />
          <DetailRow
            label={t("details.labels.siblingsInfo")}
            value={profile.siblingsDetails}
            icon={Users}
            fullWidth
          />
        </DetailSection>

        {/* 5. Contact Details - Parallel Grid */}
        {canViewContact ? (
          <DetailSection title={t("details.sections.contact")} icon={Phone}>
            <DetailRow
              label={t("details.labels.currentCity")}
              value={profile.currentCity}
              icon={MapPin}
            />
            <DetailRow
              label={t("details.labels.nativePlace")}
              value={profile.nativePlace}
              icon={Home}
            />
            <DetailRow
              label={t("details.labels.mobile")}
              value={profile.mobileNumber}
              icon={Phone}
            />
            <DetailRow
              label={t("details.labels.email")}
              value={profile.emailAddress}
              icon={Mail}
              fullWidth
            />
            <DetailRow
              label={t("details.labels.contactPref")}
              value={profile.preferredContact}
              icon={MessageCircle}
            />
            <DetailRow
              label={t("details.labels.createdBy")}
              value={profile.profileCreatedBy}
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
            value={profile.dietPreferences}
            icon={Utensils}
          />
          <DetailRow
            label={t("details.labels.smoking")}
            value={profile.smokingHabit}
            icon={Cigarette}
          />
          <DetailRow
            label={t("details.labels.drinking")}
            value={profile.drinkingHabit}
            icon={Wine}
          />
          <DetailRow
            label={t("details.labels.exercise")}
            value={profile.exerciseRoutine}
            icon={Dumbbell}
          />
          <DetailRow
            label={t("details.labels.fitness")}
            value={profile.fitnessLevel}
            icon={Activity}
          />
          <DetailRow
            label={t("details.labels.personality")}
            value={profile.personalityType}
            icon={Brain}
          />

          {/* Hobbies - Custom Chip Layout */}
          {profile?.hobbies?.length > 0 && (
            <View style={styles.hobbiesBox}>
              <Text style={styles.hobbyLabel}>
                {t("details.labels.hobbies")}
              </Text>
              <View style={styles.hobbyList}>
                {profile.hobbies.map((h: string, i: number) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{h}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </DetailSection>
        {/* 7. Partner Preferences - Parallel Grid */}
        <DetailSection title={t("details.sections.preferences")} icon={Star}>
          <DetailRow
            label={t("details.labels.maritalStatus")}
            value={profile.preferredMaritalStatus}
            icon={HeartHandshake}
          />
          <DetailRow
            label={t("details.labels.manglik")}
            value={profile.manglikPreference}
            icon={Sparkles}
          />
          <DetailRow
            label={t("details.labels.education")}
            value={profile.preferredEducation}
            icon={GraduationCap}
          />
          <DetailRow
            label={t("details.labels.profession")}
            value={profile.preferredProfession}
            icon={Briefcase}
          />
          <DetailRow
            label={t("details.labels.minIncome")}
            value={profile.preferredIncomeRange}
            icon={DollarSign}
          />
          <DetailRow
            label={t("details.labels.livingWithParents")}
            value={profile.livingWithParents}
            icon={Home}
            fullWidth
          />
        </DetailSection>
      </View>
      {/* Only show for feed profiles */}
      {!isSelf && (
        <ProfileActionFooter
          onShare={() => {}}
          onBlock={() => {}}
          // loading={isProcessing}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
