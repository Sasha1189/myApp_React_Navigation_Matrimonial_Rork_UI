import { theme } from "../../../theme/index";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  ArrowLeft,
  Brain,
  Briefcase,
  Building,
  Calendar,
  Church,
  Cigarette,
  DollarSign,
  Droplets,
  Dumbbell,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Link,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Scale,
  Sparkles,
  Star,
  Target,
  Timer,
  User,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  Wine,
  Zap,
} from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppStackParamList } from "../../../navigation/types";
import { useProfileContext } from "../../../context/ProfileContext";
import LoadingScreen from "../../../components/LoadingScreen";
import { Profile } from "../../../types/profile";

interface DetailSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  icon: Icon,
  children,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Icon size={20} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface DetailRowProps {
  label: string;
  value?:
    | string
    | number
    | boolean
    | Date
    | { min: number; max: number }
    | null;
  icon?: React.ComponentType<any>;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, icon: Icon }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        {Icon && <Icon size={16} color={theme.colors.primary} />}
        <Text style={styles.detailLabel}>{label}:</Text>
      </View>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
};

type UserDetailsScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "UserDetails"
>;

export default function UserDetailsScreen({
  route,
}: {
  route: RouteProp<AppStackParamList, "UserDetails">;
}) {
  const navigation = useNavigation<UserDetailsScreenNavigationProp>();
  let profile: Profile | null = null;

  if ("profile" in route.params) {
    // Case 1: full profile passed in
    profile = route.params.profile ?? null;
  } else if ("userId" in route.params) {
    // Case 2: only userId, fetch profile from backend here
    // profile = await fetchProfile(route.params.userId);
  } else if ("self" in route.params && route.params.self) {
    // Case 3: self profile, use context
    profile = useProfileContext().profile ?? null;
  }

  if (!profile) {
    return <LoadingScreen />;
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: profile?.fullName || "Profile",
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: "white",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, profile]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {profile?.photos && profile?.photos.length > 0 ? (
            <>
              <Image
                source={{ uri: profile?.photos[0].downloadURL }}
                resizeMode="cover"
                style={styles.profileImage}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.imageGradient}
              />
            </>
          ) : (
            <View
              style={[
                styles.profileImage,
                { backgroundColor: theme.colors.border },
              ]}
            />
          )}

          {/* <View style={styles.imageOverlay}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileAge}>
              {formatDOB(profile.dateOfBirth, "age")}
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="white" />
              <Text style={styles.locationText}>{profile.currentCity}</Text>
            </View>
          </View> */}
        </View>
      </View>

      <View style={styles.content}>
        <DetailSection title="Personal Information" icon={Users}>
          <DetailRow
            label="Full Name"
            value={profile.fullName}
            icon={UserCheck}
          />
          <DetailRow
            label="Date of Birth"
            value={profile.dateOfBirth}
            icon={Calendar}
          />
          <DetailRow
            label="Time of Birth"
            value={profile.timeOfBirth}
            icon={Timer}
          />
          <DetailRow
            label="Place of Birth"
            value={profile.placeOfBirth}
            icon={MapPin}
          />
          <DetailRow label="Gender" value={profile.gender} icon={User} />
          <DetailRow
            label="Marital Status"
            value={profile.maritalStatus}
            icon={HeartHandshake}
          />
          <DetailRow label="Height" value={profile.height} icon={Ruler} />
          <DetailRow label="Weight" value={profile.weight} icon={Scale} />
          <DetailRow
            label="Body Type"
            value={profile.bodyType}
            icon={Activity}
          />
          <DetailRow
            label="Blood Group"
            value={profile.bloodGroup}
            icon={Droplets}
          />
          <DetailRow
            label="Manglik Status"
            value={profile.manglikStatus}
            icon={Sparkles}
          />
          <DetailRow label="Rashi" value={profile.rashi} icon={Star} />
          <DetailRow
            label="Horoscope Required"
            value={profile.horoscopeRequired}
            icon={Zap}
          />
        </DetailSection>

        <DetailSection title="About Me" icon={Heart}>
          <DetailRow
            label="Bio"
            value={profile.shortBio}
            icon={MessageCircle}
          />
          <DetailRow
            label="Life Goals"
            value={profile?.aspirations}
            icon={Target}
          />
          <DetailRow
            label="Beliefs & Values"
            value={profile?.beliefsValues}
            icon={Church}
          />
          <DetailRow label="Strengths" value={profile?.strengths} icon={Zap} />
          <DetailRow
            label="Likes & Dislikes"
            value={profile?.likesDislikesText}
            icon={Heart}
          />
          <DetailRow
            label="Social Media"
            value={profile?.socialMedia}
            icon={Link}
          />
        </DetailSection>

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
          <DetailRow
            label="Mobile Number"
            value={profile.mobileNumber}
            icon={Phone}
          />
          <DetailRow label="Email" value={profile.emailAddress} icon={Mail} />
          <DetailRow
            label="Preferred Contact"
            value={profile.preferredContact}
            icon={MessageCircle}
          />
          <DetailRow
            label="Profile Created By"
            value={profile.profileCreatedBy}
            icon={UserPlus}
          />
        </DetailSection>

        <DetailSection title="Education & Career" icon={GraduationCap}>
          <DetailRow
            label="Highest Qualification"
            value={profile.highestQualification}
            icon={GraduationCap}
          />
          <DetailRow
            label="Field of Study"
            value={profile.fieldOfStudy}
            icon={GraduationCap}
          />
          <DetailRow
            label="Current Occupation"
            value={profile?.occupation}
            icon={Briefcase}
          />
          <DetailRow
            label="Industry"
            value={profile.industry}
            icon={Building}
          />
          <DetailRow
            label="Job Title"
            value={profile.jobTitle}
            icon={Briefcase}
          />
          <DetailRow
            label="Company"
            value={profile.companyName}
            icon={Building}
          />
          <DetailRow
            label="Work Location"
            value={profile.workLocation}
            icon={MapPin}
          />
          <DetailRow
            label="Annual Income"
            value={profile.annualIncome}
            icon={DollarSign}
          />
        </DetailSection>

        <DetailSection title="Family Details" icon={Home}>
          <DetailRow
            label="Father's Occupation"
            value={profile.fatherOccupation}
            icon={User}
          />
          <DetailRow
            label="Mother's Occupation"
            value={profile.motherOccupation}
            icon={User}
          />
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
            label="Siblings Details"
            value={profile.siblingsDetails}
            icon={Users}
          />
          <DetailRow
            label="Family Type"
            value={profile.familyType}
            icon={Home}
          />
          <DetailRow
            label="Family Values"
            value={profile.familyValues}
            icon={Heart}
          />
        </DetailSection>

        <DetailSection title="Lifestyle & Habits" icon={Activity}>
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
            label="Fitness Level"
            value={profile.fitnessLevel}
            icon={Activity}
          />
          <DetailRow
            label="Personality"
            value={profile.personalityType}
            icon={Brain}
          />
          <DetailRow
            label="Belief System"
            value={profile.beliefSystem}
            icon={Church}
          />

          {profile?.hobbies?.length > 0 && (
            <View style={styles.hobbiesContainer}>
              <Text style={styles.detailLabel}>Hobbies:</Text>
              <View style={styles.hobbiesList}>
                {profile?.hobbies.map((hobby: string, index: number) => (
                  <View key={index} style={styles.hobbyTag}>
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </DetailSection>

        <DetailSection title="Partner Preferences" icon={Star}>
          {/* <DetailRow
            label="Age Range"
            value={`${profile.preferredAgeRange.min} - ${profile.preferredAgeRange.max} years`}
            icon={Calendar}
          />
          <DetailRow
            label="Height Range"
            value={`${profile.preferredHeightRange.min} - ${profile.preferredHeightRange.max}`}
            icon={Ruler}
          /> */}
          <DetailRow
            label="Marital Status"
            value={profile.preferredMaritalStatus}
            icon={HeartHandshake}
          />
          <DetailRow
            label="Manglik Preference"
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
            label="Income Range"
            value={profile.preferredIncomeRange}
            icon={DollarSign}
          />
          <DetailRow
            label="Location"
            value={profile.locationPreference}
            icon={MapPin}
          />
          <DetailRow
            label="Living with Parents"
            value={profile.livingWithParents}
            icon={Home}
          />
        </DetailSection>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    height: 475,
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  profileName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold",
    color: "white",
    marginBottom: theme.spacing.xs,
  },
  profileAge: {
    fontSize: theme.fontSize.lg,
    color: "white",
    marginBottom: theme.spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "white",
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  sectionContent: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.xs,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1.5,
    textAlign: "right",
  },
  hobbiesContainer: {
    paddingVertical: theme.spacing.xs,
  },
  hobbiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: theme.spacing.xs,
  },
  hobbyTag: {
    backgroundColor: theme.colors.primary + "20",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  hobbyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "500",
  },
});
