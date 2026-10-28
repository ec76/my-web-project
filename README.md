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
user actions. ContentCard currently has three required text props and no links
or callbacks, so its tests cover rendering and prop updates.

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
