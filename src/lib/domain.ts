export const CATEGORY_IDS = [
  "cardigans",
  "scarves",
  "gloves",
  "keychains",
  "flowers",
  "holders",
  "bands",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  blurb: string;
  motif: Motif;
  palette: PaletteId;
}[] = [
  {
    id: "cardigans",
    label: "Cardigans",
    blurb: "Cropped granny cardigans and an open mesh shrug, tied at the front.",
    motif: "scarf",
    palette: "burgundy",
  },
  {
    id: "scarves",
    label: "Scarves",
    blurb: "Rib scarves with bows, roses, sunflowers, and granny squares.",
    motif: "scarf",
    palette: "rose",
  },
  {
    id: "gloves",
    label: "Gloves",
    blurb: "Fingerless gloves, paw gloves, and long arm warmers.",
    motif: "gloves",
    palette: "blush",
  },
  {
    id: "keychains",
    label: "Keychains",
    blurb: "Tiny charms on a ring: paws, bears, flowers, and little faces.",
    motif: "keychain",
    palette: "berry",
  },
  {
    id: "flowers",
    label: "Flowers",
    blurb: "Stems, hangers, and bouquets that stay in bloom.",
    motif: "bouquet",
    palette: "sun",
  },
  {
    id: "holders",
    label: "Card holders",
    blurb: "Small pouches and card holders with bows and scalloped flaps.",
    motif: "phone",
    palette: "blush",
  },
  {
    id: "bands",
    label: "Bandanas",
    blurb: "Triangle bandanas and openwork cuffs.",
    motif: "clip",
    palette: "cream",
  },
];

export const MOTIF_IDS = [
  "gloves",
  "paws",
  "scarf",
  "arms",
  "bunny",
  "couple",
  "miffy",
  "keychain",
  "flower",
  "bouquet",
  "bag",
  "frog",
  "kit",
  "clip",
  "phone",
  "bow",
  "pins",
  "turtle",
] as const;

export type Motif = (typeof MOTIF_IDS)[number];

export const MOTIFS: { id: Motif; label: string }[] = [
  { id: "gloves", label: "Hand warmers" },
  { id: "paws", label: "Paw gloves" },
  { id: "scarf", label: "Scarf" },
  { id: "arms", label: "Arm warmers" },
  { id: "bunny", label: "Bunny" },
  { id: "couple", label: "Pair of bunnies" },
  { id: "miffy", label: "Round bunny" },
  { id: "keychain", label: "Keychain" },
  { id: "flower", label: "Single flower" },
  { id: "bouquet", label: "Bouquet" },
  { id: "bag", label: "Shoulder bag" },
  { id: "frog", label: "Frog bag" },
  { id: "kit", label: "Yarn kit" },
  { id: "clip", label: "Hair clip" },
  { id: "phone", label: "Phone cover" },
  { id: "bow", label: "Bow" },
  { id: "pins", label: "Pins" },
  { id: "turtle", label: "Turtle" },
];

export const PALETTE_IDS = [
  "sage",
  "blush",
  "burgundy",
  "gold",
  "sky",
  "sun",
  "ocean",
  "cream",
  "berry",
  "forest",
  "night",
  "rose",
] as const;

export type PaletteId = (typeof PALETTE_IDS)[number];

export type Palette = {
  bg: string;
  floor: string;
  rug: string;
  yarn: string;
  accent: string;
  detail: string;
};

export const PALETTES: Record<PaletteId, Palette> = {
  sage: { bg: "#f6f3ec", floor: "#e7e0d2", rug: "#8d3a49", yarn: "#b7c48a", accent: "#efd0d6", detail: "#5d7340" },
  blush: { bg: "#f8f2ef", floor: "#eadfd8", rug: "#a33b4c", yarn: "#f6ebe4", accent: "#e7b4c4", detail: "#c46b86" },
  burgundy: { bg: "#f7f2ef", floor: "#e6d9d2", rug: "#6f2433", yarn: "#8d2f3e", accent: "#e2b33c", detail: "#f6e7c4" },
  gold: { bg: "#f8f4ea", floor: "#e8dcc8", rug: "#8d3a49", yarn: "#f0d56a", accent: "#5c4030", detail: "#fff6dc" },
  sky: { bg: "#f3f5f8", floor: "#e4e1da", rug: "#8d3a49", yarn: "#d5e4f2", accent: "#6f8fb5", detail: "#f7fbff" },
  sun: { bg: "#fbf6ee", floor: "#eadfce", rug: "#8d3a49", yarn: "#f0c84b", accent: "#3d3428", detail: "#5d7a32" },
  ocean: { bg: "#f2f6f6", floor: "#e3e4de", rug: "#8d3a49", yarn: "#7eb0c8", accent: "#24566a", detail: "#f4fbfe" },
  cream: { bg: "#f7f4ef", floor: "#e7e0d4", rug: "#8d3a49", yarn: "#f7f1e6", accent: "#c9a27a", detail: "#8d5a3c" },
  berry: { bg: "#f8f3f4", floor: "#eadfe2", rug: "#f0d0d4", yarn: "#d6455d", accent: "#f3e7a4", detail: "#6b2433" },
  forest: { bg: "#f3f5f0", floor: "#e3e2d6", rug: "#8d3a49", yarn: "#6f8f55", accent: "#e7d27a", detail: "#f7f3ea" },
  night: { bg: "#f4f3f6", floor: "#e4e1e8", rug: "#8d3a49", yarn: "#2c3a55", accent: "#e6c56a", detail: "#f4f0e4" },
  rose: { bg: "#fbf4f4", floor: "#eadfdf", rug: "#8d3a49", yarn: "#c23b4a", accent: "#f2c9cf", detail: "#4a2030" },
};

export const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
] as const;

export type City = (typeof CITIES)[number];

export const PAYMENT_IDS = ["cod", "jazzcash", "easypaisa"] as const;
export type PaymentId = (typeof PAYMENT_IDS)[number];

export const PAYMENTS: { id: PaymentId; label: string; detail: string }[] = [
  { id: "cod", label: "Cash on delivery", detail: "Pay when the parcel arrives." },
  { id: "jazzcash", label: "JazzCash", detail: "We send a payment request after the piece is confirmed." },
  { id: "easypaisa", label: "EasyPaisa", detail: "We send a payment request after the piece is confirmed." },
];

export const FREE_DELIVERY = 5000;

export function shippingFor(subtotal: number, city: string) {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_DELIVERY) return 0;
  if (city === "Lahore") return 180;
  return 280;
}

export function categoryLabel(id: string, categories: { id: string; label: string }[] = CATEGORIES) {
  return categories.find((category) => category.id === id)?.label ?? id;
}
