import hashlib
import os

from appwrite.exception import AppwriteException
from dotenv import load_dotenv
from substrateinterface import ContractInstance, Keypair, SubstrateInterface


load_dotenv()


POLKADOT_CONTRACT_ADDRESS = os.environ["POLKADOT_CONTRACT_ADDRESS"]  # '5EXvxAcsG2asmQjGz...LRoJsag7kV9KMu1kR6q'
POLKADOT_SUBSTRATE_URL = os.environ["POLKADOT_SUBSTRATE_URL"]  # 'ws://127.0.0.1:9944'
POLKADOT_KEYPAIR_ACCOUNT = os.environ["POLKADOT_KEYPAIR_ACCOUNT"]  # '//Alice'


def store_hash_on_chain(hash): ...


def main(context):

    try:
        body = context.req.body_json or {}

        blob_text = body.get("blob_text", "")
        context.log(f"Received blob_text: {blob_text}")

        blob_hash = hashlib.sha256(blob_text.encode("utf-8")).digest()
        context.log(f"Hashed blob_text: {blob_hash}")

        tx_hash = "0xef2e65640216c75332aac88cfd8beb1892b9150e3adbcf24c2ff2166c2d04dcb"
        result = {"status_code": 200, "submitted_value": blob_text, "tx_hash": tx_hash}

        return context.res.json(result)

    except AppwriteException as err:
        context.error("Appwrite error: " + repr(err))
        return context.res.json(
            {"error": "Appwrite-related issue occurred.", "status_code": 500}
        )
    except Exception as e:
        context.error("Unhandled error: " + str(e))
        return context.res.json({"error": str(e), "status_code": 500})
