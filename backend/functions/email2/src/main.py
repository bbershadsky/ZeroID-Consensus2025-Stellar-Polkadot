import os
import json
import resend # Make sure the resend library is included in your function's dependencies
import datetime # For current year
from appwrite.client import Client
from appwrite.services.users import Users # Not used in this version, but kept if needed later
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

# This Appwrite function will be executed every time your function is triggered
def main(context):
    # --- Essential Configuration ---
    api_endpoint = os.getenv("APPWRITE_FUNCTION_API_ENDPOINT")
    project_id = os.getenv("APPWRITE_FUNCTION_PROJECT_ID")
    # function_id = os.getenv("APPWRITE_FUNCTION_ID") # Not directly used in this logic

    db_id = os.getenv("APPWRITE_DATABASE_ID")
    job_history_collection_id = os.getenv("APPWRITE_JOB_HISTORY_ID")
    resend_api_key = os.getenv("RESEND_API_KEY") # For sending emails

    # --- Validate Core Configuration ---
    if not all([api_endpoint, project_id]):
        context.error("Error: Missing core Appwrite configuration (endpoint or project ID).")
        return context.res.json({"status": "failure", "message": "Server configuration error."}, status_code=500)

    if not db_id:
        context.error("Error: Environment variable APPWRITE_DATABASE_ID is not set.")
        return context.res.json({"status": "failure", "message": "APPWRITE_DATABASE_ID is not configured."}, status_code=500)

    if not job_history_collection_id:
        context.error("Error: Environment variable APPWRITE_JOB_HISTORY_ID is not set.")
        return context.res.json({"status": "failure", "message": "APPWRITE_JOB_HISTORY_ID is not configured."}, status_code=500)

    if not resend_api_key:
        context.error("Error: Environment variable RESEND_API_KEY is not set.")
        return context.res.json({"status": "failure", "message": "Email sending API key is not configured."}, status_code=500)

    # Initialize Appwrite Client
    client = Client().set_endpoint(api_endpoint).set_project(project_id)
    databases = Databases(client)

    # Initialize Resend API Key
    resend.api_key = resend_api_key

    context.log(f"Job History Collection ID: {job_history_collection_id}")
    context.log(f"Database ID: {db_id}")

    # --- Request Handling: Expect POST with job_history_id ---
    if context.req.method == "POST":
        job_history_id_to_fetch = None
        try:
            body = json.loads(context.req.body)
            job_history_id_to_fetch = body.get("job_history_id")
        except json.JSONDecodeError:
            context.error("Error: Could not parse request body as JSON.")
            return context.res.json({"status": "failure", "message": "Invalid JSON body."}, status_code=400)
        except Exception as e:
            context.error(f"Error processing request body: {str(e)}")
            return context.res.json({"status": "failure", "message": "Error processing request."}, status_code=400)

        if not job_history_id_to_fetch:
            context.error("Error: 'job_history_id' not provided in POST request body.")
            return context.res.json(
                {"status": "failure", "message": "Missing 'job_history_id'."}, # Changed from Unauthorized
                status_code=400 # Bad Request is more appropriate
            )

        context.log(f"Received job_history_id: {job_history_id_to_fetch} via POST request.")

        # --- Database Operation ---
        try:
            context.log(f"Fetching document from database '{db_id}', collection '{job_history_collection_id}', document '{job_history_id_to_fetch}'")
            document = databases.get_document(
                database_id=db_id,
                collection_id=job_history_collection_id,
                document_id=job_history_id_to_fetch
            )
            context.log(f"Result from get_document: {document}")

            # --- Extract data from the document with defaults ---
            verifier_email_str = document.get("verifier_email")
            # Ensure verifier_email exists, otherwise we can't send the email
            if not verifier_email_str:
                context.error(f"Critical: Verifier email is missing for job history ID: {job_history_id_to_fetch}. Cannot send email.")
                # Optionally, update the job history item status to reflect this error
                return context.res.json({
                    "status": "failure",
                    "message": "Verifier email missing in the job history record. Cannot send verification email.",
                }, status_code=400) # Bad request as the data is incomplete

            verification_message_str = document.get("verification_message") if document.get("verification_message") else "A candidate has requested employment verification."
            company_name_str = document.get("company_name") if document.get("company_name") else "N/A"
            job_title_str = document.get("job_title") if document.get("job_title") else "N/A"
            start_date_str = document.get("start_date") if document.get("start_date") else "N/A"
            end_date_str = document.get("end_date") if document.get("end_date") else "N/A"
            description_str = document.get("description") if document.get("description") else "No additional description provided."

            current_year = datetime.datetime.now().year

            # --- Prepare Email Content (HTML and Text) ---
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
    .header h1 {{ margin: 0; font-size: 24px; color: #007bff; /* Consider using your brand color */ }}
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
    <div class="header">
      <h1>Employment Verification Request</h1>
    </div>
    <div class="content">
      <p>Dear Recipient,</p>
      <p><strong>{verification_message_str}</strong></p>
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

Job Description:
{description_str}

Your timely response is greatly appreciated.

---
This email was sent from Zero ID.
If you received this email in error, you can safely delete it. Please do not reply if you are not the intended recipient.
© {current_year} Zero ID. All rights reserved.
"""
            context.log(f"Attempting to send email to: {verifier_email_str}")
            context.log(f"Company Name: {company_name_str}, Job Title: {job_title_str}")
            context.log(f"Duration: {start_date_str} to {end_date_str}")
            context.log(f"Message: {verification_message_str}")
            context.log(f"Description: {description_str}")


            # --- Send Email using Resend ---
            # For better deliverability:
            # 1. Ensure 'bryan@mail.rejections.fyi' is a verified sender in Resend.
            # 2. Configure SPF, DKIM, and DMARC records for 'mail.rejections.fyi' (or 'rejections.fyi')
            #    in your DNS settings to authorize Resend to send emails on your behalf.
            # 3. Keep content clear, concise, and avoid spam-trigger words.
            # 4. The inclusion of both HTML and Text parts is a good practice.
            params = {
                "from": "Zero ID <bryan@mail.rejections.fyi>", # Using a display name
                "to": [verifier_email_str], # 'to' expects a list of strings or a comma-separated string
                "subject": "[Zero ID] Please verify candidate's past employment",
                "html": html_body,
                "text": text_body,
                # Optional: Add headers like Reply-To if needed
                # "reply_to": "support@yourdomain.com",
                # Optional: Add tags for tracking in Resend
                # "tags": [
                #    {"name": "type", "value": "employment-verification"},
                #    {"name": "job_history_id", "value": job_history_id_to_fetch},
                # ]
            }

            email_response = resend.Emails.send(params)
            context.log(f"Resend API Response: {email_response}")

            # Check Resend response (basic check, consult Resend docs for detailed error handling)
            # resend-python v0.6.0 returns an object with an 'id' on success, or raises an exception.
            # If an exception wasn't raised by resend.Emails.send(), it's generally considered successful.

            return context.res.json({
                "status": "success",
                "message": "Verification email sent successfully.",
                "document_id": document.get("$id"),
                "resend_email_id": email_response.get('id') if isinstance(email_response, dict) else None
            })

        except AppwriteException as err:
            context.error(f"Appwrite database error while processing '{job_history_id_to_fetch}': {repr(err)}")
            if err.code == 404: # Document not found
                 return context.res.json({"status": "failure", "message": f"Job history item with ID '{job_history_id_to_fetch}' not found."}, status_code=404)
            return context.res.json({"status": "failure", "message": f"Database error: {err.message}"}, status_code=500)
        except resend.exceptions.ResendError as e: # Catch Resend specific errors
            context.error(f"Resend API error: {str(e)}")
            return context.res.json({"status": "failure", "message": f"Failed to send email: {str(e)}"}, status_code=502) # Bad Gateway or specific error
        except Exception as e:
            context.error(f"An unexpected error occurred: {str(e)}")
            # Log the full traceback for unexpected errors for better debugging
            import traceback
            context.error(traceback.format_exc())
            return context.res.json({"status": "failure", "message": "An unexpected server error occurred."}, status_code=500)

    elif context.req.path == "/ping" and context.req.method == "GET":
        return context.res.text("Pong")
    else:
        return context.res.json({"status": "failure", "message": "Invalid request method or path. Use POST with 'job_history_id' or GET /ping."}, status_code=405)

