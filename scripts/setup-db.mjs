import fs from "fs";
import postgres from "postgres";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const sql = postgres(env.DIRECT_URL, { prepare: false, max: 1 });
const schema = fs.readFileSync("src/lib/schema.sql", "utf8");
await sql.unsafe(schema);
const tables = await sql`select count(*)::int as n from information_schema.tables where table_schema = 'public' and table_name = 'users'`;
console.log(tables[0].n === 1 ? "tables ready" : "tables missing");
await sql.end();
