import { RefineThemes } from "@refinedev/mui";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import gray from "@mui/material/colors/grey";
import { Components, Theme } from "@mui/material/styles";

const components: Components<Omit<Theme, "components">> = {
  MuiChip: {
    styleOverrides: {
      labelSmall: {
        lineHeight: "18px",
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      "main.MuiBox-root": {
        backgroundColor: gray[100],
      },
      body: {
        backgroundColor: gray[100],
      },
    },
  },
  MuiTypography: {
    defaultProps: {
      variant: "body2",
    },
  },
  MuiAlert: {
    defaultProps: {
      severity: "info", // Adjust this line as needed to match your configuration
    },
    styleOverrides: {
      root: {
        borderRadius: "4px",
      },
    },
  },
};

const DarkComponents: Components<Omit<Theme, "components">> = {
  MuiChip: {
    styleOverrides: {
      labelSmall: {
        lineHeight: "18px",
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      "main.MuiBox-root": {
        backgroundColor: "#121212",
      },
      body: {
        backgroundColor: "#121212",
      },
    },
  },
  MuiTypography: {
    defaultProps: {
      variant: "body2",
    },
  },
  MuiAlert: {
    defaultProps: {
      severity: "info", // Adjust this line as needed to match your configuration
    },
    styleOverrides: {
      root: {
        borderRadius: "4px",
      },
    },
  },
};

const typography = {
  fontFamily: "Futura, Arial, sans-serif",
  h1: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  h2: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  h3: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  h4: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  h5: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  h6: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  subtitle1: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  subtitle2: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  body1: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  body2: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  button: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  caption: {
    fontFamily: "Futura, Arial, sans-serif",
  },
  overline: {
    fontFamily: "Futura, Arial, sans-serif",
  },
};

const LightTheme = createTheme({
  ...RefineThemes.Orange,
  typography,
  components,
});

const DarkTheme = createTheme({
  ...RefineThemes.OrangeDark,
  typography,
  components: DarkComponents,
});

const DarkThemeWithResponsiveFontSizes = responsiveFontSizes(DarkTheme);
const LightThemeWithResponsiveFontSizes = responsiveFontSizes(LightTheme);

export { LightThemeWithResponsiveFontSizes, DarkThemeWithResponsiveFontSizes };
