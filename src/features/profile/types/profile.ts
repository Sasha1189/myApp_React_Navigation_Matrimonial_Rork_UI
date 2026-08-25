export interface Profile {
  // Unchanged Backend Master Keys
  uid: string;
  gender: "" | "Male" | "Female";
  tier: "" | "basic" | "premium";
  liked?: boolean;

  // Compressed Basic Information
  photos: Photo[]; // photos Array
  tn?: string; // thumbnail URL
  ca: Date | string; // createdAt
  ua: Date | string; // updatedAt
  iv: boolean; // isVerified
  pid: string; // profileId

  // Compressed Personal & Birth Information
  fn: string; // fullName
  ln: string; // lastName
  db: Date | string | null; // dateOfBirth
  tob?: Date | string | null; // timeOfBirth
  pb: string; // placeOfBirth
  ms: number; // maritalStatus enum index
  ht: string; // height
  bt: number; // bodyType enum index
  bg: number; // bloodGroup enum index
  mg: number; // manglikStatus enum index
  rs: number; // rashi enum index
  hr: number; // horoscopeRequired enum index
  ir: string; // isReady

  // Compressed About Me
  sb: string; // shortBio
  as: string; // aspirations
  bv: string; // beliefsValues
  st: string; // strengths
  ld: string; // likesDislikesText
  sm: string; // socialMedia

  // Compressed Contact Details
  cc: string; // currentCity
  np: string; // nativePlace
  mn: string; // mobileNumber
  pc: number; // preferredContact enum index
  cb: number; // profileCreatedBy enum index

  // Compressed Education & Career
  hq: number; // highestQualification enum index
  fs: number; // fieldOfStudy enum index
  oc: number; // occupation enum index
  ind: number; // industry enum index
  jt?: string; // jobTitle
  cn?: string; // companyName
  wl?: string; // workLocation
  ai: number; // annualIncome enum index

  // Compressed Family Details
  fo?: string; // fatherOccupation
  mo?: string; // motherOccupation
  nb: string; // numberOfBrothers
  ns: string; // numberOfSisters
  sd?: string; // siblingsDetails

  // Compressed Lifestyle & Habits
  dp: number; // dietPreferences enum index
  sh: number; // smokingHabit enum index
  dh: number; // drinkingHabit enum index
  er: number; // exerciseRoutine enum index
  fl: number; // fitnessLevel enum index
  hb: number[]; // hobbies Array
  bs: number; // beliefSystem enum index

  // Compressed Partner Preferences
  pms: number; // preferredMaritalStatus enum index
  pe: number; // preferredEducation enum index
  pp: number; // preferredProfession enum index
  pir: number; // preferredIncomeRange enum index
  lp?: string | null; // locationPreference
  lwp: number; // livingWithParents enum index
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

export interface DBPhoto {
  id: string;
  downloadURL: string;
  isPrimary: boolean;
}

export interface ProfileContextType {
  myProfile: Profile | null;
  isLoadingProfile: boolean;
  updateMyProfile: (partialProfile: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
