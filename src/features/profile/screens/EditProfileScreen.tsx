import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Alert,
  ToastAndroid,
  Platform,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit3, Save } from "lucide-react-native";
import { useForm, FormProvider } from "react-hook-form";
import { theme } from "../../../constants/theme";
import CustomHeader from "../../../components/CustomeHeader";
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

import { useIsDirty } from "../hooks/useIsDirty";
import { useConfirmedImmutable } from "../hooks/useConfirmedImmutable";
import { useUnsavedChangesPrompt } from "../hooks/useUnsavedChangesPrompt";

export default function EditProfileScreen() {
  const navigation = useTabNavigation();
  const { profile } = useProfileContext();
  const { mutateAsync: updateProfile } = useUpdateProfileData(
    profile?.uid,
    profile?.gender
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

  const handleSave = handleSubmit(async (data) => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setLoading(true);

    try {
      // 🔹 Build only changed fields
      const changedFields: Partial<Profile> = {};
      (Object.keys(data) as (keyof Profile)[]).forEach((key) => {
        const newVal = data[key];
        const oldVal = profile?.[key];
        if (!Object.is(newVal, oldVal)) {
          changedFields[key] = newVal as Profile[typeof key];
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

      console.log("Submitting data:", changedFields);
      await updateProfile(changedFields);

      if (Platform.OS === "android") {
        ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
      } else {
        Alert.alert(
          "Profile Updated",
          "Your profile has been successfully updated."
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader
        title="Edit Profile"
        showBack
        onBack={() => navigation.goBack()}
        showRightIcon
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
      <FormProvider {...methods}>
        <ScrollView style={{ flex: 1 }}>
          <LinearGradient
            colors={[theme.colors.primary + "20", "transparent"]}
            style={{
              height: 100,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          />
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
    </SafeAreaView>
  );
}
