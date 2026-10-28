# Personal web project

A minimal Turborepo workspace with one Next.js App Router application and a
shared Material UI component package.

## Local setup

Install dependencies from the repository root:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

The site is available at [http://localhost:3000](http://localhost:3000).

## Commands

Run these from the repository root:

```sh
npm run dev
npm run build
npm run lint
npm run check-types
npm run storybook
npm run build-storybook
```

Storybook runs at [http://localhost:6006](http://localhost:6006). The static
build is written to `apps/storybook/storybook-static`.

## Azure Static Web Apps Free

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

Use these deployment settings when configuring Azure Static Web Apps:

| Setting                  | Value                   |
| ------------------------ | ----------------------- |
| Plan                     | Free                    |
| Build preset             | Custom                  |
| App location             | `/`                     |
| API location             | Empty                   |
| Output location          | `apps/web/out`          |
| Custom app build command | `npm run build:azure`   |
| Static export deployment | `IS_STATIC_EXPORT=true` |

Set `IS_STATIC_EXPORT: "true"` in the environment of the Azure deployment
workflow's build/deploy step. Use the project's supported Node.js 24 and
the npm version specified in the root `package.json` for the build environment.
This repository change does not create Azure resources, deployment workflows,
or credentials. See Microsoft's
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

The `CI` GitHub Actions workflow runs on pushes to `main`, pull requests
targeting `main`, and manual runs. Its `Validate` job installs dependencies
with `npm ci`, then checks formatting, lint, TypeScript, unit tests once, the Next.js
build, and the separate Storybook build using the root scripts.

CI uses Node.js 24, matching the supported `>=24` engine range, and installs
the npm version specified in `package.json` under `devEngines.packageManager`
(currently 11.19.1). npm downloads are cached using the root lockfile.
The job has a 20-minute timeout and read-only repository contents permissions.
New runs cancel outdated runs for the same branch or pull request. No deployment
or Turborepo remote cache credentials are required.

View results in the repository's **Actions → CI → Validate** job, or in a pull
request's **Checks** tab. Expand a named step to inspect its logs. To run CI
manually, choose **Actions → CI → Run workflow** on GitHub.

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

- Add pages, layouts, and app-specific UI in `apps/web/app`.
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
