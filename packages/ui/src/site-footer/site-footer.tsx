import { SiteAnchor } from "../site-anchor";
import { Box, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { SiteLinkRenderer, SiteNavigationLink } from "../site-link";

export interface SiteFooterLinkGroup {
  heading: string;
  links: readonly SiteNavigationLink[];
}

export interface SiteFooterProps {
  brand?: ReactNode;
  description?: string;
  linkGroups?: readonly SiteFooterLinkGroup[];
  copyright?: string;
  additionalContent?: ReactNode;
  LinkComponent?: SiteLinkRenderer;
}

export function SiteFooter({
  brand,
  description,
  linkGroups = [],
  copyright,
  additionalContent,
  LinkComponent = "a",
}: SiteFooterProps) {
  const groups = linkGroups.filter((group) => group.links.length > 0);
  const hasIntroduction = brand != null || description;
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        py: { xs: 6, md: 10 },
        overflowWrap: "anywhere",
        "& a:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 3,
        },
        "& a": {
          minHeight: 44,
          minWidth: 44,
          maxWidth: "100%",
          display: "inline-flex",
          alignItems: "center",
          overflowWrap: "anywhere",
        },
      }}
    >
      <Container maxWidth="lg">
        {(hasIntroduction || groups.length > 0) && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md:
                  hasIntroduction && groups.length
                    ? "minmax(0, 1fr) minmax(0, 2fr)"
                    : "1fr",
              },
              gap: 4,
            }}
          >
            {hasIntroduction && (
              <Box sx={{ minWidth: 0 }}>
                {brand != null && (
                  <Typography
                    component="div"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    {brand}
                  </Typography>
                )}
                {description && (
                  <Typography
                    color="text.secondary"
                    sx={{ mt: brand != null ? 1 : 0, maxWidth: "45ch" }}
                  >
                    {description}
                  </Typography>
                )}
              </Box>
            )}
            {groups.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))",
                  gap: 3,
                }}
              >
                {groups.map((group) => (
                  <Box
                    component="nav"
                    aria-label={group.heading}
                    key={group.heading}
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      component="h2"
                      variant="subtitle1"
                      sx={{ fontWeight: 600 }}
                    >
                      {group.heading}
                    </Typography>
                    <Stack
                      component="ul"
                      sx={{ listStyle: "none", p: 0, m: 0 }}
                    >
                      {group.links.map((link) => (
                        <Box
                          component="li"
                          key={link.href}
                          sx={{ minWidth: 0 }}
                        >
                          <SiteAnchor
                            LinkComponent={LinkComponent}
                            href={link.href}
                            aria-current={link.active ? "page" : undefined}
                            underline="always"
                            color="text.secondary"
                            sx={{ py: 1, width: { xs: "100%", md: "auto" } }}
                          >
                            {link.label}
                          </SiteAnchor>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        {additionalContent != null && (
          <Box sx={{ mt: hasIntroduction || groups.length ? 3 : 0 }}>
            {additionalContent}
          </Box>
        )}
        {copyright && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt:
                hasIntroduction || groups.length || additionalContent != null
                  ? 3
                  : 0,
            }}
          >
            {copyright}
          </Typography>
        )}
      </Container>
    </Box>
  );
}
