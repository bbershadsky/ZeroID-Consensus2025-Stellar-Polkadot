import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
// import FormControlLabel from "@mui/material/FormControlLabel"; // Not used in the provided snippet for add experience
// import Checkbox from "@mui/material/Checkbox"; // Not used in the provided snippet for add experience
import { useGetIdentity, useShow, useList, useTranslate, BaseRecord } from "@refinedev/core";
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
  useTheme, // theme is not used directly in VerificationStatusDisplay but kept for CandidateShow
  Skeleton,
  // CardMedia, // Not used in the provided snippet
  Chip,
  // List, // Not used in the provided snippet
  // ListItem, // Not used in the provided snippet
  // ListItemIcon, // Not used in the provided snippet
  // ListItemText, // Not used in the provided snippet
  IconButton, // Added for the link icon
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
// import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"; // Not used
// import BusinessCenterIcon from "@mui/icons-material/BusinessCenter"; // Not used
import DateRangeIcon from "@mui/icons-material/DateRange";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from '@mui/icons-material/Work';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // For rejected status
import PendingActionsIcon from '@mui/icons-material/PendingActions'; // For pending status
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For verifier confirmed
import LinkIcon from '@mui/icons-material/Link'; // Added for the on-chain link

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useParams } from "react-router-dom";

import { useCardStyles } from "../../components/card-elevated";
// Import original IJobHistory and extend it for the new optional field
import { ICandidate, IIdentity, IJobHistory as OriginalJobHistory } from "../../interfaces";
import { appwriteClient, resources } from "../../utility";
import { JobVerificationRequestModal } from "../../components/order/form-modal";

// Extend IJobHistory to include the optional onchain_confirmation_block_hash
// This assumes that if a job is 'CONFIRMED_ONCHAIN', this field might be populated.
interface IJobHistory extends OriginalJobHistory {
  onchain_confirmation_block_hash?: string;
}

// Helper function to format dates
const formatDate = (date?: string | Date | null): string => {
  if (!date) return "N/A";
  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return parsedDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
    });
  } catch (e) {
    return date instanceof Date ? date.toString() : String(date);
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

// Helper component to display verification status and action button
const VerificationStatusDisplay: React.FC<{
  job: IJobHistory; // Use the extended IJobHistory interface
  onVerifyClick: (job: IJobHistory) => void; // Can remain OriginalJobHistory if preferred, but IJobHistory is safer
  translate: (key: string, defaultValue?: string) => string;
}> = ({ job, onVerifyClick, translate }) => {
  const status = job.verification_status;

  if (!status) {
    return (
      <Button
        onClick={() => onVerifyClick(job)}
        startIcon={<VerifiedUserIcon />}
        size="small"
        variant="outlined"
        sx={{ mt: 1.5 }}
      >
        {translate("buttons.verifyExperience", "Verify Experience")}
      </Button>
    );
  }

  let chipLabel = status;
  let chipColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
  let chipIcon: React.ReactElement | undefined = undefined;
  let onchainExplorerUrl: string | null = null;

  switch (status) {
    case "VERIFICATION_SENT":
      chipLabel = translate("jobHistory.status.pendingVerification", "Pending Verification");
      chipColor = "warning";
      chipIcon = <PendingActionsIcon fontSize="small" />;
      break;
    case "VERIFIED_BY_RECIPIENT":
      chipLabel = translate("jobHistory.status.verifierConfirmed", "Verifier Confirmed");
      chipColor = "info";
      chipIcon = <CheckCircleOutlineIcon fontSize="small" />;
      break;
    case "CONFIRMED_ONCHAIN":
      chipLabel = translate("jobHistory.status.confirmedOnChain", "Confirmed On-Chain");
      chipColor = "success";
      chipIcon = <VerifiedUserIcon fontSize="small" />;
      if (job.onchain_confirmation_block_hash) {
        onchainExplorerUrl = `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc2.paseo.popnetwork.xyz#/explorer/query/${job.onchain_confirmation_block_hash}`;
      }
      break;
    case "REJECTED_BY_RECIPIENT":
      chipLabel = translate("jobHistory.status.verificationRejected", "Verification Rejected");
      chipColor = "error";
      chipIcon = <ErrorOutlineIcon fontSize="small" />;
      break;
    default:
      chipLabel = translate("jobHistory.status.generic", `Status: ${status}`);
      chipColor = "default";
      break;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
      <Chip
        label={chipLabel}
        color={chipColor}
        size="small"
        icon={chipIcon}
      />
      {status === "CONFIRMED_ONCHAIN" && onchainExplorerUrl && (
        <IconButton
          aria-label={translate("jobHistory.actions.viewOnChain", "View On-Chain Confirmation")}
          size="small"
          onClick={() => window.open(onchainExplorerUrl!, '_blank', 'noopener,noreferrer')}
          sx={{
            ml: 0.5,
            color: '#E91E63', // Pink color
            '&:hover': {
              color: '#C2185B', // Darker pink on hover
            },
          }}
        >
          <LinkIcon fontSize="inherit" />
        </IconButton>
      )}
    </Box>
  );
};


export const CandidateShow = () => {
  const { id } = useParams<{ id: string }>();
  // const theme = useTheme(); // theme is not used
  const cardStyles = useCardStyles();
  const t = useTranslate();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const isLoggedIn = !!user;
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false); // For service ordering
  const [selectedJobHistoryForVerification, setSelectedJobHistoryForVerification] = useState<IJobHistory | null>(null); // Use extended IJobHistory
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false); // Changed from isModalOpen for clarity

  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);

  const handleOpenVerificationModal = (jobHistoryItem: IJobHistory) => { // Use extended IJobHistory
    setSelectedJobHistoryForVerification(jobHistoryItem);
    setIsVerificationModalOpen(true);
  };

  const handleCloseVerificationModal = () => {
    setSelectedJobHistoryForVerification(null);
    setIsVerificationModalOpen(false);
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
    id: id!, // id is asserted as non-null because this page requires it
  });
  const candidate = candidateDataResult?.data;

  // State for the "Add New Experience" dialog
  const [newExperience, setNewExperience] = useState<ResumeExperience>({
    candidate_id: candidate?.id ?? "", // Initialize with candidate ID if available
    company_name: "",
    job_title: "",
    start_date: "",
    end_date: "",
    is_current_job: false,
    description: "",
    location: "",
    employment_type: ""
  });

  // Effect to update candidate_id in newExperience when candidate data loads
  useEffect(() => {
    if (candidate) {
      setNewExperience(prev => ({ ...prev, candidate_id: candidate.id ?? "" }));
    }
  }, [candidate]);

  // --- Fetch Job History Data for this Candidate ---
  const {
    data: jobHistoryData,
    isLoading: isJobHistoryLoading,
    error: jobHistoryError,
    refetch: refetchJobHistory, // Added refetch function
  } = useList<IJobHistory & BaseRecord>({ // Ensure BaseRecord for $id, IJobHistory here refers to the extended one for potential new field
    resource: resources.jobHistory,
    filters: [
      {
        field: "candidate_id",
        operator: "eq",
        value: id,
      },
    ],
    queryOptions: {
      enabled: !!id,
    },
    pagination: {
      pageSize: 50, // Or manage pagination as needed
    }
  });
  const jobHistoryItems: (IJobHistory & BaseRecord)[] = jobHistoryData?.data || [];


  const isLoading = isCandidateLoading || (!!id && isJobHistoryLoading);

  // Console logs for debugging
  // console.log("Candidate Data:", candidate);
  // console.log("Job History Items:", jobHistoryItems);
  // console.log("Overall Loading State:", isLoading);


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
      <Grid container spacing={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Grid item xs={12} md={8}>
          <Card elevation={4}>
            <CardContent>
              <Skeleton variant="rectangular" height={200} animation="wave" sx={{ mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '2rem' }} animation="wave" width="70%" />
              <Skeleton variant="text" animation="wave" width="50%" />
              <Skeleton variant="text" animation="wave" width="40%" sx={{ mb: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', mt: 2 }} animation="wave" width="40%" />
        </Grid>
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

  const handleAddExperienceSubmit = async () => {
    try {
      if (!candidate?.id) { // Ensure candidate ID is present
        console.error("Candidate ID is missing for adding experience.");
        // Optionally, show a notification to the user
        return;
      }
      const experienceToSubmit = { ...newExperience, candidate_id: candidate.id };

      const databases = new Databases(appwriteClient);
      await databases.createDocument(
        resources.databaseId, // Make sure resources.databaseId is correctly defined
        resources.jobHistory,
        ID.unique(),
        experienceToSubmit
      );

      console.log("New experience submitted:", experienceToSubmit);
      setIsAddExperienceOpen(false);
      // Reset form or specific fields if needed
      setNewExperience({
        candidate_id: candidate.id, // Keep candidate_id
        company_name: "", job_title: "", start_date: "", end_date: "",
        is_current_job: false, description: "", location: "", employment_type: ""
      });
      refetchJobHistory(); // Refetch job history to show the new item
    } catch (error) {
      console.error("Error submitting experience:", error);
      // Optionally, show an error notification to the user
    }
  };


  return (
    <Show
      isLoading={isLoading} // This isLoading is for the main candidate data
      canDelete={isLoggedIn && user?.$id === candidate.userID}
      canEdit={isLoggedIn && user?.$id === candidate.userID}
    // WrapperProps={{ sx: { padding: { xs: 1, sm: 2, md: 3 } } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: { xs: 2, md: 0 }, mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {candidate.name}
        </Typography>
        {isLoggedIn && user?.$id === candidate.userID && ( // Only show Add Experience if it's the candidate's own profile
          <Button
            variant="outlined"
            onClick={() => setIsAddExperienceOpen(true)}
            startIcon={<WorkIcon />}
          >
            {t("buttons.addExperience", "Add Experience")}
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Candidate Details Card */}
        <Grid item xs={12} md={jobHistoryItems.length > 0 ? 7 : 12}> {/* Adjusted grid size */}
          <Card sx={cardStyles} elevation={4}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {t('candidates.fields.email', 'Email')}: {candidate.email}
              </Typography>

              {candidate.resume_file_id && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <Button
                    component={RouterLink}
                    // TODO: Update this link structure if your file viewing is different
                    to={`/files/view/${candidate.resume_file_id}`}
                    target="_blank"
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                  >
                    {t('candidates.fields.resume', 'View Resume')}
                  </Button>
                </Typography>
              )}

              <Chip
                label={`${t('candidates.fields.verificationStatus', 'Overall Status')}: ${candidate.verification_status || t('common.notVerified', 'Not Verified')}`}
                color={candidate.is_verified ? "success" : "default"}
                icon={candidate.is_verified ? <VerifiedUserIcon /> : undefined}
                size="small"
                sx={{ mb: 2 }}
              />

              {/* Service Offering Section */}
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
                    ${candidate.productPrice} {/* Consider currency formatting */}
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
          <Grid item xs={12} md={5}> {/* Adjusted grid size */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
              {t("jobHistory.title", "Work Experience")}
            </Typography>
            <Grid container spacing={2}>
              {jobHistoryItems.map((job) => (
                <Grid item xs={12} key={job.$id}>
                  <Card elevation={2} sx={{ height: '100%' }}>
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
                        <Chip label={job.employment_type} size="small" sx={{ mb: 1.5, mr: 1 }} variant="outlined" />
                      )}

                      {/* Verification Status Display */}
                      <VerificationStatusDisplay
                        job={job} // job is (OriginalJobHistory & BaseRecord), compatible with extended IJobHistory
                        onVerifyClick={handleOpenVerificationModal}
                        translate={t}
                      />

                      {job.description && (
                        <Typography variant="body2" paragraph sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }}>
                          {job.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>

      {/* Modals */}
      {selectedJobHistoryForVerification && candidate && ( // Ensure candidate is loaded for candidateName
        <JobVerificationRequestModal
          open={isVerificationModalOpen}
          onClose={handleCloseVerificationModal}
          // selectedJobHistoryForVerification is already IJobHistory (extended) & BaseRecord implicitly
          jobHistoryItem={selectedJobHistoryForVerification as (OriginalJobHistory & BaseRecord)}
          candidateId={candidate?.$id || ""} // Pass candidate ID
          candidateName={candidate?.name || ""} // Pass candidate name
        />
      )}

      <Dialog open={isAddExperienceOpen} onClose={() => setIsAddExperienceOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("jobHistory.addExperience", "Add New Experience")}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}> {/* Added padding top to content */}
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("jobHistory.fields.companyName", "Company Name")}
                value={newExperience.company_name}
                onChange={(e) => setNewExperience({ ...newExperience, company_name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("jobHistory.fields.jobTitle", "Job Title")}
                value={newExperience.job_title}
                onChange={(e) => setNewExperience({ ...newExperience, job_title: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("jobHistory.fields.startDate", "Start Date")}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newExperience.start_date}
                onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("jobHistory.fields.endDate", "End Date")}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newExperience.end_date}
                onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                fullWidth
              // Not required if is_current_job is true, handle validation if needed
              />
            </Grid>
            {/* TODO: Add is_current_job checkbox if needed */}
            <Grid item xs={12}>
              <TextField
                label={t("jobHistory.fields.location", "Location")}
                value={newExperience.location}
                onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("jobHistory.fields.employmentType", "Employment Type")}
                value={newExperience.employment_type}
                onChange={(e) => setNewExperience({ ...newExperience, employment_type: e.target.value })}
                fullWidth
                helperText={t("jobHistory.placeholders.employmentType", "e.g., Full-time, Part-time, Contract")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("jobHistory.fields.description", "Description")}
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={() => setIsAddExperienceOpen(false)}>{t("buttons.cancel", "Cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleAddExperienceSubmit}
          // TODO: Add loading state for this button if submission is slow
          >
            {t("buttons.submit", "Submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </Show>
  );
};