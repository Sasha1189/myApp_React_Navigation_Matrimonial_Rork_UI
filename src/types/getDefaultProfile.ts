import { Profile } from "../types/profile";

export const getDefaultProfile = (): Profile => ({
  // Unchanged Backend Master Keys
  uid: "", // Will be filled dynamically by AuthContext
  gender: "",
  tier: "",
  liked: false,

  // Compressed Basic Information
  photos: [], // photos array -> ph
  tb: "", // thumbnail URL -> tb
  ca: new Date().toISOString(), // createdAt -> ca (using ISO string standard)
  ua: new Date().toISOString(), // updatedAt -> ua
  iv: false, // isVerified -> iv
  pid: "", // profileId -> pid

  // Compressed Personal & Birth Information-12
  fn: "", // firstName -> fn
  ln: "", // lastName -> ln
  db: null, // dateOfBirth -> db
  tob: "", // timeOfBirth -> tob
  pb: "", // placeOfBirth -> pb
  ms: 0, // maritalStatus enum index -> ms
  ht: "", // height -> ht
  bt: 0, // bodyType enum index -> bt
  bg: 0, // bloodGroup enum index -> bg
  mg: 0, // manglikStatus enum index -> mg
  rs: 0, // rashi enum index -> rs
  hr: 0, // horoscopeRequired enum index -> hr
  ir: "", // isReady -> ir

  // Compressed About Me-6
  sb: "", // shortBio -> sb
  as: "", // aspirations -> as
  bv: "", // beliefsValues -> bv
  st: "", // strengths -> st
  ld: "", // likesDislikesText -> ld
  sm: "", // socialMedia -> sm

  // Compressed Contact Details-6
  cc: "", // currentCity -> cc
  np: "", // nativePlace -> np
  mn: "", // mobileNumber -> mn
  pc: 0, // preferredContact enum index -> pc
  cb: 0, // profileCreatedBy enum index -> cb (Defaults to index 0 which maps to "Self")

  // Compressed Education & Career-8
  hq: 0, // highestQualification enum index -> hq
  fs: 0, // fieldOfStudy enum index -> fs
  oc: 0, // occupation enum index -> oc
  ind: 0, // industry enum index -> ind
  jt: "", // jobTitle -> jt
  cn: "", // companyName -> cn
  wl: "", // workLocation -> wl
  ai: 0, // annualIncome enum index -> ai

  // Compressed Family Details-5
  fo: "", // fatherOccupation -> fo
  mo: "", // motherOccupation -> mo
  nb: "", // numberOfBrothers -> nb
  ns: "", // numberOfSisters -> ns
  sd: "", // siblingsDetails -> sd

  // Compressed Lifestyle & Habits-8
  dp: 0, // dietPreferences enum index -> dp
  sh: 0, // smokingHabit enum index -> sh
  dh: 0, // drinkingHabit enum index -> dh
  er: 0, // exerciseRoutine enum index -> er
  fl: 0, // fitnessLevel enum index -> fl
  hb: [], // hobbies array index list -> hb
  bs: 0, // beliefSystem enum index -> bs

  // Compressed Partner Preferences -6
  pms: 0, // preferredMaritalStatus enum index -> pms
  pe: 0, // preferredEducation enum index -> pe
  pp: 0, // preferredProfession enum index -> pp
  pir: 0, // preferredIncomeRange enum index -> pir
  lp: null, // locationPreference -> lp
  lwp: 0, // livingWithParents enum index -> lwp
});
