// Converts cm (e.g. 175) -> { feet: 5, inches: 9, label: '5 ft 9 in (175 cm)' }
export const cmToFeetInches = (cm?: number | string | null) => {
  if (!cm || isNaN(Number(cm))) return { feet: 0, inches: 0, label: "" };
  const numCm = Number(cm);
  const totalInches = Math.round(numCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return {
    feet,
    inches,
    label: `${feet} ft ${inches} in`,
    shortLabel: `${feet}'${inches}"`,
  };
};

// Converts Feet (5) & Inches (9) -> cm (175)
export const feetInchesToCm = (feet: number, inches: number): number => {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
};

// Generate height options for dropdowns/pickers (e.g., 4'0" to 7'0")
export const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const totalInches = 48 + i; // Starts from 4 feet (48 inches) up to 7 feet
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const cm = Math.round(totalInches * 2.54);
  return {
    feet,
    inches,
    cm,
    label: `${feet} ft ${inches} in`,
    shortLabel: `${feet}'${inches}"`,
  };
});

export const formatHeight = (cm?: number | string | null): string => {
  if (!cm || isNaN(Number(cm)) || Number(cm) <= 0) return "";

  const numCm = Number(cm);
  const totalInches = Math.round(numCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  return `${feet} ft ${inches} in`;
};
