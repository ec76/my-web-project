import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  decideDeployments,
  discoverBaselines,
  decisionSummary,
} from "./deployment-decisions.mjs";

const sha = (number) => number.toString(16).padStart(40, "0");
const graph = [
  { name: "web", path: "apps/web", dependencies: ["@repo/ui"] },
  {
    name: "called-together",
    path: "apps/called-together",
    dependencies: ["@repo/ui", "@repo/ministry"],
  },
  { name: "@repo/ui", path: "packages/ui", dependencies: ["@repo/core"] },
  { name: "@repo/core", path: "packages/core", dependencies: [] },
  { name: "@repo/ministry", path: "packages/ministry", dependencies: [] },
  {
    name: "@repo/storybook",
    path: "apps/storybook",
    dependencies: ["@repo/ui"],
  },
];
const baseline = { test: { sha: sha(1) }, "called-together": { sha: sha(1) } };
async function decisions(files, options = {}) {
  return decideDeployments({
    event: "push",
    ref: "refs/heads/main",
    baselines: baseline,
    graph,
    changedFiles: async () => files,
    ...options,
  });
}
const flags = (result) => [
  result.test.deploy,
  result["called-together"].deploy,
];

for (const [name, files, expected] of [
  ["test app only", ["apps/web/app/page.tsx"], [true, false]],
  ["ministry app only", ["apps/called-together/app/page.tsx"], [false, true]],
  ["shared UI", ["packages/ui/src/theme.ts"], [true, true]],
  ["transitive dependency", ["packages/core/src/index.ts"], [true, true]],
  [
    "dependency of only one website",
    ["packages/ministry/src/index.ts"],
    [false, true],
  ],
  [
    "documentation only",
    [
      "README.md",
      "docs/hosting.md",
      "packages/ui/README.md",
      "apps/web/docs/guide.md",
      "AGENTS.md",
    ],
    [false, false],
  ],
  [
    "Storybook only",
    ["apps/storybook/.storybook/main.ts", "apps/storybook/package.json"],
    [false, false],
  ],
  ["root lockfile", ["package-lock.json"], [true, true]],
  ["root config", ["turbo.json"], [true, true]],
  ["workflow", [".github/workflows/validate-deploy.yml"], [true, true]],
  [
    "Called Together packaging",
    ["scripts/package-called-together.mjs"],
    [false, true],
  ],
  ["unknown root script", ["scripts/new-deployment.mjs"], [true, true]],
  [
    "deleted or unknown package",
    ["packages/removed/src/index.ts"],
    [true, true],
  ],
  ["actual markdown content", ["apps/web/app/about/page.mdx"], [true, false]],
  [
    "markdown public asset",
    ["apps/called-together/public/README.md"],
    [false, true],
  ],
  [
    "mixed documentation and application",
    ["README.md", "apps/web/app/page.tsx"],
    [true, false],
  ],
]) {
  test(name, async () =>
    assert.deepEqual(flags(await decisions(files)), expected),
  );
}

test("documentation explicitly consumed by a build is not ignored", async () => {
  assert.deepEqual(
    flags(
      await decisions(["docs/content.md"], {
        buildInputs: ["docs/content.md"],
      }),
    ),
    [true, true],
  );
  assert.deepEqual(
    flags(
      await decisions(["apps/web/docs/content.md"], {
        buildInputs: ["apps/web/docs"],
      }),
    ),
    [true, false],
  );
});
test("each app compares against its own last deployed SHA", async () => {
  const result = await decisions([], {
    baselines: { test: { sha: sha(1) }, "called-together": { sha: sha(2) } },
    changedFiles: async (base) =>
      base === sha(1) ? ["apps/web/app/page.tsx", "README.md"] : ["README.md"],
  });
  assert.deepEqual(flags(result), [true, false]);
});
test("missing baseline falls back only for the affected app", async () => {
  const result = await decisions(["README.md"], {
    baselines: { "called-together": baseline["called-together"] },
  });
  assert.deepEqual(flags(result), [true, false]);
  assert.match(result.test.reason, /fallback/);
});
test("missing history deploys both, even for documentation", async () => {
  assert.deepEqual(flags(await decisions(["README.md"], { baselines: {} })), [
    true,
    true,
  ]);
});
test("unavailable ancestry/diff and graph failures deploy conservatively", async () => {
  assert.deepEqual(
    flags(
      await decisions([], {
        changedFiles: async () => {
          throw new Error("not an ancestor");
        },
      }),
    ),
    [true, true],
  );
  assert.deepEqual(flags(await decisions([], { graph: [] })), [true, true]);
});
for (const [target, expected] of [
  ["test", [true, false]],
  ["called-together", [false, true]],
  ["both", [true, true]],
  ["auto", [false, false]],
]) {
  test(`manual ${target}`, async () =>
    assert.deepEqual(
      flags(await decisions([], { event: "workflow_dispatch", target })),
      expected,
    ));
}
test("manual override works without history and does not force the other app", async () => {
  assert.deepEqual(
    flags(
      await decisions([], {
        event: "workflow_dispatch",
        target: "test",
        baselines: {},
      }),
    ),
    [true, false],
  );
});
test("pull requests and off-main manual runs never deploy", async () => {
  assert.deepEqual(
    flags(
      await decisions([], {
        event: "pull_request",
        target: "both",
        baselines: {},
      }),
    ),
    [false, false],
  );
  assert.deepEqual(
    flags(
      await decisions([], {
        event: "workflow_dispatch",
        ref: "refs/heads/feature",
        target: "both",
        baselines: {},
      }),
    ),
    [false, false],
  );
});

function run(id, options = {}) {
  return {
    id,
    head_sha: sha(id),
    head_branch: "main",
    event: "push",
    run_attempt: 1,
    ...options,
  };
}
function job(name, id, options = {}) {
  return {
    id,
    name,
    status: "completed",
    conclusion: "success",
    completed_at: new Date(Date.UTC(2026, 0, id)).toISOString(),
    ...options,
  };
}
function history(runs, jobs, options = {}) {
  const calls = [];
  const request = async (route) => {
    calls.push(route);
    const url = new URL(route, "https://api.github.com");
    const page = Number(url.searchParams.get("page"));
    const size = Number(url.searchParams.get("per_page"));
    const match = url.pathname.match(/\/runs\/(\d+)\/attempts\/(\d+)\/jobs$/);
    const key = match ? `${match[1]}/${match[2]}` : null;
    const values = key ? jobs[key] || [] : runs;
    return {
      [key ? "jobs" : "workflow_runs"]: values.slice(
        (page - 1) * size,
        page * size,
      ),
    };
  };
  return {
    calls,
    result: discoverBaselines({
      request,
      repository: "ec76/starweave",
      runId: 100,
      attempt: 1,
      pageSize: 2,
      ...options,
    }),
  };
}
test("history paginates runs and jobs; job success counts when overall run failed", async () => {
  const fixture = history(
    [run(4), run(3), run(2, { conclusion: "failure" }), run(1)],
    {
      "4/1": [
        job("Deploy", 4, { conclusion: "failure" }),
        job("Deploy Called Together", 5, { conclusion: "cancelled" }),
      ],
      "3/1": [job("Deploy", 3, { conclusion: "skipped" })],
      "2/1": [
        job("Validate", 1),
        job("Unrelated job", 2),
        job("Deploy", 3),
        job("Deploy Called Together", 4),
      ],
      "1/1": [job("Deploy", 1)],
    },
  );
  const result = await fixture.result;
  assert.equal(result.test.sha, sha(2));
  assert.equal(result["called-together"].sha, sha(2));
  assert(
    fixture.calls.some((route) => route.includes("runs?per_page=2&page=3")),
  );
  assert(
    fixture.calls.some((route) =>
      route.includes("/2/attempts/1/jobs?per_page=2&page=2"),
    ),
  );
});
test("reruns of older runs rank by deployment completion time", async () => {
  const result = await history([run(3), run(1, { run_attempt: 2 })], {
    "3/1": [job("Deploy", 3), job("Deploy Called Together", 4)],
    "1/2": [job("Deploy", 8)],
    "1/1": [job("Deploy", 1), job("Deploy Called Together", 2)],
  }).result;
  assert.equal(result.test.sha, sha(1));
  assert.equal(result.test.attempt, 2);
  assert.equal(result["called-together"].sha, sha(3));
});
test("exclude active attempt but permit previous attempts of the current run", async () => {
  const fixture = history(
    [run(100, { run_attempt: 2 }), run(1)],
    {
      "100/2": [job("Deploy", 10)],
      "100/1": [
        job("Deploy", 9),
        job("Deploy Called Together", 10, { run_attempt: 2 }),
      ],
      "1/1": [job("Deploy Called Together", 1)],
    },
    { attempt: 2 },
  );
  const result = await fixture.result;
  assert.equal(result.test.sha, sha(100));
  assert.equal(result["called-together"].sha, sha(1));
  assert(!fixture.calls.some((route) => route.includes("/100/attempts/2/")));
});
test("failed deployment followed by unrelated push retains pending application changes", async () => {
  const baselines = await history([run(3), run(2), run(1)], {
    "3/1": [job("Deploy", 3, { conclusion: "skipped" })],
    "2/1": [
      job("Deploy", 2, { conclusion: "failure" }),
      job("Deploy Called Together", 3),
    ],
    "1/1": [job("Deploy", 1), job("Deploy Called Together", 2)],
  }).result;
  const result = await decisions([], {
    baselines,
    changedFiles: async (base) =>
      base === sha(1) ? ["apps/web/app/page.tsx", "README.md"] : ["README.md"],
  });
  assert.deepEqual(flags(result), [true, false]);
  assert.equal(result.test.baseline, sha(1));
});
test("history failure discards partial results conservatively", async () => {
  let calls = 0;
  const result = await discoverBaselines({
    repository: "ec76/starweave",
    runId: 100,
    attempt: 1,
    request: async () => {
      if (++calls === 1) return { workflow_runs: [run(1)] };
      throw new Error("HTTP 403");
    },
  });
  assert.match(result.test.reason, /history unavailable/);
  assert(!result.test.sha);
  assert.deepEqual(flags(await decisions([], { baselines: result })), [
    true,
    true,
  ]);
});
test("empty history, non-main and PR runs never supply baselines", async () => {
  const result = await history(
    [run(2, { event: "pull_request" }), run(1, { head_branch: "feature" })],
    {},
  ).result;
  assert(!result.test.sha);
  assert(!result["called-together"].sha);
});
test("job summary contains each baseline, decision, and reason", () => {
  const summary = decisionSummary(
    {
      test: { baseline: sha(1), deploy: true, reason: "pending changes" },
      "called-together": { deploy: false, reason: "documentation" },
    },
    sha(3),
  );
  for (const value of [
    sha(1),
    sha(3),
    "yes",
    "no",
    "pending changes",
    "documentation",
  ])
    assert(summary.includes(value));
});

for (const scenario of [
  "unchanged",
  "ancestry-unavailable",
  "api-unavailable",
]) {
  test(`CLI integration with real Git: ${scenario}`, () => {
    const temporary = mkdtempSync(
      path.join(tmpdir(), "starweave-selection-test-"),
    );
    try {
      const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
      const head = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: repositoryRoot,
        encoding: "utf8",
      }).trim();
      const base =
        scenario === "ancestry-unavailable" ? "deadbeef".repeat(5) : head;
      const preload = path.join(temporary, "mock-api.mjs");
      writeFileSync(
        preload,
        `
        const run = ${JSON.stringify(run(1, { head_sha: base }))};
        const jobs = ${JSON.stringify([job("Deploy", 1), job("Deploy Called Together", 2)])};
        globalThis.fetch = async (url) => {
          if (${JSON.stringify(scenario)} === "api-unavailable") return new Response(null, { status: 403 });
          return Response.json(String(url).includes('/workflows/') ? { workflow_runs: [run] } : { jobs });
        };
      `,
      );
      const output = path.join(temporary, "outputs");
      const summary = path.join(temporary, "summary");
      const result = spawnSync(
        process.execPath,
        [
          "--import",
          pathToFileURL(preload).href,
          fileURLToPath(new URL("./select-deployments.mjs", import.meta.url)),
        ],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            GITHUB_EVENT_NAME: "push",
            GITHUB_REF: "refs/heads/main",
            GITHUB_SHA: head,
            GITHUB_REPOSITORY: "ec76/starweave",
            GITHUB_RUN_ID: "100",
            GITHUB_RUN_ATTEMPT: "1",
            GITHUB_OUTPUT: output,
            GITHUB_STEP_SUMMARY: summary,
            GITHUB_TOKEN: "fixture-token-never-sent-to-network",
            DEPLOY_TARGET: "auto",
            DEPLOYMENT_GRAPH: JSON.stringify(graph),
          },
        },
      );
      assert.equal(result.status, 0, result.stdout + result.stderr);
      const expected = scenario !== "unchanged";
      const decisions = readFileSync(output, "utf8");
      assert(decisions.includes(`deploy-test=${expected}`));
      assert(decisions.includes(`deploy-called-together=${expected}`));
      assert(
        readFileSync(summary, "utf8").includes(
          expected ? "Conservative fallback" : head,
        ),
      );
    } finally {
      // Only remove the directory allocated by this test, never a computed repo path.
      assert(
        temporary.startsWith(path.join(tmpdir(), "starweave-selection-test-")),
      );
      rmSync(temporary, { recursive: true, force: true });
    }
  });
}
