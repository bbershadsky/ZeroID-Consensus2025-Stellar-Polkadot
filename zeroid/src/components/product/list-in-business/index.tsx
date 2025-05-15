import React, { useState } from "react";
import {
  Card,
  CardActions,
  Button,
  // IconButton, // Not used currently
  // Modal, // Not used directly
  Box,
  Typography,
  Stack,
  CardContent,
  CardMedia,
  // CircularProgress, // Not used currently
  Skeleton,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // Changed icon
import { BaseRecord, useList, useShow, useTranslate } from "@refinedev/core";
import { IEmployer, ICandidate, IJobHistory } from "../../../interfaces"; // Added IJobHistory, BaseRecord
import { resources } from "../../../utility";
// import SaveIcon from "@mui/icons-material/Save"; // Not used
// import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // Replaced by VerifiedUserIcon for this button
import { useCardStyles } from "../../card-elevated/index";
import { JobVerificationRequestModal } from "../../order/form-modal";

interface ProductListProps {
  businessId?: string;
}

const ProductListBusiness: React.FC<ProductListProps> = ({ businessId }) => {
  const cardStyles = useCardStyles();
  const t = useTranslate();

  // State for controlling the modal and the candidate whose "experience" is to be "verified"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidateForVerification, setSelectedCandidateForVerification] = useState<ICandidate | null>(null);

  // Fetching business details - This seems to fetch candidates using businessId, which is confusing.
  // If businessId is for an Employer, this should fetch IEmployer.
  // If businessId is a filter for candidates, then its usage below needs to be clear.
  // For now, assuming this part is as intended by the user, though it might be a source of issues.
  const { queryResult: businessQueryResult } = useShow<IEmployer>({
    resource: resources.employers, // Assuming businessId is for an Employer
    id: businessId || "",
    queryOptions: {
      enabled: !!businessId,
    }
  });
  const business = businessQueryResult.data?.data; // This is the IEmployer object

  const {
    data: productsData, // These are ICandidate items
    isLoading: productsLoading,
    error: productsError,
  } = useList<ICandidate & BaseRecord>({ // Ensure ICandidate includes BaseRecord for $id
    resource: resources.candidates,
    filters: [{ field: "businessID", operator: "eq", value: businessId }],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!businessId, // Only fetch if businessId is present
    }
  });

  const products = productsData?.data || []; // products are ICandidate[]

  const handleOpenModal = (candidate: ICandidate) => {
    setSelectedCandidateForVerification(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCandidateForVerification(null);
    setIsModalOpen(false);
  };


  if (productsLoading && businessId) { // Only show loading if we expect products
    return (
      <Box sx={{ width: "100%" }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        {[1, 2].map(i => (
          <Card key={i} sx={{ ...cardStyles, marginBottom: 2 }}>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton variant="text" height={30} width="80%" />
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={20} width="40%" sx={{ mt: 1 }} />
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Skeleton variant="rounded" width={80} height={30} />
            </CardActions>
          </Card>
        ))}
      </Box>
    );
  }

  if (productsError && businessId) {
    return <Typography color="error">{t("businesses.products.loadError", "Failed to load products/services")}</Typography>;
  }

  if (businessId && (!products || products.length === 0) && !productsLoading) {
    return <Typography>{t("businesses.products.noneFound", "No products or services found for this business.")}</Typography>;
  }
  if (!businessId) {
    return <Typography>{t("businesses.products.selectBusiness", "Please select a business to see their offerings.")}</Typography>;
  }


  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" gutterBottom>
        {t("businesses.products.products-services", "Offerings from this Business")}
      </Typography>
      {products.map((product) => ( // product is an ICandidate
        <Card
          key={product.$id} // Use $id from BaseRecord
          sx={{ ...cardStyles, marginBottom: 2 }}
        >
          {product.productImageURL && ( // Assuming ICandidate has productImageURL for their offering
            <CardMedia
              component="img"
              height="140"
              image={product.productImageURL}
              alt={product.productName || product.name} // Fallback to candidate name
            />
          )}
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {/* A candidate is not a "productName". If they offer a service, that service has a name. */}
              {/* Using candidate's name here as a placeholder for their "offering" name. */}
              {product.productName || product.name}
            </Typography>
            <Typography color="text.secondary" sx={{ minHeight: '40px' }}> {/* Ensure consistent height */}
              {product.productDescription || t("common.noDescription", "No detailed description available.")}
            </Typography>
            {product.productPrice !== undefined && product.productPrice !== null && (
              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <AttachMoneyIcon color="primary" />
                <Typography variant="body1">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: business?.currency || product.productCurrency || "USD", // Prefer business currency, then product's, then USD
                  }).format(Number(product.productPrice))}
                </Typography>
              </Stack>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            {/* This button now opens the JobVerificationRequestModal.
                The label and icon should reflect that if this is the intended action.
                Currently, it's very confusing to have a "Verify Experience" button on a candidate listing
                that tries to use the candidate itself as a "job history item".
            */}
            <Button
              onClick={() => handleOpenModal(product)}
              startIcon={<VerifiedUserIcon />} // Changed icon
              size="small"
              variant="outlined"
            >
              {t("buttons.verifyExperienceExample", "Verify Experience (Example)")}
            </Button>
          </CardActions>
        </Card>
      ))}

      {selectedCandidateForVerification && (
        <JobVerificationRequestModal
          open={isModalOpen}
          onClose={handleCloseModal}
          // !!! CRITICAL TYPE MISMATCH WARNING !!!
          // The 'jobHistoryItem' prop expects an IJobHistory object.
          // You are passing 'selectedCandidateForVerification' which is an ICandidate object.
          // This will lead to errors or incorrect behavior inside the modal
          // because ICandidate does not have fields like 'job_title', 'company_name', etc.,
          // that the modal expects from an IJobHistory item.
          // This is done to fulfill the request "jobhistoryitem should be passed",
          // but it needs to be corrected with the proper data type or a different modal.
          jobHistoryItem={selectedCandidateForVerification as any as (IJobHistory & BaseRecord)}
          candidateId={selectedCandidateForVerification.$id || ""} // Candidate's own ID
          candidateName={selectedCandidateForVerification.name}
        />
      )}
    </Box>
  );
};

export default ProductListBusiness;
