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

export function useSectionEditor<T extends FieldValues>(
  profile: T | any,
  sectionFields: readonly (keyof T)[],
  onSaveApi: (data: Partial<T>) => Promise<void>,
  navigation: any,
  theme: any,
  title: string,
) {
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
      Alert.alert("Discard Changes?", "You have unsaved changes.", [
        { text: "Keep Editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]);
      return true;
    }
    navigation.goBack();
    return true;
  }, [isDirty, navigation]);

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

  const onSave = handleSubmit(async (data) => {
    if (isSaving) return; // Prevent multiple clicks
    setIsSaving(true);

    try {
      const changedFields: Partial<T> = {};
      sectionFields.forEach((key) => {
        if (
          !isDeepEqual(data[key], profile?.[key]) &&
          !isFieldLocked(profile, key as any)
        ) {
          changedFields[key] = data[key];
        }
      });

      if (Object.keys(changedFields).length > 0) {
        await onSaveApi(changedFields);
        reset(data);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  });

  // 4. Header Injection (Demo Aesthetic)
  useEffect(() => {
    navigation.setOptions({
      headerTitle: title,
      headerTitleStyle: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 0.5,
        color: theme.colors.card,
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBack}
          style={{ marginLeft: 16, marginRight: 16, padding: 4 }}
        >
          <X size={22} color={theme.colors.card} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={onSave}
          disabled={isSaving || !isDirty}
          style={{
            marginRight: 16,
            opacity: isSaving || !isDirty ? 0.3 : 1,
            padding: 4,
          }}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.card} />
          ) : (
            <Save size={22} color={theme.colors.card} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, isSaving, isDirty, theme, handleBack, onSave, title]);

  return { control };
}
