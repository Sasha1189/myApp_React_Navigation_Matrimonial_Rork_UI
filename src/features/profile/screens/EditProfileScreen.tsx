import React, { useState, useLayoutEffect } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  ToastAndroid,
  Platform,
  View,
} from "react-native";
import { Edit3, Save, X } from "lucide-react-native";
import { useForm, FormProvider } from "react-hook-form";
import { theme } from "../../../constants/theme";
import { useTabNavigation } from "../../../navigation/hooks";
import { useProfileContext } from "../../../context/ProfileContext";
import { useUpdateProfileData } from "../hooks/useProfileData";
import { Profile } from "../../../types/profile";
import {
  PersonalInfoSection,
  AboutMeSection,
  ContactDetailsSection,
  EducationCareerSection,
  FamilyDetailsSection,
  LifestyleSection,
  PartnerPreferencesSection,
} from "../components/sections";
import {
  requiredFields,
  immutableFields,
  isFieldLocked,
} from "../components/form/profileValidation";
import { isDeepEqual } from "../../../utils/deepEqual";
import { useUnsavedChangesPrompt } from "../hooks/useUnsavedChangesPrompt";

export default function EditProfileScreen() {
  const navigation = useTabNavigation();
  const { profile } = useProfileContext();
  const { mutateAsync: updateProfile } = useUpdateProfileData(
    profile?.uid,
    profile?.gender,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const methods = useForm<Profile>({
    defaultValues: profile,
  });
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  useUnsavedChangesPrompt(navigation, isDirty);

  const handleSave = handleSubmit(async (data) => {
    if (!isEditing) return setIsEditing(true);
    setLoading(true);
    try {
      const changedFields: Partial<Profile> = {};
      const SKIP_FIELDS: (keyof Profile)[] = [
        "photos",
        "createdAt",
        "updatedAt",
        "thumbnail",
      ];

      (Object.keys(data) as (keyof Profile)[]).forEach((key) => {
        if (SKIP_FIELDS.includes(key as keyof Profile)) return false;

        if (
          !isDeepEqual(data[key], profile?.[key]) &&
          !isFieldLocked(profile, key)
        ) {
          (changedFields as any)[key] = data[key]!;
        }
      });

      if (Object.keys(changedFields).length > 0) {
        await updateProfile(changedFields);
        reset(data);
      }

      setIsEditing(false);
      if (Platform.OS === "android") {
        ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
      } else {
        Alert.alert(
          "Profile Updated",
          "Your profile has been successfully updated.",
        );
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      Alert.alert("Error", err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  });

  const handleDiscard = () => {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to revert all changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            reset(profile); // 🔹 Reverts form to original profile data
            setIsEditing(false); // 🔹 Locks the fields
          },
        },
      ],
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        isEditing ? (
          <TouchableOpacity
            onPress={handleDiscard}
            style={{
              backgroundColor: "rgba(151, 4, 4, 0.12)",
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              marginHorizontal: theme.spacing.lg,
            }}
          >
            <X size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        ) : null,

      // 🔹 Right Side: Edit/Save Toggle
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (!isEditing) {
              setIsEditing(true);
            } else if (!isDirty) {
              // 🔹 BUG FIX: If nothing changed, just lock it back, don't trigger save logic
              setIsEditing(false);
            } else {
              handleSave();
            }
          }}
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            marginHorizontal: theme.spacing.lg,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : isEditing ? (
            <Save size={24} color={theme.colors.background} />
          ) : (
            <Edit3 size={24} color={theme.colors.background} />
          )}
        </TouchableOpacity>
      ),
      headerTitle: isEditing ? "Editing Profile" : "My Profile",
    });
  }, [navigation, isEditing, loading, isDirty]);

  return (
    <FormProvider {...methods}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{ padding: theme.spacing.lg, paddingTop: theme.spacing.xl }}
        >
          <PersonalInfoSection editable={isEditing} profile={profile} />
          <AboutMeSection editable={isEditing} />
          <ContactDetailsSection editable={isEditing} />
          <EducationCareerSection editable={isEditing} />
          <FamilyDetailsSection editable={isEditing} />
          <LifestyleSection editable={isEditing} />
          <PartnerPreferencesSection editable={isEditing} />
        </View>
      </ScrollView>
    </FormProvider>
  );
}
