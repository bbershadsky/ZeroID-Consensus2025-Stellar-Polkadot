import { useState, useEffect, useContext, ReactNode } from "react";
import {
  // useList,
  useTranslate,
  useGetIdentity,
  useTranslation,
  // useIsAuthenticated,
} from "@refinedev/core";
import { RefineThemedLayoutV2HeaderProps, HamburgerMenu } from "@refinedev/mui";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  // Typography,
  // Menu,
  // MenuItem,
  // Avatar,
  // Switch,
} from "@mui/material";

import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Select from "@mui/material/Select";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import BrightnessHighIcon from "@mui/icons-material/BrightnessHigh";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { useTheme } from "@mui/material/styles";
import { IOrder, IStore, ICourier, IIdentity } from "../../interfaces";
import { ColorModeContext } from "../../contexts";
import React from "react";
import { LanguageSelector } from "../language-selector";
import { useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";
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
  const isDarkMode = theme.palette.mode === "dark";
  // const { data: authenticated } = useIsAuthenticated();
  const { mode, setMode } = useContext(ColorModeContext);
  const { getLocale, changeLocale } = useTranslation();
  const currentLocale = getLocale();
  const { data: user } = useGetIdentity<IIdentity | null>();

  const t = useTranslate();
  const navigate = useNavigate();

  // console.log("usr", user);
  // const { refetch: refetchOrders } = useList<IOrder>({
  //   resource: "orders",
  //   config: {
  //     filters: [{ field: "q", operator: "contains", value }],
  //   },
  //   queryOptions: {
  //     enabled: false,
  //     onSuccess: (data) => {
  //       const orderOptionGroup: IOptions[] = data.data.map((item) => {
  //         return {
  //           label: `${item.store.title} / #${item.orderNumber}`,
  //           link: `/orders/show/${item.id}`,
  //           category: t("orders.orders"),
  //           avatar: (
  //             <Avatar
  //               variant="rounded"
  //               sx={{
  //                 width: "32px",
  //                 height: "32px",
  //               }}
  //               src={item.products?.[0]?.images?.[0]?.url}
  //             />
  //           ),
  //         };
  //       });
  //       if (orderOptionGroup.length > 0) {
  //         setOptions((prevOptions) => [...prevOptions, ...orderOptionGroup]);
  //       }
  //     },
  //   },
  // });

  // const { refetch: refetchStores } = useList<IBusiness>({
  //   resource: resources.businesses,
  //   config: {
  //     filters: [{ field: "q", operator: "contains", value }],
  //   },
  //   queryOptions: {
  //     enabled: false,
  //     onSuccess: (data) => {
  //       const storeOptionGroup = data.data.map((item) => {
  //         return {
  //           label: `${item.title} - ${item.address.text}`,
  //           link: `/stores/edit/${item.id}`,
  //           category: t("stores.stores"),
  //         };
  //       });
  //       setOptions((prevOptions) => [...prevOptions, ...storeOptionGroup]);
  //     },
  //   },
  // });

  // const { refetch: refetchCouriers } = useList<ICourier>({
  //   resource: "couriers",
  //   config: {
  //     filters: [{ field: "q", operator: "contains", value }],
  //   },
  //   queryOptions: {
  //     enabled: false,
  //     onSuccess: (data) => {
  //       const courierOptionGroup = data.data.map((item) => {
  //         return {
  //           label: `${item.name}`,
  //           avatar: (
  //             <Avatar
  //               sx={{
  //                 width: "32px",
  //                 height: "32px",
  //               }}
  //               src={item.avatar?.[0]?.url}
  //             />
  //           ),
  //           link: `/couriers/edit/${item.id}`,
  //           category: t("couriers.couriers"),
  //         };
  //       });
  //       setOptions((prevOptions) => [...prevOptions, ...courierOptionGroup]);
  //     },
  //   },
  // });
  const handleAvatarClick = () => {
    if (user?.$id) {
      navigate(`/profile/${user.$id}`);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: should run when `value` changed
  useEffect(() => {
    setOptions([]);
    // refetchOrders();
    // refetchCouriers();
    // refetchStores();
  }, [
    value,
    // refetchOrders,
    // refetchCouriers,
    // refetchStores,
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

          {/* <Stack direction="row" flex={1}>
            <Autocomplete
              sx={{
                maxWidth: 550,
              }}
              id="search-autocomplete"
              options={options}
              filterOptions={(x) => x}
              disableClearable
              freeSolo
              fullWidth
              size="small"
              onInputChange={(event, value) => {
                if (event?.type === "change") {
                  setValue(value);
                }
              }}
              groupBy={(option) => option.category}
              renderOption={(props, option: IOptions) => {
                return (
                  <Link href={option.link} underline="none">
                    <Box
                      {...props}
                      component="li"
                      sx={{
                        display: "flex",
                        padding: "10px",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {option?.avatar && option.avatar}
                      <Typography
                        sx={{
                          fontSize: {
                            md: "14px",
                            lg: "16px",
                          },
                        }}
                      >
                        {option.label}
                      </Typography>
                    </Box>
                  </Link>
                );
              }}
              renderInput={(params) => {
                return (
                  <Box
                    position="relative"
                    sx={{
                      "& .MuiFormLabel-root": {
                        paddingRight: "24px",
                      },
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                    }}
                  >
                    <TextField
                      {...params}
                      label={t("search.placeholder")}
                      InputProps={{
                        ...params.InputProps,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <SearchOutlined />
                    </IconButton>
                  </Box>
                );
              }}
            />
          </Stack> */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={{
              xs: "8px",
              sm: "24px",
            }}
          >
            <IconButton
              onClick={() => {
                setMode();
              }}
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "transparent" : "#00000014",
              }}
            >
              {mode === "dark" ? (
                <BrightnessHighIcon />
              ) : (
                <Brightness4Icon
                  sx={{
                    fill: "#000000DE",
                  }}
                />
              )}
            </IconButton>
            <Stack
              direction="row"
              gap={{
                xs: "8px",
                sm: "16px",
              }}
              alignItems="center"
              justifyContent="center"
            >
              {user?.name && (
                <>
                  <Typography variant="subtitle2">{user.name}</Typography>
                  <Avatar
                    src={user?.prefs.profilePhoto}
                    alt={user.name}
                    sx={{ cursor: "pointer" }}
                    onClick={handleAvatarClick}
                  />
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
