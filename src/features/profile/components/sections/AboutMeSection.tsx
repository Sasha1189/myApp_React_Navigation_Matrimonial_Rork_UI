import React from "react";
import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import { FileText } from "lucide-react-native";
import { Profile } from "../../../../types/profile";

interface Props {
  formData: Partial<Profile>;
  updateField: (field: keyof Profile, value: any) => void;
  editable?: boolean;
}

const AboutMeSection: React.FC<Props> = ({
  formData,
  updateField,
  editable = true,
}) => (
  <FormSection title="About Me" icon={FileText} editable={editable}>
    <InputField
      label="Short Bio"
      value={formData.shortBio || ""}
      onChangeText={(t) => updateField("shortBio", t)}
      placeholder="e.g., Simple, kind-hearted individual..."
      multiline
      editable={editable}
    />
    <InputField
      label="Aspiration"
      value={formData.aspirations || ""}
      onChangeText={(t) => updateField("aspirations", t)}
      placeholder="e.g., Build a successful career and a happy family"
      multiline
      editable={editable}
    />
    <InputField
      label="Beliefs & Values"
      value={formData.beliefsValues || ""}
      onChangeText={(t) => updateField("beliefsValues", t)}
      placeholder="e.g. Respect, honesty, and compassion"
      multiline
      editable={editable}
    />
    <InputField
      label="Strengths"
      value={formData.strengths || ""}
      onChangeText={(t) => updateField("strengths", t)}
      placeholder="e.g., Hardworking, empathetic, and a good listener"
      multiline
      editable={editable}
    />
    <InputField
      label="Likes & Dislikes"
      value={formData.likesDislikesText || ""}
      onChangeText={(t) => updateField("likesDislikesText", t)}
      placeholder="e.g., Likes: Traveling, Dislikes: smoking"
      multiline
      editable={editable}
    />
    <InputField
      label="Social Media Link"
      value={formData.socialMedia || ""}
      onChangeText={(t) => updateField("socialMedia", t)}
      placeholder="e.g., https://twitter.com/yourprofile"
      editable={editable}
    />
  </FormSection>
);

export default AboutMeSection;
