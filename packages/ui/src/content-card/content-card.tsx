import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export interface ContentCardProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function ContentCard({ eyebrow, title, description }: ContentCardProps) {
  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        height: "100%",
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent
        sx={{ p: { xs: 3, sm: 4 }, "&:last-child": { pb: { xs: 3, sm: 4 } } }}
      >
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Chip
            label={eyebrow}
            color="primary"
            size="small"
            variant="outlined"
          />
          <Typography component="h2" variant="h5" sx={{ fontWeight: 650 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
            {description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
