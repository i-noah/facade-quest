import path from "path";
import fs from "fs";

export const root = path.resolve(".");

export const tmpDir = path.join(root, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
