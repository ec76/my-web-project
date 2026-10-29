import NextLink from "next/link";
import { Box, Link } from "@mui/material";
import { SiteFooter, SiteHeader, type SiteNavigationLink } from "@repo/ui";
import type { ReactNode } from "react";

// Application routes and section names stay here, outside the shared UI package.
const navigation: readonly SiteNavigationLink[] = [
  { label: "Home", href: "/", active: true },
  { label: "Explore Scripture", href: "/#explore-scripture" },
  { label: "Practical Guidance", href: "/#practical-guidance" },
  { label: "Their Stories", href: "/#their-stories" },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Link
        href="#main-content"
        sx={{
          position: "absolute",
          left: 16,
          top: 16,
          p: 2,
          bgcolor: "background.paper",
          transform: "translateY(-200%)",
          "&:focus": { transform: "none", zIndex: 1 },
        }}
      >
        Skip to main content
      </Link>
      <SiteHeader
        brand="Called Together"
        brandHref="/"
        links={navigation}
        LinkComponent={NextLink}
      />
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}
      >
        {children}
      </Box>
      <SiteFooter
        brand={
          <NextLink
            href="/"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Called Together
          </NextLink>
        }
        copyright="© Called Together"
      />
    </Box>
  );
}
