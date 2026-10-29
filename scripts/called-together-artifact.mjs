import { cp, lstat, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repository = fileURLToPath(new URL("../", import.meta.url));
export const artifact = path.join(repository, "artifacts/called-together");
export const application = "apps/called-together";
export const entryPoint = `${application}/server.js`;

function excluded(relative) {
  const parts = relative.split(path.sep);
  return (
    parts.some((part) =>
      /^(?:\.env.*|\.git|\.aws|\.azure|\.ssh|\.npmrc|\.yarnrc(?:\.yml)?)$/i.test(
        part,
      ),
    ) ||
    parts.some((part) => /\.(?:pem|key|pfx|p12)$/i.test(part)) ||
    (parts[0] === "apps" && parts.length > 1 && parts[1] !== "called-together")
  );
}

export function isInside(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

// Copy all traced files, including dotfiles, but never follow a link out of its
// source tree. Dereferencing internal links makes the artifact relocatable.
export async function copyRuntime(source, destination) {
  const root = await realpath(source);
  await cp(source, destination, {
    recursive: true,
    dereference: true,
    filter: async (file) => {
      if (excluded(path.relative(source, file))) return false;
      const resolved = await realpath(file);
      if (!isInside(root, resolved)) {
        throw new Error("Runtime link points outside the source tree");
      }
      if (excluded(path.relative(root, resolved))) return false;
      return true;
    },
  });
}

export async function auditArtifact(root) {
  async function walk(directory) {
    for (const name of await readdir(directory)) {
      const file = path.join(directory, name);
      if (excluded(path.relative(root, file))) {
        throw new Error("Artifact contains an excluded file or application");
      }
      const info = await lstat(file);
      if (info.isSymbolicLink())
        throw new Error("Artifact contains a symbolic link");
      if (info.isDirectory()) await walk(file);
    }
  }
  await walk(root);
}
