import React, { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { Controller } from "react-hook-form";
import {
  Coffee,
  Droplets,
  Wine,
  Activity,
  Heart,
  Sparkles,
} from "lucide-react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG } from "../form/profileValidation";
import { Profile } from "../../../../types/profile";
import { useTranslation } from "react-i18next";

import PickerField from "../form/PickerField";
import MultiSelectField from "../form/MultiSelectField";

// Your Options
import {
  dietOptions,
  habitOptions,
  exerciseOptions,
  fitnessOptions,
  beliefOptions,
  hobbyOptions,
} from "../form/profileOptions";

export default function EditLifestyleScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const config = SECTION_CONFIG.find((s) => s.id === "lifestyle")!;

  const { control } = useSectionEditor<Profile>(
    myProfile as Profile,
    config.fields,
    updateMyProfile,
    navigation,
    theme,
    config.title,
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: theme.spacing.xs }}>
        {/* Diet Preferences */}
        <Controller
          control={control}
          name="dietPreferences"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.diet")}
              value={value}
              placeholder={t("details.placeholders.diet")}
              options={dietOptions}
              onSelect={onChange}
              icon={Coffee}
              editable={true}
            />
          )}
        />

        {/* Smoking Habit */}
        <Controller
          control={control}
          name="smokingHabit"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.smoking")}
              value={value}
              placeholder={t("details.placeholders.habit")}
              options={habitOptions}
              onSelect={onChange}
              icon={Droplets}
              editable={true}
            />
          )}
        />

        {/* Drinking Habit */}
        <Controller
          control={control}
          name="drinkingHabit"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.drinking")}
              value={value}
              placeholder={t("details.placeholders.habit")}
              options={habitOptions}
              onSelect={onChange}
              icon={Wine}
              editable={true}
            />
          )}
        />

        {/* Exercise Routine */}
        <Controller
          control={control}
          name="exerciseRoutine"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.exercise")}
              value={value}
              placeholder={t("details.placeholders.exercise")}
              options={exerciseOptions}
              onSelect={onChange}
              icon={Activity}
              editable={true}
            />
          )}
        />

        {/* Fitness Level */}
        <Controller
          control={control}
          name="fitnessLevel"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.fitness")}
              value={value}
              placeholder={t("details.placeholders.fitness")}
              options={fitnessOptions}
              onSelect={onChange}
              icon={Heart}
              editable={true}
            />
          )}
        />

        {/* Hobbies (MultiSelect) - Premium Chip View */}
        <Controller
          control={control}
          name="hobbies"
          render={({ field: { onChange, value } }) => (
            <MultiSelectField
              label={t("details.labels.hobbies")}
              value={Array.isArray(value) ? value : []}
              options={hobbyOptions}
              onChange={onChange}
              placeholder={t("details.placeholders.multiHobbies")}
              icon={Sparkles}
              editable={true}
            />
          )}
        />

        {/* Belief System */}
        <Controller
          control={control}
          name="beliefSystem"
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.beliefSystem")}
              value={value}
              placeholder={t("details.placeholders.beliefSystem")}
              options={beliefOptions}
              onSelect={onChange}
              icon={Sparkles}
              editable={true}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
