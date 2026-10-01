import postgres from "postgres";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const prices = {
  "paw-keychains": 450,
  "brown-granny-cardigan": 5000,
  "pink-paw-gloves": 1500,
  "cream-bear-keychain": 850,
  "moon-and-star-keychains": 550,
  "ghost-keychains": 600,
  "burgundy-bow-scarf": 2900,
  "burgundy-bow-gloves": 1450,
  "brown-scallop-gloves": 1200,
  "brown-arm-warmers": 1950,
  "heart-fingerless-gloves": 1200,
  "lace-cuffs": 1300,
  "octopus-keychains": 550,
  "crochet-bandanas": 1150,
  "blue-granny-cardigan": 5000,
  "blush-granny-cardigan": 5000,
  "pink-card-holder": 1250,
  "scallop-card-holders": 850,
  "pink-star-charm": 400,
  "mesh-shrug": 3000,
  "lily-of-the-valley": 500,
  "tulip-bouquet": 600,
  "mushroom-keychain": 600,
  "strawberry-keychain": 500,
  "sunflower-scarf": 3500,
  "sunflower-keychain": 450,
  "granny-square-scarf": 4000,
  "rose-scarf": 4000,
  "ruffle-scarf": 3900,
  "black-granny-scarf": 3900,
  "bow-card-holders": 950,
  "sunflower-hanger": 450,
  "pink-card-pouch": 1050,
  "dragonfly-keychain": 450,
  "clover-keychain": 450,
  "pink-bow-keychain": 450,
  "pink-bow-scarf": 3200,
  "maroon-gold-scarf": 3400,
  "bat-keychain": 400,
  "sunflower-bouquet-keychain": 600,
};

const sql = postgres(env.DIRECT_URL || env.DATABASE_URL, { prepare: false, max: 1 });
const slugs = Object.keys(prices);
await sql.begin(async (tx) => {
  for (const [slug, price] of Object.entries(prices)) {
    const updated = await tx`update products set price = ${price} where slug = ${slug} returning slug`;
    if (!updated.length) throw new Error(`Missing ${slug}`);
  }
});
const left = await sql`select slug, price from products where price = 0 or slug not in ${sql(slugs)} order by slug`;
const count = await sql`select count(*)::int as pieces, min(price)::int as low, max(price)::int as high from products`;
console.log(JSON.stringify({ count: count[0], unmatched: left }));
await sql.end();
