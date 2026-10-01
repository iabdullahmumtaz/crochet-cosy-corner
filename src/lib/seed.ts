import bcrypt from "bcryptjs";
import { CATEGORIES, shippingFor, type CategoryId, type Motif, type PaletteId } from "@/lib/domain";
import { defaultCoupons } from "@/lib/coupons";
import { eventCopy, makeEvent } from "@/lib/order-flow";
import type { Order, Product, Store, User } from "@/lib/types";

type SeedPiece = {
  slug: string;
  name: string;
  price: number;
  compareAt?: number;
  category: CategoryId;
  motif: Motif;
  palette: PaletteId;
  stock: number;
  featured?: boolean;
  yarn: string;
  description: string;
};

const pieces: SeedPiece[] = [
  { slug: "hand-warmers", name: "Hand warmers", price: 1200, category: "gloves", motif: "gloves", palette: "sage", stock: 8, featured: true, yarn: "Milk cotton", description: "Ribbed fingerless warmers in sage and blush. They sit just past the wrist and leave your fingers free for a cup of tea." },
  { slug: "cat-paw-gloves", name: "Cat Paw Gloves", price: 1500, category: "gloves", motif: "paws", palette: "blush", stock: 6, featured: true, yarn: "Soft acrylic", description: "Cream paw gloves with little pink beans. A cosy pair for cold rooms and silly photos." },
  { slug: "floral-scarf", name: "Floral Scarf", price: 7000, category: "scarves", motif: "scarf", palette: "cream", stock: 2, featured: true, yarn: "Merino blend", description: "A long cream scarf with tiny embroidered flowers and a soft fringe. Light enough for a cool evening." },
  { slug: "heart-hand-warmers", name: "Heart hand warmers", price: 1200, category: "gloves", motif: "gloves", palette: "burgundy", stock: 7, yarn: "Milk cotton", description: "Burgundy warmers finished with a small heart on the back of the hand." },
  { slug: "arm-warmers", name: "Arm warmers", price: 1950, category: "gloves", motif: "arms", palette: "cream", stock: 5, yarn: "Milk cotton", description: "Long cream arm warmers with a gentle rib. They layer over a sleeve without bulk." },
  { slug: "gryffindor-scarf", name: "Gryffindor scarf", price: 3500, category: "scarves", motif: "scarf", palette: "burgundy", stock: 4, featured: true, yarn: "Worsted wool blend", description: "Maroon and gold stripes with a deep fringe. A house scarf made for winter walks." },
  { slug: "mikasa-scarf", name: "Mikasa Scarf", price: 3000, category: "scarves", motif: "scarf", palette: "rose", stock: 4, yarn: "Worsted wool blend", description: "A rich red scarf with a tidy fringe, long enough to wrap twice." },
  { slug: "couple-cinnamoroll-plushie", name: "Couple Cinnamoroll plushie", price: 2000, category: "keychains", motif: "couple", palette: "sky", stock: 5, yarn: "Plush velvet yarn", description: "Two small white pups with floppy ears, made as a pair. One wears a tiny blue hood." },
  { slug: "cinnamoroll-plushie", name: "Cinnamoroll Plushie", price: 1000, category: "keychains", motif: "bunny", palette: "gold", stock: 8, yarn: "Plush velvet yarn", description: "A palm-sized white pup with a butter-yellow hat. Soft enough for a desk or a bedside." },
  { slug: "miffy-plushies", name: "Miffy plushies", price: 2000, category: "keychains", motif: "miffy", palette: "sky", stock: 5, featured: true, yarn: "Cotton plush", description: "A dressed pair of round bunnies, one in blue and one in rose. Simple faces, sturdy stitches." },
  { slug: "bunny-with-a-heart", name: "Bunny with a Heart plushie", price: 2300, compareAt: 2500, category: "keychains", motif: "bunny", palette: "blush", stock: 6, featured: true, yarn: "Cotton plush", description: "A cream bunny holding a rose heart. The ears are lined in a softer pink." },
  { slug: "strawberry-charm-keychain", name: "Strawberry charm keychain", price: 550, category: "keychains", motif: "keychain", palette: "berry", stock: 12, yarn: "Embroidery cotton", description: "A pair of strawberry charms on silver rings. Clip them to a pouch or a zipper." },
  { slug: "jungkook-head-keychain", name: "Jungkook head doll keychain", price: 1500, category: "keychains", motif: "keychain", palette: "night", stock: 4, yarn: "Milk cotton", description: "A tiny doll head with dark yarn hair and a small smile, finished on a key ring." },
  { slug: "miffy-tomato-hat", name: "Miffy with tomato hat", price: 950, category: "keychains", motif: "keychain", palette: "rose", stock: 7, yarn: "Cotton plush", description: "A round bunny charm in a bright tomato hat. Light, and happy on a bag strap." },
  { slug: "naruto-doll-keychain", name: "Naruto doll keychain", price: 1500, category: "keychains", motif: "keychain", palette: "sun", stock: 4, yarn: "Milk cotton", description: "A small standing doll in orange and navy, with spiky yarn hair and a key ring." },
  { slug: "fruit-goobers", name: "Fruit Goobers", price: 550, category: "keychains", motif: "keychain", palette: "gold", stock: 10, yarn: "Embroidery cotton", description: "A cluster of tiny fruit charms. Sweet, small, and easy to gift." },
  { slug: "mini-turtle", name: "Mini turtle", price: 500, category: "keychains", motif: "turtle", palette: "forest", stock: 9, yarn: "Milk cotton", description: "A pocket turtle with a round shell and a little key ring loop." },
  { slug: "miffy-keychains", name: "Miffy keychains", price: 950, category: "keychains", motif: "miffy", palette: "blush", stock: 6, yarn: "Cotton plush", description: "A handful of mini round bunnies in soft colours, each on its own ring." },
  { slug: "jennie-doll", name: "Jennie Doll", price: 1600, category: "keychains", motif: "keychain", palette: "night", stock: 3, yarn: "Milk cotton", description: "A little doll with auburn yarn hair and a navy dress, made to hang from a bag." },
  { slug: "rose-bouquet", name: "Rose bouquet", price: 2500, category: "flowers", motif: "bouquet", palette: "cream", stock: 4, yarn: "Cotton yarn", description: "A wrapped bunch of cream and dusty blue roses with a paper collar. It stays as you left it." },
  { slug: "sunflower-bouquet", name: "Sunflower bouquet", price: 600, category: "flowers", motif: "flower", palette: "sun", stock: 10, yarn: "Cotton yarn", description: "One cheerful sunflower with a brown ribbon. Small enough for a desk." },
  { slug: "single-tulip", name: "Tulip", price: 400, category: "flowers", motif: "flower", palette: "sky", stock: 14, yarn: "Cotton yarn", description: "A single tulip on a green stem. Quiet, and easy to tuck into a vase." },
  { slug: "sunflower-pair", name: "Sunflower pair", price: 1000, category: "flowers", motif: "bouquet", palette: "gold", stock: 6, yarn: "Cotton yarn", description: "Two sunflowers tied with a black ribbon. A bright pair that will not wilt." },
  { slug: "tulip-pair", name: "Tulips", price: 400, category: "flowers", motif: "flower", palette: "sun", stock: 12, yarn: "Cotton yarn", description: "Two small tulips, lemon and cream, on one stem." },
  { slug: "lily-flower", name: "Lily Flower", price: 700, category: "flowers", motif: "flower", palette: "cream", stock: 7, featured: true, yarn: "Cotton yarn", description: "An open lily with a gold centre and a long green stem." },
  { slug: "red-rose-bouquet", name: "Red rose bouquet", price: 3300, category: "flowers", motif: "bouquet", palette: "rose", stock: 3, featured: true, yarn: "Cotton yarn", description: "A full bunch of deep red roses, wrapped for gifting." },
  { slug: "blush-rose-bouquet", name: "Rose bouquet", price: 3300, category: "flowers", motif: "bouquet", palette: "blush", stock: 3, yarn: "Cotton yarn", description: "Blush and berry roses gathered tight, with soft leaves at the collar." },
  { slug: "pond-bag", name: "Pond bag", price: 6000, category: "holders", motif: "bag", palette: "night", stock: 1, featured: true, yarn: "Cotton cord", description: "A round navy bag with a pond of flowers on the flap and a pearl-strand strap." },
  { slug: "blue-star-shoulder-bag", name: "Blue Star Shoulder Bag", price: 3000, category: "holders", motif: "bag", palette: "sky", stock: 4, yarn: "Cotton cord", description: "A tidy blue shoulder bag with a star patch and a short strap." },
  { slug: "froggie-bag", name: "Froggie bag", price: 5500, category: "holders", motif: "frog", palette: "forest", stock: 2, featured: true, yarn: "Cotton cord", description: "A frog you can wear. Round eyes, a smile, and a strap long enough to cross the body." },
  { slug: "ocean-bag", name: "Ocean bag", price: 6000, category: "holders", motif: "bag", palette: "ocean", stock: 2, yarn: "Cotton cord", description: "A sea-blue round bag scattered with shells, stars, and a small whale." },
  { slug: "star-shoulder-bag", name: "Star shoulder bag", price: 2500, category: "holders", motif: "bag", palette: "blush", stock: 5, yarn: "Cotton cord", description: "A cream shoulder bag with a pink bow and a tiny star. Light for everyday." },
  { slug: "sunflower-strap-bag", name: "Sunflower strap shoulder bag", price: 3200, category: "holders", motif: "bag", palette: "gold", stock: 3, yarn: "Cotton cord", description: "A black rectangular bag with a strap of sunflowers. The clasp is a small silver button." },
  { slug: "sunflower-bag", name: "Sunflower bag", price: 4200, category: "holders", motif: "bag", palette: "sun", stock: 3, featured: true, yarn: "Cotton cord", description: "A round bag that is mostly one big sunflower, with an olive strap." },
  { slug: "beginner-crochet-kit", name: "Beginner crochet kit", price: 1050, category: "bands", motif: "kit", palette: "gold", stock: 15, featured: true, yarn: "Bentley acrylic", description: "Three yarns, a hook, a needle, and a first pattern card. Enough for an evening coaster." },
  { slug: "strawberry-clip", name: "Strawberry clip", price: 300, category: "bands", motif: "clip", palette: "berry", stock: 16, yarn: "Embroidery cotton", description: "A set of strawberry hair clips. Light on a claw clip or a bobby pin." },
  { slug: "flower-hairclip", name: "Flower hairclip", price: 450, category: "bands", motif: "clip", palette: "blush", stock: 12, yarn: "Cotton yarn", description: "Two open blossoms on a clip, in cream and petal pink." },
  { slug: "rose-phone-case", name: "Rose phone case", price: 1500, category: "holders", motif: "phone", palette: "rose", stock: 5, yarn: "Cotton yarn", description: "A crochet cover with a rose and a leaf. Tell us the phone size in the order note." },
  { slug: "bow-clips", name: "Bow clips", price: 350, category: "bands", motif: "bow", palette: "sky", stock: 14, yarn: "Cotton yarn", description: "A pair of pale blue bows. They sit flat and hold a half-up style." },
  { slug: "sunflower-hair-clip", name: "Sunflower hair clip", price: 650, category: "bands", motif: "clip", palette: "sun", stock: 8, yarn: "Cotton yarn", description: "A cluster of mini sunflowers on one clip." },
  { slug: "mobile-cover-initial", name: "Mobile cover with initial", price: 1300, category: "holders", motif: "phone", palette: "sky", stock: 5, yarn: "Cotton yarn", description: "A soft phone cover with a letter on the back. Add the initial in your order note." },
  { slug: "mood-pins", name: "Mood Pins", price: 350, category: "bands", motif: "pins", palette: "burgundy", stock: 3, yarn: "Embroidery cotton", description: "Little statement pins in wine and black. Pin them to a tote or a jacket." },
];

function user(partial: Omit<User, "passwordHash" | "addresses"> & { password: string }): User {
  const { password, ...rest } = partial;
  return { ...rest, addresses: [], passwordHash: bcrypt.hashSync(password, 10) };
}

function product(seed: SeedPiece, createdAt: string): Product {
  return {
    id: crypto.randomUUID(),
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    price: seed.price,
    compareAt: seed.compareAt ?? null,
    category: seed.category,
    motif: seed.motif,
    palette: seed.palette,
    stock: seed.stock,
    featured: Boolean(seed.featured),
    active: true,
    yarn: seed.yarn,
    imageUrl: "",
    createdAt,
  };
}

function buildOrder(
  input: {
    number: string;
    userId: string;
    email: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    payment: Order["payment"];
    status: Order["status"];
    courier: string;
    trackingCode: string;
    createdAt: string;
    slugs: { slug: string; qty: number }[];
    steps: { status: Order["status"]; at: string }[];
  },
  catalog: Product[],
): Order {
  const items = input.slugs.map(({ slug, qty }) => {
    const piece = catalog.find((item) => item.slug === slug);
    if (!piece) throw new Error(`Missing seed piece ${slug}`);
    return {
      productId: piece.id,
      name: piece.name,
      price: piece.price,
      qty,
      lineTotal: piece.price * qty,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = shippingFor(subtotal, input.city);
  const events = input.steps.map((step) => {
    const copy = eventCopy(step.status, {
      courier: input.courier,
      trackingCode: input.trackingCode,
    });
    return makeEvent(step.status, copy.label, copy.note, step.at);
  });
  return {
    id: crypto.randomUUID(),
    number: input.number,
    userId: input.userId,
    email: input.email,
    name: input.name,
    phone: input.phone,
    address: input.address,
    city: input.city,
    notes: "",
    payment: input.payment,
    reference: "",
    items,
    subtotal,
    shipping,
    discount: 0,
    couponCode: "",
    total: subtotal + shipping,
    status: input.status,
    courier: input.courier,
    trackingCode: input.trackingCode,
    stockRestored: false,
    events,
    createdAt: input.createdAt,
  };
}

export function createSeed(): Store {
  const createdAt = "2026-08-01T08:00:00.000Z";
  const products = pieces.map((piece) => product(piece, createdAt));
  const customer = user({
    id: crypto.randomUUID(),
    name: "Amina Shah",
    email: "amina@cosycorner.shop",
    password: "CosyShop!2026",
    role: "customer",
    phone: "03001234567",
    city: "Lahore",
    createdAt: "2026-08-12T09:00:00.000Z",
  });
  customer.addresses.push({
    id: crypto.randomUUID(),
    label: "Home",
    line: "14-C, Gulberg III",
    city: "Lahore",
    phone: customer.phone,
  });
  const admin = user({
    id: crypto.randomUUID(),
    name: "Cosy Studio",
    email: "studio@cosycorner.shop",
    password: "CosyAdmin!2026",
    role: "admin",
    phone: "",
    city: "Lahore",
    createdAt: "2026-08-01T08:00:00.000Z",
  });

  const delivered = buildOrder(
    {
      number: "CC-1842",
      userId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: "14-C, Gulberg III",
      city: "Lahore",
      payment: "cod",
      status: "delivered",
      courier: "Studio courier",
      trackingCode: "COS-184210",
      createdAt: "2026-09-12T11:20:00.000Z",
      slugs: [{ slug: "bunny-with-a-heart", qty: 1 }],
      steps: [
        { status: "placed", at: "2026-09-12T11:20:00.000Z" },
        { status: "confirmed", at: "2026-09-12T15:00:00.000Z" },
        { status: "making", at: "2026-09-13T10:00:00.000Z" },
        { status: "packed", at: "2026-09-16T12:00:00.000Z" },
        { status: "shipped", at: "2026-09-16T17:00:00.000Z" },
        { status: "out_for_delivery", at: "2026-09-18T08:30:00.000Z" },
        { status: "delivered", at: "2026-09-18T16:10:00.000Z" },
      ],
    },
    products,
  );

  const making = buildOrder(
    {
      number: "CC-1904",
      userId: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: "14-C, Gulberg III",
      city: "Lahore",
      payment: "jazzcash",
      status: "making",
      courier: "",
      trackingCode: "",
      createdAt: "2026-09-28T14:05:00.000Z",
      slugs: [{ slug: "floral-scarf", qty: 1 }],
      steps: [
        { status: "placed", at: "2026-09-28T14:05:00.000Z" },
        { status: "confirmed", at: "2026-09-28T18:40:00.000Z" },
        { status: "making", at: "2026-09-29T09:15:00.000Z" },
      ],
    },
    products,
  );

  for (const order of [delivered, making]) {
    for (const item of order.items) {
      const piece = products.find((product) => product.id === item.productId);
      if (piece) piece.stock = Math.max(0, piece.stock - item.qty);
    }
  }

  const bySlug = (slug: string) => products.find((item) => item.slug === slug)?.id ?? null;

  return {
    seq: 1905,
    users: [admin, customer],
    products,
    orders: [making, delivered],
    reviews: [
      {
        id: crypto.randomUUID(),
        userId: null,
        productId: bySlug("cat-paw-gloves"),
        name: "Ayesha",
        city: "Lahore",
        rating: 5,
        text: "The cat paw gloves arrived wrapped like a gift. They are even softer than the photos.",
        createdAt: "2026-09-20T10:00:00.000Z",
      },
      {
        id: crypto.randomUUID(),
        userId: customer.id,
        productId: bySlug("bunny-with-a-heart"),
        name: "Hina",
        city: "Lahore",
        rating: 5,
        text: "Ordered the bunny for my sister. Tracking was clear, and the box smelled like a yarn shop.",
        createdAt: "2026-09-19T12:00:00.000Z",
      },
      {
        id: crypto.randomUUID(),
        userId: null,
        productId: bySlug("sunflower-strap-bag"),
        name: "Mehak",
        city: "Islamabad",
        rating: 5,
        text: "The sunflower strap bag gets compliments every day. You can tell it was made slowly.",
        createdAt: "2026-09-22T09:30:00.000Z",
      },
      {
        id: crypto.randomUUID(),
        userId: null,
        productId: bySlug("beginner-crochet-kit"),
        name: "Sara",
        city: "Rawalpindi",
        rating: 4,
        text: "The beginner kit was actually beginner-friendly. I finished a coaster on the first evening.",
        createdAt: "2026-09-25T18:00:00.000Z",
      },
    ],
    messages: [
      {
        id: crypto.randomUUID(),
        name: "Hina Qureshi",
        email: "hina@example.com",
        topic: "Custom piece",
        body: "Could you make the heart warmers in cream and cocoa for a November wedding? I need four pairs.",
        read: false,
        createdAt: "2026-09-29T10:12:00.000Z",
      },
    ],
    coupons: defaultCoupons(),
    categories: CATEGORIES.map((category) => ({ ...category, imageUrl: "" })),
    whatsapp: "",
    theme: "blush",
    subscribers: [
      {
        id: crypto.randomUUID(),
        email: "sara@example.com",
        createdAt: "2026-09-21T08:00:00.000Z",
      },
    ],
  };
}
