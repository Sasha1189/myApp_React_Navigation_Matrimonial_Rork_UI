import React, { useState, useEffect, useLayoutEffect } from "react";
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
import { useUpdateProfileData } from "../hooks/useProfile";
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
} from "../components/form/profileValidation";
import { isDeepEqual } from "../../../utils/deepEqual";
import { useIsDirty } from "../hooks/useIsDirty";
import { useConfirmedImmutable } from "../hooks/useConfirmedImmutable";
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

  // ✅ useForm with FormProvider
  const methods = useForm<Profile>({
    defaultValues: profile,
  });

  // ✅ small reusable hooks
  const formData = methods.watch();
  const isDirty = useIsDirty(formData, profile);
  const confirmedImmutable = useConfirmedImmutable(profile, requiredFields);
  useUnsavedChangesPrompt(navigation, isDirty);

  const { handleSubmit, reset } = methods;

  // ✅ reset when profile changes
  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const SKIP_FIELDS: (keyof Profile)[] = ["photos", "createdAt", "updatedAt"];

  const handleSave = handleSubmit(async (data) => {
    if (!isEditing) return setIsEditing(true);

    setLoading(true);

    try {
      // 🔹 Build only changed fields
      const changedFields: Partial<Profile> = {};
      (Object.keys(data) as (keyof Profile)[]).forEach((key) => {
        const newVal = data[key];
        const oldVal = profile?.[key];

        if (SKIP_FIELDS.includes(key as keyof Profile)) return false;

        if (!isDeepEqual(newVal, oldVal)) {
          changedFields[key] = newVal!;
        }
      });

      // 🔹 Filter out immutable fields if they were already confirmed
      immutableFields.forEach((k) => {
        if (confirmedImmutable.includes(k)) {
          delete changedFields[k];
        }
      });

      // 🔹 If no changes, abort
      if (Object.keys(changedFields).length === 0) {
        Alert.alert("No Changes", "You have not made any editable changes.");
        setIsEditing(false);
        setLoading(false);
        return;
      }

      await updateProfile(changedFields);

      if (Platform.OS === "android") {
        ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
      } else {
        Alert.alert(
          "Profile Updated",
          "Your profile has been successfully updated.",
        );
      }
      // Lock fields again
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile update failed:", err);
      Alert.alert("Error", err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  });

  const handleDiscard = () => {
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
      // 🔹 Left Side: Discard Button (Only when editing)
      headerLeft: () =>
        isEditing ? (
          <TouchableOpacity
            onPress={handleDiscard}
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
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
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
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
      // 🔹 Ensure the back button is hidden if we show the X button
      headerBackVisible: !isEditing,
    });
  }, [navigation, isEditing, loading, profile]);

  return (
    <FormProvider {...methods}>
      <ScrollView style={{ flex: 1 }}>
        {/* <LinearGradient
          colors={[theme.colors.primary + "20", "transparent"]}
          style={{
            height: 100,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        /> */}
        <View
          style={{ padding: theme.spacing.lg, paddingTop: theme.spacing.xl }}
        >
          <PersonalInfoSection editable={isEditing} />
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
