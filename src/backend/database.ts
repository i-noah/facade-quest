import path from "path";
import knex, { Knex } from "knex";
import { tmpDir, root } from "./paths";

let manifest: ImageDataManifest = [];
let quests: ImageQuestItem[] = [];

try {
  manifest = require(path.resolve(root, "config", "manifest.json"));
  quests = require(path.resolve(root, "config", "quest.json"));
} catch (e) {
  console.log(e);
  console.error("无法解析manifest.json");
}

type ImageDatasetRegroup = Record<string, ImageDataSetItem[]>;

const regroupImageDataset: ImageDatasetRegroup = {};

for (let { data } of manifest) {
  if (!regroupImageDataset[data.group]) regroupImageDataset[data.group] = [];
  regroupImageDataset[data.group].push(data);
}

export { manifest, quests, regroupImageDataset };

const dbFilename = path.join(tmpDir, "data.db");
const db = knex({
  client: "sqlite3",
  connection: {
    filename: dbFilename,
  },
  useNullAsDefault: true,
});

const createTableIfNotExist = async (
  name: string,
  cb: (table: Knex.CreateTableBuilder) => void
) => {
  const hasTable = await db.schema.hasTable(name);
  if (hasTable) return;
  await db.schema.createTable(name, cb);
};

(async () => {
  try {
    // Create a table
    await createTableIfNotExist("users", (table) => {
      table.increments("id");
      table.string("username");
      table.string("password");
    });

    await createTableIfNotExist("quests", (table) => {
      table.increments("id");
      table.string("uuid");
      table.integer("uid");
      table.string("group");
      table.string("qid");
      table.string("answer");
      table.timestamp("date").defaultTo(db.fn.now());
    });
  } catch (e) {
    console.error(e);
  }
})();

export default db;
