from appwrite.exception import AppwriteException


def main(context):

    try:
        context.log(dir(context.req))
        body = context.req.bodyJson or {}
        blob_text = body.get("blob_text", "")

        context.log(f"Received blob_text: {blob_text}")
        tx_hash = "0xef2e65640216c75332aac88cfd8beb1892b9150e3adbcf24c2ff2166c2d04dcb"
        result = {
            "status_code": 200,
            "submitted_value": blob_text,
            "tx_hash": tx_hash
        }

        return context.res.json(result)

    except AppwriteException as err:
        context.error("Appwrite error: " + repr(err))
        return context.res.json(
            {
                "error": "Appwrite-related issue occurred.",
                'status_code': 500
             }
        )
    except Exception as e:
        context.error("Unhandled error: " + str(e))
        return context.res.json(
            {
                "error": str(e),
                'status_code': 500
            }
        )