# Starweave

Starweave is a generic Turborepo monorepo for independent applications, each
with its own pages and deployment. It includes two independent Next.js App Router
applications, Storybook, and shared Material UI components in `packages/ui`.

| Application            | Workspace         | Purpose                               | Development port |
| ---------------------- | ----------------- | ------------------------------------- | ---------------- |
| `apps/web`             | `web`             | Existing experimentation/test website | 3000             |
| `apps/called-together` | `called-together` | Called Together ministry website      | 3001             |
| `apps/storybook`       | `@repo/storybook` | Shared component catalog              | 6006             |

Both websites may use `@repo/ui`. Called Together keeps its ministry content,
components, and independent Material UI theme inside `apps/called-together`.
It contains a homepage and a request-time health endpoint. It is prepared for
App Service Linux, but its deployment is not enabled.

Repository: [ec76/starweave](https://github.com/ec76/starweave).

## Local setup

Use Node.js 24 (the repository supports `>=24`; CI selects 24) and exactly
npm 11.19.1, as required by `devEngines.packageManager`. For a fresh clone:

```sh
git clone https://github.com/ec76/starweave.git
cd starweave
npm ci
```

Start both website development servers:

```sh
npm run dev
```

The test site is available at [http://localhost:3000](http://localhost:3000)
and Called Together at [http://localhost:3001](http://localhost:3001).
Start just one with `npm run dev:test` or `npm run dev:called-together`.
Start the component catalog separately with `npm run storybook`.

## Commands

Run these from the repository root:

```sh
npm run dev
npm run dev:test
npm run dev:called-together
npm run build
npm run build:called-together
npm run package:called-together
npm run verify:called-together
npm run lint
npm run check-types
npm run storybook
npm run build-storybook
npm run build:azure
npm run format
npm run format:check
npm test
npm run test:watch
npm run test:coverage
```

Storybook runs at [http://localhost:6006](http://localhost:6006). The static
build is written to `apps/storybook/storybook-static`.

`npm run build` builds both websites. Each can also build independently:
`npm run build:azure` targets only `web` and its dependencies, while
`npm run build:called-together` targets only `called-together` and its dependencies.
Both transpile `@repo/ui`. The test website retains Next.js static export in
`apps/web/out`; serve that directory with a static file server for production preview.
Called Together uses Next.js standalone server output in
`apps/called-together/.next/standalone` and requires a Node.js server.
The existing Azure workflow deploys only `apps/web/out`; Called Together is
validated but is not uploaded or deployed.

## Called Together: App Service Linux preparation

The intended target is separate from the existing Static Web App:

| Setting        | Target                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| Web App        | `called-together-dev-ec76`                                                       |
| Resource group | `rg-called-together-dev`                                                         |
| Runtime        | Node 24 LTS on Linux                                                             |
| URL            | https://called-together-dev-ec76-gyfufcfwg9etchgs.centralus-01.azurewebsites.net |

These are deployment instructions, not confirmation that Azure has been configured.
No Called Together deployment step, credentials, or Azure resource changes are
included. The existing `Validate` check name and `apps/web` deployment are preserved.

From the repository root, using Node.js 24 and npm 11.19.1:

```sh
npm ci
npm run package:called-together
npm run verify:called-together
```

Packaging first runs the filtered application build and its required workspace
dependencies. The Node.js packaging script then replaces only
`artifacts/called-together`, copying the full traced standalone tree without
flattening it. `outputFileTracingRoot` points to the monorepo root so dependencies
outside the app can be traced. The package includes runtime dependencies and hidden
Next.js files. Internal links are dereferenced for relocation; links outside the
source tree are rejected. Environment files, credential files such as `.npmrc`,
private-key files, and other applications are excluded. Keep secrets out of source,
public assets, and build-time JavaScript; copying filters cannot remove values
already embedded in compiled code.

The resulting layout is:

```text
artifacts/called-together/
  node_modules/                       # traced runtime dependencies
  apps/called-together/
    server.js                         # generated Next.js entry point
    package.json
    .next/                            # server build and manifests
      static/                         # copied browser JS/CSS assets
    public/                           # copied only when present
```

Additional traced workspace files retain their generated relative paths.
Generated artifacts are ignored by Git and Prettier. Do not deploy the repository,
the static `out` directory, or only the nested application directory. A future
deployment must upload the **contents** of `artifacts/called-together` to
`/home/site/wwwroot`, including dotfiles and `node_modules`, and preserve this
layout. Build on Linux for the Linux target so any native dependencies match the
runtime. Use the prebuilt package without an Azure/Oryx rebuild or runtime npm
installation when deployment is enabled in separate work.

The exact Azure Linux startup command, from `/home/site/wwwroot`, is:

```sh
HOSTNAME=0.0.0.0 node apps/called-together/server.js
```

The generated server reads Azure's `PORT` environment variable; do not hardcode it
in the startup command. Explicit `HOSTNAME=0.0.0.0` overrides the container hostname
and binds all interfaces. This follows the [Next.js standalone server guidance](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
and [Azure Node.js port requirements](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs).
For a manual local preview, change into `artifacts/called-together` and run:

```sh
HOSTNAME=0.0.0.0 PORT=3001 node apps/called-together/server.js
```

In PowerShell, set `$env:HOSTNAME = "0.0.0.0"` and `$env:PORT = "3001"`, then run
`node apps/called-together/server.js` from the artifact root. Stop with Ctrl+C.

`npm run verify:called-together` works on Windows and Linux. It copies the package
to a fresh OS temporary directory outside the checkout, checks that Next.js resolves
inside the copy, and starts the generated server with a clean environment,
`HOSTNAME=0.0.0.0`, and a temporary `PORT`. It checks the homepage, referenced
JavaScript and CSS (including response bytes), optional public assets, and repeated
`GET /api/health` responses. Health returns only `{"status":"ok"}` with `no-store`;
the route is forced dynamic and the verifier checks it is not prerendered.
The verifier stops the process and deletes its temporary directory on success or
failure. It does not rely on the checkout's `node_modules`. It is an HTTP smoke
test, not a browser hydration or visual test.

The existing Linux `Validate` job builds, packages, and smoke-tests Called Together
using the pinned Node/npm setup. It continues to upload only the `web-static`
artifact; no Called Together upload or deployment is enabled.

## Current Azure resources for apps/web

The current web application deploys to Azure Static Web Apps Free. These existing
Azure resource names, site URL, and deployment-secret reference remain unchanged
by the Starweave repository rename. They identify the current web deployment,
not the monorepo or future applications. The current static-export deployment
architecture is preserved; an App Service migration is outside this change.

| Azure resource       | Value                                                   |
| -------------------- | ------------------------------------------------------- |
| Static Web App       | `my-web-project`                                        |
| Resource group       | `rg-my-web-project`                                     |
| Hosting plan         | Free                                                    |
| deploymentAuthPolicy | `DeploymentToken`                                       |
| Site                 | https://victorious-bush-002c17210.3.azurestaticapps.net |

The website uses Next.js `output: "export"` and retains
`transpilePackages: ["@repo/ui"]` for the shared Material UI components.
Build the deployable static site from the repository root:

```sh
npm run build:azure
```

This runs the web build and required workspace dependencies through Turborepo,
without building Storybook. The entry point is `apps/web/out/index.html`.
Turborepo caches the workspace-relative `out/**` output; Git and Prettier
ignore generated `out` directories. The existing `npm run build` command also
produces the static export, so CI's website build validates this output mode.

The deployment workflow builds on the GitHub runner using Node.js 24 and
npm 11.19.1, runs `npm ci` and `npm run build:azure`, and verifies the exported
entry point. Azure uploads these prebuilt files without an Oryx app build:

| Setting                  | Value                   |
| ------------------------ | ----------------------- |
| Plan                     | Free                    |
| Build preset             | Custom                  |
| App location             | `apps/web/out`          |
| API location             | Empty                   |
| Output location          | Empty                   |
| Skip app build           | `true`                  |
| Static export deployment | `IS_STATIC_EXPORT=true` |

The upload step retains `IS_STATIC_EXPORT: "true"`. Its app build command is
omitted because the runner has already built the site. OIDC helper steps are
no longer needed; production upload uses the existing deployment-token
secret. If Azure disables deployment-token authentication, select the deployment
token policy under the Static Web App's **Settings > Configuration > Deployment
configuration**. If the GitHub secret is missing, add the deployment token under
the repository's **Settings > Secrets and variables > Actions**, named
`AZURE_STATIC_WEB_APPS_API_TOKEN_VICTORIOUS_BUSH_002C17210`. Do not put the token
in source code or chat.

To update the deployment token:

1. In the Azure portal, open `my-web-project` in `rg-my-web-project` and choose
   **Manage deployment token**. Copy the current token, or reset it if rotating
   credentials. Resetting invalidates the previous token.
2. In GitHub, open **Settings > Secrets and variables > Actions** and update
   `AZURE_STATIC_WEB_APPS_API_TOKEN_VICTORIOUS_BUSH_002C17210` with the token.
   Keep its value out of logs, documentation, source files, and chat.
3. Open **Actions > Validate and Deploy**, select the failed run on `main`,
   and choose **Re-run failed jobs**. Alternatively, use **Run workflow** on
   `main` to validate and deploy again. Token rotation does not require a commit.

See Microsoft's [deployment token management guide](https://learn.microsoft.com/en-us/azure/static-web-apps/deployment-token-management)
for the portal steps.

There is currently no `staticwebapp.config.json`. If needed, place it in
`apps/web/public/staticwebapp.config.json` so Next.js includes it at the root of
`apps/web/out`. No Azure resources or credentials are created by these changes.
See Microsoft's
[static Next.js deployment guide](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs-static-export).

The current app has no static-export blockers: no request-time APIs, Server
Actions, dynamic routes, middleware, or server-dependent redirects. The shared
theme and components render at build time. There is no `next/image` usage, so
no image configuration is needed. If added later, use a custom image loader
or unoptimized images rather than the default server optimizer. Features
requiring a running Next.js server need a different hosting strategy; see
[Next.js static export limitations](https://nextjs.org/docs/app/guides/static-exports#unsupported-features).
For a production preview, serve `apps/web/out` with a static file server;
`npm run start --workspace=web` uses `next start` and does not serve exports.

## Formatting

Prettier is installed at the repository root with an exact version. All
workspaces use `.prettierrc.json`: Prettier defaults with LF line endings.
Generated dependencies, build output, caches, coverage, and `next-env.d.ts`
are excluded through `.prettierignore`.

```sh
npm run format
npm run format:check
```

`format` rewrites files; `format:check` reports differences without changing
files. Source, stories, tests, and GitHub workflows are all checked.
Prettier runs separately from ESLint; the shared ESLint configurations apply
`eslint-config-prettier` last to disable conflicting formatting rules while
preserving code-quality checks.

In VS Code, install the recommended **Prettier - Code formatter** extension
(`esbenp.prettier-vscode`) from the Extensions view's workspace recommendations.
Shared `.vscode` settings enable format on save, require a Prettier config,
and select Prettier for the project's supported languages.

## Continuous integration

The workflow in `.github/workflows/validate-deploy.yml` runs on pushes to
`main`, pull requests targeting `main`, and manual runs. Its flow is
**Validate -> Deploy**.

Work on a feature branch, push it, and open a pull request targeting `main`.
Wait for Validate and review to pass, then merge. The resulting push to `main`
runs Validate again; only after success does Deploy publish that exact build
artifact. Open the site URL above to confirm the change is visible.

Validate uses Node.js 24 and npm 11.19.1, bootstrapped from `runner.temp`
before repository npm commands. It caches npm downloads using the root lockfile,
runs `npm ci`, formatting checks, lint, TypeScript checks, unit tests,
`npm run build:azure`, `npm run package:called-together`,
`npm run verify:called-together`, and the Storybook build.
Lint and TypeScript checks include both websites through their workspace scripts.
Each website builds independently, so the overlapping `npm run build` does not
run again. Validation verifies the test website's exported `index.html` and
smoke-tests Called Together's isolated standalone package on Linux.

Validate verifies `apps/web/out/index.html` and uploads the entire export as
`web-static`, including hidden files and `staticwebapp.config.json` if used.
Deploy requires successful validation, downloads the artifact, and uploads it
to Azure without installing dependencies, rebuilding, or invoking Oryx.
Only pushes to main and manual runs on main deploy. Pull requests validate
without accessing the deployment secret or creating previews.

Both jobs have 20-minute timeouts and read-only repository contents permissions.
New runs cancel outdated runs for the same branch or pull request. Validation
needs no deployment or Turborepo remote cache credentials; Deploy uses the
existing Azure deployment-token secret.

The superseded CI and Azure workflows and preview cleanup job are removed.
Any preview environments created by the old workflow may need one-time cleanup
in the Azure portal under the Static Web App's Environments page. This change
does not delete those environments automatically.

View results under **Actions > Validate and Deploy**, or the pull request's
**Checks** tab. Manual runs are available through **Run workflow**. The job
names are **Validate** and **Deploy**. Review branch-protection required checks
if they reference old workflow/job names; require Validate rather than Deploy,
which is intentionally skipped on pull requests.

## Testing

Run unit and React component tests from the repository root:

```sh
npm test
npm run test:watch
npm run test:coverage
```

Tests live beside their components as `*.test.tsx` (or `*.test.ts` for
non-React units), starting with `packages/ui/src/content-card/content-card.test.tsx`.
The UI workspace uses Vitest with jsdom and automatic React JSX support from
its TypeScript configuration. Its setup loads jest-dom matchers and cleans up
React renders after every test.

Use `renderWithProviders` from `packages/ui/src/test/render-with-providers.tsx`
to render with the same Material UI theme/provider as the website and Storybook.
Prefer accessible queries; for interactive components, create
`const user = userEvent.setup()` using `@testing-library/user-event` and await
user actions. ContentCard has required title and description props, an optional
eyebrow, and no links or callbacks. Its tests cover rendering and prop updates.

Coverage prints a text summary and writes an HTML report. Open
`packages/ui/coverage/index.html` in your browser after `npm run test:coverage`.
Eligible untested source files are included; stories, tests, test helpers,
declaration files, export-only index files, configuration, and generated output
are excluded. Coverage reports are ignored by Git and cached by Turborepo.

Unit tests use their own `packages/ui/vitest.config.mts` and only discover
`src/**/*.test.{ts,tsx}`. They do not run Storybook stories or browser tests;
keep future Storybook browser tests in a separate configuration and task.
Turborepo caches one-shot test tasks and coverage, including changes in
dependent workspaces through the `test:inputs` transit task. Watch mode is
persistent and uncached. Add testing dependencies and scripts to each workspace
that starts using them.

On Windows PowerShell with script execution disabled, use `npm.cmd` in place
of `npm`.

## Where to add code

- Add experimentation/test pages, layouts, and app-specific UI in `apps/web/app`.
- Add ministry pages, content, components, and theme in `apps/called-together/app`.
- Add reusable React components, the shared Material UI theme, and its provider
  in `packages/ui/src`.
- Add component stories beside their components in `packages/ui/src` using the
  `*.stories.tsx` naming pattern. For example, copy the structure of
  `packages/ui/src/content-card/content-card.stories.tsx`, define story args for the
  component's props, and add the `autodocs` tag to enable generated docs and
  interactive controls.
- Storybook's Vite configuration and preview decorators live in
  `apps/storybook/.storybook`.
- Shared ESLint and TypeScript configurations live in
  `packages/eslint-config` and `packages/typescript-config`.
