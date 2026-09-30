import type { CategoryId, Motif, PaletteId, PaymentId } from "@/lib/domain";

export type Role = "admin" | "customer";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "making"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type SavedAddress = {
  id: string;
  label: string;
  line: string;
  city: string;
  phone: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone: string;
  city: string;
  addresses: SavedAddress[];
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAt: number | null;
  category: string;
  motif: Motif;
  palette: PaletteId;
  stock: number;
  featured: boolean;
  active: boolean;
  yarn: string;
  imageUrl: string;
  createdAt: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  lineTotal: number;
};

export type TrackingEvent = {
  id: string;
  status: OrderStatus | "note";
  label: string;
  note: string;
  at: string;
};

export type Order = {
  id: string;
  number: string;
  userId: string | null;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment: PaymentId;
  reference: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode: string;
  total: number;
  status: OrderStatus;
  courier: string;
  trackingCode: string;
  stockRestored: boolean;
  events: TrackingEvent[];
  createdAt: string;
};

export type Review = {
  id: string;
  productId: string | null;
  userId: string | null;
  name: string;
  city: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type Coupon = {
  code: string;
  label: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  active: boolean;
};

export type StudioMessage = {
  id: string;
  name: string;
  email: string;
  topic: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export type ShopCategory = {
  id: string;
  label: string;
  blurb: string;
  motif: Motif;
  palette: PaletteId;
  imageUrl: string;
};

export type Store = {
  seq: number;
  users: User[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  messages: StudioMessage[];
  subscribers: Subscriber[];
  coupons: Coupon[];
  categories: ShopCategory[];
  whatsapp: string;
};

export type QuoteLine = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  qty: number;
  lineTotal: number;
  motif: Motif;
  palette: PaletteId;
  stock: number;
};

export type Quote =
  | {
      ok: true;
      lines: QuoteLine[];
      subtotal: number;
      shipping: number | null;
      discount: number;
      couponCode: string;
      couponLabel: string;
      couponError: string;
      total: number;
    }
  | { ok: false; error: string };

export type ActionOk = { ok: true };
export type ActionFail = { ok: false; error: string };
