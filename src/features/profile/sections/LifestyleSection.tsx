import React from "react";
import FormSection from "../../../components/form/FormSection";
import PickerField from "../../../components/form/PickerField";
import MultiSelectField from "../../../components/form/MultiSelectField";
import { Coffee, Droplets, Wine } from "lucide-react-native";
import { Profile } from "../../../types/profile";
import {
  dietOptions,
  habitOptions,
  exerciseOptions,
  fitnessOptions,
  beliefOptions,
  hobbyOptions,
} from "../../../constants/profileOptions";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
  editable?: boolean;
}

const LifestyleSection: React.FC<Props> = ({
  formData,
  updateField,
  editable = true,
}) => (
  <FormSection title="Lifestyle" icon={Coffee}>
    <PickerField
      label="Diet Preferences"
      value={formData.dietPreferences || ""}
      options={dietOptions}
      onSelect={(v) => updateField("dietPreferences", v)}
      editable={editable}
      icon={Coffee}
    />
    <PickerField
      label="Smoking Habit"
      value={formData.smokingHabit || ""}
      options={habitOptions}
      onSelect={(v) => updateField("smokingHabit", v)}
      editable={editable}
      icon={Droplets}
    />
    <PickerField
      label="Drinking Habit"
      value={formData.drinkingHabit || ""}
      options={habitOptions}
      onSelect={(v) => updateField("drinkingHabit", v)}
      editable={editable}
      icon={Wine}
    />
    <PickerField
      label="Exercise Routine"
      value={formData.exerciseRoutine || ""}
      options={exerciseOptions}
      onSelect={(v) => updateField("exerciseRoutine", v)}
      editable={editable}
      icon={Droplets}
    />
    <PickerField
      label="Fitness Level"
      value={formData.fitnessLevel || ""}
      options={fitnessOptions}
      onSelect={(v) => updateField("fitnessLevel", v)}
      editable={editable}
      icon={Coffee}
    />
    {/* hobbies multiselect */}
    <MultiSelectField
      label="Hobbies"
      value={Array.isArray(formData.hobbies) ? formData.hobbies : []}
      options={hobbyOptions}
      onChange={(v) => updateField("hobbies", v)}
      editable={editable}
      icon={Coffee}
    />
    <PickerField
      label="Belief System"
      value={formData.beliefSystem || ""}
      options={beliefOptions}
      onSelect={(v) => updateField("beliefSystem", v)}
      editable={editable}
      icon={Coffee}
    />
  </FormSection>
);

export default LifestyleSection;
