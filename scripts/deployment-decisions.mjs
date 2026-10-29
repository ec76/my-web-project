export const applications = {
  test: { package: "web", job: "Deploy" },
  "called-together": {
    package: "called-together",
    job: "Deploy Called Together",
  },
};

// Ignore only conventional documentation locations, never application/source
// content such as app/**/*.mdx or public assets. Explicit consumers take priority.
function documentation(file, owner, buildInputs) {
  if (
    buildInputs.some((input) => file === input || file.startsWith(`${input}/`))
  )
    return false;
  const local = owner ? file.slice(owner.path.length + 1) : file;
  return (
    /^(?:README|CHANGELOG|CONTRIBUTING|LICENSE|AGENTS)(?:\.[^/]*)?$/i.test(
      local,
    ) ||
    local.startsWith("docs/") ||
    (!owner && !file.includes("/") && /\.(?:md|rst|txt)$/i.test(file)) ||
    (!owner && file.startsWith(".github/") && /\.md$/i.test(file))
  );
}

export function affectedApplication(app, files, graph, buildInputs = []) {
  const packages = new Map(graph.map((item) => [item.name, item]));
  const dependencies = new Set();
  function visit(name) {
    if (name === "//" || dependencies.has(name)) return;
    const item = packages.get(name);
    if (!item) throw new Error(`Incomplete workspace graph: ${name}`);
    dependencies.add(name);
    for (const dependency of item.dependencies) visit(dependency);
  }
  visit(applications[app].package);
  const owners = graph
    .filter((item) => item.path)
    .sort((a, b) => b.path.length - a.path.length);
  for (const file of files) {
    const owner = owners.find((item) => file.startsWith(`${item.path}/`));
    if (documentation(file, owner, buildInputs)) continue;
    if (owner) {
      if (dependencies.has(owner.name))
        return {
          deploy: true,
          reason: `Changed dependency ${owner.name}: ${file}`,
        };
      continue;
    }
    if (
      /^scripts\/(?:package-called-together|verify-called-together|called-together-artifact)\.mjs$/.test(
        file,
      )
    ) {
      if (app === "called-together")
        return {
          deploy: true,
          reason: `Changed application deployment script: ${file}`,
        };
      continue;
    }
    // Unknown/deleted workspaces, root configuration, lockfiles, workflow and
    // deployment-selection changes are deliberately conservative.
    return {
      deploy: true,
      reason: `Root or unclassified build/deployment input: ${file}`,
    };
  }
  return {
    deploy: false,
    reason:
      "No relevant application or dependency changes since successful deployment",
  };
}

export async function decideDeployments({
  event,
  ref,
  target = "auto",
  baselines,
  graph,
  changedFiles,
  buildInputs = [],
}) {
  const decisions = {};
  for (const app of Object.keys(applications)) {
    const baseline = baselines[app];
    let decision;
    if (
      ref !== "refs/heads/main" ||
      !["push", "workflow_dispatch"].includes(event)
    ) {
      decision = {
        deploy: false,
        reason: "Only pushes and manual runs on main may deploy",
      };
    } else if (event === "workflow_dispatch" && target !== "auto") {
      if (!["test", "called-together", "both"].includes(target))
        throw new Error("Invalid deploy_target");
      decision = {
        deploy: target === app || target === "both",
        reason: `Manual selection: ${target}`,
      };
    } else if (!baseline?.sha) {
      decision = {
        deploy: true,
        reason: `Conservative fallback: ${baseline?.reason || "no successful deployment baseline"}`,
      };
    } else {
      try {
        const files = await changedFiles(baseline.sha);
        decision = affectedApplication(app, files, graph, buildInputs);
      } catch (error) {
        decision = {
          deploy: true,
          reason: `Conservative fallback: ${error.message}`,
        };
      }
    }
    decisions[app] = { baseline: baseline?.sha || null, ...decision };
  }
  return decisions;
}

// Enumerate unfiltered workflow history: GitHub caps filtered searches at 1,000
// runs. Inspect *all attempts*, not just the latest run conclusion. A later rerun
// of an old SHA can be the last deployment (including an intentional rollback).
export async function discoverBaselines({
  request,
  repository,
  runId,
  attempt,
  pageSize = 100,
}) {
  const baselines = {};
  const prefix = `/repos/${repository}/actions`;
  try {
    for (let page = 1; ; page++) {
      const response = await request(
        `${prefix}/workflows/validate-deploy.yml/runs?per_page=${pageSize}&page=${page}`,
      );
      if (!Array.isArray(response.workflow_runs))
        throw new Error("Malformed workflow history response");
      for (const run of response.workflow_runs) {
        if (
          run.head_branch !== "main" ||
          !["push", "workflow_dispatch"].includes(run.event)
        )
          continue;
        if (!Number.isInteger(run.run_attempt) || run.run_attempt < 1)
          throw new Error("Missing run attempt metadata");
        for (let number = run.run_attempt; number >= 1; number--) {
          if (String(run.id) === String(runId) && number >= attempt) continue;
          for (let jobPage = 1; ; jobPage++) {
            const result = await request(
              `${prefix}/runs/${run.id}/attempts/${number}/jobs?per_page=${pageSize}&page=${jobPage}`,
            );
            if (!Array.isArray(result.jobs))
              throw new Error("Malformed job history response");
            for (const job of result.jobs) {
              if (job.status !== "completed" || job.conclusion !== "success")
                continue;
              const app = Object.keys(applications).find(
                (key) => applications[key].job === job.name,
              );
              if (!app) continue;
              // Some rerun responses include jobs carried forward from earlier
              // attempts. Never admit the active attempt through such a response.
              if (
                String(run.id) === String(runId) &&
                (job.run_attempt ?? number) >= attempt
              )
                continue;
              const completed = Date.parse(job.completed_at);
              if (
                !Number.isFinite(completed) ||
                !/^[a-f0-9]{40}$/i.test(run.head_sha)
              )
                throw new Error("Invalid deployment job metadata");
              if (job.head_sha && job.head_sha !== run.head_sha)
                throw new Error("Deployment job SHA disagrees with its run");
              const previous = baselines[app];
              if (
                !previous ||
                completed > previous.completed ||
                (completed === previous.completed && job.id > previous.jobId)
              ) {
                baselines[app] = {
                  sha: run.head_sha,
                  completed,
                  jobId: job.id,
                  runId: run.id,
                  attempt: job.run_attempt ?? number,
                };
              }
            }
            if (result.jobs.length < pageSize) break;
          }
        }
      }
      if (response.workflow_runs.length < pageSize) break;
    }
    for (const app of Object.keys(applications))
      baselines[app] ??= {
        reason: "no successful deployment job in available history",
      };
    return baselines;
  } catch (error) {
    // A partially scanned history cannot establish the most recent deployment.
    return Object.fromEntries(
      Object.keys(applications).map((app) => [
        app,
        {
          reason: `deployment history unavailable or incomplete: ${error.message}`,
        },
      ]),
    );
  }
}

export function decisionSummary(decisions, head) {
  const safe = (value) => String(value).replace(/[|\r\n`<>]/g, " ");
  return [
    "## Deployment selection",
    `Compared against current SHA: \`${safe(head)}\``,
    "",
    "| Application | Last successful deployment SHA | Deploy | Reason |",
    "| --- | --- | --- | --- |",
    ...Object.entries(decisions).map(
      ([app, item]) =>
        `| ${app} | ${item.baseline || "unavailable"} | ${item.deploy ? "yes" : "no"} | ${safe(item.reason)} |`,
    ),
    "",
  ].join("\n");
}
