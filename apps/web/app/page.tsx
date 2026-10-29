import { Box, Container, Stack, Typography } from "@mui/material";
import { ContentCard } from "@repo/ui";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        py: { xs: 8, md: 14 },
        background:
          "radial-gradient(ellipse at 15% 0%, rgba(103, 80, 164, 0.1), transparent 38%)",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={{ xs: 5, md: 7 }}>
          <Box>
            <Typography
              component="p"
              variant="overline"
              color="primary.main"
              sx={{ fontWeight: 700, letterSpacing: "0.14em", mb: 1 }}
            >
              PERSONAL WEB PROJECT
            </Typography>
            <Typography
              component="h1"
              variant="h1"
              sx={{
                maxWidth: 720,
                fontSize: { xs: "2.75rem", sm: "4rem" },
                fontWeight: 700,
                letterSpacing: "-0.045em",
                lineHeight: 1.08,
              }}
            >
              A small corner of the web.
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 2, maxWidth: 600, fontSize: { sm: "1.125rem" } }}
            >
              A simple place to collect ideas, share what I am working on, and
              make the web feel a little more personal.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2.5,
            }}
          >
            <ContentCard
              eyebrow="THE PROJECT"
              title="A thoughtful starting point"
              description="One Next.js app, a shared component package, and a design system that can grow as new ideas take shape."
            />
            <ContentCard
              eyebrow="IN PROGRESS"
              title="Room to make it yours"
              description="Add pages for the things you care about, and keep reusable building blocks in one shared home."
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Selective Deployment
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
