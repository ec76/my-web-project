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
```

## Where to add code

- Add pages, layouts, and app-specific UI in `apps/web/app`.
- Add reusable React components, the shared Material UI theme, and its provider
  in `packages/ui/src`.
- Shared ESLint and TypeScript configurations live in
  `packages/eslint-config` and `packages/typescript-config`.
