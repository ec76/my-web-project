import { createTheme } from "@mui/material/styles";
import { tokens } from "./design-tokens";

const { color, layout, radius } = tokens;
const base = createTheme();
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: color.brand,
      dark: color.hover,
      contrastText: color.surface,
    },
    background: { default: color.page, paper: color.surface },
    text: { primary: color.text, secondary: color.secondary },
    divider: color.border,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    allVariants: { overflowWrap: "anywhere" },
    h1: {
      fontSize: "2.25rem",
      fontWeight: 600,
      lineHeight: 1.2,
      [base.breakpoints.up("md")]: { fontSize: "3rem" },
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.2,
      [base.breakpoints.up("md")]: { fontSize: "2.25rem" },
    },
    h3: {
      fontSize: "1.375rem",
      fontWeight: 600,
      lineHeight: 1.2,
      [base.breakpoints.up("md")]: { fontSize: "1.625rem" },
    },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
    button: { fontSize: "1rem", fontWeight: 600, textTransform: "none" },
    subtitle1: { fontSize: "1rem", lineHeight: 1.6, fontWeight: 600 },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          width: "100%",
          maxWidth: layout.container,
          paddingInline: base.spacing(layout.gutters.xs),
          [base.breakpoints.up("sm")]: {
            paddingInline: base.spacing(layout.gutters.sm),
          },
          [base.breakpoints.up("lg")]: {
            maxWidth: layout.container,
            paddingInline: base.spacing(layout.gutters.lg),
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: "2.75rem",
          minWidth: "2.75rem",
          borderRadius: radius.control,
          transitionDuration: "180ms",
          whiteSpace: "normal",
        },
        contained: { "&:hover": { backgroundColor: color.hover } },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { fontSize: "1rem", minHeight: "2.75rem" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: radius.control },
        notchedOutline: { borderColor: color.secondary },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${color.border}`,
          borderRadius: radius.surface,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        ":focus-visible": {
          outline: `2px solid ${color.brand}`,
          outlineOffset: "4px",
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
  },
});
