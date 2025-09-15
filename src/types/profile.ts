export interface Profile {
  // Basic Information
  uid: string;
  photos: Photo[];
  likeCount: number;
  liked?: boolean; // whether current user liked this profile
  likedMe?: boolean; // whether this profile liked current user
  createdAt: Date;
  updatedAt: Date;

  // Profile Status
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  // lastActiveAt: Date;
  // Personal & Birth Information-13
  fullName: string;
  dateOfBirth: Date | null;
  timeOfBirth?: string | null;
  placeOfBirth: string;
  gender: '' | 'Male' | 'Female';
  maritalStatus: '' | 'Never Married' | 'Divorced' | 'Widowed';
  height: string;
  weight: string;
  bodyType: '' | 'Slim' | 'Athletic' | 'Average' | 'Heavy';
  bloodGroup: '' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  manglikStatus: '' | 'Yes' | 'No' | 'Partial' | "Don't Know";
  rashi: '' | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
  horoscopeRequired: '' | 'Yes' | 'No' | 'Optional';
  
  // About Me-6
  shortBio: string;
  aspirations?: string;
  beliefsValues?: string;
  strengths?: string;
  likesDislikesText?: string;
  socialMedia?: string;
  
  // Contact Details-6
  currentCity: string;
  nativePlace: string;
  mobileNumber: string;
  emailAddress?: string;
  preferredContact: '' | 'WhatsApp' | 'Phone' | 'Email' | 'Chat only';
  profileCreatedBy: 'Self' | 'Father' | 'Mother' | 'Sibling';
  
  // Education & Career-8
  highestQualification: '' | '10th' | '12th' | 'Diploma' | "Bachelor's" | "Master's" | 'PhD' | 'Other';
  fieldOfStudy: '' | 'Engineering' | 'Arts' | 'Science' | 'Commerce' | 'Medicine' | 'Law' | 'Other';
  occupation: '' | 'Working' | 'Business' | 'Self-employed' | 'Freelancer' | 'Not working' | 'Student';
  industry: '' | 'IT' | 'Finance' | 'Govt' | 'Education' | 'Healthcare' | 'Other';
  jobTitle?: string;
  companyName?: string;
  workLocation?: string;
  annualIncome: '' | '₹UPTO 5L' | '₹5L+' | '₹10L+' | '₹20L+';
  
  // Family Details-7
  fatherOccupation?: string;
  motherOccupation?: string;
  numberOfBrothers: number;
  numberOfSisters: number;
  siblingsDetails?: string;
  familyType: '' | 'Joint' | 'Nuclear';
  familyValues: '' | 'Traditional' | 'Modern';
  
  // Lifestyle & Habits-8
  dietPreferences: '' | 'Vegetarian' | 'Eggetarian' | 'Non-Veg';
  smokingHabit: '' | 'No' | 'Occasionally' | 'Yes';
  drinkingHabit: '' | 'No' | 'Occasionally' | 'Yes';
  exerciseRoutine: '' | 'Regular' | 'Sometimes' | 'Rarely' | 'Never';
  fitnessLevel: '' | 'Fit' | 'Average' | 'Overweight' | 'Athletic';
  hobbies: string[];
  personalityType: '' | 'Introvert' | 'Extrovert' | 'Ambivert';
  beliefSystem: '' | 'Spiritual' | 'Open-minded';
  
  // Partner Preferences-9
  preferredAgeRange: { min: number; max: number } | null;
  preferredHeightRange: { min: string; max: string } | null;
  preferredMaritalStatus: '' | 'Never Married' | 'Divorced' | 'Widowed';
  manglikPreference: '' | 'Required' | 'Not Required' | "Don't Know";
  preferredEducation: '' | '12th' | 'Graduate' | 'Postgraduate' | 'No preference';
  preferredProfession: '' | 'Working Professional' | 'Govt Job' | 'Business' | 'No preference';
  preferredIncomeRange: '' | '₹3L+' | '₹5L+' | '₹10L+' | 'No preference';
  locationPreference?: string | null;
  livingWithParents: '' | 'Okay' | 'Not okay' | 'Prefer separate';
}

export interface Match {
  id: string;
  profile: Profile;
  matchedAt: Date;
  lastMessage?: string;
  unreadCounts?: number;
  otherUser?: Partial<Profile>; // The profile of the other user in the match
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Photo {
  id: string;
  localUrl?: string;
  downloadURL?: string;
  isPrimary: boolean;
}