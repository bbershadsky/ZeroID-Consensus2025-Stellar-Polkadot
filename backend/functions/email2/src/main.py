import os
import json
import resend # Make sure the resend library is included in your function's dependencies
import datetime
import traceback # For detailed error logging
import hashlib # For SHA256 hashing

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException

# Attempt to import Polkadot related libraries
try:
    from dotenv import load_dotenv
    from substrateinterface import ContractInstance, Keypair, SubstrateInterface
    POLKADOT_LIBS_AVAILABLE = True
except ImportError:
    POLKADOT_LIBS_AVAILABLE = False
    SubstrateInterface = None
    Keypair = None
    ContractInstance = None
    load_dotenv = None


# --- Essential Configuration ---
APPWRITE_ENDPOINT = os.getenv("APPWRITE_FUNCTION_API_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_FUNCTION_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_FUNCTION_API_KEY")

DB_ID = os.getenv("APPWRITE_DATABASE_ID")
JOB_HISTORY_COLLECTION_ID = os.getenv("APPWRITE_JOB_HISTORY_ID")
SERVER_ACTIONS_COLLECTION_ID = os.getenv("APPWRITE_SERVER_ACTIONS_COLLECTION_ID")
RESEND_API_KEY = os.getenv("RESEND_API_KEY") # Uppercase global variable

# --- Polkadot Configuration ---
POLKADOT_CONTRACT_ADDRESS = os.getenv("POLKADOT_CONTRACT_ADDRESS")
POLKADOT_SUBSTRATE_URL = os.getenv("POLKADOT_SUBSTRATE_URL")
POLKADOT_KEYPAIR_ACCOUNT = os.getenv("POLKADOT_KEYPAIR_ACCOUNT")
POLKADOT_KEYPAIR_MNEMONIC = os.getenv('POLKADOT_KEYPAIR_MNEMONIC')
ENV = os.getenv('ENV', 'prod')

# --- Constants ---
MAX_TASKS_PER_RUN = 5
ACTION_TYPE_SEND_VERIFICATION_EMAIL = "SEND_VERIFICATION_EMAIL"
ACTION_TYPE_CONFIRM_EMPLOYMENT = "CONFIRM_EMPLOYMENT"

if load_dotenv:
    if os.path.exists(".env"):
        load_dotenv()
    elif os.path.exists(os.path.join(os.path.dirname(__file__), '.env')):
        load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))


def validate_env_vars(context):
    """Validates essential Appwrite environment variables for basic script operation."""
    required_appwrite_vars = {
        "APPWRITE_FUNCTION_API_ENDPOINT": APPWRITE_ENDPOINT,
        "APPWRITE_FUNCTION_PROJECT_ID": APPWRITE_PROJECT_ID,
        "APPWRITE_FUNCTION_API_KEY": APPWRITE_API_KEY,
        "APPWRITE_DATABASE_ID": DB_ID,
        "APPWRITE_JOB_HISTORY_ID": JOB_HISTORY_COLLECTION_ID,
        "APPWRITE_SERVER_ACTIONS_COLLECTION_ID": SERVER_ACTIONS_COLLECTION_ID,
    }
    
    missing_vars = [name for name, value in required_appwrite_vars.items() if not value]
    if missing_vars:
        error_message = f"Error: Missing essential Appwrite environment variables: {', '.join(missing_vars)}. Function cannot start."
        context.error(error_message)
        raise ValueError(error_message)

    if not RESEND_API_KEY:
        context.warn("Warning: RESEND_API_KEY is not set. SEND_VERIFICATION_EMAIL actions will fail if attempted.")
    
    if POLKADOT_LIBS_AVAILABLE:
        if not all([POLKADOT_CONTRACT_ADDRESS, POLKADOT_SUBSTRATE_URL, ENV]):
            context.warn("Warning: Core Polkadot ENV VARS (CONTRACT_ADDRESS, SUBSTRATE_URL, ENV) are not fully set. CONFIRM_EMPLOYMENT actions may fail.")
        # Further specific checks for keypair based on ENV are done within the action block
    elif not POLKADOT_LIBS_AVAILABLE:
        context.warn("Warning: Polkadot libraries (substrateinterface, python-dotenv) are not available. CONFIRM_EMPLOYMENT actions cannot be processed.")
    return True

def _send_verification_email(context, databases, job_history_id_to_fetch):
    """
    Handles the logic for fetching job history and sending the verification email.
    """
    context.log(f"Fetching document for email from database '{DB_ID}', collection '{JOB_HISTORY_COLLECTION_ID}', document '{job_history_id_to_fetch}'")
    document = databases.get_document(
        database_id=DB_ID,
        collection_id=JOB_HISTORY_COLLECTION_ID,
        document_id=job_history_id_to_fetch
    )
    # ... (rest of the email sending logic as before)
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
      <p><strong>{verification_message_str}</strong></p>
      <p>Please verify the following employment details for a candidate:</p>
      <div class="data-item"><span>Company:</span> {company_name_str}</div>
      <div class="data-item"><span>Job Title:</span> {job_title_str}</div>
      <div class="data-item"><span>Employment Duration:</span> {start_date_str} to {end_date_str}</div>
      <div class="data-item"><span>Job Description:</span></div>
      <p style="padding-left: 10px;">{description_str}</p>
      <p>Your timely response is greatly appreciated.</p>
      {""""""}
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

{""""""}

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

    if not (isinstance(email_response, dict) and email_response.get('id')):
        context.warn(f"Email send to {verifier_email_str} for job {job_history_id_to_fetch} may not have succeeded, response: {email_response}")

    context.log(f"Verification email sent successfully for job history {job_history_id_to_fetch} to {verifier_email_str}.")
    return True

def _store_hash_on_chain(context, hash_to_store):
    """
    Stores a given hash on the Polkadot chain.
    Returns a dictionary with 'extrinsic_hash' and 'block_hash' on success.
    """
    if not POLKADOT_LIBS_AVAILABLE:
        raise RuntimeError("Polkadot libraries are not available. Cannot call _store_hash_on_chain.")

    context.log(f"Attempting to store hash on chain: {hash_to_store.hex()}")
    substrate = SubstrateInterface(url=POLKADOT_SUBSTRATE_URL, type_registry_preset='substrate-node-template')
    context.log(f"Substrate interface initialized for URL: {POLKADOT_SUBSTRATE_URL}")

    if ENV == 'local':
        if not POLKADOT_KEYPAIR_ACCOUNT:
            raise ValueError("POLKADOT_KEYPAIR_ACCOUNT is not set for ENV=local")
        keypair = Keypair.create_from_uri(POLKADOT_KEYPAIR_ACCOUNT)
    elif ENV in ['dev', 'prod']:
        if not POLKADOT_KEYPAIR_MNEMONIC:
            raise ValueError(f"POLKADOT_KEYPAIR_MNEMONIC is not set for ENV={ENV}")
        keypair = Keypair.create_from_mnemonic(POLKADOT_KEYPAIR_MNEMONIC)
    else:
        raise ValueError(f'Invalid ENV value: {ENV}. Must be "local", "dev", or "prod".')

    contract_path = os.path.join(os.path.dirname(__file__), 'zid_contract.json')
    if not os.path.exists(contract_path):
        raise FileNotFoundError(f"Contract metadata file not found: {contract_path}.")
    
    contract = ContractInstance.create_from_address(
        substrate=substrate,
        contract_address=POLKADOT_CONTRACT_ADDRESS,
        metadata_file=contract_path
    )
    context.log(f'Successfully created contract instance for address: {POLKADOT_CONTRACT_ADDRESS}')
    
    receipt = contract.exec(keypair, 'store_verified_resume_data', args={'hash': hash_to_store})
    context.log(f"Contract exec submitted. Extrinsic hash: {receipt.extrinsic_hash if receipt else 'No receipt'}")
    
    if receipt and receipt.is_success:
        block_hash = receipt.block_hash if hasattr(receipt, "block_hash") else None
        context.log(
            f'Successfully stored hash on chain. '
            f'Extrinsic Hash: {receipt.extrinsic_hash}, '
            f'Block Hash: {block_hash}, '
            f'Contract Events: {receipt.contract_events if hasattr(receipt, "contract_events") else "N/A"}'
        )
        return {"extrinsic_hash": receipt.extrinsic_hash, "block_hash": block_hash}
    elif receipt:
        error_message = f"Failed to store hash on chain. Error: {receipt.error_message or 'Unknown error'}."
        if receipt.dispatch_error:
             error_message += f" Dispatch Error: {receipt.dispatch_error}"
        context.error(error_message)
        raise RuntimeError(error_message)
    else:
        raise RuntimeError("Contract execution did not return a receipt.")


def _handle_confirm_employment(context, databases, payload_str):
    """
    Handles the CONFIRM_EMPLOYMENT action: fetches job history, hashes data, stores on chain,
    and updates job history with confirmation details.
    Returns a dictionary with transaction details.
    """
    context.log("Executing CONFIRM_EMPLOYMENT action.")
    payload = json.loads(payload_str) # Assuming payload_str is validated before this call
    job_history_id = payload.get("job_history_id") # Assuming job_history_id is validated

    context.log(f"Fetching job history document ID: {job_history_id} for on-chain confirmation.")
    job_doc = databases.get_document(DB_ID, JOB_HISTORY_COLLECTION_ID, job_history_id)
    context.log(f"Retrieved job history document: {job_doc.get('$id')}")

    blob_data = {
        "document_id": job_doc.get("$id"), "job_title": job_doc.get("job_title"),
        "company_name": job_doc.get("company_name"), "start_date": job_doc.get("start_date"),
        "end_date": job_doc.get("end_date"), "description": job_doc.get("description"),
        "is_current_job": job_doc.get("is_current_job"),
        "verification_status": "CONFIRMED", # Will be set to CONFIRMED
        "verifier_email": job_doc.get("verifier_email"),
        "verification_confirmed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), # Confirmation time
        "verification_message": job_doc.get("verification_message"),
    }
    blob_text = json.dumps(blob_data, sort_keys=True, separators=(',', ':'))
    context.log(f"Constructed blob_text for hashing (first 100 chars): {blob_text[:100]}...")
    blob_hash_bytes = hashlib.sha256(blob_text.encode("utf-8")).digest()
    context.log(f"Hashed blob_text (bytes): {blob_hash_bytes.hex()}")

    onchain_result = _store_hash_on_chain(context, blob_hash_bytes)
    tx_hash = onchain_result.get("extrinsic_hash")
    block_hash = onchain_result.get("block_hash")
    
    update_data = {
        "onchain_confirmation_tx_hash": tx_hash,
        "onchain_confirmation_block_hash": block_hash, # New field
        "onchain_confirmed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "verification_status": "CONFIRMED" # Update status to CONFIRMED
    }
    try:
        databases.update_document(DB_ID, JOB_HISTORY_COLLECTION_ID, job_history_id, data=update_data)
        context.log(f"Updated job history {job_history_id} with on-chain details and status CONFIRMED. TxHash: {tx_hash}, BlockHash: {block_hash}")
    except AppwriteException as e:
        context.error(f"Failed to update job history {job_history_id} with on-chain details: {e}. Ensure attributes exist in collection.")
        # Depending on requirements, you might want to re-raise or handle this differently
        # For now, we log the error but consider the on-chain part successful if it reached here.

    return {"tx_hash": tx_hash, "block_hash": block_hash}


def main(context):
    try:
        validate_env_vars(context)
    except ValueError as e:
        return context.res.json({"status": "failure", "message": f"Initial configuration error: {str(e)}"}, 500)

    client = Client()
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    databases = Databases(client)

    if RESEND_API_KEY: 
        resend.api_key = RESEND_API_KEY

    context.log("Cron job started: Looking for pending server actions.")
    # ... (other logs)

    processed_count = 0
    failed_count = 0

    try:
        pending_actions_response = databases.list_documents(
            DB_ID, SERVER_ACTIONS_COLLECTION_ID,
            queries=[Query.equal("status", "pending"), Query.order_asc("$createdAt"), Query.limit(MAX_TASKS_PER_RUN)]
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
            action_result_details_str = None 

            context.log(f"Processing action ID: {action_id}, Type: {action_type}, Attempts: {current_attempts}")

            try:
                databases.update_document(
                    DB_ID, SERVER_ACTIONS_COLLECTION_ID, action_id,
                    data={
                        "status": "processing", "attempts": current_attempts + 1,
                        "last_attempt_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                    }
                )

                if action_type == ACTION_TYPE_SEND_VERIFICATION_EMAIL:
                    if not RESEND_API_KEY:
                        raise ValueError("RESEND_API_KEY not configured.")
                    if not payload_str: raise ValueError("Payload missing for SEND_VERIFICATION_EMAIL.")
                    payload = json.loads(payload_str)
                    job_history_id = payload.get("job_history_id")
                    if not job_history_id: raise ValueError("'job_history_id' missing in payload.")
                    _send_verification_email(context, databases, job_history_id)
                    action_result_details_str = "Email sent successfully."

                elif action_type == ACTION_TYPE_CONFIRM_EMPLOYMENT:
                    if not POLKADOT_LIBS_AVAILABLE:
                         raise RuntimeError("Polkadot libraries not available for CONFIRM_EMPLOYMENT.")
                    if not all([POLKADOT_CONTRACT_ADDRESS, POLKADOT_SUBSTRATE_URL, ENV]):
                        raise ValueError("Polkadot config (CONTRACT_ADDRESS, SUBSTRATE_URL, ENV) incomplete.")
                    if ENV == 'local' and not POLKADOT_KEYPAIR_ACCOUNT:
                        raise ValueError("POLKADOT_KEYPAIR_ACCOUNT required for ENV=local.")
                    if ENV in ['dev', 'prod'] and not POLKADOT_KEYPAIR_MNEMONIC:
                        raise ValueError(f"POLKADOT_KEYPAIR_MNEMONIC required for ENV={ENV}.")
                    if ENV not in ['local', 'dev', 'prod']:
                        raise ValueError(f"Invalid ENV value '{ENV}'.")
                    if not payload_str: raise ValueError("Payload missing for CONFIRM_EMPLOYMENT.")
                    
                    confirmation_details = _handle_confirm_employment(context, databases, payload_str)
                    action_result_details_str = f"Employment confirmed. TxHash: {confirmation_details.get('tx_hash')}, BlockHash: {confirmation_details.get('block_hash')}"
                    context.log(f"Action ID: {action_id} (CONFIRM_EMPLOYMENT) result: {action_result_details_str}")

                else:
                    raise ValueError(f"Unknown action_type: '{action_type}' for action ID: {action_id}")

                databases.update_document(
                    DB_ID, SERVER_ACTIONS_COLLECTION_ID, action_id,
                    data={"status": "completed", "last_error": None, "action_result_details": action_result_details_str}
                )
                context.log(f"Action ID: {action_id} completed. Details: {action_result_details_str}")
                processed_count += 1

            except (AppwriteException, json.JSONDecodeError, ValueError, RuntimeError, FileNotFoundError) as e:
                # Corrected NameError: Use RESEND_API_KEY (uppercase)
                resend_error_type = getattr(resend.exceptions, 'ResendError', None) if 'resend' in globals() and RESEND_API_KEY else None
                if resend_error_type and isinstance(e, resend_error_type):
                    error_message = f"Resend API error processing action {action_id} ({action_type}): {str(e)}. Type: {type(e).__name__}"
                else:
                    error_message = f"Error processing action {action_id} ({action_type}): {str(e)}. Type: {type(e).__name__}"
                
                context.error(error_message)
                context.error(traceback.format_exc())
                failed_count += 1
                try:
                    databases.update_document(
                        DB_ID, SERVER_ACTIONS_COLLECTION_ID, action_id,
                        data={ "status": "failed", "last_error": error_message[:2048] } # Ensure last_error attribute exists and has enough size
                    )
                except AppwriteException as db_update_err:
                    context.error(f"CRITICAL: Failed to update action {action_id} status to 'failed': {db_update_err}")
            except Exception as e: 
                error_message = f"Unexpected error processing action {action_id} ({action_type}): {str(e)}. Type: {type(e).__name__}"
                context.error(error_message)
                context.error(traceback.format_exc())
                failed_count += 1
                try:
                    databases.update_document(
                        DB_ID, SERVER_ACTIONS_COLLECTION_ID, action_id,
                        data={ "status": "failed", "last_error": error_message[:2048] }
                    )
                except AppwriteException as db_update_err:
                     context.error(f"CRITICAL: Failed to update action {action_id} status to 'failed': {db_update_err}")

        summary_message = f"Cron job finished. Processed: {processed_count}, Failed: {failed_count}."
        context.log(summary_message)
        return context.res.json({"status": "success", "message": summary_message, "processed": processed_count, "failed": failed_count})

    except AppwriteException as e:
        context.error(f"Appwrite error during cron job execution: {repr(e)}")
        context.error(traceback.format_exc())
        return context.res.json({"status": "failure", "message": f"Appwrite error: {e.message}"}, 500) # Corrected status code usage
    except Exception as e:
        context.error(f"An unexpected error occurred in cron job: {str(e)}")
        context.error(traceback.format_exc())
        # Corrected context.res.json call for Appwrite
        return context.res.json({"status": "failure", "message": f"An unexpected server error occurred: {str(e)}"}, 500)

