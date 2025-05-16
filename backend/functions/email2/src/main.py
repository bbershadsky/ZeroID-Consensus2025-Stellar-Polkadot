from appwrite.client import Client
from appwrite.services.users import Users
from appwrite.exception import AppwriteException
from appwrite.services.databases import Databases
import os
import resend
import json # Import the json library to parse the request body

# This Appwrite function will be executed every time your function is triggered
def main(context):
    # --- Essential Configuration ---
    api_endpoint = os.getenv("APPWRITE_FUNCTION_API_ENDPOINT")
    project_id = os.getenv("APPWRITE_FUNCTION_PROJECT_ID")
    function_id = os.getenv("APPWRITE_FUNCTION_ID")
    # api_key = context.req.headers.get("x-appwrite-key") # For server-side execution with API key
                                                      # For client-side, ensure user is authenticated

    db_id = os.getenv("APPWRITE_DATABASE_ID")
    job_history_collection_id = os.getenv("APPWRITE_JOB_HISTORY_ID")

    # --- Validate Core Configuration ---
    if not all([api_endpoint, project_id]): # API key might not be needed if function is called by authenticated user
        context.error("Error: Missing core Appwrite configuration (endpoint or project ID).")
        return context.res.json({"status": "failure", "message": "Server configuration error."}, status_code=500)

    if not db_id:
        context.error("Error: Environment variable APPWRITE_DATABASE_ID is not set.")
        return context.res.json({"status": "failure", "message": "APPWRITE_DATABASE_ID is not configured."}, status_code=500)

    if not job_history_collection_id:
        context.error("Error: Environment variable APPWRITE_JOB_HISTORY_ID is not set.")
        return context.res.json({"status": "failure", "message": "APPWRITE_JOB_HISTORY_ID is not configured."}, status_code=500)

    client = Client().set_endpoint(api_endpoint).set_project(project_id)

    # Decide on authentication method: API key or JWT (from client)
    # If this function is meant to be called by an end-user directly,
    # Appwrite automatically handles JWT. If it's server-to-server, API key is fine.
    # For this example, assuming API key for server-side or admin-like operations.
    # If called from client SDK after user login, client handles auth.
    # if api_key:
    #     client.set_key(api_key)
    # else:
    #     # If no API key, and this function requires auth, it might fail
    #     # or rely on the calling user's session if executed via client SDK.
    #     context.log("Warning: No API key provided. Assuming client-side authenticated execution or public access.")


    users = Users(client)
    databases = Databases(client)

    context.log(f"Job History Collection ID: {job_history_collection_id}")
    context.log(f"Database ID: {db_id}")

    # --- Request Handling: Expect POST with job_history_id ---
    if context.req.method == "POST":
        job_history_id_to_fetch = None
        try:
            # Attempt to parse the body as JSON
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
                {"status": "failure", "message": "Unauthorized: Missing 'job_history_id'."},
                status_code=401  # 401 Unauthorized
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

            # Extract data from the document
            # verifier_email = document.get("candidate")
            verifier_email = document.get("verifier_email")
            verification_message = document.get("verification_message")
            company_name = document.get("company_name")
            job_title = document.get("job_title")
            start_date = document.get("start_date")
            end_date = document.get("end_date") # Corrected from start_date
            description = document.get("description")

            # Example: send_verification_email(verifier_email, verification_message, company_name, job_title, ...)
            context.log(f"Verifier Email: {verifier_email}")
            context.log(f"Company Name: {company_name}")
            context.log(f"Duration: {start_date} to {end_date}")
            context.log(f"Job Title: {job_title}")
            context.log(f"Job desc: {description}")

            params: resend.Emails.SendParams = {
                "from": "bryan@mail.rejections.fyi",
                "to": verifier_email,
                "subject": "[Zero ID] Please verify our candidate's past employment",
                "html": "<strong>{verification_message}</strong>\n\nCompany: {company_name}\n\nJob Title: {job_title}\n\nDuration: {start_date} to {end_date}\n\nDescription: {description}",
                # "reply_to": "to@gmail.com",
                # "bcc": "bcc@resend.dev",
                # "cc": ["cc@resend.dev"],
                # "tags": [
                #     {"name": "tag1", "value": "tagvalue1"},
                #     {"name": "tag2", "value": "tagvalue2"},
                # ],
            }

            email: resend.Email = resend.Emails.send(params)
            context.log(email)


            return context.res.json({
                "status": "success",
                "message": "Document fetched and processed.",
                "document_id": document.get("$id"),
                "verifier_email": verifier_email # Example: return some data
            })

        except AppwriteException as err:
            context.error(f"Could not fetch document '{job_history_id_to_fetch}': {repr(err)}")
            if err.code == 404: # Document not found
                 return context.res.json({"status": "failure", "message": f"Job history item with ID '{job_history_id_to_fetch}' not found."}, status_code=404)
            return context.res.json({"status": "failure", "message": "Error accessing database."}, status_code=500)
        except Exception as e:
            context.error(f"An unexpected error occurred: {str(e)}")
            return context.res.json({"status": "failure", "message": "An unexpected server error occurred."})

    elif context.req.path == "/ping" and context.req.method == "GET": # Ensure ping is GET
        return context.res.text("Pong")
    else:
        # Handle other methods or paths if necessary
        return context.res.json({"status": "failure", "message": "Invalid request method or path. Please use POST with job_history_id or GET /ping."}, status_code=405)

