import { access, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import {
  application,
  artifact,
  auditArtifact,
  copyRuntime,
  entryPoint,
  isInside,
  repository,
} from "./called-together-artifact.mjs";

const source = path.join(repository, application);
const standalone = path.join(source, ".next/standalone");
await access(path.join(standalone, entryPoint));
await access(path.join(source, ".next/static"));

// This is the only generated destination this script is allowed to replace.
if (!isInside(repository, artifact) || artifact === repository) {
  throw new Error("Artifact destination must be inside the repository");
}
await rm(artifact, {
  recursive: true,
  force: true,
  maxRetries: 5,
  retryDelay: 200,
});
await mkdir(artifact, { recursive: true });
await copyRuntime(standalone, artifact);
const runtimeApp = path.join(artifact, application);
await copyRuntime(
  path.join(source, ".next/static"),
  path.join(runtimeApp, ".next/static"),
);
// public is optional; failures while copying an existing directory must surface.
const publicExists = await access(path.join(source, "public")).then(
  () => true,
  (error) => {
    if (error.code === "ENOENT") return false;
    throw error;
  },
);
if (publicExists)
  await copyRuntime(
    path.join(source, "public"),
    path.join(runtimeApp, "public"),
  );
await auditArtifact(artifact);
await access(path.join(artifact, entryPoint));
console.log("Packaged artifacts/called-together");
console.log(`Startup from artifact root: HOSTNAME=0.0.0.0 node ${entryPoint}`);
