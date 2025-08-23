import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Save,
  User,
  Heart,
  Phone,
  GraduationCap,
  Users,
  Activity,
  Star,
  Calendar,
  MapPin,
  ChevronDown,
  UserCheck,
  Timer,
  Home,
  Scale,
  Ruler,
  Droplets,
  Sparkles,
  Zap,
  Target,
  MessageCircle,
  Link,
  Mail,
  UserPlus,
  Building,
  Briefcase,
  DollarSign,
  Utensils,
  Cigarette,
  Wine,
  Dumbbell,
  Brain,
  Church,
  HeartHandshake,
  Edit3,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import type { Profile } from "../../../types/profile";
import CustomHeader from "../../../components/CustomeHeader";
import { useTabNavigation } from "../../../navigation/hooks";
import { useProfileContext } from "../../../context/ProfileContext";
import { useUpdateProfile } from "../../../src/hooks/queries/useProfile";
import {
  PersonalInfoSection,
  AboutMeSection,
  ContactDetailsSection,
  EducationCareerSection,
  FamilyDetailsSection,
  LifestyleSection,
  PartnerPreferencesSection,
} from "../sections";

// Example required fields
const requiredFields: (keyof Profile)[] = ["fullName"];

export default function EditProfileScreen() {
  const navigation = useTabNavigation();
  const { profile } = useProfileContext();

  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  // Initialize with profile
  const [formData, setFormData] = useState<Partial<Profile>>(profile || {});

  // typed field updater
  const updateField = (field: keyof Profile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Check if any field is different
  const isDirty = useMemo(() => {
    return (Object.keys(formData) as (keyof Profile)[]).some(
      (key) => formData[key] !== profile[key]
    );
  }, [formData, profile]);

  // Navigation guard for unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!isDirty) return;

      e.preventDefault();

      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isDirty]);

  // Reset form when profile updates
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData(profile);
    }
  }, [profile, isEditing]);

  // Validate form data
  const validateForm = (): boolean => {
    const emptyRequiredFields = requiredFields.filter(
      (key) =>
        !formData[key] ||
        (typeof formData[key] === "string" && formData[key].trim() === "")
    );
    if (emptyRequiredFields.length) {
      Alert.alert(
        "Incomplete Form",
        `Please fill out the following required fields:\n\n${emptyRequiredFields
          .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
          .join(", ")}`
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    console.log(formData.fullName);
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      const changedFields: any = {};
      (Object.keys(formData) as (keyof Profile)[]).forEach((key) => {
        const newVal = formData[key];
        const oldVal = (profile as any)[key];
        const changed = !Object.is(newVal, oldVal);
        if (changed) {
          changedFields[key] = newVal;
        }
      });

      if (Object.keys(changedFields).length === 0) {
        Alert.alert("No Changes", "You have not made any changes.");
        setIsEditing(false);
        return;
      }

      if (!profile?.id) {
        Alert.alert("Error", "Profile ID is missing.");
        return;
      }
      console.log("API about to hit");
      // Ensure gender is always included because server requires it
      if (changedFields.gender === undefined && (profile as any).gender !== undefined) {
        changedFields.gender = (profile as any).gender;
      }

      // use mutateAsync so we can await completion and catch server errors
      await updateProfileMutation.mutateAsync({
        id: profile.id,
        data: changedFields,
      });
      Alert.alert(
        "Profile Updated",
        "Your profile has been successfully updated."
      );
    } catch (error: any) {
      console.error("Submit error:", error);
      // If React Query's ApiError or other error, show message
      Alert.alert(
        "Error",
        error?.message || (error?.response?.message ?? "Something went wrong.")
      );
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Edit Profile"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRightIcon={true}
        onIconClick={handleSave}
        rightIcon={
          !isEditing ? (
            <>
              <Text>Edit Profile</Text>
              <Edit3 size={24} color="white" />
            </>
          ) : (
            <>
              <Text>{loading ? "Updating..." : "Submit"}</Text>
              <Save size={24} color="white" />
            </>
          )
        }
      />
      <ScrollView
        style={styles.scrollcontainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.colors.primary + "20", "transparent"]}
          style={styles.headerGradient}
        />

        <View style={styles.content}>
          <PersonalInfoSection
            formData={formData}
            updateField={updateField}
            editable={isEditing}
          />
          <AboutMeSection
            formData={formData}
            updateField={updateField}
            editable={isEditing}
          />
          <ContactDetailsSection
            formData={formData}
            updateField={updateField}
            editable={isEditing}
          />
          <EducationCareerSection
            formData={formData}
            updateField={updateField}
            editable={isEditing}
          />
          <FamilyDetailsSection
            formData={formData}
            updateField={updateField}
            editable={isEditing}
          />
          <LifestyleSection
            formData={formData}
            updateField={updateField}
            editable={isEditing}
          />
          <PartnerPreferencesSection
            formData={formData}
            updateField={updateField}
            editable={isEditing}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollcontainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    height: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
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
    gap: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.sm,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: "white",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: "white",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "white",
    marginBottom: theme.spacing.sm,
  },
  pickerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  optionsContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "white",
    marginTop: theme.spacing.xs,
    maxHeight: 200,
  },
  optionItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  rangeContainer: {
    marginBottom: theme.spacing.sm,
  },
  rangeInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  rangeInput: {
    flex: 1,
  },
  rangeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
});
