import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const photos = readdirSync("C:/Users/ranaa/.cursor/projects/h-projet/assets").filter((name) => name.includes("WhatsApp_Image"));

const pieces = [
  ["1e234940", "paw-keychains", "Paw keychains", "keychains", "keychain", "blush", "A cream paw with pink beans, and a beige paw with cocoa beans, each on a silver ring."],
  ["bd1c881e", "brown-granny-cardigan", "Brown granny cardigan", "wearables", "scarf", "burgundy", "A cropped cream cardigan of brown granny squares, tied at the front."],
  ["9fb8c5f4", "pink-paw-gloves", "Pink paw gloves", "wearables", "paws", "blush", "Cream fingerless gloves with a large pink paw on the back of each hand."],
  ["f0e5daf7", "cream-bear-keychain", "Cream bear keychain", "keychains", "keychain", "cream", "A small cream bear with a coral bow, finished on a silver ring."],
  ["24171551", "moon-and-star-keychains", "Moon and star keychains", "keychains", "keychain", "sky", "A cream moon and a blue star, each with a soft face and its own ring."],
  ["f203d618", "ghost-keychains", "Ghost keychains", "keychains", "keychain", "night", "A cream ghost and a black ghost, paired on one clasp."],
  ["86651931", "burgundy-bow-scarf", "Burgundy bow scarf", "wearables", "scarf", "burgundy", "A long burgundy rib scarf with two small white bows and a deep fringe."],
  ["9bcbe208", "burgundy-bow-gloves", "Burgundy bow gloves", "wearables", "gloves", "burgundy", "Burgundy fingerless gloves with a cream scallop cuff and a cream bow."],
  ["d3900db8", "brown-scallop-gloves", "Brown scallop gloves", "wearables", "gloves", "gold", "Brown fingerless gloves finished with a cream scalloped edge."],
  ["e3ab831f", "brown-arm-warmers", "Brown arm warmers", "wearables", "arms", "gold", "Long brown ribbed arm warmers that sit over the wrist."],
  ["4837d412", "heart-fingerless-gloves", "Heart fingerless gloves", "wearables", "gloves", "cream", "Cream gloves with a burgundy scallop and a small burgundy heart."],
  ["d80ec8ec", "lace-cuffs", "Lace cuffs", "accessories", "clip", "cream", "Openwork cream cuffs with a fan edge and a few small beads."],
  ["49d7b2b6", "octopus-keychains", "Octopus keychains", "keychains", "keychain", "blush", "A cream octopus with a pink bow, and a pink octopus with a white bow."],
  ["0dbf209b", "crochet-bandanas", "Crochet bandanas", "wearables", "scarf", "rose", "Triangle bandanas in sand, burgundy, and cream, each with tie strings."],
  ["3f8336ce", "blue-granny-cardigan", "Blue granny cardigan", "wearables", "scarf", "ocean", "A cropped cream cardigan of blue and aqua granny squares, tied at the front."],
  ["46cbca37", "blush-granny-cardigan", "Blush granny cardigan", "wearables", "scarf", "blush", "A cropped cardigan of blush, blue, and cream granny squares."],
  ["91a48aee", "pink-card-holder", "Pink card holder", "accessories", "phone", "blush", "A small pink card holder with a cream border."],
  ["6ea4d516", "scallop-card-holders", "Scallop card holders", "accessories", "phone", "sage", "Olive, dusty blue, and blush card holders, each with a white scalloped flap."],
  ["55e60389", "pink-star-charm", "Pink star charm", "keychains", "keychain", "blush", "A small pink star on a yarn loop, made to hang from a bag."],
  ["b875a9c3", "mesh-shrug", "Mesh shrug", "wearables", "arms", "cream", "An open cream mesh shrug with long sleeves."],
  ["e800b60d", "lily-of-the-valley", "Lily of the valley", "flowers", "flower", "cream", "Two cream bells on a green stem, with a small yarn loop."],
  ["561e447d", "tulip-bouquet", "Tulip bouquet", "flowers", "bouquet", "rose", "One red tulip with green leaves, wrapped and tied with a green bow."],
  ["0c9b689e", "mushroom-keychain", "Mushroom keychain", "keychains", "keychain", "gold", "A cocoa mushroom with a cream stem and tiny cream spots."],
  ["db1000ed", "strawberry-keychain", "Strawberry keychain", "keychains", "keychain", "berry", "A red strawberry with a white flower and a pearl centre."],
  ["f1509498", "sunflower-scarf", "Sunflower scarf", "wearables", "scarf", "gold", "A brown rib scarf with yellow sunflowers along the fringe."],
  ["f5069dfa", "sunflower-keychain", "Sunflower keychain", "keychains", "keychain", "sun", "A yellow sunflower with a cocoa centre and one green leaf."],
  ["b64b8c78", "granny-square-scarf", "Granny square scarf", "wearables", "scarf", "rose", "A long scarf of cream, blush, and berry granny squares with a fringe."],
  ["5293c8ec", "rose-scarf", "Rose scarf", "wearables", "scarf", "cream", "A white rib scarf scattered with small pink roses and green leaves."],
  ["5da250f0", "ruffle-scarf", "Ruffle scarf", "wearables", "scarf", "blush", "A cream rib scarf with a dusty-rose ruffle and a small bow."],
  ["ff6a3552", "black-granny-scarf", "Black granny scarf", "wearables", "scarf", "night", "A black scarf with three white-and-grey granny squares and a grey fringe."],
  ["1fa945fd", "bow-card-holders", "Bow card holders", "accessories", "bow", "blush", "Card holders with a bow on the flap, in lilac, berry, gold, blush, black, cream, blue, olive, and sand."],
  ["440ad919", "sunflower-hanger", "Sunflower hanger", "flowers", "flower", "sun", "A sunflower on a green loop, with two leaves at the stem."],
  ["d7e345a2", "pink-card-pouch", "Pink card pouch", "accessories", "phone", "blush", "A pink pouch with a cream top edge and a small cream bow charm."],
  ["0c78cb81", "dragonfly-keychain", "Dragonfly keychain", "keychains", "keychain", "sage", "A mint dragonfly with a short strand of pearls."],
  ["b8429613", "clover-keychain", "Clover keychain", "keychains", "keychain", "forest", "A sage four-leaf clover on a silver ring."],
  ["9e65448a", "pink-bow-keychain", "Pink bow keychain", "keychains", "bow", "blush", "A soft pink bow on a silver ring."],
  ["85d2fe1b", "pink-bow-scarf", "Pink bow scarf", "wearables", "scarf", "blush", "A pink rib scarf with one white bow and a pink fringe."],
  ["1e04dde4", "maroon-gold-scarf", "Maroon and gold scarf", "wearables", "scarf", "burgundy", "A maroon scarf with gold stripes and a deep fringe."],
  ["1794cafc", "bat-keychain", "Bat keychain", "keychains", "keychain", "night", "A small black bat on a silver ring."],
  ["330e8fd8", "sunflower-bouquet-keychain", "Sunflower bouquet keychain", "keychains", "bouquet", "sun", "A tiny sunflower wrapped in cream and tied with twine."],
];

const featured = new Set([
  "brown-granny-cardigan",
  "pink-paw-gloves",
  "blue-granny-cardigan",
  "blush-granny-cardigan",
  "strawberry-keychain",
  "sunflower-keychain",
  "bow-card-holders",
  "maroon-gold-scarf",
]);

function findFile(id) {
  const match = photos.find((name) => name.includes(id));
  if (!match) throw new Error(`Missing photo ${id}`);
  return path.join("C:/Users/ranaa/.cursor/projects/h-projet/assets", match);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const bucket = await supabase.storage.getBucket("shop");
if (bucket.error) {
  const created = await supabase.storage.createBucket("shop", { public: true, fileSizeLimit: 8_000_000 });
  if (created.error && !created.error.message.toLowerCase().includes("already")) {
    throw new Error(created.error.message);
  }
}

const rows = [];
for (const [id, slug, name, category, motif, palette, description] of pieces) {
  const file = findFile(id);
  const body = readFileSync(file);
  const storagePath = `products/${slug}.jpg`;
  const uploaded = await supabase.storage.from("shop").upload(storagePath, body, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (uploaded.error) throw new Error(`${slug}: ${uploaded.error.message}`);
  const url = supabase.storage.from("shop").getPublicUrl(storagePath).data.publicUrl;
  rows.push({
    id: randomUUID(),
    slug,
    name,
    description,
    price: 0,
    compare_at: null,
    category,
    motif,
    palette,
    stock: 5,
    featured: featured.has(slug),
    active: true,
    yarn: "Cotton yarn",
    image_url: url,
    created_at: new Date().toISOString(),
  });
  process.stdout.write(`uploaded ${slug}\n`);
}

const sql = postgres(env.DIRECT_URL, { prepare: false, max: 1 });
await sql.begin(async (tx) => {
  await tx`delete from tracking_events`;
  await tx`delete from order_items`;
  await tx`delete from orders`;
  await tx`delete from reviews`;
  await tx`delete from messages`;
  await tx`delete from subscribers`;
  await tx`delete from addresses`;
  await tx`delete from users where role <> 'admin'`;
  await tx`delete from products`;
  await tx`insert into products ${tx(rows)}`;
});

const counts = await sql`
  select
    (select count(*) from products) as products,
    (select count(*) from orders) as orders,
    (select count(*) from users where role = 'customer') as customers,
    (select count(*) from users where role = 'admin') as admins
`;
console.log(JSON.stringify(counts[0]));
await sql.end();
