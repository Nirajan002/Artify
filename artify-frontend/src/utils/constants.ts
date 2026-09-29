export const ARTWORK_TYPES = [
  "Painting", "DigitalArt", "Photography", "Illustration", "Sketch", "Abstract", "TraditionalArt",
] as const;

export const humanize = (s: string) => s.replace(/([A-Z])/g, " $1").trim();