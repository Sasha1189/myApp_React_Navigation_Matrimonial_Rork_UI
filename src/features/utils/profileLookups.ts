export const LOOKUPS = {
  ms: ["", "Never Married", "Divorced", "Widowed"],
  ir: ["", "Ready", "Studying"],
  bt: ["", "Slim", "Athletic", "Average", "Heavy"],
  bg: ["", "A+", "B+", "AB+", "O+", "O-"],
  mg: ["", "Yes", "No", "Partial", "Don't Know"],
  rs: [
    "",
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
  ],
  hr: ["", "Yes", "No", "Optional"],
  pc: ["", "WhatsApp", "Phone", "Email", "Chat only"],
  cb: ["", "Self", "Father", "Mother", "Sibling"],
  hq: ["", "10th", "12th", "Diploma", "Bachelor's", "Master's", "PhD", "Other"],
  fs: [
    "",
    "Engineering",
    "Arts",
    "Science",
    "Commerce",
    "Medicine",
    "Law",
    "Other",
  ],
  oc: [
    "",
    "Job",
    "Business",
    "Self-employed",
    "Freelancer",
    "Not working",
    "Student",
  ],
  ind: ["", "IT", "Finance", "Govt", "Education", "Healthcare", "Other"],
  ai: ["", "₹UPTO 5L", "₹5L+", "₹10L+", "₹20L+"],
  dp: ["", "Vegetarian", "Eggetarian", "Non-Veg"],
  sh: ["", "No", "Occasionally", "Yes"],
  dh: ["", "No", "Occasionally", "Yes"],
  er: ["", "Regular", "Sometimes", "Rarely", "Never"],
  fl: ["", "Fit", "Average", "Overweight", "Athletic"],
  pt: ["", "Introvert", "Extrovert", "Ambivert"],
  bs: ["", "Spiritual", "Open-minded"],
  lwp: ["", "Okay", "Not okay", "Prefer separate"],
  ct: [
    "",
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ],
} as const;

type LookupField = keyof typeof LOOKUPS;

export const getDisplayValue = <TField extends LookupField>(
  field: TField,
  value: number | string | null | undefined,
): string => {
  if (value === undefined || value === null || value === "") return "";
  const index = typeof value === "number" ? value : Number(value);
  return LOOKUPS[field][index] || "";
};

export const getEnumIndex = <TField extends LookupField>(
  field: TField,
  label: string,
): number => {
  return (LOOKUPS[field] as readonly string[]).indexOf(label);
};

export const transformLookupToOptions = (field: keyof typeof LOOKUPS) => {
  return LOOKUPS[field].map((label, index) => ({
    label: label,
    value: index, // Bound directly to index integer
  }));
};
