import React from "react";
import { ScrollView, View, StyleSheet, Text, Dimensions } from "react-native";
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
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { formatDOB } from "../../../utils/dateUtils";
import { ProfileCarousel } from "../components/photos/ProfileCarousel";
import {
  DetailSection,
  DetailRow,
} from "../components/profileDetailView/ProfileInfoGrid";
// import { useProfileActions } from "../hooks/useProfileActions";
import { ProfileActionFooter } from "../components/profileDetailView/ProfileActionFooter";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function UserDetailsScreen({ route }: any) {
  const { theme } = useAppTheme();
  const { profile: myProfile } = useAuth();
  const profile = route.params?.profile;

  // Hook for Share/Block logic
  // const { generateAndSharePDF, handleBlock } = useProfileActions(profile);

  if (!profile) return null;
  const isSelf = myProfile?.uid === profile?.uid;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: 400,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 12 }}>
        {/* Profile Photos */}
        <View style={styles.carouselCard}>
          <ProfileCarousel profile={profile} />
        </View>

        {/* 1. Personal Info - Parallel Grid */}
        <DetailSection title="Personal Information" icon={Users}>
          <DetailRow
            label="Full Name"
            value={profile.fullName}
            icon={UserCheck}
            fullWidth
          />
          <DetailRow label="Gender" value={profile.gender} icon={User} />
          <DetailRow
            label="Age"
            value={formatDOB(profile?.dateOfBirth, "age")}
            icon={Calendar}
          />
          <DetailRow label="Height" value={profile.height} icon={Ruler} />
          <DetailRow label="Weight" value={profile.weight} icon={Scale} />
          <DetailRow
            label="Marital Status"
            value={profile.maritalStatus}
            icon={HeartHandshake}
          />
          <DetailRow
            label="Blood Group"
            value={profile.bloodGroup}
            icon={Droplets}
          />
          <DetailRow label="Rashi" value={profile.rashi} icon={Star} />
          <DetailRow
            label="Manglik"
            value={profile.manglikStatus}
            icon={Sparkles}
          />
          <DetailRow
            label="Birth Place"
            value={profile.placeOfBirth}
            icon={MapPin}
            fullWidth
          />
        </DetailSection>

        {/* 2. About Me - Full Width Blocks */}
        <DetailSection title="About Me" icon={Heart}>
          <DetailRow
            label="Bio"
            value={profile.shortBio}
            icon={MessageCircle}
            fullWidth
          />
          <DetailRow
            label="Life Goals"
            value={profile?.aspirations}
            icon={Target}
            fullWidth
          />
          <DetailRow
            label="Beliefs"
            value={profile?.beliefsValues}
            icon={Church}
            fullWidth
          />
        </DetailSection>

        {/* 3. Education & Career - Parallel Grid */}
        <DetailSection title="Education & Career" icon={GraduationCap}>
          <DetailRow
            label="Qualification"
            value={profile.highestQualification}
            icon={GraduationCap}
          />
          <DetailRow
            label="Study Field"
            value={profile.fieldOfStudy}
            icon={GraduationCap}
          />
          <DetailRow
            label="Occupation"
            value={profile.occupation}
            icon={Briefcase}
          />
          <DetailRow
            label="Industry"
            value={profile.industry}
            icon={Building}
          />
          <DetailRow
            label="Company"
            value={profile.companyName}
            icon={Building}
            fullWidth
          />
          <DetailRow
            label="Work City"
            value={profile.workLocation}
            icon={MapPin}
          />
          <DetailRow
            label="Income"
            value={profile.annualIncome}
            icon={DollarSign}
          />
        </DetailSection>

        {/* 4. Family Details - Parallel Grid */}
        <DetailSection title="Family Details" icon={Home}>
          <DetailRow
            label="Family Type"
            value={profile.familyType}
            icon={Home}
          />
          <DetailRow label="Values" value={profile.familyValues} icon={Heart} />
          <DetailRow
            label="Brothers"
            value={profile.numberOfBrothers}
            icon={User}
          />
          <DetailRow
            label="Sisters"
            value={profile.numberOfSisters}
            icon={User}
          />
          <DetailRow
            label="Father Occ."
            value={profile.fatherOccupation}
            icon={User}
          />
          <DetailRow
            label="Mother Occ."
            value={profile.motherOccupation}
            icon={User}
          />
          <DetailRow
            label="Siblings Info"
            value={profile.siblingsDetails}
            icon={Users}
            fullWidth
          />
        </DetailSection>

        {/* 2. Contact Details - Parallel Grid */}
        <DetailSection title="Contact Details" icon={Phone}>
          <DetailRow
            label="Current City"
            value={profile.currentCity}
            icon={MapPin}
          />
          <DetailRow
            label="Native Place"
            value={profile.nativePlace}
            icon={Home}
          />
          <DetailRow label="Mobile" value={profile.mobileNumber} icon={Phone} />
          <DetailRow
            label="Email"
            value={profile.emailAddress}
            icon={Mail}
            fullWidth
          />
          <DetailRow
            label="Contact Preference"
            value={profile.preferredContact}
            icon={MessageCircle}
          />
          <DetailRow
            label="Created By"
            value={profile.profileCreatedBy}
            icon={UserPlus}
          />
        </DetailSection>

        {/* 5. Lifestyle - Parallel Grid */}
        <DetailSection title="Lifestyle" icon={Activity}>
          <DetailRow
            label="Diet"
            value={profile.dietPreferences}
            icon={Utensils}
          />
          <DetailRow
            label="Smoking"
            value={profile.smokingHabit}
            icon={Cigarette}
          />
          <DetailRow
            label="Drinking"
            value={profile.drinkingHabit}
            icon={Wine}
          />
          <DetailRow
            label="Exercise"
            value={profile.exerciseRoutine}
            icon={Dumbbell}
          />
          <DetailRow
            label="Fitness"
            value={profile.fitnessLevel}
            icon={Activity}
          />
          <DetailRow
            label="Personality"
            value={profile.personalityType}
            icon={Brain}
          />

          {/* Hobbies - Custom Chip Layout */}
          {profile?.hobbies?.length > 0 && (
            <View style={styles.hobbiesBox}>
              <Text style={styles.hobbyLabel}>Hobbies</Text>
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
        {/* 5. Partner Preferences - Parallel Grid */}
        <DetailSection title="Partner Preferences" icon={Star}>
          <DetailRow
            label="Marital Status"
            value={profile.preferredMaritalStatus}
            icon={HeartHandshake}
          />
          <DetailRow
            label="Manglik"
            value={profile.manglikPreference}
            icon={Sparkles}
          />
          <DetailRow
            label="Education"
            value={profile.preferredEducation}
            icon={GraduationCap}
          />
          <DetailRow
            label="Profession"
            value={profile.preferredProfession}
            icon={Briefcase}
          />
          <DetailRow
            label="Min. Income"
            value={profile.preferredIncomeRange}
            icon={DollarSign}
          />
          <DetailRow
            label="Living with Parents"
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
});
