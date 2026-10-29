import { Box, Container, Link, Typography } from "@mui/material";

const introductions = [
  {
    title: "Explore Scripture",
    description: "Biblical and theological foundations.",
  },
  {
    title: "Find Practical Guidance",
    description: "Resources for churches and leaders.",
  },
  {
    title: "Hear Their Stories",
    description: "Experiences of women serving in ministry.",
  },
];

export default function Home() {
  return (
    <>
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
        Skip to content
      </Link>
      <Container maxWidth="lg">
        <Box
          component="header"
          sx={{ py: 4, borderBottom: 1, borderColor: "divider" }}
        >
          <Typography sx={{ fontWeight: 700, letterSpacing: "0.04em" }}>
            Called Together
          </Typography>
        </Box>
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ py: { xs: 7, md: 12 } }}
        >
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
                mt: 2,
                fontSize: { xs: "3rem", sm: "4.5rem", md: "5.5rem" },
                lineHeight: 1.1,
              }}
            >
              Called Together
            </Typography>
            <Typography
              sx={{ mt: 3, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
            >
              Supporting women called to spiritual leadership.
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 3, maxWidth: 650, fontSize: "1.125rem" }}
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
              gap: { xs: 4, md: 5 },
              mt: { xs: 7, md: 10 },
            }}
          >
            {introductions.map(({ title, description }, index) => (
              <Box
                component="section"
                aria-labelledby={`introduction-${index}`}
                key={title}
                sx={{ borderTop: 2, borderColor: "divider", pt: 3 }}
              >
                <Typography
                  id={`introduction-${index}`}
                  component="h2"
                  variant="h2"
                  sx={{ fontSize: "1.6rem", lineHeight: 1.3 }}
                >
                  {title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  {description}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box
            component="aside"
            aria-label="Resource availability"
            sx={{
              mt: { xs: 7, md: 9 },
              p: { xs: 3, md: 4 },
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
        <Box
          component="footer"
          sx={{ py: 3, borderTop: 1, borderColor: "divider" }}
        >
          <Typography variant="body2" color="text.secondary">
            Called Together
          </Typography>
        </Box>
      </Container>
    </>
  );
}
