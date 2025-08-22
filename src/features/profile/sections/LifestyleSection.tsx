import React from "react";
import FormSection from "../../../components/form/FormSection";
import PickerField from "../../../components/form/PickerField";
import { Coffee, Droplets, Wine } from "lucide-react-native";
import { Profile } from "../../../types/profile";
import {
  dietOptions,
  smokeOptions,
  drinkOptions,
} from "../../../constants/profileOptions";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
}

const LifestyleSection: React.FC<Props> = ({ formData, updateField }) => (
  <FormSection title="Lifestyle" icon={Coffee}>
    <PickerField
      label="Diet"
      value={formData.diet || ""}
      options={dietOptions}
      onSelect={(v) => updateField("diet", v)}
      icon={Coffee}
    />
    <PickerField
      label="Smoke"
      value={formData.smoke || ""}
      options={smokeOptions}
      onSelect={(v) => updateField("smoke", v)}
      icon={Droplets}
    />
    <PickerField
      label="Drink"
      value={formData.drink || ""}
      options={drinkOptions}
      onSelect={(v) => updateField("drink", v)}
      icon={Wine}
    />
  </FormSection>
);

export default LifestyleSection;
