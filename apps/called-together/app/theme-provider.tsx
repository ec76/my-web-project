"use client";

import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#76503d" },
    background: { default: "#fbf8f2", paper: "#fffdf9" },
    text: { primary: "#302f29", secondary: "#605c52" },
    divider: "#d8cfc0",
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h1: { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 },
    h2: { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 },
    body1: { lineHeight: 1.8 },
  },
  shape: { borderRadius: 8 },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
