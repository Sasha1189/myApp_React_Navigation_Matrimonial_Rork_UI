import React from "react";
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

import { useAppTheme } from "@/theme/ThemeContext";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import { SECTION_CONFIG } from "../form/profileValidation";
import { Profile } from "../../types/profile";
import { useTranslation } from "react-i18next";
import { transformLookupToOptions } from "@/features/utils/profileLookups";

import PickerField from "../form/PickerField";
import MultiSelectField from "../form/MultiSelectField";
import { useMyProfile } from "../../context/ProfileContext";

// Separate standalone array lookup since 'hb' index array is missing from LOOKUPS root object
const HOBBIES_LOOKUP = [
  "Reading",
  "Traveling",
  "Cooking",
  "Music",
  "Movies",
  "Sports",
  "Fitness",
  "Dancing",
  "Photography",
  "Gaming",
  "Art & Craft",
  "Other",
];

export default function EditLifestyleScreen({ navigation }: any) {
  const { myProfile, updateMyProfile } = useMyProfile();
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

  // Convert flat hobbies list to uniform structural lookup objects mapping indexes to labels
  const structuredHobbyOptions = React.useMemo(() => {
    return HOBBIES_LOOKUP.map((label, index) => ({
      label,
      value: index,
    }));
  }, []);

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
          name="dp" // dietPreferences -> dp
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.diet")}
              value={value}
              placeholder={t("details.placeholders.diet")}
              options={transformLookupToOptions("dp")}
              onSelect={onChange}
              icon={Coffee}
              editable={true}
            />
          )}
        />

        {/* Smoking Habit */}
        <Controller
          control={control}
          name="sh" // smokingHabit -> sh
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.smoking")}
              value={value}
              placeholder={t("details.placeholders.habit")}
              options={transformLookupToOptions("sh")}
              onSelect={onChange}
              icon={Droplets}
              editable={true}
            />
          )}
        />

        {/* Drinking Habit */}
        <Controller
          control={control}
          name="dh" // drinkingHabit -> dh
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.drinking")}
              value={value}
              placeholder={t("details.placeholders.habit")}
              options={transformLookupToOptions("dh")}
              onSelect={onChange}
              icon={Wine}
              editable={true}
            />
          )}
        />

        {/* Exercise Routine */}
        <Controller
          control={control}
          name="er" // exerciseRoutine -> er
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.exercise")}
              value={value}
              placeholder={t("details.placeholders.exercise")}
              options={transformLookupToOptions("er")}
              onSelect={onChange}
              icon={Activity}
              editable={true}
            />
          )}
        />

        {/* Fitness Level */}
        <Controller
          control={control}
          name="fl" // fitnessLevel -> fl
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.fitness")}
              value={value}
              placeholder={t("details.placeholders.fitness")}
              options={transformLookupToOptions("fl")}
              onSelect={onChange}
              icon={Heart}
              editable={true}
            />
          )}
        />

        {/* Hobbies (MultiSelect) - Premium Chip View */}
        <Controller
          control={control}
          name="hb" // hobbies -> hb
          render={({ field: { onChange, value } }) => (
            <MultiSelectField
              label={t("details.labels.hobbies")}
              value={Array.isArray(value) ? value : []} // Array of numeric indices e.g. [1, 3]
              options={structuredHobbyOptions}
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
          name="bs" // beliefSystem -> bs
          render={({ field: { onChange, value } }) => (
            <PickerField
              label={t("details.labels.beliefSystem")}
              value={value}
              placeholder={t("details.placeholders.beliefSystem")}
              options={transformLookupToOptions("bs")}
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
