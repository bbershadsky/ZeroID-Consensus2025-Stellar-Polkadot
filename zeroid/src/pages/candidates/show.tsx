import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useGetIdentity, useShow, useList, useTranslate, BaseRecord } from "@refinedev/core"; // Added useList
import { Databases, ID } from "appwrite";
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
  Chip, // For displaying tags like employment type
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter"; // Icon for job history
import DateRangeIcon from "@mui/icons-material/DateRange";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from '@mui/icons-material/Work';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';


import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useParams } from "react-router-dom"; // Renamed Link to avoid conflict

import { useCardStyles } from "../../components/card-elevated";
import { ICandidate, IIdentity, IJobHistory } from "../../interfaces";
import {appwriteClient, resources} from "../../utility";
// import CurrencySelector from "../../components/currency-selector"; // Not used if business section is removed
// import { LanguageDisplay } from "../../components"; // Not used if business section is removed
import { JobVerificationRequestModal } from "../../components/order/form-modal"; // Keep if candidate has "orderable" services

// Helper function to format dates (optional, but good for UI)
const formatDate = (date?: string | Date | null): string => {
  if (!date) return "N/A";
  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return parsedDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return date instanceof Date ? date.toString() : date; // Return original if formatting fails
  }
};
export interface ResumeExperience {
  candidate_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  is_current_job: boolean;
  description: string;
  location: string;
  employment_type: string;
}
export const CandidateShow = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const cardStyles = useCardStyles();
  const t = useTranslate();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const isLoggedIn = !!user;
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedJobHistoryForVerification, setSelectedJobHistoryForVerification] = useState<IJobHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);

  const handleOpenModal = (jobHistoryItem: IJobHistory) => {
    setSelectedJobHistoryForVerification(jobHistoryItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedJobHistoryForVerification(null);
    setIsModalOpen(false);
  };

  // --- Fetch Candidate Data ---
  const {
    queryResult: {
      data: candidateDataResult,
      isLoading: isCandidateLoading,
      error: candidateError,
    },
  } = useShow<ICandidate>({
    resource: resources.candidates,
    id: id!,
  });
  const candidate = candidateDataResult?.data;
  const [newExperience, setNewExperience] = useState<ResumeExperience>({
    candidate_id: candidate?.id ?? "",
    company_name: "",
    job_title: "",
    start_date: "",
    end_date: "",
    is_current_job: false,
    description: "",
    location: "",
    employment_type: ""
  });

  // --- Fetch Job History Data for this Candidate ---
  const {
    data: jobHistoryData, // This will be { data: IJobHistory[], total: number }
    isLoading: isJobHistoryLoading,
    error: jobHistoryError,
  } = useList<IJobHistory>({
    resource: resources.jobHistory, // Ensure this resource is defined in your App.tsx and utility.ts
    filters: [
      {
        field: "candidate_id", // Filter by the candidate_id field in your jobHistory collection
        operator: "eq",
        value: id, // The ID of the current candidate
      },
    ],
    queryOptions: {
      enabled: !!id, // Only run this query if the candidate ID is available
    },
    pagination: {
      pageSize: 10, // Adjust as needed, or use 'off' for all items
    }
  });
  const jobHistoryItems = jobHistoryData?.data || [];

  // --- Combined Loading and Error States ---
  const isLoading = isCandidateLoading || (!!id && isJobHistoryLoading);

  console.log("Candidate Data:", candidate);
  console.log("Job History Items:", jobHistoryItems);
  console.log("Overall Loading State:", isLoading);
  if (candidateError) {
    return (
      <Typography color="error">
        {t("common.errors.loadFailed", { resource: t("candidates.candidates", "Candidate") })}:{" "}
        {candidateError.message}
      </Typography>
    );
  }
  if (jobHistoryError) {
    return (
      <Typography color="error">
        {t("common.errors.loadFailed", { resource: t("jobHistory.jobHistory", "Job History") })}:{" "}
        {jobHistoryError.message}
      </Typography>
    );
  }

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {/* Skeleton for Candidate Card */}
        <Grid item xs={12} md={8}> {/* Main content area */}
          <Card elevation={4}>
            <CardContent>
              <Skeleton variant="rectangular" height={200} animation="wave" sx={{ mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '2rem' }} animation="wave" width="70%" />
              <Skeleton variant="text" animation="wave" width="50%" />
              <Skeleton variant="text" animation="wave" width="40%" sx={{ mb: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        {/* Skeleton for Job History Section Title */}
        <Grid item xs={12}>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', mt: 2 }} animation="wave" width="40%" />
        </Grid>
        {/* Skeletons for Job History Cards */}
        {[1, 2].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={`skeleton-job-${item}`}>
            <Card elevation={2}>
              <CardContent>
                <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} animation="wave" width="80%" />
                <Skeleton variant="text" animation="wave" width="60%" />
                <Skeleton variant="rectangular" height={50} animation="wave" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!candidate) {
    return <Typography>{t("common.errors.noData", "No candidate data found.")}</Typography>;
  }

  return (
    <Show
      isLoading={isLoading}
      canDelete={isLoggedIn && user?.$id === candidate.userID}
      canEdit={isLoggedIn && user?.$id === candidate.userID}
    // WrapperProps={{ sx: { padding: { xs: 1, sm: 2, md: 3 } } }} // Optional: Add padding to the Show wrapper
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: { xs: 3, md: 0 }, mb: 2 }}>
        <Typography variant="h5" component="h2">
          {t("jobHistory.title", "Work Experience")}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setIsAddExperienceOpen(true)}
          startIcon={<WorkIcon />}
        >
          {t("buttons.addExperience", "Add Experience")}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Candidate Details Card */}
        <Grid item xs={12} md={jobHistoryItems.length > 0 ? 8 : 12}> {/* Adjust grid size based on job history presence */}

          <Card sx={cardStyles} elevation={4}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {candidate.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {t('candidates.fields.email', 'Email')}: {candidate.email}
              </Typography>

              {candidate.resume_file_id && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <Button
                    component={RouterLink}
                    to={`/files/view/${candidate.resume_file_id}`} // Example: Adjust this link to how you view files
                    target="_blank"
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                  >
                    {t('candidates.fields.resume', 'View Resume')}
                  </Button>
                </Typography>
              )}

              <Chip
                label={`${t('candidates.fields.verificationStatus', 'Status')}: ${candidate.verification_status}`}
                color={candidate.is_verified ? "success" : "warning"}
                size="small"
                sx={{ mb: 2 }}
              />

              {/* If candidate has "product-like" fields for a service they offer */}
              {candidate.productName && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" component="h2" gutterBottom>
                    {t("candidates.serviceOffering", "Service Offering")}
                  </Typography>
                  <Typography variant="h6">{candidate.productName}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                    {candidate.productDescription}
                  </Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'medium' }}>
                    ${candidate.productPrice}
                  </Typography>
                  <CardActions sx={{ justifyContent: "flex-start", pl: 0, pt: 2 }}>
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
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Job History Section */}
        {jobHistoryItems.length > 0 && (
          <Grid item xs={12} md={4}> {/* Sidebar for job history or takes full width if candidate card is smaller */}
            <Grid container spacing={2}>
              {jobHistoryItems.map((job) => (
                <Grid item xs={12} key={job.$id}>
                  <Card elevation={2} sx={{ height: '100%' /* Ensure cards have same height if desired */ }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {job.job_title || t("common.notAvailable", "N/A")}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle1" color="text.secondary">
                          {job.company_name || t("common.notAvailable", "N/A")}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(job.start_date)} – {job.is_current_job ? t("jobHistory.present", "Present") : formatDate(job.end_date)}
                        </Typography>
                      </Box>
                      {job.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                      )}
                      {job.employment_type && (
                        <Chip label={job.employment_type} size="small" sx={{ mb: 1 }} />
                      )}
                      {job.description && (
                        <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                          {job.description}
                        </Typography>
                      )}
                       <Button
                                    onClick={() => handleOpenModal(job)}
                                    startIcon={<VerifiedUserIcon />} // Changed icon
                                    size="small"
                                    variant="outlined"
                                  >
                                    {t("buttons.verifyExperienceExample", "Verify Experience")}
                                  </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
          <JobVerificationRequestModal
                 open={isModalOpen}
                 onClose={handleCloseModal}
                 jobHistoryItem={selectedJobHistoryForVerification as IJobHistory & BaseRecord}
                 candidateId={candidate.$id || ""}
                 candidateName={candidate.name || ""}
               />
      </Grid>
      <Dialog open={isAddExperienceOpen} onClose={() => setIsAddExperienceOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t("jobHistory.addExperience", "Add New Experience")}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company Name"
                value={newExperience.company_name}
                onChange={(e) => setNewExperience({ ...newExperience, company_name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Job Title"
                value={newExperience.job_title}
                onChange={(e) => setNewExperience({ ...newExperience, job_title: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newExperience.start_date}
                onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newExperience.end_date}
                onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                value={newExperience.location}
                onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Employment Type"
                value={newExperience.employment_type}
                onChange={(e) => setNewExperience({ ...newExperience, employment_type: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                fullWidth
                multiline
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddExperienceOpen(false)}>{t("buttons.cancel", "Cancel")}</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                if (!id) return;

                const databases = new Databases(appwriteClient);
                await databases.createDocument(
                  resources.databaseId,
                  resources.jobHistory,
                  ID.unique(),
                  newExperience
                );

                console.log("New experience submitted:", newExperience);
                setIsAddExperienceOpen(false);
              } catch (error) {
                console.error("Error submitting experience:", error);
              }
            }}
          >
            {t("buttons.submit", "Submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </Show>
  );
};
