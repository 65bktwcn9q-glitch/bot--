import { createHash } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "./updates";
const outFile = process.argv[3] ?? path.join(root, "manifest.json");

async function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const filesDir = path.join(root, "files");
  const files = await walk(filesDir);
  const manifestFiles = [];

  for (const file of files) {
    const stats = await fs.stat(file);
    const sha256 = await hashFile(file);
    manifestFiles.push({
      path: path.relative(filesDir, file).replace(/\\/g, "/"),
      size: stats.size,
      sha256
    });
  }

  const manifest = {
    version: new Date().toISOString(),
    critical: false,
    files: manifestFiles
  };

  await fs.writeFile(outFile, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Manifest written to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
