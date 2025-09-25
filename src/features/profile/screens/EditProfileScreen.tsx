import React, { useState } from "react";
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
import { theme } from "../../../constants/theme";
import CustomHeader from "../../../components/CustomeHeader";
import { useTabNavigation } from "../../../navigation/hooks";
import { useProfileContext } from "../../../context/ProfileContext";
import { useProfileForm } from "../hooks/useProfileForm";
import {
  requiredFields,
  immutableFields,
} from "../../../utils/profileValidation";
import {
  PersonalInfoSection,
  AboutMeSection,
  ContactDetailsSection,
  EducationCareerSection,
  FamilyDetailsSection,
  LifestyleSection,
  PartnerPreferencesSection,
} from "../components/sections";
import { useUpdateProfileData } from "../hooks/useProfile";
import { Profile } from "../../../types/profile";
import { useIsDirty } from "../hooks/useIsDirty";
import { useConfirmedImmutable } from "../hooks/useConfirmedImmutable";
import { useUnsavedChangesPrompt } from "../hooks/useUnsavedChangesPrompt";

export default function EditProfileScreen() {
  const navigation = useTabNavigation();
  const { profile } = useProfileContext();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { formData, fieldErrors, updateField, validateForm, scrollRef } =
    useProfileForm(profile, isEditing);

  const { mutateAsync: updateProfile } = useUpdateProfileData(
    profile?.uid,
    profile?.gender
  );

  // ✅ small reusable hooks
  const isDirty = useIsDirty(formData, profile);
  const confirmedImmutable = useConfirmedImmutable(profile, requiredFields);
  useUnsavedChangesPrompt(navigation, isDirty);

  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    setSaving(true);

    if (!validateForm()) {
      setSaving(false);
      return;
    }

    try {
      // build changedFields
      const changedFields: Partial<Profile> = {};
      (Object.keys(formData) as (keyof Profile)[]).forEach((key) => {
        const newVal = formData[key];
        const oldVal = profile?.[key];
        if (!Object.is(newVal, oldVal)) {
          changedFields[key] = newVal!;
        }
      });

      // filter immutable
      immutableFields.forEach((k) => {
        if (confirmedImmutable.includes(k)) delete changedFields[k];
      });

      if (Object.keys(changedFields).length === 0) {
        Alert.alert("No Changes", "You have not made any editable changes.");
        setIsEditing(false);
        setSaving(false);
        return;
      }

      await updateProfile(changedFields);

      if (Platform.OS === "android") {
        ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
      } else {
        Alert.alert(
          "Profile Updated",
          "Your profile has been successfully updated."
        );
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      Alert.alert("Error", err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

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
              <Text>{saving ? "Updating..." : "Submit"}</Text>
              <Save size={24} color="white" />
            </>
          )
        }
      />
      <ScrollView ref={scrollRef} style={{ flex: 1 }}>
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
