import React from "react";
import { View, ScrollView } from "react-native";
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
import { Profile } from "@/types/profile";
import { useTranslation } from "react-i18next";

export default function EditAboutMeScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const config = SECTION_CONFIG.find((s) => s.id === "about")!;

  const { control } = useSectionEditor(
    myProfile,
    config.fields,
    updateMyProfile,
    navigation,
    theme,
    config.title,
  );

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: theme.spacing.xxl,
      }}
      contentContainerStyle={{
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ padding: 20, gap: 16 }}>
        {/* Short Bio */}
        <Controller
          control={control}
          name="shortBio"
          render={({ field: { onChange, value } }) => {
            const isLocked = isFieldLocked(myProfile, "shortBio");
            return (
              <InputField
                label={t("details.labels.shortBio")}
                value={value}
                onChangeText={onChange}
                placeholder={t("details.placeholders.bio")}
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
          name="aspirations"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.aspirations")}
              value={value ?? ""}
              onChangeText={onChange}
              placeholder={t("details.placeholders.aspirations")}
              multiline
              editable={!isFieldLocked(myProfile as Profile, "aspirations")}
              icon={Target}
            />
          )}
        />

        {/* Beliefs & Values */}
        <Controller
          control={control}
          name="beliefsValues"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.beliefsValues")}
              value={value}
              onChangeText={onChange}
              placeholder={t("details.placeholders.beliefs")}
              multiline
              editable={!isFieldLocked(myProfile as Profile, "beliefsValues")}
              icon={Church}
            />
          )}
        />

        {/* Strengths */}
        <Controller
          control={control}
          name="strengths"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.strengths")}
              value={value}
              onChangeText={onChange}
              placeholder={t("details.placeholders.strengths")}
              editable={!isFieldLocked(myProfile as Profile, "strengths")}
              icon={Zap}
            />
          )}
        />

        {/* Likes & Dislikes */}
        <Controller
          control={control}
          name="likesDislikesText"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.likesDislikesText")}
              value={value}
              onChangeText={onChange}
              placeholder={t("details.placeholders.likes")}
              editable={
                !isFieldLocked(myProfile as Profile, "likesDislikesText")
              }
              icon={Heart}
            />
          )}
        />

        {/* Social Media */}
        <Controller
          control={control}
          name="socialMedia"
          render={({ field: { onChange, value } }) => (
            <InputField
              label={t("details.labels.socialMedia")}
              value={value}
              onChangeText={onChange}
              placeholder={t("details.placeholders.social")}
              editable={!isFieldLocked(myProfile as Profile, "socialMedia")}
              icon={Link}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
