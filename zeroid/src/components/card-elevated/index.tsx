import { useTheme } from "@mui/material";

export const useCardStyles = () => {
  const theme = useTheme();

  const cardStyles = {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[50], // Darker on dark mode, lighter on light mode
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0px 4px 20px rgba(0, 0, 0, 0.5)"
        : "0px 2px 10px rgba(0, 0, 0, 0.1)", // More prominent shadow in dark mode
    "&:hover": {
      boxShadow:
        theme.palette.mode === "dark"
          ? "0px 6px 24px rgba(0, 0, 0, 0.7)"
          : "0px 4px 20px rgba(0, 0, 0, 0.15)", // Enhanced hover effect
    },
  };

  return cardStyles;
};
