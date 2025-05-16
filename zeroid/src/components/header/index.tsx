import { useState, useEffect, useContext, ReactNode } from "react";
import {
  useTranslate,
  useGetIdentity,
  useTranslation,
} from "@refinedev/core";
import { RefineThemedLayoutV2HeaderProps, HamburgerMenu } from "@refinedev/mui";
import {
  AppBar,
  Toolbar,
} from "@mui/material";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import {  IIdentity } from "../../interfaces";
import React from "react";
import { LanguageSelector } from "../language-selector";
import { useNavigate } from "react-router-dom";
interface IOptions {
  label: string;
  avatar?: ReactNode;
  link: string;
  category: string;
}

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = () => {
  const [value, setValue] = useState("");
  const [options, setOptions] = useState<IOptions[]>([]);
  const theme = useTheme();
  const { getLocale, changeLocale } = useTranslation();
  const currentLocale = getLocale();
  const { data: user } = useGetIdentity<IIdentity | null>();

  const t = useTranslate();
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    if (user?.$id) {
      navigate(`/profile/${user.$id}`);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: should run when `value` changed
  useEffect(() => {
    setOptions([]);
  }, [
    value,
  ]);

  if (!currentLocale) {
    return <div>Loading locale...</div>; // or some other fallback
  }

  return (
    <AppBar
      color="default"
      position="sticky"
      elevation={0}
      sx={{
        "& .MuiToolbar-root": {
          minHeight: "64px",
        },
        height: "64px",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      <Toolbar
        sx={{
          paddingLeft: {
            xs: "0",
            sm: "16px",
            md: "24px",
          },
        }}
      >
        <Box
          minWidth="40px"
          minHeight="40px"
          marginRight={{
            xs: "0",
            sm: "16px",
          }}
          sx={{
            "& .MuiButtonBase-root": {
              marginLeft: 0,
              marginRight: 0,
            },
          }}
        >
          <HamburgerMenu />
        </Box>

        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          gap={{
            xs: "8px",
            sm: "24px",
          }}
        >
          <LanguageSelector
            changeLocale={changeLocale}
            currentLocale={currentLocale}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
