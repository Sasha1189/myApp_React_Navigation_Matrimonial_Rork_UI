import { useState, useCallback, useEffect } from "react";
import {
  Alert,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FieldValues, useForm } from "react-hook-form";
import { X, Save } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { isDeepEqual } from "@/utils/deepEqual";
import { isFieldLocked } from "../components/form/profileValidation";
import { useTranslation } from "react-i18next";

export function useSectionEditor<T extends FieldValues>(
  profile: T | any,
  sectionFields: readonly (keyof T)[],
  updateProfile: (data: Partial<T>) => Promise<void>,
  navigation: any,
  theme: any,
  title: string,
) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<T>({
    defaultValues: profile || {},
  });

  // Handle Discard Alert
  const handleBack = useCallback(() => {
    if (isDirty) {
      Alert.alert(t("editor.discardTitle"), t("editor.discardMsg"), [
        { text: t("editor.keepEditing"), style: "cancel" },
        {
          text: t("editor.discard"),
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]);
      return true;
    }
    navigation.goBack();
    return true;
  }, [isDirty, navigation, t]);

  // Android Hardware Back
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack,
      );
      return () => subscription.remove();
    }, [handleBack]),
  );

  const onSave = handleSubmit(
    async (data) => {
      if (isSaving) return;
      setIsSaving(true);

      try {
        const changedFields: Partial<T> = {};

        sectionFields.forEach((key) => {
          const newValue = data[key];
          const oldValue = profile?.[key];

          // 1. Skip if value hasn't changed at all
          if (isDeepEqual(newValue, oldValue)) return;

          // 2. Skip if field is immutable and already locked down on server
          if (isFieldLocked(profile, key as any)) return;

          // 3. Skip if the value is blank garbage (empty string, whitespace, null, or undefined)
          if (
            newValue === null ||
            newValue === undefined ||
            (typeof newValue === "string" && newValue.trim() === "")
          ) {
            return;
          }

          // 4. Safe & Optimized: Capture ONLY the actual modified payload changes
          changedFields[key] = newValue;
        });

        // Only ping your endpoint if real updates occurred
        if (Object.keys(changedFields).length > 0) {
          await updateProfile(changedFields);
          reset(data);
        }
        navigation.goBack();
      } catch (err: any) {
        Alert.alert(t("common.error"), err.message || t("editor.saveError"));
      } finally {
        setIsSaving(false);
      }
    },
    (validationErrors) => {
      console.log("❌ Form Validation Failed Fields:", validationErrors);
      Alert.alert(
        t("common.error"),
        t("editor.validationErrorMsg") ||
          "Please fulfill all required fields before saving.",
      );
    },
  );

  // 4. Header Injection (Demo Aesthetic)
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: `${theme.colors.primary}12`,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: theme.spacing.md,
          }}
        >
          <X size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving || !isDirty}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: `${theme.colors.primary}12`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: theme.spacing.md,
            opacity: isSaving || !isDirty ? 0.3 : 1,
          }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Save size={22} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, isSaving, isDirty, theme, handleBack, onSave, title]);

  return { control };
}
