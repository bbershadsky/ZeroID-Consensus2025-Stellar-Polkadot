import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { useForm } from '@refinedev/react-hook-form';
import { Controller } from 'react-hook-form';
import CloseIcon from '@mui/icons-material/Close';
import { FieldError } from 'react-hook-form'; // Import FieldError from react-hook-form
import { SubmitHandler } from 'react-hook-form'; // Imported SubmitHandler from react-hook-form
import { useTranslate, HttpError } from '@refinedev/core';
import { FileDropzone } from '../../dropzone'; // Adjusted path to common dropzone location
import { resources } from '../../../utility'; // Adjusted path to common utility location

interface CandidateFormValues {
  name: string;
  email: string;
  resume_file_id?: string;
  resume_file_hash?: string;
  uploaded_at?: string;
  is_verified: boolean;
  verification_status: string;
}

interface CandidateDrawerFormProps {
  open: boolean;
  onClose: () => void;
  action: 'create' | 'edit';
  id?: string;
}

export const CandidateDrawerForm: React.FC<CandidateDrawerFormProps> = ({
  open,
  onClose,
  action,
  id,
}) => {
  const t = useTranslate();
  const mode = 'light'; // Fallback if ColorModeContext is not used/available
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFileDetails, setResumeFileDetails] = useState<{ id?: string, name?: string, url?: string }>({});

  const {
    refineCore: { onFinish, formLoading, queryResult },
    register,
    handleSubmit,
    control, // Type will be RHFControl<CandidateFormValues, any>
    setValue,
    formState: { errors },
    reset,
  } = useForm<CandidateFormValues, HttpError, CandidateFormValues>({ // Explicitly typing 3rd generic for mutation values
    defaultValues: {
      name: '',
      email: '',
      resume_file_id: '',
      resume_file_hash: '',
      uploaded_at: '',
      is_verified: false,
      verification_status: 'AWAITING_CONSENT',
    },
    refineCoreProps: {
      resource: resources.candidates,
      action: action,
      id: id,
      onMutationSuccess: () => {
        onClose();
        reset();
        setResumeFileDetails({}); // Also reset resume details
      },
      redirect: false,
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setResumeFileDetails({});
    }
  }, [open, reset]);

  useEffect(() => {
    if (action === 'edit' && queryResult?.data?.data) {
      const candidateData = queryResult.data.data as CandidateFormValues;
      setValue('name', candidateData.name);
      setValue('email', candidateData.email);
      setValue('resume_file_id', candidateData.resume_file_id);
      setValue('resume_file_hash', candidateData.resume_file_hash);
      setValue('is_verified', candidateData.is_verified);
      setValue('verification_status', candidateData.verification_status);
      setValue('uploaded_at', candidateData.uploaded_at); // Make sure to set uploaded_at if it's part of the data
      if (candidateData.resume_file_id) {
        setResumeFileDetails({ id: candidateData.resume_file_id, name: "Uploaded Resume" /* TODO: Get actual name if stored */ });
      }
    }
  }, [queryResult, action, setValue]);

  const handleResumeUpload = (fileUrl: string, fileId?: string, originalFilename?: string, fileHash?: string) => {
    if (fileId) {
      setValue('resume_file_id', fileId, { shouldValidate: true, shouldDirty: true });
      setResumeFileDetails({ id: fileId, name: originalFilename || 'resume.pdf', url: fileUrl });
    }
    if (fileHash) { // If your FileDropzone provides a hash
      setValue('resume_file_hash', fileHash, { shouldValidate: true, shouldDirty: true });
    }
    setValue('uploaded_at', new Date().toISOString(), { shouldValidate: false, shouldDirty: true });
  };

  const handleSetResumeFilename = (filename: string) => {
    console.log("Resume filename from dropzone:", filename);
    // If you need to store this original filename in the form, add a field to CandidateFormValues
    // and use setValue here. For now, it's just logged.
  };

  // Explicitly type the handler to match what handleSubmit expects after being typed by useForm
  const onSubmitHandler: SubmitHandler<CandidateFormValues> = async (data) => {
    setIsSubmitting(true);
    if (!data.uploaded_at && data.resume_file_id) {
      data.uploaded_at = new Date().toISOString();
    }
    data.is_verified = data.is_verified || false; // Ensure boolean
    data.verification_status = data.verification_status || 'AWAITING_CONSENT';

    try {
      await onFinish(data); // onFinish is from refineCore, expects CandidateFormValues
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to safely get error message string
  const getErrorMessage = (errorField: FieldError | undefined): string | undefined => {
    if (!errorField) return undefined;
    return typeof errorField.message === 'string' ? errorField.message : undefined;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400, md: 500 }, p: 2 } }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">
          {action === 'create'
            ? t('candidates.actions.create', 'Create Candidate')
            : t('candidates.actions.edit', 'Edit Candidate')}
        </Typography>
        <IconButton onClick={onClose} aria-label="close" disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </Box>

      {formLoading && action === 'edit' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <TextField
            {...register('name', {
              required: t('validation.required', { field: 'Name' }),
            })}
            label={t('candidates.fields.name', 'Full Name')}
            error={!!errors.name}
            helperText={getErrorMessage(errors.name)}
            fullWidth
            margin="normal"
            disabled={isSubmitting}
          />
          <TextField
            {...register('email', {
              required: t('validation.required', { field: 'Email' }),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('validation.email', 'Invalid email address'),
              },
            })}
            label={t('candidates.fields.email', 'Email Address')}
            type="email"
            error={!!errors.email}
            helperText={getErrorMessage(errors.email)}
            fullWidth
            margin="normal"
            disabled={isSubmitting}
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            {t('candidates.fields.resume', 'Resume')}
          </Typography>
          <input type="hidden" {...register('resume_file_id')} />
          <input type="hidden" {...register('resume_file_hash')} />
          <input type="hidden" {...register('uploaded_at')} />

          <FileDropzone
            bucketID={resources.bucketFiles} // Ensure bucketResumes is defined or use a fallback
            onFileUploaded={handleResumeUpload}
            setFilename={handleSetResumeFilename}
            imageURL={resumeFileDetails.url || ""}
            setImageURL={(url: string) => setResumeFileDetails(prev => ({ ...prev, url }))} // url should be string
          // Add a disabled prop to FileDropzone if needed: disabled={isSubmitting}
          />
          {resumeFileDetails.id && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('candidates.fields.uploadedResume', `Uploaded: ${resumeFileDetails.name || ''}`)}
            </Typography>
          )}
          {errors.resume_file_id && (
            <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              {getErrorMessage(errors.resume_file_id) || t('validation.required', { field: "Resume" })}
            </Typography>
          )}

          {action === 'edit' && (
            <>
              <FormControlLabel
                control={
                  <Controller
                    name="is_verified"
                    render={({ field: { onChange, onBlur, value, ref, name } }) => ( // Destructure all necessary field props
                      <Switch
                        checked={!!value} // Ensure value is boolean
                        onChange={(event, checked) => onChange(checked)} // Correctly pass boolean to RHF onChange
                        onBlur={onBlur}
                        inputRef={ref}
                        name={name}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                }
                label={t('candidates.fields.isVerified', 'Verified')}
                sx={{ mt: 1, display: 'block' }} // Ensure it takes full width or adjust as needed
                disabled={isSubmitting}
              />
              <TextField
                {...register('verification_status')}
                label={t('candidates.fields.verificationStatus', 'Verification Status')}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true, // Or make it a Select if admins can change it
                }}
                disabled={isSubmitting}
              />
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={onClose} sx={{ mr: 1 }} disabled={isSubmitting}>
              {t('buttons.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || (formLoading && action === 'edit')}>
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (action === 'create' ? t('buttons.create', 'Create') : t('buttons.save', 'Save Changes'))}
            </Button>
          </Box>
        </form>
      )}
    </Drawer>
  );
};
