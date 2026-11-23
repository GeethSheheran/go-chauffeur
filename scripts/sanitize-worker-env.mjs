import { readFile, writeFile } from "node:fs/promises";

// OpenNext compiles .env.local into server output. Keep private credentials solely
// in Worker runtime secrets, including when builds run on a developer's laptop.
const file = new URL("../.open-next/cloudflare/next-env.mjs", import.meta.url);
const source = await readFile(file, "utf8");
const output = ["production", "development", "test"].map((mode) => {
  const match = source.match(new RegExp(`export const ${mode} = (.*);`));
  if (!match) throw new Error(`Unrecognized OpenNext environment format: ${mode}`);
  const values = JSON.parse(match[1]);
  const publicValues = Object.fromEntries(Object.entries(values).filter(([key]) => key.startsWith("NEXT_PUBLIC_")));
  return `export const ${mode} = ${JSON.stringify(publicValues)};\n`;
}).join("");
await writeFile(file, output);
console.log("Worker environment prepared: private values must come from runtime secrets.");
