import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Profile } from "../../../../types/profile";
import {
  FileText,
  Target,
  Church,
  Zap,
  Heart,
  Link,
  MessageCircle,
} from "lucide-react-native";

import FormSection from "../form/FormSection";
import InputField from "../form/InputField";

interface Props {
  editable?: boolean;
}

export const AboutMeSection: React.FC<Props> = ({ editable = true }) => {
  const { control } = useFormContext<Profile>();

  return (
    <FormSection title="About Me" icon={FileText} editable={editable}>
      {/* Short Bio */}
      <Controller
        control={control}
        name="shortBio"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Short Bio"
            value={value}
            onChangeText={onChange}
            placeholder="Write about yourself..."
            multiline
            editable={editable}
            icon={MessageCircle}
          />
        )}
      />

      {/* Aspirations */}
      <Controller
        control={control}
        name="aspirations"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Aspirations"
            value={value ?? ""}
            onChangeText={onChange}
            placeholder="e.g., Build a successful career and a happy family"
            multiline
            editable={editable}
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
            label="Beliefs & Values"
            value={value}
            onChangeText={onChange}
            placeholder="e.g., Respect, honesty, and compassion"
            multiline
            editable={editable}
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
            label="Strengths"
            value={value}
            onChangeText={onChange}
            placeholder="e.g., Hardworking, empathetic, and a good listener"
            editable={editable}
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
            label="Likes & Dislikes"
            value={value}
            onChangeText={onChange}
            placeholder="e.g., Likes: Traveling, Dislikes: Smoking"
            editable={editable}
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
            label="Social Media"
            value={value}
            onChangeText={onChange}
            placeholder="e.g., https://twitter.com/yourprofile"
            editable={editable}
            icon={Link}
          />
        )}
      />
    </FormSection>
  );
};
