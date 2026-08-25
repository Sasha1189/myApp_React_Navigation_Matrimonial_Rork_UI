import React from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Controller } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import {
  Target,
  Church,
  Zap,
  Heart,
  Link,
  MessageCircle,
} from "lucide-react-native";
import InputField from "../form/InputField";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG, isFieldLocked } from "../form/profileValidation";
import { Profile } from "@/features/profile/types/profile";
import { useTranslation } from "react-i18next";
import { useMyProfile } from "../../context/ProfileContext";

export default function EditAboutMeScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useMyProfile();
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const config = SECTION_CONFIG.find((s) => s.id === "about")!;

  const { control } = useSectionEditor<Profile>(
    myProfile as Profile,
    config.fields,
    updateMyProfile,
    navigation,
    theme,
    config.title,
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={true}
      >
        <View style={{ gap: 16 }}>
          {/* Short Bio */}
          <Controller
            control={control}
            name="sb" // shortBio -> sb
            render={({ field: { onChange, value } }) => {
              const isLocked = isFieldLocked(myProfile as Profile, "sb");
              return (
                <InputField
                  label={t("details.labels.shortBio")}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t("details.placeholders.bio")}
                  maxLength={250}
                  multiline
                  editable={!isLocked}
                  locked={isLocked}
                  icon={MessageCircle}
                />
              );
            }}
          />

          {/* Aspirations */}
          <Controller
            control={control}
            name="as" // aspirations -> as
            render={({ field: { onChange, value } }) => {
              const isLocked = isFieldLocked(myProfile as Profile, "as");
              return (
                <InputField
                  label={t("details.labels.aspirations")}
                  value={value ?? ""}
                  onChangeText={onChange}
                  placeholder={t("details.placeholders.aspirations")}
                  maxLength={150}
                  multiline
                  editable={!isLocked}
                  locked={isLocked}
                  icon={Target}
                />
              );
            }}
          />

          {/* Beliefs & Values */}
          <Controller
            control={control}
            name="bv" // beliefsValues -> bv
            render={({ field: { onChange, value } }) => {
              const isLocked = isFieldLocked(myProfile as Profile, "bv");
              return (
                <InputField
                  label={t("details.labels.beliefsValues")}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t("details.placeholders.beliefs")}
                  maxLength={150}
                  multiline
                  editable={!isLocked}
                  locked={isLocked}
                  icon={Church}
                />
              );
            }}
          />

          {/* Strengths */}
          <Controller
            control={control}
            name="st" // strengths -> st
            render={({ field: { onChange, value } }) => {
              const isLocked = isFieldLocked(myProfile as Profile, "st");
              return (
                <InputField
                  label={t("details.labels.strengths")}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t("details.placeholders.strengths")}
                  maxLength={100}
                  editable={!isLocked}
                  locked={isLocked}
                  icon={Zap}
                />
              );
            }}
          />

          {/* Likes & Dislikes */}
          <Controller
            control={control}
            name="ld" // likesDislikesText -> ld
            render={({ field: { onChange, value } }) => {
              const isLocked = isFieldLocked(myProfile as Profile, "ld");
              return (
                <InputField
                  label={t("details.labels.likesDislikesText")}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t("details.placeholders.likes")}
                  maxLength={100}
                  editable={!isLocked}
                  locked={isLocked}
                  icon={Heart}
                />
              );
            }}
          />

          {/* Social Media */}
          <Controller
            control={control}
            name="sm" // socialMedia -> sm
            render={({ field: { onChange, value } }) => {
              const isLocked = isFieldLocked(myProfile as Profile, "sm");
              return (
                <InputField
                  label={t("details.labels.socialMedia")}
                  value={value}
                  onChangeText={onChange}
                  placeholder={t("details.placeholders.social")}
                  maxLength={150}
                  editable={!isLocked}
                  locked={isLocked}
                  icon={Link}
                />
              );
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
