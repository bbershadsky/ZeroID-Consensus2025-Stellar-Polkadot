import { languageMenuItems } from "../../utility";

import React from "react";
import { Box, Chip, Avatar, Tooltip, AvatarGroup } from "@mui/material";

interface BusinessLanguagesDisplayProps {
  languages: string[];
  showAvatarGroup?: boolean; // Optional parameter
}
export const BusinessLanguagesDisplay: React.FC<
  BusinessLanguagesDisplayProps
> = ({
  languages,
  showAvatarGroup = false, // Default to false if not provided
}) => {
  if (!languages || languages.length === 0) return null;

  if (showAvatarGroup) {
    return (
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <AvatarGroup max={4}>
          {/* // You can adjust 'max' to limit the number of visible avatars */}
          {languages.map((languageKey) => {
            const language = languageMenuItems.find(
              (item) => item.key === languageKey
            );
            if (!language) return null;
            return (
              <Tooltip key={language.key} title={language.label}>
                <Avatar
                  alt={`${language.label} Flag`}
                  src={language.flag}
                  sx={{ width: 24, height: 24 }}
                />
              </Tooltip>
            );
          })}
        </AvatarGroup>
      </Box>
    );
  } else {
    return (
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {languages.map((languageKey, index) => {
          const language = languageMenuItems.find(
            (item) => item.key === languageKey
          );
          if (!language) return null;

          // Only show the first two languages with labels
          if (index < 2) {
            return (
              <Chip
                key={language.key}
                avatar={
                  <Avatar alt={`${language.label} Flag`} src={language.flag} />
                }
                label={language.label}
                variant="outlined"
              />
            );
          } else {
            // For additional languages, show only avatars with tooltips
            return (
              <Tooltip key={language.key} title={language.label}>
                <Avatar
                  alt={`${language.label} Flag`}
                  src={language.flag}
                  sx={{ width: 24, height: 24 }}
                />
              </Tooltip>
            );
          }
        })}
      </Box>
    );
  }
};
