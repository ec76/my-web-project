import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  decideDeployments,
  decisionSummary,
  discoverBaselines,
} from "./deployment-decisions.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const run = (program, args) =>
  execFileSync(program, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
const emit = (key, value) =>
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);

if (process.argv.includes("--graph")) {
  try {
    const require = createRequire(import.meta.url);
    const turbo = require.resolve("turbo/bin/turbo");
    const result = JSON.parse(
      run(process.execPath, [
        turbo,
        "query",
        "query { packages { items { name path directDependencies { items { name } } } } }",
      ]),
    );
    if (result.errors || !result.data?.packages?.items)
      throw new Error("Turbo package graph unavailable");
    const graph = result.data.packages.items
      .filter((item) => item.name !== "//")
      .map((item) => ({
        name: item.name,
        path: item.path.replaceAll("\\", "/"),
        dependencies: item.directDependencies.items
          .map((dependency) => dependency.name)
          .filter((name) => name !== "//"),
      }));
    emit("graph", JSON.stringify(graph));
    console.log(
      `Exported Turbo ${result.version} package graph (${graph.length} workspaces).`,
    );
  } catch {
    emit("graph", "[]");
    console.log(
      "::warning::Turbo graph unavailable; automatic deployment selection will deploy conservatively.",
    );
  }
} else {
  const {
    GITHUB_EVENT_NAME: event,
    GITHUB_REF: ref,
    GITHUB_SHA: head,
    GITHUB_REPOSITORY: repository,
  } = process.env;
  const deadline = Date.now() + 90000;
  let requests = 0;
  const request = async (route) => {
    if (++requests > 500 || Date.now() >= deadline)
      throw new Error(
        "history scan budget exhausted (90 seconds / 500 requests)",
      );
    const response = await fetch(
      new URL(route, process.env.GITHUB_API_URL || "https://api.github.com"),
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
        },
        signal: AbortSignal.timeout(
          Math.max(1, Math.min(10000, deadline - Date.now())),
        ),
      },
    );
    if (!response.ok)
      throw new Error(`GitHub history API returned HTTP ${response.status}`);
    return response.json();
  };
  const baselines =
    ref === "refs/heads/main" && ["push", "workflow_dispatch"].includes(event)
      ? await discoverBaselines({
          request,
          repository,
          runId: process.env.GITHUB_RUN_ID,
          attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
        })
      : {};
  let graph = [];
  try {
    graph = JSON.parse(process.env.DEPLOYMENT_GRAPH);
  } catch {
    /* Per-app graph errors deploy conservatively. */
  }
  const policy = JSON.parse(
    readFileSync(new URL("./deployment-policy.json", import.meta.url), "utf8"),
  );
  const diffs = new Map();
  const changedFiles = async (base) => {
    if (!diffs.has(base)) {
      if (!/^[a-f0-9]{40}$/i.test(base) || !/^[a-f0-9]{40}$/i.test(head))
        throw new Error("invalid comparison SHA");
      try {
        run("git", ["merge-base", "--is-ancestor", base, head]);
      } catch {
        throw new Error(
          `baseline ${base} is missing or not an ancestor of the current SHA`,
        );
      }
      diffs.set(
        base,
        run("git", [
          "diff",
          "--name-only",
          "--no-renames",
          "-z",
          `${base}..${head}`,
          "--",
        ])
          .split("\0")
          .filter(Boolean),
      );
    }
    return diffs.get(base);
  };
  const decisions = await decideDeployments({
    event,
    ref,
    target: process.env.DEPLOY_TARGET || "auto",
    baselines,
    graph,
    changedFiles,
    buildInputs: policy.documentationBuildInputs,
  });
  for (const [app, item] of Object.entries(decisions))
    emit(`deploy-${app}`, String(item.deploy));
  const summary = decisionSummary(decisions, head);
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
