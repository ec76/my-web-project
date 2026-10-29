import { Box, Button, Container, Stack, Typography } from "@mui/material";
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
    <Container maxWidth="lg" sx={{ py: tokens.layout.section }}>
      <Stack spacing={tokens.layout.section}>
        <Stack
          spacing={tokens.layout.stack}
          sx={{ maxWidth: tokens.layout.reading }}
        >
          <Typography color="primary" sx={{ fontWeight: 600 }}>
            Women in spiritual leadership
          </Typography>
          <Typography component="h1" variant="h1">
            Called Together
          </Typography>
          <Typography sx={{ fontSize: "1.375rem" }}>
            Supporting women called to spiritual leadership.
          </Typography>
          <Typography color="text.secondary" sx={tokens.article}>
            Biblical foundations, practical guidance, and stories that help
            communities understand and support women serving as elders and
            pastors.
          </Typography>
          <Box>
            <Button variant="contained" href="#explore-scripture">
              Explore Scripture
            </Button>
          </Box>
        </Stack>
        <Box
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
