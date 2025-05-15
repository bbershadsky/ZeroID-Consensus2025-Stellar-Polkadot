import hashlib
import os

from appwrite.exception import AppwriteException
from dotenv import load_dotenv
from substrateinterface import ContractInstance, Keypair, SubstrateInterface


load_dotenv()

ENV = os.getenv('ENV')
IS_LOCAL = ENV == 'local'
IS_DEV = ENV == 'dev'

POLKADOT_CONTRACT_ADDRESS = os.environ["POLKADOT_CONTRACT_ADDRESS"]  # '5EXvxAcsG2asmQjGz...LRoJsag7kV9KMu1kR6q'
POLKADOT_SUBSTRATE_URL = os.environ["POLKADOT_SUBSTRATE_URL"]  # 'ws://127.0.0.1:9944'
POLKADOT_KEYPAIR_ACCOUNT = os.environ["POLKADOT_KEYPAIR_ACCOUNT"]  # '//Alice'
POLKADOT_KEYPAIR_MNEMONIC = os.environ['POLKADOT_KEYPAIR_MNEMONIC']  # "foo bar ... baz qux"


def store_hash_on_chain(hash, context):
    substrate = SubstrateInterface(
        url=POLKADOT_SUBSTRATE_URL,
        type_registry_preset='substrate-node-template'
    )

    if IS_LOCAL:
        keypair = Keypair.create_from_uri(POLKADOT_KEYPAIR_ACCOUNT)
    elif IS_DEV:
        keypair = Keypair.create_from_mnemonic(POLKADOT_KEYPAIR_MNEMONIC)
    else:
        raise Exception(f'Failed to load valid {ENV=}')

    contract_path = os.path.join(os.path.dirname(__file__), 'zid_contract.json')
    context.log(f'Creating contract instance from {contract_path=}...')

    contract = ContractInstance.create_from_address(
        substrate=substrate,
        contract_address=POLKADOT_CONTRACT_ADDRESS,
        metadata_file=contract_path
    )

    context.log(f'Successfully created {contract=}')

    result = contract.exec(
        keypair,
        'store_verified_resume_data',
        args={'hash': hash},
    )

    context.log(
        f'Successfully stored resume data, '
        f'{result.extrinsic_hash=}, '
        f'{result.block_hash=}, '
        f'{result.block_number=}, '
        f'{result.contract_address=}, '
        f'{result.is_success=}, '
        f'{result.contract_events=}, '
        f'{result.contract_metadata=}'
    )

    return result


def main(context):
    try:
        body = context.req.body_json or {}

        blob_text = body.get("blob_text", "")
        context.log(f"Received blob_text: {blob_text}")

        blob_hash = hashlib.sha256(blob_text.encode("utf-8")).digest()
        context.log(f"Hashed blob_text: {blob_hash}")

        result = store_hash_on_chain(blob_hash, context)

        tx_hash = result.extrinsic_hash
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
