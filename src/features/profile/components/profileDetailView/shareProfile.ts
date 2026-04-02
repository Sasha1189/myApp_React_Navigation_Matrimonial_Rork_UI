// src/utils/shareUtils.ts
export const formatProfileForShare = (profile: any, t: any) => {
  // Define all possible keys from your details.ts labels
  const allPossibleKeys = [
    "fullName",
    "gender",
    "age",
    "height",
    "weight",
    "maritalStatus",
    "bloodGroup",
    "rashi",
    "manglik",
    "birthPlace",
    "shortBio",
    "aspirations",
    "education",
    "profession",
    "goals",
    "beliefsValues",
    "qualification",
    "studyField",
    "occupation",
    "industry",
    "company",
    "workCity",
    "income",
    "familyType",
    "values",
    "brothers",
    "sisters",
    "fatherOcc",
    "motherOcc",
    "siblingsInfo",
    "currentCity",
    "nativePlace",
    "mobile",
    "email",
    "contactPref",
    "createdBy",
    "diet",
    "smoking",
    "drinking",
    "exercise",
    "fitness",
    "personality",
    "hobbies",
    "minIncome",
    "livingWithParents",
    "timeOfBirth",
    "bodyType",
    "horoscopeRequired",
    "isReady",
    "strengths",
    "likesDislikesText",
    "socialMedia",
    "jobTitle",
    "beliefSystem",
    "locationPreference",
  ];

  let message = `*${t("navigation.home")} Matrimony*\n`;
  message += `----------------------------\n`;

  allPossibleKeys.forEach((key) => {
    const value = profile[key];

    // Only add the field if it has a valid, non-empty value
    if (value !== undefined && value !== null && value !== "" && value !== 0) {
      const label = t(`details.labels.${key}`);

      // Special formatting for Bio/ShortBio to make it stand out
      if (key === "shortBio") {
        message += `\n*${label}:*\n${value}\n`;
      } else {
        message += `*${label}:* ${value}\n`;
      }
    }
  });

  message += `----------------------------\n`;
  message += `_Shared via our Lonari App_`;

  return message.trim();
};
