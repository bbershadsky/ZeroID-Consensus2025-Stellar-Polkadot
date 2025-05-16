import React, { useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  useTranslate,
  useUpdate,
  useCreate, 
  HttpError,
  useGetIdentity,
  BaseRecord,
  useNotification,
} from "@refinedev/core";
import { IJobHistory, IIdentity } from "../../../interfaces"; 
import { resources } from "../../../utility";

// Interface for the verification request form values
interface VerificationFormValues {
  verifierEmail: string;
  customMessage?: string;
}

// Props for the modal
interface JobVerificationRequestModalProps {
  open: boolean;
  onClose: () => void;
  jobHistoryItem: (IJobHistory & BaseRecord) | null;
  candidateId: string;
  candidateName?: string;
}

export const JobVerificationRequestModal: React.FC<JobVerificationRequestModalProps> = ({
  open,
  onClose,
  jobHistoryItem,
  candidateId,
  candidateName,
}) => {
  const t = useTranslate();
  const { data: user } = useGetIdentity<IIdentity | null>();
  const { open: openNotification } = useNotification();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<VerificationFormValues>({
    defaultValues: {
      verifierEmail: jobHistoryItem?.verifier_email || "",
      customMessage: jobHistoryItem?.verification_message || "",
    },
  });

  // Hook to update the job history item
  const { mutate: updateJobHistory, isLoading: isUpdateLoading } =
    useUpdate<IJobHistory>();

  // Hook to create the server action for sending the email
  const { mutate: createServerAction, isLoading: isCreateServerActionLoading } =
    useCreate();

  // Reset form when jobHistoryItem changes or modal opens/closes
  useEffect(() => {
    if (open && jobHistoryItem) {
      reset({
        verifierEmail: jobHistoryItem.verifier_email || "",
        customMessage: jobHistoryItem.verification_message || "",
      });
    } else if (!open) {
      reset({ verifierEmail: "", customMessage: "" });
    }
  }, [open, jobHistoryItem, reset]);

  const onSubmit: SubmitHandler<VerificationFormValues> = async (data) => {
    if (!jobHistoryItem?.id) {
      console.error("Job History ID is missing.");
      openNotification?.({
        type: "error",
        message: t("verificationRequests.notifications.missingJobIdError", "Job History ID is missing."),
        description: t("common.errors.tryAgain", "Please try again or contact support."),
      });
      return;
    }

    const jobHistoryUpdatePayload = {
      verifier_email: data.verifierEmail,
      verification_message: data.customMessage,
      // Consider changing to "VERIFICATION_PENDING" or "VERIFICATION_QUEUED"
      // and have the backend update to "VERIFICATION_SENT" after successful email dispatch.
      verification_status: "VERIFICATION_SENT",
      verification_requested_by: user?.$id,
      verification_requested_at: new Date().toISOString(),
    };

    updateJobHistory(
      {
        resource: resources.jobHistory,
        id: jobHistoryItem.id,
        values: jobHistoryUpdatePayload,
      },
      {
        onError: (error: HttpError) => {
          console.error("Error updating job history for verification:", error);
          openNotification?.({
            type: "error",
            message: t("verificationRequests.notifications.updateError", "Failed to update job history."),
            description: error.message || t("common.errors.tryAgain", "Please try again."),
          });
        },
        onSuccess: () => {
          // Now that job history is updated, create the server action to send the email
          createServerAction(
            {
              // Assuming 'resources.serverActions' is defined in your utility.ts
              // If not, replace with the actual collection name string e.g., "server_actions"
              resource: resources.serverActions,
              values: {
                action_type: "SEND_VERIFICATION_EMAIL",
                payload: JSON.stringify({ job_history_id: jobHistoryItem.id }),
                status: "pending", // Will be picked up by the cron job
                triggered_by: "user",
                // triggered_by: user?.$id,
                attempts: 0,
              },
            },
            {
              onError: (error: HttpError) => {
                console.error("Error creating server action for email verification:", error);
                openNotification?.({
                  type: "error",
                  message: t("verificationRequests.notifications.queueError", "Failed to queue verification email."),
                  description: error.message || t("common.errors.tryAgain", "The job history was updated, but queuing the email failed. Please contact support or try again."),
                });
                // Note: Job history was updated, but email queuing failed.
                // You might want to implement a retry mechanism or guide the user.
              },
              onSuccess: () => {
                openNotification?.({
                  type: "success",
                  message: t("verificationRequests.notifications.success", "Verification request submitted successfully! The email will be sent shortly."),
                });
                onClose(); // Close modal only after both operations are successful
              },
            }
          );
        },
      }
    );
  };

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

  // Combined loading state
  const isLoading = isFormSubmitting || isUpdateLoading || isCreateServerActionLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {t("verificationRequests.modalTitle", "Request Experience Verification")}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isLoading}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {!jobHistoryItem ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>
              {t("verificationRequests.errors.noJobHistorySelected", "No job history item selected or data is invalid.")}
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Typography variant="h6">
                {t("verificationRequests.jobDetails", "Job Details to Verify:")}
              </Typography>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'action.hover' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{t("jobHistory.fields.jobTitle", "Job Title:")}</strong> {jobHistoryItem.job_title || "N/A"}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>{t("jobHistory.fields.companyName", "Company:")}</strong> {jobHistoryItem.company_name || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t("jobHistory.fields.dates", "Dates:")}</strong>{" "}
                  {formatDateDisplay(jobHistoryItem.start_date)} –{" "}
                  {jobHistoryItem.is_current_job
                    ? t("jobHistory.present", "Present")
                    : formatDateDisplay(jobHistoryItem.end_date)}
                </Typography>
                {jobHistoryItem.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxHeight: 100, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    <strong>{t("jobHistory.fields.description", "Description:")}</strong> {jobHistoryItem.description}
                  </Typography>
                )}
              </Box>

              {candidateName && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {t("verificationRequests.forCandidate", `This experience is part of ${candidateName}'s profile.`)}
                </Typography>
              )}

              <Controller
                name="verifierEmail"
                control={control}
                rules={{
                  required: t("validation.requiredRule", { field: t("verificationRequests.fields.verifierEmail", "Verifier's Email") }),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("validation.emailRule", "Invalid email address"),
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
                    disabled={isLoading}
                  />
                )}
              />

              <Controller
                name="customMessage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("verificationRequests.fields.customMessage", "Optional Message to Verifier")}
                    variant="outlined"
                    multiline
                    rows={3}
                    fullWidth
                    disabled={isLoading}
                    placeholder={t("verificationRequests.placeholders.customMessage", "e.g., Please confirm my role and dates of employment.")}
                  />
                )}
              />

              <Alert severity="info" sx={{ mt: 1 }}>
                {t("verificationRequests.info", "An email will be sent to the verifier.")}
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} disabled={isLoading}>
            {t("buttons.cancel", "Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            disabled={isLoading || !jobHistoryItem}
          >
            {isLoading
              ? <CircularProgress size={24} color="inherit" />
              : t("buttons.sendRequest", "Send Verification Request")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
