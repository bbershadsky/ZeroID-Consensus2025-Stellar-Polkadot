import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Typography,
  Stack,
  DialogActions,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  useTranslate,
  useCreate,
  HttpError,
  useGetIdentity,
  BaseRecord,
} from "@refinedev/core";
import { IJobHistory, IIdentity } from "../../../interfaces"; // Ensure IJobHistory is correctly defined
import { resources } from "../../../utility"; // Ensure resources.verificationRequests is defined

// Interface for the verification request form
interface VerificationFormValues {
  verifierEmail: string;
  // You might add a custom message field if needed
  // customMessage?: string;
}

// Props for the modal
interface JobVerificationRequestModalProps {
  open: boolean;
  onClose: () => void;
  jobHistoryItem: IJobHistory & BaseRecord; // The specific job history item to verify
  candidateId: string; // The ID of the candidate to whom this job history belongs
  candidateName?: string; // Optional: Candidate's name for context
}

export const JobVerificationRequestModal: React.FC<JobVerificationRequestModalProps> = ({
  open,
  onClose,
  jobHistoryItem,
  candidateId,
  candidateName,
}) => {
  const t = useTranslate();
  const { data: user } = useGetIdentity<IIdentity | null>(); // Current logged-in user

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerificationFormValues>({
    defaultValues: {
      verifierEmail: "",
    },
  });

  const { mutate: createVerificationRequest, isLoading: isCreateLoading } =
    useCreate<BaseRecord>(); // Using BaseRecord as a generic for the verification request payload

  const onSubmit: SubmitHandler<VerificationFormValues> = async (data) => {
    if (!jobHistoryItem?.$id) {
      console.error("Job History ID is missing.");
      // Optionally, show a notification to the user
      return;
    }

    createVerificationRequest(
      {
        resource: resources.jobHistory, // IMPORTANT: Define this resource in your utility.ts and App.tsx
        values: {
          jobHistory_id: jobHistoryItem.$id, // Link to the job history item
          candidate_id: candidateId, // Link to the candidate
          verifier_email: data.verifierEmail,
          status: "PENDING_VERIFICATION", // Initial status
          requested_by_user_id: user?.$id, // ID of the user who initiated the request (optional)
          job_title: jobHistoryItem.job_title, // For context in the verification request record
          company_name: jobHistoryItem.company_name, // For context
          // custom_message: data.customMessage, // If you add a custom message field
          requested_at: new Date().toISOString(),
        },
      },
      {
        onError: (error: HttpError) => {
          console.error("Error creating verification request:", error);
          // Handle error notification, e.g., using useNotification
        },
        onSuccess: () => {
          reset();
          onClose();
          // Handle success notification
          // notify({ type: "success", message: t("verificationRequests.notifications.success") });
        },
      }
    );
  };

  // Helper to format dates
  const formatDateDisplay = (date?: string | Date | null): string => {
    if (!date) return "N/A";
    try {
      const parsedDate = typeof date === "string" ? new Date(date) : date;
      return parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    } catch (e) {
      return date instanceof Date ? date.toString() : String(date);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {t("verificationRequests.modalTitle", "Request Experience Verification")}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isSubmitting || isCreateLoading}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="h6">
              {t("verificationRequests.jobDetails", "Job Details:")}
            </Typography>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>{t("jobHistory.fields.jobTitle", "Job Title:")}</strong> {jobHistoryItem?.job_title || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t("jobHistory.fields.companyName", "Company:")}</strong> {jobHistoryItem?.company_name || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t("jobHistory.fields.dates", "Dates:")}</strong>{" "}
                {formatDateDisplay(jobHistoryItem?.start_date)} –{" "}
                {jobHistoryItem?.is_current_job
                  ? t("jobHistory.present", "Present")
                  : formatDateDisplay(jobHistoryItem?.end_date)}
              </Typography>
              {jobHistoryItem?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxHeight: 100, overflowY: 'auto' }}>
                  <strong>{t("jobHistory.fields.description", "Description:")}</strong> {jobHistoryItem.description}
                </Typography>
              )}
            </Box>

            {candidateName && (
              <Typography variant="body2" color="text.secondary">
                {t("verificationRequests.forCandidate", `This request is for candidate: ${candidateName}`)}
              </Typography>
            )}

            <Controller
              name="verifierEmail"
              control={control}
              defaultValue=""
              rules={{
                required: t("validation.required", { field: t("verificationRequests.fields.verifierEmail", "Verifier's Email") }),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("validation.email", "Invalid email address"),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("verificationRequests.fields.verifierEmail", "Verifier's Email Address")}
                  type="email"
                  variant="outlined"
                  error={!!errors.verifierEmail}
                  helperText={errors.verifierEmail?.message}
                  fullWidth
                  disabled={isSubmitting || isCreateLoading}
                />
              )}
            />
            {/*
            <Controller
              name="customMessage"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("verificationRequests.fields.customMessage", "Optional Message")}
                  variant="outlined"
                  multiline
                  rows={3}
                  fullWidth
                  disabled={isSubmitting || isCreateLoading}
                />
              )}
            />
            */}
            <Alert severity="info" sx={{ mt: 1 }}>
              {t("verificationRequests.info", "A verification request will be sent to the email address provided. Ensure you have their consent.")}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} disabled={isSubmitting || isCreateLoading}>
            {t("buttons.cancel", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            disabled={isSubmitting || isCreateLoading}
          >
            {isSubmitting || isCreateLoading
              ? <CircularProgress size={24} color="inherit" />
              : t("buttons.sendRequest", "Send Request")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
