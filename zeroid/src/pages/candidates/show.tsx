import React, { useState } from "react";
import { useGetIdentity, useShow, useTranslate } from "@refinedev/core";
import { Show } from "@refinedev/mui"; // Assuming this is your Show component wrapper
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
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import TranslateIcon from "@mui/icons-material/Translate";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useParams } from "react-router-dom";

import { useCardStyles } from "../../components/card-elevated"; // Ensure this path is correct
import { ICandidate, IEmployer, IIdentity } from "../../interfaces";
import { resources } from "../../utility"; // Ensure resources.candidates and resources.employers are correct
import CurrencySelector from "../../components/currency-selector"; // Ensure this path is correct
import { LanguageDisplay } from "../../components"; // Ensure LanguageDisplay and OrderFormModal paths are correct
import { OrderFormModal } from "../../components/order/form-modal";

export const CandidateShow = () => {
  const { id } = useParams<{ id: string }>(); // Get candidate ID from URL
  const theme = useTheme();
  const cardStyles = useCardStyles(); // Assuming this hook provides styles
  const t = useTranslate();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const isLoggedIn = !!user;
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // --- Fetch Candidate Data (Primary data for this page) ---
  const {
    queryResult: {
      data: candidateDataResult, // Renamed to avoid conflict
      isLoading: isCandidateLoading,
      error: candidateError,
    },
  } = useShow<ICandidate>({
    resource: resources.candidates, // Correct resource for candidate
    id: id!, // Ensure id is not undefined
  });
  const candidate = candidateDataResult?.data;

  // --- Fetch Related Business (Employer) Data ---
  // This fetch depends on candidate.businessID
  const {
    queryResult: {
      data: businessDataResult,
      isLoading: isBusinessLoading,
      error: businessError,
    },
  } = useShow<IEmployer>({
    resource: resources.employers, // *** CORRECTED: Use employers resource ***
    id: candidate?.businessID || "", // Fetch only if businessID exists
    queryOptions: {
      enabled: !!candidate?.businessID, // Only run this query if candidate and candidate.businessID are available
    },
  });
  const business = businessDataResult?.data;

  // --- Loading and Error States ---
  // The page is loading if either the candidate or the (conditionally fetched) business is loading.
  const isLoading = isCandidateLoading || (!!candidate?.businessID && isBusinessLoading);

  // Log for debugging
  console.log("Candidate Data:", candidate);
  console.log("Business Data:", business);
  console.log("Is Candidate Loading:", isCandidateLoading);
  console.log("Is Business Loading:", isBusinessLoading);
  console.log("Overall Loading State:", isLoading);


  if (candidateError) {
    return (
      <Typography color="error">
        {t("common.errors.loadFailed", { resource: t("candidates.candidates", "Candidate") })}:{" "}
        {candidateError.message}
      </Typography>
    );
  }
  // Only show business error if we attempted to load business data
  if (candidate?.businessID && businessError) {
    return (
      <Typography color="error">
        {t("common.errors.loadFailed", { resource: t("employers.employers", "Business") })}:{" "}
        {businessError.message}
      </Typography>
    );
  }

  // Show skeleton if overall loading is true
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={4}>
            <CardContent>
              <Skeleton variant="rectangular" height={160} animation="wave" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} animation="wave" width="80%" />
              <Skeleton variant="text" height={25} animation="wave" width="60%" />
              <Skeleton variant="text" height={25} animation="wave" width="40%" />
              <Skeleton variant="text" height={25} animation="wave" width="50%" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="text" height={50} animation="wave" width="60%" sx={{ mb: 1 }} />
          <Card elevation={4}>
            <CardContent>
              <Skeleton variant="rectangular" height={160} animation="wave" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} animation="wave" width="80%" />
              <Skeleton variant="text" height={60} animation="wave" width="90%" />
              <Skeleton variant="text" height={40} animation="wave" width="30%" sx={{ mt: 1 }} />
            </CardContent>
            <CardActions>
              <Skeleton variant="text" height={60} width="30%" sx={{ ml: "auto" }} />
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // If candidate data is missing after loading (and no error)
  if (!candidate) {
    return <Typography>{t("common.errors.noData", "No candidate data found.")}</Typography>;
  }

  return (
    <Show
      isLoading={isLoading} // Use combined loading state
      // canDelete and canEdit depend on business data, which might not always be present or relevant for a candidate
      // Adjust this logic based on your application's requirements.
      // For example, a candidate might edit their own profile, or an admin might.
      canDelete={isLoggedIn && user?.$id === candidate.userID} // Example: User can delete their own candidate profile
      canEdit={isLoggedIn && user?.$id === candidate.userID}   // Example: User can edit their own candidate profile
    >
      <Grid container spacing={3}>
        {/* Business Overview Card (Only if business data is available) */}
        {business && (
          <Grid item xs={12} md={5}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {t("common.businessOverview", "Associated Business")}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {business.imageURL ? (
                  <CardMedia
                    component="img"
                    sx={{ height: 180, mb: 2, borderRadius: 1 }}
                    image={business.imageURL}
                    alt={business.name}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      mb: 2,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      color: "text.secondary",
                      backgroundColor: theme.palette.action.hover,
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 48 }} />
                    <Typography variant="caption">
                      {t("common.noImage", "No Image Available")}
                    </Typography>
                  </Box>
                )}
                <Typography variant="h6" gutterBottom>{business.name}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {business.description}
                </Typography>
                {business.email && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon color="action" fontSize="small" />
                    <Typography variant="body2">{business.email}</Typography>
                  </Box>
                )}
                {business.phone && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Typography variant="body2">{business.phone}</Typography>
                  </Box>
                )}
                {business.currency && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <RequestQuoteIcon color="action" fontSize="small" />
                    <CurrencySelector
                      currentCurrency={business.currency}
                      view="label"
                    />
                  </Box>
                )}
                {/* Assuming business.language is a single string code, adjust if it's an array */}
                {business.languages && business.languages.length > 0 && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <TranslateIcon color="action" fontSize="small" />
                    {/* If LanguageDisplay expects a single string and business.languages is an array: */}
                    <LanguageDisplay currentLanguage={business.languages[0]} />
                    {/* Or map through business.languages if LanguageDisplay can handle multiple or you want to list them */}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Candidate Details Card */}
        <Grid item xs={12} md={business ? 7 : 12}> {/* Adjust grid size if business card is not shown */}
          <Typography variant="h5" gutterBottom sx={!business ? { mt: 0 } : {}}>
            {/* Using candidate.name as title, assuming product... fields are specific to a candidate's offering */}
            {candidate.name || t("candidates.candidateDetails", "Candidate Details")}
          </Typography>
          <Card sx={cardStyles} elevation={4}> {/* Use cardStyles from your hook */}
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                // alignItems: "center", // Removed to allow text to align left
              }}
            >
              {/* Assuming candidate might have an image (e.g. profile picture) */}
              {/* If product... fields are what you mean by candidate's offering, use those */}
              {candidate.productImageURL ? ( // Using ICandidate fields now
                <CardMedia
                  component="img"
                  sx={{ height: 200, mb: 2, borderRadius: 1, objectFit: 'cover' }}
                  image={candidate.productImageURL} // Example: if candidate has an image
                  alt={candidate.name}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    width: "100%",
                    mb: 2,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "text.secondary",
                    backgroundColor: theme.palette.action.hover,
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 48 }} />
                  <Typography variant="caption">
                    {t("common.noImage", "No Profile Image")}
                  </Typography>
                </Box>
              )}
              {/* Displaying candidate fields */}
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {candidate.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {t('candidates.fields.email', 'Email')}: {candidate.email}
              </Typography>

              {/* Example: Displaying resume if available */}
              {candidate.resume_file_id && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  <Link to={`#view-resume/${candidate.resume_file_id}`} target="_blank"> {/* Replace with actual view link */}
                    {t('candidates.fields.resume', 'View Resume')}
                  </Link>
                </Typography>
              )}

              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {t('candidates.fields.verificationStatus', 'Status')}: {candidate.verification_status}
              </Typography>

              {/* If candidate has product-like fields: */}
              {candidate.productName && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {candidate.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {candidate.productDescription}
                  </Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'medium' }}>
                    ${candidate.productPrice}
                  </Typography>
                </>
              )}
            </CardContent>
            {/* CardActions might be for "contact candidate", "view profile elsewhere", etc. */}
            {/* The "Buy" button seems more relevant if this is a product page, not a candidate profile. */}
            {/* Adjusting for a hypothetical "Order Service" from candidate */}
            {candidate.productName && ( // Only show if there's a product/service defined
              <CardActions
                sx={{
                  justifyContent: "flex-end", // Align button to the right
                  padding: "12px 16px",
                  borderTop: "1px solid",
                  borderColor: theme.palette.divider,
                }}
              >
                <Button
                  onClick={() => setIsOrderModalOpen(true)}
                  startIcon={<ShoppingCartIcon />}
                  size="large"
                  variant="contained"
                  color="primary"
                >
                  {t("buttons.orderService", "Order Service")}
                </Button>
              </CardActions>
            )}
          </Card>

          {candidate.productName && business && (
            <OrderFormModal
              open={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              // Assuming OrderFormModal needs product ID and business currency
              // If it's the candidate's service, pass candidate.id or a specific service ID
              product={candidate.id?.toString() ?? ""} // Or a specific service ID from the candidate
              currency={business.currency} // Or candidate's preferred currency if they set one
            />
          )}
        </Grid>
      </Grid>
    </Show>
  );
};
