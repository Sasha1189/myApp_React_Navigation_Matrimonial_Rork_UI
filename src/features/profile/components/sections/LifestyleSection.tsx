import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import FormSection from "../form/FormSection";
import PickerField from "../form/PickerField";
import MultiSelectField from "../form/MultiSelectField";
import { Coffee, Droplets, Wine } from "lucide-react-native";
import { Profile } from "../../../../types/profile";
import {
  dietOptions,
  habitOptions,
  exerciseOptions,
  fitnessOptions,
  beliefOptions,
  hobbyOptions,
} from "../form/profileOptions";

interface LifestyleSectionProps {
  editable?: boolean;
}

export const LifestyleSection: React.FC<LifestyleSectionProps> = ({
  editable = true,
}) => {
  const { control } = useFormContext<Profile>();

  return (
    <FormSection title="Lifestyle" icon={Coffee} editable={editable}>
      {/* Diet Preferences */}
      <Controller
        control={control}
        name="dietPreferences"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Diet Preferences"
            value={value}
            placeholder="Select Diet Preferences"
            options={dietOptions}
            onSelect={onChange}
            editable={editable}
            icon={Coffee}
          />
        )}
      />

      {/* Smoking Habit */}
      <Controller
        control={control}
        name="smokingHabit"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Smoking Habit"
            value={value}
            placeholder="Select Smoking Habit"
            options={habitOptions}
            onSelect={onChange}
            editable={editable}
            icon={Droplets}
          />
        )}
      />

      {/* Drinking Habit */}
      <Controller
        control={control}
        name="drinkingHabit"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Drinking Habit"
            value={value}
            placeholder="Select Drinking Habit"
            options={habitOptions}
            onSelect={onChange}
            editable={editable}
            icon={Wine}
          />
        )}
      />

      {/* Exercise Routine */}
      <Controller
        control={control}
        name="exerciseRoutine"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Exercise Routine"
            value={value}
            placeholder="Select Exercise Routine"
            options={exerciseOptions}
            onSelect={onChange}
            editable={editable}
            icon={Droplets}
          />
        )}
      />

      {/* Fitness Level */}
      <Controller
        control={control}
        name="fitnessLevel"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Fitness Level"
            value={value}
            placeholder="Select Fitness Level"
            options={fitnessOptions}
            onSelect={onChange}
            editable={editable}
            icon={Coffee}
          />
        )}
      />

      {/* Hobbies (MultiSelect) */}
      <Controller
        control={control}
        name="hobbies"
        render={({ field: { onChange, value } }) => (
          <MultiSelectField
            label="Hobbies"
            value={Array.isArray(value) ? value : []}
            options={hobbyOptions}
            onChange={onChange}
            editable={editable}
            icon={Coffee}
          />
        )}
      />

      {/* Belief System */}
      <Controller
        control={control}
        name="beliefSystem"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Belief System"
            value={value}
            placeholder="Select Belief System"
            options={beliefOptions}
            onSelect={onChange}
            editable={editable}
            icon={Coffee}
          />
        )}
      />
    </FormSection>
  );
};

export default LifestyleSection;
