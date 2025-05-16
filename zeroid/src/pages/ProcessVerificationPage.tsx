import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useUpdate,
    useCreate,
    useTranslate,
    HttpError,
    // BaseRecord, // Not explicitly used here, but good for type safety if IJobHistory extends it
    useNotification, // Corrected import for useNotification
} from '@refinedev/core';
import { Typography, Box, CircularProgress, Paper, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { resources } from '../utility'; // Assuming your resources are defined here
import { IJobHistory } from '../interfaces'; // Assuming your IJobHistory interface

// Define the structure of URL parameters
interface VerificationPageParams extends Record<string, string | undefined> {
    jobHistoryId: string;
    verificationAction: 'accept' | 'reject';
}

export const ProcessVerificationPage: React.FC = () => {
    const { jobHistoryId, verificationAction } = useParams<VerificationPageParams>();
    const navigate = useNavigate();

    // Correctly using useNotification hook
    // The 'open' function is typically destructured or accessed via the returned object.
    // If 'notify' itself is the function: notify({ type: 'success', ... })
    // If 'notify' is an object with an 'open' method: notify.open({ type: 'success', ... })
    // The provided code used notify.open?. which is a safe way to call if 'open' might be undefined.
    // For clarity, if useNotification returns { open, close }, we'd use: const { open: openNotification } = useNotification();
    // Sticking to the user's provided pattern:
    const notify = useNotification();
    const t = useTranslate();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { mutate: updateJobHistory, isLoading: isUpdateLoading } = useUpdate<IJobHistory>();
    const { mutate: createServerAction, isLoading: isCreateLoading } = useCreate();

    useEffect(() => {
        if (!jobHistoryId || !verificationAction) {
            setError(t('verificationProcess.errors.missingParams', 'Missing required information to process the request.'));
            setIsLoading(false);
            return;
        }

        if (verificationAction !== 'accept' && verificationAction !== 'reject') {
            setError(t('verificationProcess.errors.invalidAction', 'Invalid action specified.'));
            setIsLoading(false);
            return;
        }

        const processVerification = async () => {
            setIsLoading(true); // Ensure loading is true at the start of processing
            setError(null);
            setSuccessMessage(null);

            try {
                if (verificationAction === 'accept') {
                    // Step 1: Update Job History to "VERIFIED_BY_RECIPIENT"
                    await new Promise<void>((resolve, reject) => {
                        updateJobHistory(
                            {
                                resource: resources.jobHistory,
                                id: jobHistoryId,
                                values: {
                                    verification_status: 'VERIFIED_BY_RECIPIENT',
                                    verification_processed_at: new Date().toISOString(),
                                },
                            },
                            {
                                onSuccess: () => {
                                    notify.open?.({ // Using the pattern from user's code
                                        type: 'success',
                                        message: t('verificationProcess.notifications.jobHistoryUpdated', 'Job history status updated.'),
                                    });
                                    resolve();
                                },
                                onError: (updateError: HttpError) => {
                                    console.error('Error updating job history:', updateError);
                                    setError(
                                        t('verificationProcess.errors.updateFailed', `Failed to update job history: ${updateError.message}`)
                                    );
                                    reject(updateError);
                                },
                            }
                        );
                    });

                    // Step 2: Create a server action for on-chain confirmation
                    await new Promise<void>((resolve, reject) => {
                        createServerAction(
                            {
                                resource: resources.serverActions,
                                values: {
                                    action_type: 'CONFIRM_EMPLOYMENT',
                                    payload: JSON.stringify({ job_history_id: jobHistoryId }),
                                    status: 'pending',
                                    triggered_by: `VERIFIER_ACCEPTANCE_${jobHistoryId}`,
                                    attempts: 0,
                                },
                            },
                            {
                                onSuccess: () => {
                                    // **** UPDATED SUCCESS MESSAGE HERE ****
                                    setSuccessMessage(
                                        t('verificationProcess.success.updatingOnBlockchain', 'Updating on blockchain, thank you.')
                                    );
                                    notify.open?.({ // Using the pattern from user's code
                                        type: 'success',
                                        message: t('verificationProcess.notifications.confirmationQueued', 'On-chain confirmation process initiated.'),
                                        description: t('verificationProcess.notifications.blockchainUpdatePending', 'The details will be recorded on the blockchain shortly.')
                                    });
                                    resolve();
                                },
                                onError: (createError: HttpError) => {
                                    console.error('Error creating server action:', createError);
                                    setError(
                                        t('verificationProcess.errors.queueFailed', `Failed to queue for on-chain confirmation: ${createError.message}. Please contact support.`)
                                    );
                                    reject(createError);
                                },
                            }
                        );
                    });

                } else if (verificationAction === 'reject') {
                    // Update Job History to "REJECTED_BY_RECIPIENT"
                    await new Promise<void>((resolve, reject) => {
                        updateJobHistory(
                            {
                                resource: resources.jobHistory,
                                id: jobHistoryId,
                                values: {
                                    verification_status: 'REJECTED_BY_RECIPIENT',
                                    verification_processed_at: new Date().toISOString(),
                                },
                            },
                            {
                                onSuccess: () => {
                                    setSuccessMessage(
                                        t('verificationProcess.success.rejected', 'Thank you! The employment has been marked as not confirmed.')
                                    );
                                    notify.open?.({ // Using the pattern from user's code
                                        type: 'error', // Changed to 'error' or 'info' as it's a rejection
                                        message: t('verificationProcess.notifications.rejected', 'Employment verification rejected.'),
                                    });
                                    resolve();
                                },
                                onError: (updateError: HttpError) => {
                                    console.error('Error updating job history for rejection:', updateError);
                                    setError(
                                        t('verificationProcess.errors.rejectFailed', `Failed to process rejection: ${updateError.message}`)
                                    );
                                    reject(updateError);
                                },
                            }
                        );
                    });
                }
            } catch (e) {
                // This catch block handles errors if any promise in the try block is rejected
                // and not caught by its specific onError.
                if (!error) {
                    setError(t('verificationProcess.errors.unexpected', 'An unexpected error occurred during the process.'));
                }
                console.error("Overall processing error caught in useEffect:", e);
            } finally {
                setIsLoading(false);
            }
        };

        processVerification();
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [jobHistoryId, verificationAction]); // Removed other dependencies as they are stable or setters

    // Combined loading state for UI
    const displayLoading = isLoading || isUpdateLoading || isCreateLoading;

    if (displayLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <CircularProgress size={60} />
                <Typography sx={{ mt: 2 }}>
                    {t('verificationProcess.loading', 'Processing your request...')}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600, textAlign: 'center' }}>
                {successMessage && (
                    <>
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" component="h1" gutterBottom color="success.main">
                            {t('verificationProcess.headers.success', 'Success!')}
                        </Typography>
                        <Typography variant="body1">{successMessage}</Typography>
                    </>
                )}
                {error && (
                    <>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" component="h1" gutterBottom color="error.main">
                            {t('verificationProcess.headers.error', 'Error')}
                        </Typography>
                        <Typography variant="body1">{error}</Typography>
                    </>
                )}
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 3 }}
                >
                    {t('buttons.backToSite', 'Return to Site')}
                </Button>
            </Paper>
        </Box>
    );
};
