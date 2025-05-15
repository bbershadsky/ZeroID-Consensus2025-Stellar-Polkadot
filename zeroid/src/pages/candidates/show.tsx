import { useGetIdentity, useShow, useTranslate } from "@refinedev/core";
import { Show } from "@refinedev/mui";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  CardActions,
  Button,
  Grid,
  useTheme,
  Skeleton,
  CardMedia,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { useCardStyles } from "../../components/card-elevated";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import TranslateIcon from "@mui/icons-material/Translate";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { ICandidate, IEmployer, IIdentity } from "../../interfaces";
import { resources } from "../../utility";
import CurrencySelector from "../../components/currency-selector";
import { useState } from "react";
import { LanguageDisplay, OrderForm } from "../../components";
import { OrderFormModal } from "../../components/order/form-modal";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export const ProductShow = () => {
  const { queryResult } = useShow<ICandidate>(); // Ensure the correct product ID is provided or fetched from context/router
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const cardStyles = useCardStyles();
  const t = useTranslate();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const isLoggedIn = !!user;

  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = queryResult;

  const product = productData?.data;
  const { queryResult: businessQueryResult } = useShow<IEmployer>({
    resource: resources.candidates,
    id: product?.businessID || "",
    queryOptions: {
      enabled: !!product?.businessID,
    },
  });

  const {
    data: businessData,
    isLoading: businessLoading,
    error: businessError,
  } = businessQueryResult;
  const business = businessData?.data;

  if (productError || businessError) {
    return <Typography color="error">Failed to load data</Typography>;
  }
  if (businessLoading) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={4}>
            <CardContent>
              <Skeleton variant="rectangular" height={250} animation="wave" />
              <Skeleton
                variant="text"
                height={40}
                animation="wave"
                width="80%"
              />
              <Skeleton
                variant="text"
                height={25}
                animation="wave"
                width="60%"
              />
              <Skeleton
                variant="text"
                height={25}
                animation="wave"
                width="40%"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={300} animation="wave" />
          <Skeleton variant="text" height={30} animation="wave" width="90%" />
          <Skeleton variant="text" height={30} animation="wave" width="90%" />
          <Skeleton variant="text" height={30} animation="wave" width="90%" />
        </Grid>
      </Grid>
    );
  }

  return (
    <Show
      isLoading={productLoading}
      canDelete={user?.$id == business?.userID}
      canEdit={isLoggedIn && user?.$id == business?.userID}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={4}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {t("common.business-overview")}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {business?.imageURL ? (
                <CardMedia
                  component="img"
                  sx={{ height: 160, mb: 2 }}
                  image={business.imageURL}
                  alt={business.name}
                />
              ) : (
                <Box
                  sx={{
                    height: 160,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "text.secondary",
                    backgroundColor: (theme) => theme.palette.action.hover,
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 40 }} />
                  <Typography variant="caption">
                    {t("common.no-image")}
                  </Typography>
                </Box>
              )}
              <Typography variant="h6">{business?.name}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {business?.description}
              </Typography>
              {business?.email && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EmailIcon color="action" />
                  <Typography>{business?.email}</Typography>
                </Box>
              )}
              {business?.phone && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <PhoneIcon color="action" />
                  <Typography>{business?.phone}</Typography>
                </Box>
              )}
              {business?.currency && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <RequestQuoteIcon color="action" />
                  <CurrencySelector
                    currentCurrency={business?.currency}
                    view="label"
                  />
                </Box>
              )}
              {business?.language && (
                <Box display="flex" alignItems="center" gap={1}>
                  <TranslateIcon color="action" />
                  <LanguageDisplay currentLanguage={business.language} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            {t("businesses.products.selectedProduct")}
          </Typography>
          <Card sx={cardStyles}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {product?.productImageURL ? (
                <CardMedia
                  component="img"
                  sx={{ height: 160, mb: 2 }}
                  image={product.productImageURL}
                  alt={product.productName}
                />
              ) : (
                <Box
                  sx={{
                    height: 160,
                    width: "100%",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "text.secondary",
                    backgroundColor: (theme) => theme.palette.action.hover,
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 40 }} />
                  <Typography variant="caption">
                    {t("common.no-image")}
                  </Typography>
                </Box>
              )}
              <Typography variant="h5" gutterBottom>
                {product?.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {product?.productDescription}
              </Typography>
              <Typography variant="h5">${product?.productPrice}</Typography>
            </CardContent>
            <CardActions
              sx={{
                justifyContent: "space-between",
                padding: "12px 16px",
                marginTop: "auto",
                borderTop: "1px solid",
                borderColor: theme.palette.divider,
              }}
            >
              <div></div>
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                startIcon={<ShoppingCartIcon />}
                size="large"
                color="primary"
              >
                {t("buttons.buy")}
              </Button>
            </CardActions>
          </Card>

          <OrderFormModal
            open={open}
            onClose={() => setOpen(false)}
            product={product?.id?.toString() ?? ""}
            currency={business?.currency}
          />

          
        </Grid>
      </Grid>

      {/* {openEditDrawer && (
        <ProductEdit
          productId={product?.id?.toString()}
          onClose={() => setOpenEditDrawer(false)}
        />
      )} */}
    </Show>
  );
};
