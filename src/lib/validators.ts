import { z } from "zod";
import { CITIES, MOTIF_IDS, PALETTE_IDS, PAYMENT_IDS } from "@/lib/domain";

const line = z.object({
  productId: z.string().trim().min(8).max(80),
  qty: z.number().int().min(1).max(5),
});

export const quoteSchema = z.object({
  items: z.array(line).max(20),
  city: z.string().trim().max(40).optional(),
  coupon: z.string().trim().max(20).optional().default(""),
});

export const orderSchema = z.object({
  name: z.string().trim().min(2, "Add the name for the parcel.").max(80),
  email: z.string().trim().email("Enter a real email so we can send tracking.").max(120),
  phone: z
    .string()
    .trim()
    .min(10, "Add a phone number the courier can use.")
    .max(16)
    .regex(/^[0-9+\s-]+$/, "Use digits for the phone number."),
  address: z.string().trim().min(6, "Add a street address.").max(200),
  city: z.enum(CITIES, { message: "Choose a delivery city." }),
  notes: z.string().trim().max(300).optional().default(""),
  payment: z.enum(PAYMENT_IDS),
  reference: z.string().trim().max(40).optional().default(""),
  coupon: z.string().trim().max(20).optional().default(""),
  items: z.array(line).min(1, "Your basket is empty.").max(20),
});

export const reviewSchema = z.object({
  productId: z.string().trim().min(8).max(80),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(8, "Write a little more.").max(400),
});

export const addressSchema = z.object({
  label: z.string().trim().min(2, "Name this address.").max(30),
  line: z.string().trim().min(6, "Add the street.").max(200),
  city: z.enum(CITIES, { message: "Choose a city." }),
  phone: z.string().trim().min(10).max(16).regex(/^[0-9+\s-]+$/, "Use digits for the phone number."),
});

export const categorySchema = z.object({
  id: z.string().trim().max(40).optional().default(""),
  label: z.string().trim().min(2, "Name the collection.").max(40),
  blurb: z.string().trim().min(8, "Add a short line.").max(160),
  motif: z.enum(MOTIF_IDS),
  palette: z.enum(PALETTE_IDS),
  imageUrl: z.string().trim().max(500).optional().default(""),
});

export const themeSchema = z.object({
  theme: z.enum(["blush", "cocoa", "moss", "lilac"]),
});

export const whatsappSchema = z.object({
  whatsapp: z
    .string()
    .trim()
    .max(16)
    .refine((value) => value === "" || /^[0-9]{10,15}$/.test(value), "Use the number with country code, digits only."),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9]+$/, "Use letters and numbers only."),
  label: z.string().trim().min(2).max(40),
  type: z.enum(["percent", "fixed", "shipping"]),
  value: z.number().int().min(0).max(100000),
  minOrder: z.number().int().min(0).max(100000),
  active: z.boolean(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Add your name.").max(80),
  email: z.string().trim().email("Enter a real email.").max(120),
  password: z.string().min(8, "Use at least 8 characters.").max(72),
  phone: z.string().trim().max(16).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter the email on the account.").max(120),
  password: z.string().min(1, "Enter the password.").max(72),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Add your name.").max(80),
  phone: z
    .string()
    .trim()
    .max(16)
    .refine((value) => value === "" || /^[0-9+\s-]{10,16}$/.test(value), "Use digits for the phone number."),
  city: z.string().trim().max(40),
});

export const messageSchema = z.object({
  name: z.string().trim().min(2, "Add your name.").max(80),
  email: z.string().trim().email("Enter a real email.").max(120),
  topic: z.enum(["Order", "Custom piece", "Crochet kit", "Something else"]),
  body: z.string().trim().min(8, "Tell us a little more.").max(800),
});

export const subscribeSchema = z.object({
  email: z.string().trim().email("Enter a real email.").max(120),
});

export const trackSchema = z.object({
  number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^CC-\d+$/, "Order numbers look like CC-1904."),
  email: z.string().trim().email("Enter the email from checkout.").max(120),
});

export const productSchema = z.object({
  id: z.string().trim().min(8).max(80).optional(),
  name: z.string().trim().min(2, "Name the piece.").max(80),
  description: z.string().trim().min(10, "Add a short description.").max(800),
  price: z.number().int().min(50, "Price should be at least Rs50.").max(100000),
  compareAt: z.number().int().min(0).max(100000).nullable(),
  category: z.string().trim().min(2).max(40),
  motif: z.enum(MOTIF_IDS),
  palette: z.enum(PALETTE_IDS),
  stock: z.number().int().min(0).max(999),
  yarn: z.string().trim().min(2, "Name the yarn.").max(80),
  featured: z.boolean(),
  active: z.boolean(),
  imageUrl: z.string().trim().max(500).optional().default(""),
});

export const orderUpdateSchema = z.object({
  number: z.string().trim().regex(/^CC-\d+$/),
  intent: z.enum(["advance", "cancel", "note", "set", "details"]),
  status: z.enum(["placed", "confirmed", "making", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]).optional(),
  note: z.string().trim().max(240).optional().default(""),
  courier: z.string().trim().max(40).optional().default(""),
  trackingCode: z.string().trim().max(40).optional().default(""),
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(16).optional().default(""),
  address: z.string().trim().min(6).max(160).optional(),
  city: z.string().trim().min(2).max(40).optional(),
});

export const customerUpdateSchema = z.object({
  id: z.string().trim().min(8).max(80),
  name: z.string().trim().min(2, "Add a name.").max(80),
  phone: z.string().trim().max(16).optional().default(""),
  city: z.string().trim().max(40).optional().default(""),
});

export const nextNumberSchema = z.object({
  seq: z.number().int().min(1000, "Use a number from 1000 up.").max(999999),
});

export const lookupSchema = trackSchema;
