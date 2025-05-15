import React from "react";
import { Stack, Avatar, Typography, useTheme, Box, Chip } from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import {
  BusinessLanguagesDisplayProps,
  LanguageDisplayProps,
} from "../../interfaces";
import { languageMenuItems } from "../../utility";

export const LanguageDisplay: React.FC<LanguageDisplayProps> = ({
  currentLanguage,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const currentLanguageItem = React.useMemo(
    () => languageMenuItems.find((item) => item.key === currentLanguage),
    [currentLanguage]
  );

  if (!currentLanguageItem) return null;

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Avatar
        src={currentLanguageItem.flag}
        alt={`${currentLanguageItem.label} Flag`}
        sx={{ width: 24, height: 24 }}
      />
      <Typography sx={{ color: isDarkMode ? "common.white" : "text.primary" }}>
        {currentLanguageItem.label}
      </Typography>
    </Stack>
  );
};

export const BusinessLanguagesDisplay: React.FC<
  BusinessLanguagesDisplayProps
> = ({ languages, currentLanguage }) => {
  if (!languages || languages.length === 0) return null;

  return (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      {languages.map((language, index) => (
        <Chip key={index} label={language} variant="outlined" />
      ))}
      <LanguageDisplay currentLanguage={currentLanguage} />
    </Box>
  );
};
