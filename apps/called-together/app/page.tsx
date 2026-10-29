import { Box, Container, Typography } from "@mui/material";

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
    <Container maxWidth="lg">
      <Box sx={{ py: 2 }}>
        <Box sx={{ maxWidth: 800 }}>
          <Typography
            variant="overline"
            color="primary"
            sx={{ letterSpacing: "0.15em" }}
          >
            Women in spiritual leadership
          </Typography>
          <Typography
            component="h1"
            variant="h1"
            sx={{
              mt: 1,
              fontSize: { xs: "3rem", sm: "4.5rem", md: "5.5rem" },
              lineHeight: 1.1,
            }}
          >
            Called Together
          </Typography>
          <Typography
            sx={{ mt: 1.5, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
          >
            Supporting women called to spiritual leadership.
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 1.5, maxWidth: 650, fontSize: "1.125rem" }}
          >
            Biblical foundations, practical guidance, and stories that help
            communities understand and support women serving as elders and
            pastors.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2.5,
            mt: 3,
          }}
        >
          {introductions.map(({ id, title, description }, index) => (
            <Box
              component="section"
              id={id}
              tabIndex={-1}
              aria-labelledby={`introduction-${index}`}
              key={title}
              sx={{ borderTop: 2, borderColor: "divider", pt: 1.5 }}
            >
              <Typography
                id={`introduction-${index}`}
                component="h2"
                variant="h2"
                sx={{ fontSize: "1.6rem", lineHeight: 1.3 }}
              >
                {title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          component="aside"
          aria-label="Resource availability"
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            Resources are being developed.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
