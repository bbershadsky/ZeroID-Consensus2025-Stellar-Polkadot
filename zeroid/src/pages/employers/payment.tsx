import { useGetIdentity, useShow } from "@refinedev/core";
import { Show, RefreshButton, ListButton } from "@refinedev/mui";
import { Chip, Skeleton } from "@mui/material";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Modal,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import TranslateIcon from "@mui/icons-material/Translate";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { IEmployer, IIdentity } from "../../interfaces";
import ProductListBusiness from "../../components/product/list-in-business";
import { useState } from "react";
import { LanguageDisplay } from "../../components/language-icons/index";
import CurrencySelector from "../../components/currency-selector";
import { BusinessLanguagesDisplay } from "../../components/languages-chip";
import PaymentMethodsForm from "../../components/payment-methods-form";

export const BusinessPayment = () => {
  const { queryResult } = useShow<IEmployer>({});
  const { data: businessData, isLoading: businessLoading } = queryResult;
  const business = businessData?.data;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { data: user } = useGetIdentity<IIdentity | null>();
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
          {/* Optionally show skeletons for product list or other content */}
          <Skeleton variant="rectangular" height={300} animation="wave" />
          <Skeleton variant="text" height={30} animation="wave" width="90%" />
          <Skeleton variant="text" height={30} animation="wave" width="90%" />
          <Skeleton variant="text" height={30} animation="wave" width="90%" />
        </Grid>
      </Grid>
    );
  }
  const isLoggedIn = !!user;

  return (
    <Show
      isLoading={businessLoading}
      canDelete={isLoggedIn && user?.$id == business?.userID}
      canEdit={isLoggedIn && user?.$id == business?.userID}
      headerButtons={({
        //   deleteButtonProps,
        //   editButtonProps,
        listButtonProps,
        refreshButtonProps,
      }) => (
        <>
          {/* <Button type="primary">Custom Button</Button>*/}
          {listButtonProps && (
            <ListButton {...listButtonProps} meta={{ foo: "bar" }} />
          )}
          {/* {editButtonProps && (
            <EditButton {...editButtonProps} meta={{ foo: "bar" }} />
          )}
          {deleteButtonProps && (
            <DeleteButton {...deleteButtonProps} meta={{ foo: "bar" }} />
          )} */}
          <RefreshButton {...refreshButtonProps} hideText={true} />
        </>
      )}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={4}>
            {business?.imageURL && (
              <>
                <CardMedia
                  component="img"
                  height="250"
                  image={business.imageURL}
                  alt="Business"
                  sx={{ cursor: "pointer" }}
                  onClick={handleOpen}
                />
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "auto", // Auto width for responsiveness
                      maxWidth: "98%", // Slightly less than full screen width
                      maxHeight: "98%", // Slightly less than full screen height
                      overflow: "auto", // Adds scroll on overflow
                      outline: "none", // Removes the focus outline
                    }}
                  >
                    <img
                      src={business.imageURL}
                      alt="Business"
                      style={{
                        maxWidth: "100%", // Ensures the image is not wider than the box
                        maxHeight: "100%", // Ensures the image is not taller than the box
                        display: "block", // Removes extra space below the image
                        objectFit: "contain", // Ensures the aspect ratio is maintained
                      }}
                    />
                  </Box>
                </Modal>
              </>
            )}
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {business?.name}
              </Typography>
             
              {business?.email && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EmailIcon color="action" />
                  <Typography>{business?.email}</Typography>
                </Box>
              )}
             
              {/* <PaymentMethodsForm businessId={business?.id!} /> */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <ProductListBusiness businessId={business?.id} />
        </Grid>
      </Grid>
    </Show>
  );
};
