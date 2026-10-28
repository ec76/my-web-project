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
