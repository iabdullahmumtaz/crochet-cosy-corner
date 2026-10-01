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

const sql = postgres(env.DIRECT_URL, { prepare: false, max: 1 });
const users = await sql`update users set city = 'Lahore' where city = 'Karachi' returning id`;
const addresses = await sql`update addresses set city = 'Lahore' where city = 'Karachi' returning id`;
console.log(JSON.stringify({ users: users.length, addresses: addresses.length }));
await sql.end();
