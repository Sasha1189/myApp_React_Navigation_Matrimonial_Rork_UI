import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
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
import {
  PersonalInfoSection,
  AboutMeSection,
  ContactDetailsSection,
  EducationCareerSection,
  FamilyDetailsSection,
  LifestyleSection,
  PartnerPreferencesSection,
} from "../components/sections";

const requiredFields: (keyof Profile)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "maritalStatus",
];
const immutableFields: (keyof Profile)[] = [...requiredFields];

export default function EditProfileScreen() {
  const navigation = useTabNavigation();
  const { profile, loading, updateProfile } = useProfileContext();
  const [formData, setFormData] = useState<Partial<Profile>>(profile || {});
  const [isEditing, setIsEditing] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [confirmedImmutable, setConfirmedImmutable] = useState<
    (keyof Profile)[]
  >([]);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof Profile, string>>
  >({});

  // // Check if any field is different
  // const isDirty = useMemo(() => {
  //   return (Object.keys(formData) as (keyof Profile)[]).some(
  //     (key) => formData[key] !== profile[key]
  //   );
  // }, [formData, profile]);

  // // Navigation guard for unsaved changes
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("beforeRemove", (e) => {
  //     if (!isDirty) return;

  //     e.preventDefault();

  //     Alert.alert(
  //       "Unsaved Changes",
  //       "You have unsaved changes. Are you sure you want to leave?",
  //       [
  //         { text: "Cancel", style: "cancel", onPress: () => {} },
  //         {
  //           text: "Discard",
  //           style: "destructive",
  //           onPress: () => navigation.dispatch(e.data.action),
  //         },
  //       ]
  //     );
  //   });

  //   return unsubscribe;
  // }, [navigation, isDirty]);

  // Reset form when profile updates
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData(profile);
    }
    // initialize confirmedImmutable from server-loaded profile: any required field
    // that already has a value should be considered confirmed/immutable
    if (profile) {
      const initiallyConfirmed = requiredFields.filter((k) => {
        const v = (profile as any)[k];
        if (v === null || v === undefined) return false;
        if (typeof v === "string" && v.trim() === "") return false;
        return true;
      });
      setConfirmedImmutable(initiallyConfirmed);
    }
  }, [profile, isEditing]);

  const scrollRef = useRef<ScrollView | null>(null);

  // typed field updater
  const updateField = (field: keyof Profile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // clear error for this field when user updates it
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev } as any;
      delete next[field];
      return next;
    });
  };
  // Validate form data
  const validateForm = (): boolean => {
    const emptyRequiredFields = requiredFields.filter((key) => {
      const val = formData[key];
      if (val === null || val === undefined) return true;
      if (typeof val === "string" && val.trim() === "") return true;
      return false;
    });

    // Special validation for gender (must be explicitly selected)
    if (
      !formData.gender ||
      (typeof formData.gender === "string" && formData.gender.trim() === "")
    ) {
      // set inline error for gender field
      setFieldErrors((prev) => ({
        ...prev,
        gender: "Please select your gender.",
      }));
      // also show an alert for accessibility/visibility
      Alert.alert("Please select your gender.");
      return false;
    }

    if (emptyRequiredFields.length) {
      // map to readable names and set first field error for focus
      const first = emptyRequiredFields[0];
      setFieldErrors((prev) => ({
        ...prev,
        [first]: "This field is required.",
      }));
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

      // Remove any immutable fields from payload if they were changed by the UI
      // but only treat a field as immutable if it was previously confirmed (saved).
      immutableFields.forEach((k) => {
        if (k in changedFields) {
          // Only block updates if this field was already confirmed immutable
          if (
            confirmedImmutable.includes(k) &&
            (profile as any)[k] !== undefined &&
            (changedFields as any)[k] !== (profile as any)[k]
          ) {
            delete (changedFields as any)[k];
          }
        }
      });

      // If filtering immutable fields removed all changes, abort
      if (Object.keys(changedFields).length === 0) {
        Alert.alert(
          "No Updatable Changes",
          "Changes only included fields that cannot be updated."
        );
        setIsEditing(false);
        setLoading(false);
        return;
      }
      console.log("API about to hit");

      // Normalize Date values to ISO date-only strings before sending
      try {
        const { toISODate } = await import("../../../utils/date");
        Object.keys(changedFields).forEach((k) => {
          const v = changedFields[k as keyof Profile];
          if (v instanceof Date) {
            const iso = toISODate(v as Date);
            if (iso) changedFields[k as keyof Profile] = iso;
          }
        });
      } catch (e) {
        // If helper import fails, continue without normalization
        console.warn("Date normalization failed", e);
      }

      const updated = await updateProfile(changedFields);

      if (Platform.OS === "android") {
        ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
      } else {
        Alert.alert(
          "Profile Updated",
          "Your profile has been successfully updated."
        );
      }
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
        ref={scrollRef}
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
            requiredFields={requiredFields}
            immutableFields={immutableFields}
            confirmedImmutable={confirmedImmutable}
            fieldErrors={fieldErrors}
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
