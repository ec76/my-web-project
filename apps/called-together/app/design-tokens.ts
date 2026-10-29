// MUI spacing values use the existing 8px base; dimensions use rem/ch.
export const tokens = {
  color: {
    page: "#FAF9F6",
    surface: "#FFFFFF",
    text: "#202B33",
    secondary: "#52616B",
    brand: "#235D59",
    hover: "#194642",
    subtle: "#EDF4F1",
    border: "#DDE3DF",
  },
  layout: {
    container: "75rem",
    reading: "68ch",
    gutters: { xs: 2, sm: 3, lg: 4 },
    section: { xs: 6, md: 10 },
    card: { xs: 2, sm: 3 },
    grid: { xs: 2, sm: 3, md: 4 },
    inline: 1,
    related: 2,
    stack: 3,
    group: 4,
  },
  radius: { surface: "0.75rem", control: "0.5rem" },
  article: { maxWidth: "68ch", fontSize: "1.125rem", lineHeight: 1.75 },
} as const;
