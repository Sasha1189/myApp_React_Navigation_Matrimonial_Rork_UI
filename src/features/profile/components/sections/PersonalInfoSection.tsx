import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  UserCheck,
  Calendar,
  User,
  HeartHandshake,
  Ruler,
  Scale,
  Droplets,
  Activity,
  Sparkles,
  Star,
  Zap,
  MapPin,
  Timer,
} from "lucide-react-native";

import { Profile } from "../../../../types/profile";

import FormSection from "../form/FormSection";
import InputField from "../form/InputField";
import PickerField from "../form/PickerField";
import RadioField from "../form/RadioField";
import DatePickerField, { TimePickerField } from "../form/DateTimePickers";
import {
  genderOptions,
  maritalStatusOptions,
  bodyTypeOptions,
  bloodGroupOptions,
  manglikOptions,
  rashiOptions,
  horoscopeOptions,
} from "../form/profileOptions";

interface PersonalInfoSectionProps {
  editable?: boolean;
  requiredFields?: (keyof Profile)[];
  immutableFields?: (keyof Profile)[];
  confirmedImmutable?: (keyof Profile)[];
  fieldErrors?: Partial<Record<keyof Profile, string>>;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  immutableFields,
  confirmedImmutable,
  editable,
}) => {
  const { control } = useFormContext<Profile>();
  return (
    <FormSection title="Personal Information" icon={User} editable={editable}>
      {/* Full Name */}
      <Controller
        control={control}
        name="fullName"
        rules={{ required: "Full Name is required" }}
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Full Name"
            value={value}
            onChangeText={onChange}
            placeholder="Enter full name"
            icon={UserCheck}
            required
            editable={editable}
            locked={
              immutableFields?.includes("fullName") &&
              confirmedImmutable?.includes("fullName")
            }
          />
        )}
      />

      {/* Date of Birth */}
      <Controller
        control={control}
        name="dateOfBirth"
        rules={{ required: "Date of Birth is required" }}
        render={({ field: { onChange, value } }) => (
          <DatePickerField
            label="Date of Birth"
            value={value ? String(value) : ""}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            editable={editable}
            icon={Calendar}
            required
            locked={
              immutableFields?.includes("dateOfBirth") &&
              confirmedImmutable?.includes("dateOfBirth")
            }
          />
        )}
      />

      {/* Time of Birth */}
      <Controller
        control={control}
        name="timeOfBirth"
        render={({ field: { onChange, value } }) => (
          <TimePickerField
            label="Time of Birth"
            value={value ?? ""}
            placeholder="e.g., 06:30 AM"
            onChange={onChange}
            editable={editable}
            icon={Timer}
          />
        )}
      />

      {/* Place of Birth */}
      <Controller
        control={control}
        name="placeOfBirth"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Place of Birth"
            value={value}
            onChangeText={onChange}
            placeholder="Enter place"
            icon={MapPin}
            editable={editable}
          />
        )}
      />

      {/* Gender */}
      <Controller
        control={control}
        name="gender"
        rules={{ required: "Gender is required" }}
        render={({ field: { onChange, value } }) => (
          <RadioField
            label="Gender"
            value={value}
            options={genderOptions}
            onSelect={onChange}
            editable={editable}
            icon={User}
            required
            locked={
              immutableFields?.includes("gender") &&
              confirmedImmutable?.includes("gender")
            }
          />
        )}
      />

      {/* Marital Status */}
      <Controller
        control={control}
        name="maritalStatus"
        rules={{ required: "Marital Status is required" }}
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Marital Status"
            value={value}
            placeholder="Un-married/Wisowed/Divorced"
            options={maritalStatusOptions}
            onSelect={onChange}
            editable={editable}
            icon={HeartHandshake}
            locked={
              immutableFields?.includes("maritalStatus") &&
              confirmedImmutable?.includes("maritalStatus")
            }
          />
        )}
      />

      {/* Height */}
      <Controller
        control={control}
        name="height"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Height"
            value={value}
            onChangeText={onChange}
            placeholder="e.g., 5'8''"
            icon={Ruler}
            editable={editable}
          />
        )}
      />

      {/* Weight */}
      <Controller
        control={control}
        name="weight"
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Weight"
            value={value}
            onChangeText={onChange}
            placeholder="e.g., 70kg"
            icon={Scale}
            editable={editable}
          />
        )}
      />

      {/* Body Type */}
      <Controller
        control={control}
        name="bodyType"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Body Type"
            value={value}
            placeholder="Slim / Athletic / Average"
            options={bodyTypeOptions}
            onSelect={onChange}
            editable={editable}
            icon={Activity}
          />
        )}
      />

      {/* Blood Group */}
      <Controller
        control={control}
        name="bloodGroup"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Blood Group"
            value={value}
            placeholder="A+ / O-"
            options={bloodGroupOptions}
            onSelect={onChange}
            editable={editable}
            icon={Droplets}
          />
        )}
      />

      {/* Manglik Status */}
      <Controller
        control={control}
        name="manglikStatus"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Manglik Status"
            value={value}
            placeholder="Yes / No / Partial"
            options={manglikOptions}
            onSelect={onChange}
            editable={editable}
            icon={Sparkles}
          />
        )}
      />

      {/* Rashi */}
      <Controller
        control={control}
        name="rashi"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Rashi (Zodiac)"
            value={value}
            placeholder="Aries / Taurus / ..."
            options={rashiOptions}
            onSelect={onChange}
            editable={editable}
            icon={Star}
          />
        )}
      />

      {/* Horoscope Required */}
      <Controller
        control={control}
        name="horoscopeRequired"
        render={({ field: { onChange, value } }) => (
          <PickerField
            label="Horoscope Required?"
            value={value}
            placeholder="Yes / No / Optional"
            options={horoscopeOptions}
            onSelect={onChange}
            editable={editable}
            icon={Zap}
          />
        )}
      />
    </FormSection>
  );
};

// import React from "react";
// import { Controller, useFormContext } from "react-hook-form";
// import {
//   UserCheck,
//   Calendar,
//   User,
//   HeartHandshake,
//   Ruler,
//   Scale,
//   Droplets,
//   Activity,
//   Sparkles,
//   Star,
//   Zap,
//   MapPin,
//   Timer,
// } from "lucide-react-native";

// import { Profile } from "../../../../types/profile";

// import FormSection from "../form/FormSection";
// import InputField from "../form/InputField";
// import PickerField from "../form/PickerField";
// import RadioField from "../form/RadioField";
// import DatePickerField, { TimePickerField } from "../form/DateTimePickers";
// import {
//   genderOptions,
//   maritalStatusOptions,
//   bodyTypeOptions,
//   bloodGroupOptions,
//   manglikOptions,
//   rashiOptions,
//   horoscopeOptions,
// } from "../../../../constants/profileOptions";

// interface PersonalInfoSectionProps {
//   editable?: boolean;
//   requiredFields?: (keyof Profile)[];
//   immutableFields?: (keyof Profile)[];
//   confirmedImmutable?: (keyof Profile)[];
//   fieldErrors?: Partial<Record<keyof Profile, string>>;
// }

// export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
//   immutableFields,
//   confirmedImmutable,
//   editable = true,
// }) => {
//   const { control } = useFormContext<Profile>();

//   return (
//     <FormSection title="Personal Information" icon={User} editable={editable}>
//       {/* Full Name */}
//       <Controller
//         control={control}
//         name="fullName"
//         rules={{ required: "Full Name is required" }}
//         render={({ field: { onChange, value } }) => (
//           <InputField
//             label="Full Name"
//             value={value}
//             onChangeText={onChange}
//             placeholder="Enter full name"
//             icon={UserCheck}
//             required
//             editable={editable}
//             locked={
//               immutableFields?.includes("fullName") &&
//               confirmedImmutable?.includes("fullName")
//             }
//           />
//         )}
//       />

//       {/* Date of Birth */}
//       <Controller
//         control={control}
//         name="dateOfBirth"
//         rules={{ required: "Date of Birth is required" }}
//         render={({ field: { onChange, value } }) => (
//           <DatePickerField
//             label="Date of Birth"
//             value={value ?? ""}
//             onChange={onChange}
//             placeholder="YYYY-MM-DD"
//             editable={editable}
//             icon={Calendar}
//             required
//             locked={
//               immutableFields?.includes("dateOfBirth") &&
//               confirmedImmutable?.includes("dateOfBirth")
//             }
//           />
//         )}
//       />

//       {/* Time of Birth */}
//       <Controller
//         control={control}
//         name="timeOfBirth"
//         render={({ field: { onChange, value } }) => (
//           <TimePickerField
//             label="Time of Birth"
//             value={value ?? ""}
//             placeholder="e.g., 06:30 AM"
//             onChange={onChange}
//             editable={editable}
//             icon={Timer}
//           />
//         )}
//       />

//       {/* Place of Birth */}
//       <Controller
//         control={control}
//         name="placeOfBirth"
//         render={({ field: { onChange, value } }) => (
//           <InputField
//             label="Place of Birth"
//             value={value}
//             onChangeText={onChange}
//             placeholder="Enter place"
//             icon={MapPin}
//             editable={editable}
//           />
//         )}
//       />

//       {/* Gender */}
//       <Controller
//         control={control}
//         name="gender"
//         rules={{ required: "Gender is required" }}
//         render={({ field: { onChange, value } }) => (
//           <RadioField
//             label="Gender"
//             value={value}
//             options={genderOptions}
//             onSelect={onChange}
//             editable={editable}
//             icon={User}
//             required
//             locked={
//               immutableFields?.includes("gender") &&
//               confirmedImmutable?.includes("gender")
//             }
//           />
//         )}
//       />

//       {/* Marital Status */}
//       <Controller
//         control={control}
//         name="maritalStatus"
//         rules={{ required: "Marital Status is required" }}
//         render={({ field: { onChange, value } }) => (
//           <PickerField
//             label="Marital Status"
//             value={value}
//             placeholder="Never Married / Divorced / Widowed"
//             options={maritalStatusOptions}
//             onSelect={onChange}
//             editable={editable}
//             icon={HeartHandshake}
//             locked={
//               immutableFields?.includes("maritalStatus") &&
//               confirmedImmutable?.includes("maritalStatus")
//             }
//           />
//         )}
//       />

//       {/* Height */}
//       <Controller
//         control={control}
//         name="height"
//         render={({ field: { onChange, value } }) => (
//           <InputField
//             label="Height"
//             value={value}
//             onChangeText={onChange}
//             placeholder="e.g., 5'8''"
//             icon={Ruler}
//             editable={editable}
//           />
//         )}
//       />

//       {/* Weight */}
//       <Controller
//         control={control}
//         name="weight"
//         render={({ field: { onChange, value } }) => (
//           <InputField
//             label="Weight"
//             value={value}
//             onChangeText={onChange}
//             placeholder="e.g., 70kg"
//             icon={Scale}
//             editable={editable}
//           />
//         )}
//       />

//       {/* Body Type */}
//       <Controller
//         control={control}
//         name="bodyType"
//         render={({ field: { onChange, value } }) => (
//           <PickerField
//             label="Body Type"
//             value={value}
//             placeholder="Slim / Athletic / Average"
//             options={bodyTypeOptions}
//             onSelect={onChange}
//             editable={editable}
//             icon={Activity}
//           />
//         )}
//       />

//       {/* Blood Group */}
//       <Controller
//         control={control}
//         name="bloodGroup"
//         render={({ field: { onChange, value } }) => (
//           <PickerField
//             label="Blood Group"
//             value={value}
//             placeholder="A+ / O-"
//             options={bloodGroupOptions}
//             onSelect={onChange}
//             editable={editable}
//             icon={Droplets}
//           />
//         )}
//       />

//       {/* Manglik Status */}
//       <Controller
//         control={control}
//         name="manglikStatus"
//         render={({ field: { onChange, value } }) => (
//           <PickerField
//             label="Manglik Status"
//             value={value}
//             placeholder="Yes / No / Partial"
//             options={manglikOptions}
//             onSelect={onChange}
//             editable={editable}
//             icon={Sparkles}
//           />
//         )}
//       />

//       {/* Rashi */}
//       <Controller
//         control={control}
//         name="rashi"
//         render={({ field: { onChange, value } }) => (
//           <PickerField
//             label="Rashi (Zodiac)"
//             value={value}
//             placeholder="Aries / Taurus / ..."
//             options={rashiOptions}
//             onSelect={onChange}
//             editable={editable}
//             icon={Star}
//           />
//         )}
//       />

//       {/* Horoscope Required */}
//       <Controller
//         control={control}
//         name="horoscopeRequired"
//         render={({ field: { onChange, value } }) => (
//           <PickerField
//             label="Horoscope Required?"
//             value={value}
//             placeholder="Yes / No / Optional"
//             options={horoscopeOptions}
//             onSelect={onChange}
//             editable={editable}
//             icon={Zap}
//           />
//         )}
//       />
//     </FormSection>
//   );
// };
