import { useGetIdentity, useShow } from "@refinedev/core";
import { Show, RefreshButton, ListButton } from "@refinedev/mui";
import { Skeleton } from "@mui/material";
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
import { IEmployer, IIdentity } from "../../interfaces";
import ProductListBusiness from "../../components/product/list-in-business";
import { useState } from "react";
import { useParams } from "react-router-dom"; 
import { resources } from "../../utility"; 

export const BusinessShow = () => {
  const { id } = useParams<{ id: string }>(); 

  const { queryResult } = useShow<IEmployer>({
    resource: resources.employers, 
    id: id,                        
  });
  const { data: businessData, isLoading: businessLoading, error } = queryResult; 
  const business = businessData?.data;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { data: user } = useGetIdentity<IIdentity | null>();

  // For debugging:
  console.log("BusinessShow - Resource:", resources.employers);
  console.log("BusinessShow - ID from useParams:", id);
  console.log("BusinessShow - Query Result:", queryResult);
  if (error) {
    console.error("BusinessShow - Error fetching data:", error);
    // Optionally display an error message to the user
    // return <Typography color="error">Error loading business data: {error.message}</Typography>;
  }


  if (businessLoading) {
    return (
      <Grid container spacing={2}>
        <Grid item={true} xs={12} md={6}>
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

  if (!business && !businessLoading) {
    // Handle case where data is not found after loading finishes
    return <Typography>Business not found.</Typography>;
  }

  const isLoggedIn = !!user;

  return (
    <Show
      isLoading={businessLoading}
      canDelete={isLoggedIn && user?.$id === business?.userID}
      canEdit={isLoggedIn && user?.$id === business?.userID}
      headerButtons={({
        listButtonProps,
        refreshButtonProps,
      }) => (
        <>
          {listButtonProps && (
            <ListButton {...listButtonProps} />
          )}
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
                      width: "auto",
                      maxWidth: "98%",
                      maxHeight: "98%",
                      overflow: "auto",
                      outline: "none",
                    }}
                  >
                    <img
                      src={business.imageURL}
                      alt="Business"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        display: "block",
                        objectFit: "contain",
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
             
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Ensure business.id is the Appwrite document $id */}
          <ProductListBusiness businessId={business?.$id} /> {/* Changed to business?.$id */}
        </Grid>
      </Grid>
    </Show>
  );
};