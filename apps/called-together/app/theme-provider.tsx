"use client";

import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { theme } from "./theme";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
