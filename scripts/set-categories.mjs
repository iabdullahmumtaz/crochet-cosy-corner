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

const categories = [
  ["cardigans", "Cardigans", "Cropped granny cardigans and an open mesh shrug, tied at the front.", "scarf", "burgundy", "brown-granny-cardigan"],
  ["scarves", "Scarves", "Rib scarves with bows, roses, sunflowers, and granny squares.", "scarf", "rose", "rose-scarf"],
  ["gloves", "Gloves", "Fingerless gloves, paw gloves, and long arm warmers.", "gloves", "blush", "pink-paw-gloves"],
  ["keychains", "Keychains", "Tiny charms on a ring: paws, bears, flowers, and little faces.", "keychain", "berry", "strawberry-keychain"],
  ["flowers", "Flowers", "Stems, hangers, and bouquets that stay in bloom.", "bouquet", "sun", "tulip-bouquet"],
  ["holders", "Card holders", "Small pouches and card holders with bows and scalloped flaps.", "phone", "blush", "bow-card-holders"],
  ["bands", "Bandanas", "Triangle bandanas and openwork cuffs.", "clip", "cream", "crochet-bandanas"],
];

const groups = {
  cardigans: ["brown-granny-cardigan", "blue-granny-cardigan", "blush-granny-cardigan", "mesh-shrug"],
  scarves: ["burgundy-bow-scarf", "sunflower-scarf", "granny-square-scarf", "rose-scarf", "ruffle-scarf", "black-granny-scarf", "pink-bow-scarf", "maroon-gold-scarf"],
  gloves: ["pink-paw-gloves", "burgundy-bow-gloves", "brown-scallop-gloves", "brown-arm-warmers", "heart-fingerless-gloves"],
  keychains: ["paw-keychains", "cream-bear-keychain", "moon-and-star-keychains", "ghost-keychains", "octopus-keychains", "pink-star-charm", "mushroom-keychain", "strawberry-keychain", "sunflower-keychain", "dragonfly-keychain", "clover-keychain", "pink-bow-keychain", "bat-keychain", "sunflower-bouquet-keychain"],
  flowers: ["lily-of-the-valley", "tulip-bouquet", "sunflower-hanger"],
  holders: ["pink-card-holder", "scallop-card-holders", "bow-card-holders", "pink-card-pouch"],
  bands: ["crochet-bandanas", "lace-cuffs"],
};

const sql = postgres(env.DIRECT_URL || env.DATABASE_URL, { prepare: false, max: 1 });

await sql.begin(async (tx) => {
  for (const [index, [id, label, blurb, motif, palette]] of categories.entries()) {
    await tx`
      insert into categories (id, label, blurb, motif, palette, image_url, sort_order)
      values (${id}, ${label}, ${blurb}, ${motif}, ${palette}, '', ${index})
      on conflict (id) do update set
        label = excluded.label,
        blurb = excluded.blurb,
        motif = excluded.motif,
        palette = excluded.palette,
        sort_order = excluded.sort_order
    `;
  }
  for (const [id, slugs] of Object.entries(groups)) {
    await tx`update products set category = ${id} where slug in ${tx(slugs)}`;
  }
  for (const [id, , , , , cover] of categories) {
    await tx`
      update categories
      set image_url = products.image_url
      from products
      where products.slug = ${cover} and categories.id = ${id}
    `;
  }
  const ids = categories.map((category) => category[0]);
  const leftover = await tx`select slug from products where category not in ${tx(ids)}`;
  if (leftover.length) throw new Error(`Unassigned: ${leftover.map((row) => row.slug).join(", ")}`);
  await tx`delete from categories where id not in ${tx(ids)}`;
});

const summary = await sql`
  select categories.label, count(products.id)::int as pieces
  from categories
  left join products on products.category = categories.id
  group by categories.id, categories.label, categories.sort_order
  order by categories.sort_order
`;
console.log(JSON.stringify(summary));
await sql.end();
