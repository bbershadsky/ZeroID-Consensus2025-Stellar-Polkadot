from appwrite.client import Client
from appwrite.services.users import Users
from appwrite.exception import AppwriteException
from appwrite.services.databases import Databases
import os

# This Appwrite function will be executed every time your function is triggered
def main(context):
    # --- Essential Configuration ---
    # Retrieve Appwrite endpoint and project ID (these are usually auto-provided)
    api_endpoint = os.getenv("APPWRITE_FUNCTION_API_ENDPOINT")
    project_id = os.getenv("APPWRITE_FUNCTION_PROJECT_ID")
    function_id = os.getenv("APPWRITE_FUNCTION_ID") # Auto-provided

    # Retrieve the API key from headers
    # It's good practice to check if it exists
    api_key = context.req.headers.get("x-appwrite-key")

    # Retrieve your custom environment variables
    # These MUST be set in your function's settings in the Appwrite console
    db_id = os.getenv("APPWRITE_DATABASE_ID")
    job_history_collection_id = os.getenv("APPWRITE_JOB_HISTORY_ID") # Assuming this is a Collection ID

    # --- Validate Configuration ---
    if not all([api_endpoint, project_id, api_key]):
        context.error("Error: Missing core Appwrite configuration (endpoint, project ID, or API key).")
        return context.res.json({"status": "failure", "message": "Server configuration error."}, status_code=500)

    if not db_id:
        context.error("Error: Environment variable APPWRITE_DATABASE_ID is not set.")
        # You might want to return an error response or handle this differently
        return context.res.json({"status": "failure", "message": "APPWRITE_DATABASE_ID is not configured."}, status_code=500)

    if not job_history_collection_id:
        context.error("Error: Environment variable APPWRITE_JOB_HISTORY_ID (expected as collection ID) is not set.")
        # You might want to return an error response or handle this differently
        return context.res.json({"status": "failure", "message": "APPWRITE_JOB_HISTORY_ID is not configured."}, status_code=500)

    client = (
        Client()
        .set_endpoint(api_endpoint)
        .set_project(project_id)
        .set_key(api_key)
    )

    users = Users(client)
    databases = Databases(client)

    # --- Logging (using retrieved variables safely) ---
    context.log(f"Job History Collection ID (from env var APPWRITE_JOB_HISTORY_ID): {job_history_collection_id}")
    context.log(f"Project ID: {project_id}")
    context.log(f"Function ID: {function_id}")
    context.log(f"Database ID (from env var APPWRITE_DATABASE_ID): {db_id}")

    # --- Database Operation ---
    try:
        context.log(f"Fetching document from database '{db_id}', collection '{job_history_collection_id}'")
        document_id_to_fetch = "68261c1a000945c303ea" 
        result = databases.get_document(
            database_id=db_id,
            collection_id=job_history_collection_id,
            document_id=document_id_to_fetch
        )
        context.log(f"Result from get_document: {result}")
        VERIFIER_EMAIL = result.get("verifier_email")
        VERIFICATION_MESSAGE = result.get("verification_message")
        COMPANY_NAME = result.get("company_name")
        JOB_TITLE = result.get("job_title")
        START_DATE = result.get("start_date")
        END_DATE = result.get("start_date")
        DESCRIPTION = result.get("description")

        


        # Result from get_document: {'candidate_id': '6824fe1700103f4978f3', 
        # 'company_name': 'microsoooftie', 
        # 'job_title': 'doer', 
        # 'start_date': '2025-05-15T17:20:31.728+00:00', 
        # 'end_date': '2025-05-15T17:20:31.728+00:00', 
        # 'is_current_job': None, 
        # 'description': 'did all the stuff', 
        # 'location': None,
        #  'employment_type': None, 
        #  'verifier_email': 'asd@asd.com', 
        #  'verification_message': 'pls verify me for hjob', 
        #  'verification_requested_at': '2025-05-15T20:00:49.600+00:00',
        #   'verification_status': 'VERIFICATION_SENT', 
        #   '$id': '68261c1a000945c303ea',
        #    '$createdAt': '2025-05-15T16:53:46.240+00:00',
        #     '$updatedAt': '2025-05-15T20:00:49.755+00:00', 
        #     '$permissions': ['read("any")', 'update("any")', 'delete("any")'], '$databaseId': '6824b79f00151762fd77', '$collectionId': '6824f92e000279960628'}

    except AppwriteException as err:
        context.error(f"Could not fetch document: {repr(err)}")
        # Optionally, you could return an error response here as well

    # --- User Listing (example operation) ---
    try:
        response = users.list()
        context.log(f"Total users: {response['total']}")
    except AppwriteException as err:
        context.error(f"Could not list users: {repr(err)}")

    # --- Request Handling ---
    if context.req.path == "/ping":
        return context.res.text("Pong")

    return context.res.json(
        {
            "status": "success",
            # You might want to include some data from your operations here
        }
    )