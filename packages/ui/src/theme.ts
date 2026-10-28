import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6750a4",
    },
    background: {
      default: "#f8f7fb",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
  },
});

export default theme;
