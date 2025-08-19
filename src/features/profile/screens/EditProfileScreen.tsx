import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Save,
  User,
  Heart,
  Phone,
  GraduationCap,
  Users,
  Activity,
  Star,
  Calendar,
  MapPin,
  ChevronDown,
  UserCheck,
  Timer,
  Home,
  Scale,
  Ruler,
  Droplets,
  Sparkles,
  Zap,
  Target,
  MessageCircle,
  Link,
  Mail,
  UserPlus,
  Building,
  Briefcase,
  DollarSign,
  Utensils,
  Cigarette,
  Wine,
  Dumbbell,
  Brain,
  Church,
  HeartHandshake,
} from "lucide-react-native";
import { theme } from "../../../constants/theme";
import { Profile } from "../../../types/profile";
import CustomHeader from "../../../components/CustomeHeader";
import { useTabNavigation } from "../../../navigation/hooks";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  children,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Icon size={20} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  icon?: React.ComponentType<any>;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
  icon: Icon,
}) => (
  <View style={styles.inputContainer}>
    <View style={styles.inputLabelContainer}>
      {Icon && <Icon size={16} color={theme.colors.primary} />}
      <Text style={styles.inputLabel}>{label}</Text>
    </View>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textLight}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

interface PickerFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: React.ComponentType<any>;
}

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  icon: Icon,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        {Icon && <Icon size={16} color={theme.colors.primary} />}
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text style={[styles.pickerText, !value && styles.placeholderText]}>
          {value || `Select ${label}`}
        </Text>
        <ChevronDown size={20} color={theme.colors.textLight} />
      </TouchableOpacity>
      {showOptions && (
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={() => {
                onSelect(option);
                setShowOptions(false);
              }}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function EditProfileScreen() {
  const navigation = useTabNavigation();

  const [formData, setFormData] = useState<Partial<Profile>>({
    fullName: "",
    dateOfBirth: new Date(),
    timeOfBirth: "",
    placeOfBirth: "",
    gender: "Male",
    maritalStatus: "Never Married",
    height: "",
    weight: "",
    bodyType: "Average",
    bloodGroup: "O+",
    manglikStatus: "Don't Know",
    rashi: "Aries",
    horoscopeRequired: "Optional",
    shortBio: "",
    lifeGoals: "",
    beliefsValues: "",
    strengths: "",
    likesDislikesText: "",
    socialMedia: "",
    currentCity: "",
    nativePlace: "",
    mobileNumber: "",
    emailAddress: "",
    preferredContact: "Phone",
    profileCreatedBy: "Self",
    highestQualification: "Bachelor's",
    fieldOfStudy: "Engineering",
    currentOccupation: "Working",
    industry: "IT",
    jobTitle: "",
    companyName: "",
    workLocation: "",
    annualIncome: "₹5L+",
    fatherOccupation: "",
    motherOccupation: "",
    numberOfBrothers: 0,
    numberOfSisters: 0,
    siblingsDetails: "",
    familyType: "Nuclear",
    familyValues: "Modern",
    dietPreferences: "Vegetarian",
    smokingHabit: "No",
    drinkingHabit: "No",
    exerciseRoutine: "Sometimes",
    fitnessLevel: "Average",
    hobbies: [],
    personalityType: "Ambivert",
    beliefSystem: "Open-minded",
    preferredAgeRange: { min: 25, max: 35 },
    preferredHeightRange: { min: "5'0''", max: "6'0''" },
    preferredMaritalStatus: "Never Married",
    manglikPreference: "Don't Know",
    preferredEducation: "Graduate",
    preferredProfession: "Working Professional",
    preferredIncomeRange: "₹5L+",
    locationPreference: "",
    livingWithParents: "Okay",
  });

  const updateField = (field: keyof Profile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert("Success", "Profile updated successfully!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const genderOptions = ["Male", "Female"];
  const maritalStatusOptions = ["Never Married", "Divorced", "Widowed"];
  const bodyTypeOptions = ["Slim", "Athletic", "Average", "Heavy"];
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const manglikOptions = ["Yes", "No", "Partial", "Don't Know"];
  const rashiOptions = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  const horoscopeOptions = ["Yes", "No", "Optional"];
  const contactOptions = ["WhatsApp", "Phone", "Email", "Chat only"];
  const createdByOptions = ["Self", "Father", "Mother", "Sibling"];
  const qualificationOptions = [
    "10th",
    "12th",
    "Diploma",
    "Bachelor's",
    "Master's",
    "PhD",
    "Other",
  ];
  const studyFieldOptions = [
    "Engineering",
    "Arts",
    "Science",
    "Commerce",
    "Medicine",
    "Law",
    "Other",
  ];
  const occupationOptions = [
    "Working",
    "Business",
    "Self-employed",
    "Freelancer",
    "Not working",
    "Student",
  ];
  const industryOptions = [
    "IT",
    "Finance",
    "Govt",
    "Education",
    "Healthcare",
    "Other",
  ];
  const incomeOptions = ["₹UPTO 5L", "₹5L+", "₹10L+", "₹20L+"];
  const familyTypeOptions = ["Joint", "Nuclear"];
  const familyValuesOptions = ["Traditional", "Modern"];
  const dietOptions = ["Vegetarian", "Eggetarian", "Non-Veg"];
  const habitOptions = ["No", "Occasionally", "Yes"];
  const exerciseOptions = ["Regular", "Sometimes", "Rarely", "Never"];
  const fitnessOptions = ["Fit", "Average", "Overweight", "Athletic"];
  const personalityOptions = ["Introvert", "Extrovert", "Ambivert"];
  const beliefOptions = ["Spiritual", "Open-minded"];

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Edit Profile"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRightIcon={true}
        onIconClick={handleSave}
        rightIcon={<Save size={24} color="white" />}
      />
      <ScrollView
        style={styles.scrollcontainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.colors.primary + "20", "transparent"]}
          style={styles.headerGradient}
        />

        <View style={styles.content}>
          <FormSection title="Personal & Birth Information" icon={User}>
            <InputField
              label="Full Name"
              value={formData.fullName || ""}
              onChangeText={(text) => updateField("fullName", text)}
              placeholder="Enter your full name"
              icon={UserCheck}
            />

            <InputField
              label="Time of Birth"
              value={formData.timeOfBirth || ""}
              onChangeText={(text) => updateField("timeOfBirth", text)}
              placeholder="e.g., 10:30 AM"
              icon={Timer}
            />

            <InputField
              label="Place of Birth"
              value={formData.placeOfBirth || ""}
              onChangeText={(text) => updateField("placeOfBirth", text)}
              placeholder="Enter place of birth"
              icon={MapPin}
            />

            <PickerField
              label="Gender"
              value={formData.gender || ""}
              options={genderOptions}
              onSelect={(value) => updateField("gender", value)}
              icon={User}
            />

            <PickerField
              label="Marital Status"
              value={formData.maritalStatus || ""}
              options={maritalStatusOptions}
              onSelect={(value) => updateField("maritalStatus", value)}
              icon={HeartHandshake}
            />

            <InputField
              label="Height"
              value={formData.height || ""}
              onChangeText={(text) => updateField("height", text)}
              placeholder="e.g., 5'6''"
              icon={Ruler}
            />

            <InputField
              label="Weight"
              value={formData.weight || ""}
              onChangeText={(text) => updateField("weight", text)}
              placeholder="e.g., 65 kg"
              icon={Scale}
            />

            <PickerField
              label="Body Type"
              value={formData.bodyType || ""}
              options={bodyTypeOptions}
              onSelect={(value) => updateField("bodyType", value)}
              icon={Activity}
            />

            <PickerField
              label="Blood Group"
              value={formData.bloodGroup || ""}
              options={bloodGroupOptions}
              onSelect={(value) => updateField("bloodGroup", value)}
              icon={Droplets}
            />

            <PickerField
              label="Manglik Status"
              value={formData.manglikStatus || ""}
              options={manglikOptions}
              onSelect={(value) => updateField("manglikStatus", value)}
              icon={Sparkles}
            />

            <PickerField
              label="Rashi (Zodiac)"
              value={formData.rashi || ""}
              options={rashiOptions}
              onSelect={(value) => updateField("rashi", value)}
              icon={Star}
            />

            <PickerField
              label="Horoscope Required?"
              value={formData.horoscopeRequired || ""}
              options={horoscopeOptions}
              onSelect={(value) => updateField("horoscopeRequired", value)}
              icon={Zap}
            />
          </FormSection>

          <FormSection title="About Me" icon={Heart}>
            <InputField
              label="Short Bio"
              value={formData.shortBio || ""}
              onChangeText={(text) => updateField("shortBio", text)}
              placeholder="Tell us about yourself..."
              multiline
              icon={MessageCircle}
            />

            <InputField
              label="Life Goals / Aspirations"
              value={formData.lifeGoals || ""}
              onChangeText={(text) => updateField("lifeGoals", text)}
              placeholder="What are your life goals?"
              multiline
              icon={Target}
            />

            <InputField
              label="Beliefs & Values"
              value={formData.beliefsValues || ""}
              onChangeText={(text) => updateField("beliefsValues", text)}
              placeholder="What values are important to you?"
              multiline
              icon={Church}
            />

            <InputField
              label="Strengths / Highlights"
              value={formData.strengths || ""}
              onChangeText={(text) => updateField("strengths", text)}
              placeholder="What are your strengths?"
              multiline
              icon={Zap}
            />

            <InputField
              label="Likes & Dislikes"
              value={formData.likesDislikesText || ""}
              onChangeText={(text) => updateField("likesDislikesText", text)}
              placeholder="What do you like and dislike?"
              multiline
              icon={Heart}
            />

            <InputField
              label="Social Media"
              value={formData.socialMedia || ""}
              onChangeText={(text) => updateField("socialMedia", text)}
              placeholder="Social media links"
              icon={Link}
            />
          </FormSection>

          <FormSection title="Contact Details" icon={Phone}>
            <InputField
              label="Current City"
              value={formData.currentCity || ""}
              onChangeText={(text) => updateField("currentCity", text)}
              placeholder="Enter current city"
              icon={MapPin}
            />

            <InputField
              label="Native Place"
              value={formData.nativePlace || ""}
              onChangeText={(text) => updateField("nativePlace", text)}
              placeholder="Enter native place"
              icon={Home}
            />

            <InputField
              label="Mobile Number"
              value={formData.mobileNumber || ""}
              onChangeText={(text) => updateField("mobileNumber", text)}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              icon={Phone}
            />

            <InputField
              label="Email Address"
              value={formData.emailAddress || ""}
              onChangeText={(text) => updateField("emailAddress", text)}
              placeholder="Enter email address"
              keyboardType="email-address"
              icon={Mail}
            />

            <PickerField
              label="Preferred Contact"
              value={formData.preferredContact || ""}
              options={contactOptions}
              onSelect={(value) => updateField("preferredContact", value)}
              icon={MessageCircle}
            />

            <PickerField
              label="Profile Created By"
              value={formData.profileCreatedBy || ""}
              options={createdByOptions}
              onSelect={(value) => updateField("profileCreatedBy", value)}
              icon={UserPlus}
            />
          </FormSection>

          <FormSection title="Education & Career" icon={GraduationCap}>
            <PickerField
              label="Highest Qualification"
              value={formData.highestQualification || ""}
              options={qualificationOptions}
              onSelect={(value) => updateField("highestQualification", value)}
              icon={GraduationCap}
            />

            <PickerField
              label="Field of Study"
              value={formData.fieldOfStudy || ""}
              options={studyFieldOptions}
              onSelect={(value) => updateField("fieldOfStudy", value)}
              icon={GraduationCap}
            />

            <PickerField
              label="Current Occupation"
              value={formData.currentOccupation || ""}
              options={occupationOptions}
              onSelect={(value) => updateField("currentOccupation", value)}
              icon={Briefcase}
            />

            <PickerField
              label="Industry"
              value={formData.industry || ""}
              options={industryOptions}
              onSelect={(value) => updateField("industry", value)}
              icon={Building}
            />

            <InputField
              label="Job Title"
              value={formData.jobTitle || ""}
              onChangeText={(text) => updateField("jobTitle", text)}
              placeholder="Enter job title"
              icon={Briefcase}
            />

            <InputField
              label="Company Name"
              value={formData.companyName || ""}
              onChangeText={(text) => updateField("companyName", text)}
              placeholder="Enter company name"
              icon={Building}
            />

            <InputField
              label="Work Location"
              value={formData.workLocation || ""}
              onChangeText={(text) => updateField("workLocation", text)}
              placeholder="Enter work location"
              icon={MapPin}
            />

            <PickerField
              label="Annual Income"
              value={formData.annualIncome || ""}
              options={incomeOptions}
              onSelect={(value) => updateField("annualIncome", value)}
              icon={DollarSign}
            />
          </FormSection>

          <FormSection title="Family Details" icon={Users}>
            <InputField
              label="Father's Occupation"
              value={formData.fatherOccupation || ""}
              onChangeText={(text) => updateField("fatherOccupation", text)}
              placeholder="Enter father's occupation"
              icon={User}
            />

            <InputField
              label="Mother's Occupation"
              value={formData.motherOccupation || ""}
              onChangeText={(text) => updateField("motherOccupation", text)}
              placeholder="Enter mother's occupation"
              icon={User}
            />

            <InputField
              label="Number of Brothers"
              value={formData.numberOfBrothers?.toString() || "0"}
              onChangeText={(text) =>
                updateField("numberOfBrothers", parseInt(text) || 0)
              }
              placeholder="0"
              keyboardType="numeric"
              icon={User}
            />

            <InputField
              label="Number of Sisters"
              value={formData.numberOfSisters?.toString() || "0"}
              onChangeText={(text) =>
                updateField("numberOfSisters", parseInt(text) || 0)
              }
              placeholder="0"
              keyboardType="numeric"
              icon={User}
            />

            <InputField
              label="Siblings' Details"
              value={formData.siblingsDetails || ""}
              onChangeText={(text) => updateField("siblingsDetails", text)}
              placeholder="Details about siblings"
              multiline
              icon={Users}
            />

            <PickerField
              label="Family Type"
              value={formData.familyType || ""}
              options={familyTypeOptions}
              onSelect={(value) => updateField("familyType", value)}
              icon={Home}
            />

            <PickerField
              label="Family Values"
              value={formData.familyValues || ""}
              options={familyValuesOptions}
              onSelect={(value) => updateField("familyValues", value)}
              icon={Heart}
            />
          </FormSection>

          <FormSection title="Lifestyle & Habits" icon={Activity}>
            <PickerField
              label="Diet Preferences"
              value={formData.dietPreferences || ""}
              options={dietOptions}
              onSelect={(value) => updateField("dietPreferences", value)}
              icon={Utensils}
            />

            <PickerField
              label="Smoking Habit"
              value={formData.smokingHabit || ""}
              options={habitOptions}
              onSelect={(value) => updateField("smokingHabit", value)}
              icon={Cigarette}
            />

            <PickerField
              label="Drinking Habit"
              value={formData.drinkingHabit || ""}
              options={habitOptions}
              onSelect={(value) => updateField("drinkingHabit", value)}
              icon={Wine}
            />

            <PickerField
              label="Exercise Routine"
              value={formData.exerciseRoutine || ""}
              options={exerciseOptions}
              onSelect={(value) => updateField("exerciseRoutine", value)}
              icon={Dumbbell}
            />

            <PickerField
              label="Fitness Level"
              value={formData.fitnessLevel || ""}
              options={fitnessOptions}
              onSelect={(value) => updateField("fitnessLevel", value)}
              icon={Activity}
            />

            <PickerField
              label="Personality Type"
              value={formData.personalityType || ""}
              options={personalityOptions}
              onSelect={(value) => updateField("personalityType", value)}
              icon={Brain}
            />

            <PickerField
              label="Belief System"
              value={formData.beliefSystem || ""}
              options={beliefOptions}
              onSelect={(value) => updateField("beliefSystem", value)}
              icon={Church}
            />
          </FormSection>

          <FormSection title="Partner Preferences" icon={Star}>
            <View style={styles.rangeContainer}>
              <View style={styles.inputLabelContainer}>
                <Calendar size={16} color={theme.colors.primary} />
                <Text style={styles.inputLabel}>Preferred Age Range</Text>
              </View>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={[styles.input, styles.rangeInput]}
                  value={formData.preferredAgeRange?.min.toString() || ""}
                  onChangeText={(text) =>
                    updateField("preferredAgeRange", {
                      ...formData.preferredAgeRange,
                      min: parseInt(text) || 25,
                    })
                  }
                  placeholder="Min"
                  keyboardType="numeric"
                />
                <Text style={styles.rangeText}>to</Text>
                <TextInput
                  style={[styles.input, styles.rangeInput]}
                  value={formData.preferredAgeRange?.max.toString() || ""}
                  onChangeText={(text) =>
                    updateField("preferredAgeRange", {
                      ...formData.preferredAgeRange,
                      max: parseInt(text) || 35,
                    })
                  }
                  placeholder="Max"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <InputField
              label="Location Preference"
              value={formData.locationPreference || ""}
              onChangeText={(text) => updateField("locationPreference", text)}
              placeholder="Preferred location"
              icon={MapPin}
            />
          </FormSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollcontainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    height: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  section: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  sectionContent: {
    gap: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.sm,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: "500",
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: "white",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: "white",
  },
  pickerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  optionsContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "white",
    marginTop: theme.spacing.xs,
    maxHeight: 200,
  },
  optionItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  rangeContainer: {
    marginBottom: theme.spacing.sm,
  },
  rangeInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  rangeInput: {
    flex: 1,
  },
  rangeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
});
