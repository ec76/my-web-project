import { Box, Button, Link, Stack, Typography } from "@mui/material";
import type { SiteNavigationLink } from "../site-link";

export interface HeroSectionProps {
  eyebrow: string;
  heading: readonly string[];
  accent: string;
  introduction: string;
  primaryAction: SiteNavigationLink;
  secondaryAction?: SiteNavigationLink;
  panel: {
    label: string;
    heading: readonly string[];
    links: readonly SiteNavigationLink[];
  };
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <Box component="span" aria-hidden="true" sx={{ flexShrink: 0 }}>
      {diagonal ? "↗" : "→"}
    </Box>
  );
}

// The consumer supplies the page container and all content and destinations.
export function HeroSection({
  eyebrow,
  heading,
  accent,
  introduction,
  primaryAction,
  secondaryAction,
  panel,
}: HeroSectionProps) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "minmax(0, 3fr) minmax(0, 2fr)",
        },
        gap: { xs: 4, sm: 4, md: 8 },
        alignItems: "start",
        color: "text.primary",
      }}
    >
      <Stack spacing={3} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
        <Typography
          variant="body2"
          color="primary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 600,
          }}
        >
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              width: 24,
              borderTop: 2,
              borderColor: "primary.main",
              flexShrink: 0,
            }}
          />
          {eyebrow}
        </Typography>
        <Typography component="h1" variant="h1">
          {heading.map((line, index) => (
            <Box component="span" key={index} sx={{ display: "block" }}>
              {line}
            </Box>
          ))}
          <Box
            component="span"
            sx={{ display: "block", color: "primary.main" }}
          >
            {accent}
          </Box>
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ fontSize: "1.125rem", lineHeight: 1.75 }}
        >
          {introduction}
        </Typography>
        <Stack
          direction="row"
          sx={{ flexWrap: "wrap", gap: 2, alignItems: "center" }}
        >
          <Button
            href={primaryAction.href}
            variant="contained"
            endIcon={<Arrow />}
            sx={{
              minHeight: "2.75rem",
              maxWidth: "100%",
              textAlign: "start",
              overflowWrap: "anywhere",
              "&.Mui-focusVisible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 4,
              },
            }}
          >
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              underline="always"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "2.75rem",
                overflowWrap: "anywhere",
              }}
            >
              {secondaryAction.label}
            </Link>
          )}
        </Stack>
      </Stack>
      <Box
        sx={{
          bgcolor: "secondary.light",
          borderRadius: 1.5,
          p: { xs: 3, md: 4 },
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
          {panel.label}
        </Typography>
        <Typography component="h2" variant="h2" sx={{ mb: 3 }}>
          {panel.heading.map((line, index) => (
            <Box component="span" key={index} sx={{ display: "block" }}>
              {line}
            </Box>
          ))}
        </Typography>
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {panel.links.map(({ label, href }) => (
            <Box
              component="li"
              key={href}
              sx={{ "& + &": { borderTop: 1, borderColor: "divider" } }}
            >
              <Link
                href={href}
                underline="always"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  py: 2,
                  minHeight: "2.75rem",
                  boxSizing: "border-box",
                }}
              >
                <Box component="span" sx={{ minWidth: 0 }}>
                  {label}
                </Box>
                <Arrow diagonal />
              </Link>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
