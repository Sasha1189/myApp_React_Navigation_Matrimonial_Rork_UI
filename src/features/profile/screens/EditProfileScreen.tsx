import React from "react";
import { FlatList } from "react-native";
import {
  FileText,
  User,
  BookOpen,
  Heart,
  Phone,
  Users,
  Coffee,
  Settings,
} from "lucide-react-native";
import { SECTION_CONFIG } from "../components/form/profileValidation";
import { useAppNavigation } from "../../../navigation/hooks";
import { useMyProfile } from "../context/ProfileContext";
import FormSection from "../components/form/FormSection";
import { useTranslation } from "react-i18next";

// Mapping icons to your sections
const ICON_MAP: Record<string, any> = {
  personal: User,
  about: FileText,
  contact: Phone,
  education: BookOpen,
  family: Users,
  lifestyle: Coffee,
  preferences: Settings,
};

export default function EditProfileScreen() {
  const { myProfile } = useMyProfile();
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  return (
    <FlatList
      data={SECTION_CONFIG}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20, paddingBottom: 52 }}
      renderItem={({ item }) => (
        <FormSection
          title={t(`details.sections.${item.id}`)}
          icon={ICON_MAP[item.id]}
          data={myProfile}
          fields={item.fields}
          onPress={() => navigation.navigate(item.screen)}
        />
      )}
    />
  );
}
