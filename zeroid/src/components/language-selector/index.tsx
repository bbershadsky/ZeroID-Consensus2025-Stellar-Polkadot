import { useTheme } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Avatar,
  Button,
  Typography,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
interface LanguageSelectorProps {
  currentLocale: string;
  changeLocale: (locale: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLocale,
  changeLocale,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const languageMenuItems = [
    { key: "en", label: "English" },
    { key: "zh", label: "Chinese (Simplified)" },
    { key: "ru", label: "Russian" },
    { key: "it", label: "Italian" },
    { key: "fr", label: "French" },
    { key: "de", label: "German" },
    // { key: "hi", label: "Hindi" },
  ];
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Button onClick={handleClick}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            sx={{ height: 24, width: 24 }}
            src={`/images/flags/${currentLocale}.svg`}
          />
          <Typography
            sx={{
              color: isDarkMode ? "common.white" : "text.primary",
            }}
          >
            {
              languageMenuItems.find((item) => item.key === currentLocale)
                ?.label
            }
          </Typography>
          <ArrowDropDownIcon
            sx={{
              color: isDarkMode ? "common.white" : "text.primary",
            }}
          />
        </Stack>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            backgroundColor: isDarkMode
              ? theme.palette.background.paper
              : theme.palette.background.default,
            color: isDarkMode
              ? theme.palette.common.white
              : theme.palette.text.primary,
          },
        }}
      >
        {languageMenuItems.map((item) => (
          <MenuItem
            key={item.key}
            selected={item.key === currentLocale}
            onClick={() => {
              changeLocale(item.key);
              localStorage.setItem("NEXT_LOCALE", item.key);
              handleClose();
            }}
            style={{
              backgroundColor: isDarkMode
                ? theme.palette.action.selected
                : undefined,
            }}
          >
            <Avatar
              src={`/images/flags/${item.key}.svg`}
              sx={{ width: 24, height: 24, marginRight: 1 }}
            />
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
