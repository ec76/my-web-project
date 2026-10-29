import { Box, Container, Stack, Typography } from "@mui/material";
import { HeroSection } from "@repo/ui";
import { heroContent } from "./home-content";
import { tokens } from "./design-tokens";

const introductions = [
  {
    id: "explore-scripture",
    title: "Explore Scripture",
    description: "Biblical and theological foundations.",
  },
  {
    id: "practical-guidance",
    title: "Find Practical Guidance",
    description: "Resources for churches and leaders.",
  },
  {
    id: "their-stories",
    title: "Hear Their Stories",
    description: "Experiences of women serving in ministry.",
  },
];

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ pb: tokens.layout.section }}>
      <Stack spacing={0}>
        <HeroSection {...heroContent} />
        <Box
          id="resource-hub"
          tabIndex={-1}
          role="region"
          aria-label="Resource hub"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: tokens.layout.grid,
          }}
        >
          {introductions.map(({ id, title, description }) => (
            <Box
              component="section"
              id={id}
              tabIndex={-1}
              aria-labelledby={`${id}-title`}
              key={id}
              sx={{
                p: tokens.layout.card,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: tokens.radius.surface,
                minWidth: 0,
              }}
            >
              <Typography id={`${id}-title`} component="h2" variant="h3">
                {title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: tokens.layout.related }}
              >
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          component="aside"
          aria-label="Resource availability"
          sx={{
            p: tokens.layout.card,
            mt: tokens.layout.section,
            bgcolor: tokens.color.subtle,
            borderRadius: tokens.radius.surface,
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>
            Resources are being developed.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}
