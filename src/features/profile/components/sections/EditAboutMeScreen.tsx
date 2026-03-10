import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Controller } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";
import {
  X,
  Save,
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

export default function EditAboutMeScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();
  const { theme } = useAppTheme();
  const config = SECTION_CONFIG.find((s) => s.id === "about")!;

  const { control } = useSectionEditor(
    profile,
    config.fields,
    updateProfile,
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
            const isLocked = isFieldLocked(profile, "shortBio");
            return (
              <InputField
                label="Short Bio"
                value={value}
                onChangeText={onChange}
                placeholder="Tell us about yourself.."
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
              label="Aspirations"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="e.g., Build a successful career and a happy family"
              multiline
              editable={!isFieldLocked(profile as Profile, "aspirations")}
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
              editable={!isFieldLocked(profile as Profile, "beliefsValues")}
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
              editable={!isFieldLocked(profile as Profile, "strengths")}
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
              editable={!isFieldLocked(profile as Profile, "likesDislikesText")}
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
              editable={!isFieldLocked(profile as Profile, "socialMedia")}
              icon={Link}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
