import { existsSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = join(root, "prisma", "dev.db");
const journalPath = join(root, "prisma", "dev.db-journal");

for (const file of [dbPath, journalPath]) {
  if (existsSync(file)) {
    unlinkSync(file);
    console.log(`Removed ${file}`);
  }
}
