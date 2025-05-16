import os
import json
import resend # Make sure the resend library is included in your function's dependencies
import datetime
import traceback # For detailed error logging
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException

# --- Essential Configuration ---
# These should be set as environment variables in your Appwrite function settings
APPWRITE_ENDPOINT = os.getenv("APPWRITE_FUNCTION_API_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_FUNCTION_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_FUNCTION_API_KEY") # API Key for server-side operations

DB_ID = os.getenv("APPWRITE_DATABASE_ID")
JOB_HISTORY_COLLECTION_ID = os.getenv("APPWRITE_JOB_HISTORY_ID")
SERVER_ACTIONS_COLLECTION_ID = os.getenv("APPWRITE_SERVER_ACTIONS_COLLECTION_ID") # New
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Constants
MAX_TASKS_PER_RUN = 5 # Process up to 5 tasks per cron execution
ACTION_TYPE_SEND_VERIFICATION_EMAIL = "SEND_VERIFICATION_EMAIL"
ACTION_TYPE_CONFIRM_EMPLOYMENT = "CONFIRM_EMPLOYMENT"

def validate_env_vars(context):
    """Validates that all necessary environment variables are set."""
    required_vars = {
        "APPWRITE_FUNCTION_API_ENDPOINT": APPWRITE_ENDPOINT,
        "APPWRITE_FUNCTION_PROJECT_ID": APPWRITE_PROJECT_ID,
        "APPWRITE_FUNCTION_API_KEY": APPWRITE_API_KEY,
        "APPWRITE_DATABASE_ID": DB_ID,
        "APPWRITE_JOB_HISTORY_ID": JOB_HISTORY_COLLECTION_ID,
        "APPWRITE_SERVER_ACTIONS_COLLECTION_ID": SERVER_ACTIONS_COLLECTION_ID,
        "RESEND_API_KEY": RESEND_API_KEY,
    }
    missing_vars = [name for name, value in required_vars.items() if not value]
    if missing_vars:
        error_message = f"Error: Missing environment variables: {', '.join(missing_vars)}"
        context.error(error_message)
        raise ValueError(error_message)
    return True

def _send_verification_email(context, databases, job_history_id_to_fetch):
    """
    Handles the logic for fetching job history and sending the verification email.
    Returns True on success, raises an exception on failure.
    """
    context.log(f"Fetching document from database '{DB_ID}', collection '{JOB_HISTORY_COLLECTION_ID}', document '{job_history_id_to_fetch}'")
    document = databases.get_document(
        database_id=DB_ID,
        collection_id=JOB_HISTORY_COLLECTION_ID,
        document_id=job_history_id_to_fetch
    )
    context.log(f"Result from get_document for job history: {document}")

    verifier_email_str = document.get("verifier_email")
    if not verifier_email_str:
        raise ValueError(f"Critical: Verifier email is missing for job history ID: {job_history_id_to_fetch}.")

    verification_message_str = document.get("verification_message") or "A candidate has requested employment verification."
    company_name_str = document.get("company_name") or "N/A"
    job_title_str = document.get("job_title") or "N/A"
    start_date_str = document.get("start_date") or "N/A"
    end_date_str = document.get("end_date") or "N/A"
    description_str = document.get("description") or "No additional description provided."
    current_year = datetime.datetime.now().year

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Employment Verification Request</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    body, table, td, a {{ -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }}
    table {{ border-collapse: collapse !important; }}
    body {{ height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4; padding: 20px; }}
    .container {{ background-color: #ffffff; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
    .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }}
    .header h1 {{ margin: 0; font-size: 24px; color: #007bff; }}
    .content p {{ margin: 15px 0; }}
    .content strong {{ color: #555555; }}
    .data-item {{ margin-bottom: 10px; padding-left: 10px; }}
    .data-item span {{ font-weight: bold; }}
    .footer {{ text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #777777; }}
    .footer p {{ margin: 5px 0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Employment Verification Request</h1></div>
    <div class="content">
      <p>Dear Recipient,</p>
     
      <p>Please verify the following employment details for a candidate:</p>
      <div class="data-item"><span>Company:</span> {company_name_str}</div>
      <div class="data-item"><span>Job Title:</span> {job_title_str}</div>
      <div class="data-item"><span>Employment Duration:</span> {start_date_str} to {end_date_str}</div>
      <div class="data-item"><span>Job Description:</span></div>
      <p style="padding-left: 10px;">{description_str}</p>
      <p>Your timely response is greatly appreciated.</p>
    </div>
    <div class="footer">
      <p>This email was sent from Zero ID.</p>
      <p>If you received this email in error, you can safely delete it. Please do not reply if you are not the intended recipient.</p>
      <p>&copy; {current_year} Zero ID. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
"""
    text_body = f"""
Dear Recipient,

{verification_message_str}

Please verify the following employment details for a candidate:

Company: {company_name_str}
Job Title: {job_title_str}
Employment Duration: {start_date_str} to {end_date_str}

Job Description: {description_str}

Your timely response is greatly appreciated.

---
This email was sent from Zero ID.
If you received this email in error, you can safely delete it. Please do not reply if you are not the intended recipient.
© {current_year} Zero ID. All rights reserved.
"""
    context.log(f"Preparing to send email to: {verifier_email_str} for job history {job_history_id_to_fetch}")
    params = {
        "from": "Zero ID <bryan@mail.rejections.fyi>",
        "to": [verifier_email_str],
        "subject": "[Zero ID] Please verify candidate's past employment",
        "html": html_body,
        "text": text_body,
    }

    email_response = resend.Emails.send(params)
    context.log(f"Resend API Response for job {job_history_id_to_fetch}: {email_response}")

    # resend-python raises an exception on failure, so if we reach here, it's likely a success.
    # Check if response has an ID, which is typical for success.
    if not (isinstance(email_response, dict) and email_response.get('id')):
        context.warn(f"Email send to {verifier_email_str} for job {job_history_id_to_fetch} may not have succeeded, response: {email_response}")
        # Depending on Resend's guarantees, you might still consider this a success or raise an error.
        # For now, we assume if no exception, it's okay.

    context.log(f"Verification email sent successfully for job history {job_history_id_to_fetch} to {verifier_email_str}.")
    return True


def main(context):
    try:
        validate_env_vars(context)
    except ValueError:
        # Error already logged by validate_env_vars
        return context.res.json({"status": "failure", "message": "Configuration error."}, status_code=500)

    # Initialize Appwrite Client
    client = Client()
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY) # Use API Key for server-side operations

    databases = Databases(client)
    resend.api_key = RESEND_API_KEY

    context.log("Cron job started: Looking for pending server actions.")
    context.log(f"Server Actions Collection ID: {SERVER_ACTIONS_COLLECTION_ID}")
    context.log(f"Job History Collection ID: {JOB_HISTORY_COLLECTION_ID}")
    context.log(f"Database ID: {DB_ID}")

    processed_count = 0
    failed_count = 0

    try:
        # Fetch pending actions
        pending_actions_response = databases.list_documents(
            database_id=DB_ID,
            collection_id=SERVER_ACTIONS_COLLECTION_ID,
            queries=[
                Query.equal("status", "pending"),
                Query.order_asc("$createdAt"), # Process oldest first
                Query.limit(MAX_TASKS_PER_RUN)
            ]
        )
        pending_actions = pending_actions_response['documents']

        if not pending_actions:
            context.log("No pending server actions found.")
            return context.res.json({"status": "success", "message": "No pending actions to process."})

        context.log(f"Found {len(pending_actions)} pending action(s) to process.")

        for action_doc in pending_actions:
            action_id = action_doc['$id']
            action_type = action_doc.get('action_type')
            payload_str = action_doc.get('payload')
            current_attempts = action_doc.get('attempts', 0)

            context.log(f"Processing action ID: {action_id}, Type: {action_type}, Attempts: {current_attempts}")

            try:
                # 1. Mark action as 'processing'
                databases.update_document(
                    database_id=DB_ID,
                    collection_id=SERVER_ACTIONS_COLLECTION_ID,
                    document_id=action_id,
                    data={
                        "status": "processing",
                        "attempts": current_attempts + 1,
                        "last_attempt_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                    }
                )

                # 2. Execute the action based on type
                if action_type == ACTION_TYPE_SEND_VERIFICATION_EMAIL:
                    if not payload_str:
                        raise ValueError("Payload is missing for SEND_VERIFICATION_EMAIL action.")
                    
                    payload = json.loads(payload_str)
                    job_history_id = payload.get("job_history_id")

                    if not job_history_id:
                        raise ValueError("'job_history_id' not found in payload.")

                    context.log(f"Executing SEND_VERIFICATION_EMAIL for job_history_id: {job_history_id}")
                    _send_verification_email(context, databases, job_history_id) # This will raise on error

                    # 3a. Mark as 'completed' on success
                    databases.update_document(
                        database_id=DB_ID,
                        collection_id=SERVER_ACTIONS_COLLECTION_ID,
                        document_id=action_id,
                        data={
                            "status": "completed",
                            "last_error": None # Clear any previous error
                        }
                    )
                    context.log(f"Action ID: {action_id} completed successfully.")
                    processed_count += 1
                else:
                    # Unknown action type
                    raise ValueError(f"Unknown action_type: {action_type}")

            except (AppwriteException, resend.exceptions.ResendError, json.JSONDecodeError, ValueError) as e:
                # 3b. Mark as 'failed' on error
                error_message = f"Error processing action {action_id}: {str(e)}. Type: {type(e).__name__}"
                context.error(error_message)
                context.error(traceback.format_exc()) # Log full traceback for debugging
                failed_count += 1
                try:
                    databases.update_document(
                        database_id=DB_ID,
                        collection_id=SERVER_ACTIONS_COLLECTION_ID,
                        document_id=action_id,
                        data={
                            "status": "failed",
                            "last_error": error_message[:2048] # Truncate if too long for DB field
                        }
                    )
                except AppwriteException as db_update_err:
                    context.error(f"CRITICAL: Failed to update action {action_id} status to 'failed' after error: {db_update_err}")
            except Exception as e: # Catch any other unexpected error
                error_message = f"Unexpected error processing action {action_id}: {str(e)}. Type: {type(e).__name__}"
                context.error(error_message)
                context.error(traceback.format_exc())
                failed_count += 1
                try:
                    databases.update_document(
                        database_id=DB_ID,
                        collection_id=SERVER_ACTIONS_COLLECTION_ID,
                        document_id=action_id,
                        data={
                            "status": "failed",
                            "last_error": error_message[:2048]
                        }
                    )
                except AppwriteException as db_update_err:
                     context.error(f"CRITICAL: Failed to update action {action_id} status to 'failed' after unexpected error: {db_update_err}")


        summary_message = f"Cron job finished. Processed: {processed_count}, Failed: {failed_count}."
        context.log(summary_message)
        return context.res.json({"status": "success", "message": summary_message})

    except AppwriteException as e:
        context.error(f"Appwrite error during cron job execution: {repr(e)}")
        context.error(traceback.format_exc())
        return context.res.json({"status": "failure", "message": f"Appwrite error: {e.message}"}, status_code=500)
    except Exception as e:
        context.error(f"An unexpected error occurred in cron job: {str(e)}")
        context.error(traceback.format_exc())
        return context.res.json({"status": "failure", "message": "An unexpected server error occurred."}, status_code=500)