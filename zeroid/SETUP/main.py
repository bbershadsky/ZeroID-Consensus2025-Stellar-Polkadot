import os
from dotenv import load_dotenv, dotenv_values 
from time import sleep
import time
from functools import wraps

# from random import randrange
# from sys import maxsize
from appwrite.client import Client
from appwrite.services.users import Users
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
# from appwrite.services.account import Account
from appwrite.services.functions import Functions
# from appwrite.input_file import InputFile
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.id import ID

def time_tracker(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()  # Record the start time
        result = func(*args, **kwargs)  # Call the function
        end_time = time.time()  # Record the end time
        print(f"{func.__name__} executed in {end_time - start_time:.4f} seconds.")
        return result
    return wrapper


load_dotenv()

# Helper method to print green colored output.
def p(info):
    print("\033[32;1m"+str(info)+"\033[0m")

client = Client()
client.set_endpoint(os.getenv('NEXT_PUBLIC_APPWRITE_ENDPOINT')) # Your API Endpoint
client.set_project(os.getenv('NEXT_PUBLIC_APPWRITE_PROJECT_ID')) # Your project ID
client.set_key(os.getenv('APPWRITE_API_KEY')) # Your secret API key

databases = Databases(client)
storage = Storage(client)
functions = Functions(client)
users = Users(client)

database_id = os.getenv("VITE_DATABASE_ID")
collection_id = os.getenv('VITE_APPWRITE_BUSINESS_COLLECTION_ID')
product_collection_id = os.getenv('APPWRITE_BUSINESS_PRODUCT_ID')
product_collection_name = os.getenv('APPWRITE_BUSINESS_PRODUCT_NAME')
document_id = None
user_id = None
bucket_id = os.getenv('APPWRITE_BUSINESS_BUCKET_ID')
bucket_name = os.getenv('APPWRITE_BUSINESS_BUCKET_NAME')

profile_image_bucket_id = os.getenv('VITE_APPWRITE_PROFILE_IMAGE_BUCKET_ID')
profile_image_bucket_name = os.getenv('VITE_APPWRITE_PROFILE_IMAGE_BUCKET_NAME')

file_id = None
document_id = None

users_collection_id = os.getenv('VITE_APPWRITE_USER_COLLECTION_ID')
users_collection_name = os.getenv('VITE_APPWRITE_USER_COLLECTION_NAME')

orders_collection_id = os.getenv('VITE_APPWRITE_BUSINESS_ORDERS_ID')
orders_collection_name = os.getenv('VITE_APPWRITE_BUSINESS_ORDERS_NAME')

lists_collection_id = os.getenv('VITE_APPWRITE_LIST_ID')
lists_collection_name = os.getenv('VITE_APPWRITE_LIST_NAME')

messages_collection_id = os.getenv('VITE_APPWRITE_MESSAGES_ID')
messages_collection_name = os.getenv('VITE_APPWRITE_MESSAGES_NAME')

quotes_collection_id = os.getenv('VITE_APPWRITE_QUOTES_ID')
quotes_collection_name = os.getenv('VITE_APPWRITE_QUOTES_NAME')

@time_tracker
def create_collection():
    global collection_id

    p("Running Business Create Collection API")
    # response = databases.create_collection(
    #     database_id,
    #     collection_id=ID.unique(),
    #     name=os.getenv('APPWRITE_BUSINESS_COLLECTION_NAME'),
    #     document_security=True,
    #     permissions=[
    #         Permission.read(Role.any()),
    #         Permission.create(Role.users()),
    #         Permission.update(Role.users()),
    #         Permission.delete(Role.users()),
    #     ]
    # )

    # collection_id = response['$id']
    # print(response)

    # response = databases.create_string_attribute(
    #     database_id,
    #     collection_id,
    #     key='name',
    #     size=255,
    #     required=True,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     collection_id,
    #     key='description',
    #     size=255,
    #     required=True,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     collection_id,
    #     key='languages',
    #     size=100,
    #     required=False,
    #     array=True,
    # )
    # print(response)
    response = databases.create_string_attribute(
        database_id,
        collection_id,
        key='payments',
        size=255,
        required=False,
        array=True,
    )
    print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     collection_id,
    #     key='currency',
    #     size=50,
    #     required=True,
    # )
    # print(response)

    # response = databases.create_boolean_attribute(
    #     database_id,
    #     collection_id,
    #     key='isPublic',
    #     required=True
    # )
    # print(response)

    # response = databases.create_email_attribute(
    #     database_id,
    #     collection_id,
    #     key='email',
    #     required=False,
    # )
    # print(response)

    # # Wait for attributes to be created
    # sleep(2)

    # response = databases.create_index(
    #     database_id,
    #     collection_id,
    #     key='name_email_idx',
    #     type="fulltext",
    #     attributes=['name', 'email']
    # )
    # print(response)

    # response = databases.create_string_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRName1',
    #         size=50,
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_url_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRURL1',
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_url_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRImageURL1',
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_string_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRName2',
    #         size=50,
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_url_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRURL2',
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_url_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRImageURL2',
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_string_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRName3',
    #         size=50,
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_url_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRURL3',
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_url_attribute(
    #         database_id,
    #         collection_id,
    #         key='QRImageURL3',
    #         required=False,
    #     )
    # print(response)

    # response = databases.create_string_attribute(
    #     database_id,
    #     collection_id,
    #     key='userID',
    #         size=20,
    #     required=True,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     collection_id,
    #     key='phone',
    #         size=50,
    #     required=True,
    # )
    # print(response)

    # response = databases.create_boolean_attribute(
    #     database_id,
    #     collection_id,
    #     key='isDeleted',
    #     required=False
    # )
    # print(response)
@time_tracker
def create_products_collection():
    global product_collection_id

    p("Running Create Product Collection API")
    response = databases.create_collection(
        database_id,
        collection_id= product_collection_id,
        name=product_collection_name,
        document_security=True,
        permissions=[
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
    )

    collection_id = response['$id']
    print(response)

    response = databases.create_boolean_attribute(
        database_id,
        product_collection_id,
        key='isActive',
        required=False
    )
    print(response)

    response = databases.create_string_attribute(
        database_id,
        product_collection_id,
        key='productName',
        size=255,
        required=True,
    )
    print(response)
    response = databases.create_string_attribute(
        database_id,
        product_collection_id,
        key='productDescription',
        size=255,
        required=False,
    )
    print(response)
    response = databases.create_string_attribute(
        database_id,
        product_collection_id,
        key='productSku',
        size=100,
        required=False,
    )
    print(response)
    response = databases.create_float_attribute(
        database_id,
        collection_id,
        key='productPrice',
        required=False,
        min=0.0,
        max=9999.99
    )
    print(response)
    response = databases.create_string_attribute(
        database_id,
        product_collection_id,
        key='productCategory',
        size=100,
        required=False,
    )
    print(response)
    response = databases.create_url_attribute(
            database_id,
            product_collection_id,
            key='productImageURL',
            required=False,
        )
    print(response)
    response = databases.create_integer_attribute(
        database_id,
        product_collection_id,
        key='UserID',
        required=False,
        min=0,
        max=999999
    )
    print(response)
    response = databases.create_float_attribute(
        database_id,
        product_collection_id,
        key='productQuantity',
        required=False,
        min=0.0,
        max=99999.99
    )
    print(response)
    response = databases.create_string_attribute(
        database_id,
        product_collection_id,
        key='businessID',
        size=20,
        required=False,
    )
    print(response)

@time_tracker
def create_users_collection():
    p("Running Create User Collection API")
    global users_collection_id

    # response = databases.create_collection(
    #     database_id,
    #     collection_id=users_collection_id,
    #     name=users_collection_name,
    #     document_security=True,
    #     permissions=[
    #         Permission.read(Role.any()),
    #         Permission.create(Role.users()),
    #         Permission.update(Role.users()),
    #         Permission.delete(Role.users()),
    #     ]
    # )

    # users_collection_id = response['$id']
    # print(response)

    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='name',
    #     size=255,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='description',
    #     size=255,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_email_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='email',
    #     required=False,
    # )
    # print(response)
    # response = databases.create_email_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='language',
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='payments',
    #     size=255,
    #     array=True,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='profilePhoto',
    #     size=255,
    #     required=False,
    # )
    # print(response)
    
    # response = databases.create_integer_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='votesUP',
    #     required=False,
    # )
    # print(response)
    # response = databases.create_integer_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='votesDN',
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='country',
    #     size=50,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='role',
    #     size=50,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='subscriptionPlan',
    #     size=50,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='address',
    #     size=255,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='phoneNumber',
    #     size=50,
    #     required=False,
    # )
    # print(response)

    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='preferredPaymentMethod',
    #     size=255,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     users_collection_id,
    #     key='userID',
    #     size=20,
    #     required=True,
    # )
    # print(response)
    response = databases.create_boolean_attribute(
        database_id,
        users_collection_id,
        key='isPrivate',
        required=False,
        default=False,
    )
    print(response)


@time_tracker
def create_storage_bucket():
    p("Running Create Product Collection Bucket API")

    global bucket_id, bucket_name

    storage = Storage(client)

    result = storage.create_bucket(
        bucket_id = bucket_id,
        name = bucket_name,
        permissions=[
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ],
        # permissions = ["read("any")"], # optional
        # file_security = False, # optional
        # enabled = False, # optional
        maximum_file_size = 1, # optional
        allowed_file_extensions = ['jpg', 'png', 'gif', 'jpeg',], # optional
        # compression = .NONE, # optional
        encryption = False, # optional
        antivirus = False # optional
        )
    print(result)

@time_tracker
def create_orders_collection():
    global orders_collection_id

    p("Running Create Order Collection API")
    # response = databases.create_collection(
    #     database_id,
    #     collection_id= orders_collection_id,
    #     name=orders_collection_name,
    #     document_security=True,
    #     permissions=[
    #         Permission.read(Role.any()),
    #         Permission.create(Role.users()),
    #         Permission.update(Role.users()),
    #         Permission.delete(Role.users()),
    #     ]
    # )

    # collection_id = response['$id']
    # print(response)

    # response = databases.create_boolean_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderComplete',
    #     required=False
    # )
    # print(response)

    # response = databases.create_boolean_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderisPaid',
    #     required=False
    # )
    # print(response)

    # response = databases.create_string_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderOwnerID',
    #     size=20,
    #     required=True,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderCustomerID',
    #     size=200,
    #     required=False,
    # )
    # print(response)


    # order_status_values = ["Pending", "Ready", "On The Way", "Delivered", "Cancelled"]
    # response = databases.create_enum_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderStatus',
    #     elements=order_status_values,
    #     required=False,
    #     # xrequired=False  # This is optional, set to True if the attribute must always have a value
    # )

    # print("Enum attribute created:", response)

    # response = databases.create_float_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderStatus',
    #     size=100,
    #     required=False,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderCode',
    #     required=False,
    #     size=74, #segwit
    # )
    # print(response)

    # response = databases.create_string_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderCurrency',
    #     required=False,
    #     size=74, #segwit
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderDescription',
    #     size=255,
    #     required=False,
    # )
    # print(response)

    # response = databases.create_string_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderNotes',
    #     size=255,
    #     required=False,
    # )
    # print(response)

    response = databases.create_string_attribute(
        database_id,
        orders_collection_id,
        key='orderFiles',
        size=255,
        required=False,
        array=True,
    )
    print(response)
   
    # response = databases.create_integer_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderOfferPrice',
    #     required=False,
    #     min=0,
    #     max=999999
    # )
    # print(response)
    # response = databases.create_integer_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderSalePrice',
    #     required=False,
    #     min=0,
    #     max=999999
    # )
    # print(response)
    # response = databases.create_integer_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderFinalPrice',
    #     required=False,
    #     min=0,
    #     max=999999
    # )
    # print(response)

    # response = databases.create_integer_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='UserID',
    #     required=False,
    #     min=0,
    #     max=999999
    # )
    # print(response)

    # response = databases.create_url_attribute(
    #         database_id,
    #         orders_collection_id,
    #         key='orderImageURL',
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_url_attribute(
    #         database_id,
    #         orders_collection_id,
    #         key='orderPaymentURL',
    #         required=False,
    #     )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     orders_collection_id,
    #     key='orderProductID',
    #     size=20,
    #     required=False,
    # )
    # print(response)


def create_lists_collection():
    # global lists_collection_id
    # response = databases.create_collection(
    # database_id=database_id,  # Your database ID
    # collection_id=lists_collection_id,  # A unique identifier for the collection
    # name=lists_collection_name,
    # document_security=True,  # Enable or disable document-level permissions
    # permissions=[
    #     Permission.read(Role.any()),
    #     Permission.create(Role.any()),
    #     Permission.update(Role.any()),
    #     Permission.delete(Role.any()),
    # ]
    # )

    # lists_collection_id = response['$id']
    # print(response)
    databases.create_string_attribute(
        database_id=database_id,
        collection_id=lists_collection_id,
        key='description',
        size=255,
        required=True
    )
    databases.create_boolean_attribute(
        database_id=database_id,
        collection_id=lists_collection_id,
        key='completed',
        required=True
    )
    databases.create_string_attribute(
        database_id=database_id,
        collection_id=lists_collection_id,
        key='creatorUserID',
        size=64,
        required=False
    )
    databases.create_string_attribute(
        database_id=database_id,
        collection_id=lists_collection_id,
        key='lastModifiedByUserID',
        size=64,
        required=False
    )
    databases.create_string_attribute(
        database_id=database_id,
        collection_id=lists_collection_id,
        key='imageURL',
        size=100,
        required=False
    )
    databases.create_string_attribute(
        database_id=database_id,
        collection_id=lists_collection_id,
        key='parentID',
        size=100,
        required=False
    )


@time_tracker
def create_messages_collection():
    
    global messages_collection_id

    # p("Running Create Message Collection API")
    # response = databases.create_collection(
    #     database_id,
    #     collection_id=messages_collection_id,
    #     name=messages_collection_name,
    #     document_security=True,
    #     permissions=[
    #         Permission.read(Role.any()),
    #         Permission.create(Role.any()),
    #         Permission.update(Role.users()),
    #         Permission.delete(Role.users()),
    #     ]
    # )

    # collection_id = response['$id']
    # print(response)

    # response = databases.create_boolean_attribute(
    #     database_id,
    #     # messages_collection_id,
    #     collection_id,
    #     key='readByOther',
    #     required=False,
    #     default=False,
    # )
    # print(response)


    # response = databases.create_string_attribute(
    #     database_id,
    #     # messages_collection_id,
    #     collection_id,
    #     key='ownerID',
    #     size=20,
    #     required=True,
    # )
    # print(response)
    # response = databases.create_string_attribute(
    #     database_id,
    #     messages_collection_id,
    #     # collection_id,
    #     key='text',
    #     size=255,
    #     required=True,
    # )
    # print(response)

    response = databases.create_string_attribute(
        database_id,
        messages_collection_id,
        # collection_id,
        key='senderName',
        size=100,
        required=False,
    )
    print(response)


@time_tracker
def create_profile_image_storage_bucket():
    p("Running Profile Image Bucket API")

    global profile_image_bucket_id, profile_image_bucket_name

    storage = Storage(client)

    result = storage.create_bucket(
        bucket_id = profile_image_bucket_id,
        name = profile_image_bucket_name,
        permissions=[
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ],
        # permissions = ["read("any")"], # optional
        # file_security = False, # optional
        # enabled = False, # optional
        maximum_file_size = 50000000, # optional
        allowed_file_extensions = ['jpg', 'png', 'gif', 'jpeg',], # optional
        # compression = .NONE, # optional
        encryption = False, # optional
        antivirus = False # optional
        )
    print(result)

@time_tracker
def create_quotes_collection():
    global quotes_collection_id

    p("Running Create Quotes Collection API")
    
    # Create Quotes collection
    response = databases.create_collection(
        database_id,
        collection_id=quotes_collection_id,
        name="Quotes",
        document_security=True,
        permissions=[
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ]
    )

    collection_id = response['$id']
    print(response)

    # Create attributes for Quotes collection
    attributes = [
        {"type": "string", "key": "title", "size": 255, "required": True},
        {"type": "string", "key": "author", "size": 255, "required": False},
        {"type": "string", "key": "ownerID", "size": 255, "required": False},
        {"type": "string", "key": "imageURL", "size": 255, "required": False},
        {"type": "integer", "key": "votesUP", "required": False},
        {"type": "integer", "key": "votesDN", "required": False},
    ]

    for attribute in attributes:
        if attribute["type"] == "string":
            response = databases.create_string_attribute(
                database_id,
                quotes_collection_id,
                key=attribute["key"],
                size=attribute["size"],
                required=attribute["required"],
            )
        elif attribute["type"] == "integer":
            response = databases.create_integer_attribute(
                database_id,
                quotes_collection_id,
                key=attribute["key"],
                required=attribute["required"],
            )
        print(response)


# create_collection()
# create_storage_bucket()
# create_users_collection()
# create_products_collection()
# create_orders_collection()
# create_lists_collection()
# create_messages_collection()
# create_profile_image_storage_bucket()
create_users_collection()
# create_quotes_collection()