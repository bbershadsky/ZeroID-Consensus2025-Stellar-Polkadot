export interface IEmployer {
  $id: string;
  id: string;
  userID: string;
  name: string;
  company_name: string;
  email?: string;
  imageURL: string;
  primary_email: string;
  verificationEmail1?: string;
  verificationEmail2?: string;
  verificationEmail3?: string;
}

export interface IJobHistory {
  $id: string;
  id: string;
  candidate_id: string;
  company_name: string;
  job_title: string;
  start_date: Date;
  end_date: Date;
  description: string;
  location: string;
  employment_type: string;
  is_current_job: boolean;
}

// export interface IOrder {
//   id: number;
//   user: IUser;
//   createdAt: string;
//   products: IProduct[];
//   status: IOrderStatus;
//   adress: IAddress;
//   store: IStore;
//   courier: ICourier;
//   events: IEvent[];
//   orderNumber: number;
//   amount: number;
// }

interface NavigationProps {
  to: {
    action: string;
    resource: string;
    id: string;
  };
}

export interface ICandidate {
  $id?: string;
  id?: string;
  isActive?: boolean;
  createdAt?: string;
  name?: string;
  email: string;
  resume_file_id: string;
  resume_file_hash: string;
  uploaded_at: string;
  is_verified: boolean;
  verification_status: string;
  first_verified_at: string;
  verification_notes: string;
}
import { BaseRecord } from "@refinedev/core";

export interface ICandidate extends BaseRecord {
  $id: string;
  createdAt: string;
  productName: string;
  productDescription: string;
  productPrice: number;
  productCategory: string | null;
  isActive: boolean;
  productImageURL: string | null;
}

interface ProductListTableProps {
  dataGrid: DataGridPropsType;
  categories: ICategory[];
  onEditProduct: (product: ICandidate) => void;
}

interface ProductListCardProps {
  dataGrid: DataGridPropsType;
  categories: ICategory[];
  onEditProduct: (product: ICandidate) => void;
}

export interface IOrder {
  orderComplete?: boolean;
  orderisPaid?: boolean; //todo should be capitalized
  orderOwnerID?: string;
  orderCustomerID?: string;
  orderStatus: OrderStatus;
  orderCode?: string;
  orderCurrency?: string;
  orderDescription?: string;
  orderNotes?: string;
  orderFiles?: string[];
  orderOfferPrice?: string;
  orderSalePrice?: number;
  orderFinalPrice?: string;
  orderImageURL?: string;
  orderPaymentURL?: string;
  orderProductID?: string;
  createdAt: string;
  $updatedAt: string;
  id: string;
  $id: string;
  $createdAt: string;
  products: ICandidate[];
  address: IAddress;
  store: IStore;
  courier: ICourier;
  user: IUser;
  events: IEvent[];
}

export interface IOrderAssets {
  $createdAt: string;
  orderID: string;
  file1: string;
  customerNotes: string;
}

export interface IMessage {
  $id?: string;
  id?: string;
  text: string;
  $createdAt?: string;
  ownerID: string;
  readByOther: boolean;
  destination: string;
  senderName: string;
  $modifiedAt?: string;
}

export interface IChatProps {
  destinationId: string;
}

enum OrderStatus {
  Pending = "Pending",
  Ready = "Ready",
  OnTheWay = "On The Way",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export interface IOrderStatus {
  count: number;
  status:
    | "waiting"
    | "ready"
    | "on the way"
    | "delivered"
    | "could not be delivered";
}

export interface IOrderChart {
  count: number;
  status:
    | "waiting"
    | "ready"
    | "on the way"
    | "delivered"
    | "could not be delivered";
}

export interface IOrderTotalCount {
  total: number;
  totalDelivered: number;
}

export interface ISalesChart {
  date: string;
  title: "Order Count" | "Order Amount";
  value: number;
}

export interface IOrderStatus {
  id: number;
  text: "Pending" | "Ready" | "On The Way" | "Delivered" | "Cancelled";
}

export interface IUser {
  id: string;
  name: string;
  description: string;
  email: string;
  language: string;
  payments: string[];
  profilePhoto: string;
  votesUP: number;
  votesDN: number;
  country: string;
  role: string;
  subscriptionPlan: string;
  address: string;
  phoneNumber: string;
  preferredPaymentMethod: string;
  createdAt: string;
  isActive: boolean;
  avatar: IFile[];
  addresses: IAddress[];
  userID: string; // ownerID
  isPrivate: boolean;
}

export interface IIdentity {
  $id: string;
  id: number;
  name: string;
  email: string;
  avatar: string;
  prefs: Array;
  description: string;
  address: string;
}

export interface UserPrefs {
  profileURL: string;
  language: string;
}

export interface IAddress {
  text: string;
  coordinate: [string | number, string | number];
}

export interface IFile {
  name: string;
  percent: number;
  size: number;
  status: "error" | "success" | "done" | "uploading" | "removed";
  type: string;
  uid: string;
  url: string;
  lastModified: number;
}
// export interface IFile {
//   lastModified?: number;
//   name: string;
//   percent?: number;
//   size: number;
//   status?: "error" | "success" | "done" | "uploading" | "removed";
//   type: string;
//   uid?: string;
//   url: string;
// }

export interface IEvent {
  date: string;
  status: string;
}

export interface IStore {
  id: number;
  gsm: string;
  email: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  address: IAddress;
  products: ICandidate[];
}

export interface ICategory {
  id: number;
  title: string;
  isActive: boolean;
}

export interface IOrderFilterVariables {
  q?: string;
  store?: string;
  user?: string;
  status?: string[];
}

export interface IUserFilterVariables {
  q: string;
  status: boolean;
  gender: string;
  isActive: boolean | string;
}

export interface ICourierStatus {
  id: number;
  text: "Available" | "Offline" | "On delivery";
}

export interface ICourier {
  id: number;
  name: string;
  surname: string;
  email: string;
  gender: string;
  gsm: string;
  createdAt: string;
  accountNumber: string;
  licensePlate: string;
  address: string;
  avatar: IFile[];
  store: IStore;
  status: ICourierStatus;
  vehicle: IVehicle;
}

export interface IPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  images: string;
  language: string;
  isPublic: boolean;
  description: string;
}

export interface IPostVariables {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  images: string;
}

export interface IReview {
  id: number;
  order: IOrder;
  user: IUser;
  star: number;
  createDate: string;
  status: "pending" | "approved" | "rejected";
  comment: string[];
}

export interface ITrendingProducts {
  id: number;
  product: ICandidate;
  orderCount: number;
}

export type IVehicle = {
  model: string;
  vehicleType: string;
  engineSize: number;
  color: string;
  year: number;
  id: number;
};

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export interface IPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  images: string;
  language: string;
  isPublic: boolean;
  description: string;
}

export interface IPostVariables {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  images: string;
}

export interface LanguageSelectorProps {
  languageMenuItems: LanguageItem[];
  changeLocale: (lang: string) => void;
  currentLocale: string;
}

export interface CurrencySelectorProps {
  currentCurrency?: string;
  onChange?: (event: SelectChangeEvent<string>) => void;
  view?: "label" | "symbol";
}

export interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

export interface ITodo {
  id: string; // Unique identifier for the todo item
  description: string; // Text description of the todo item
  completed: boolean; // Status of the todo item, whether it's completed or not
  userID?: string; // Optional user ID if the todo is associated with a user
  updatedAt?: Date; // Timestamp for when the todo was last updated
  lastModifiedByUserID?: Date;
  imageURL?: string;
  $createdAt: Date; // Timestamp for when the todo was created
  completedAt: Date;
  parentID: string;
  food_name: string;
  createdBy?: string;
}

export interface INote {
  noteId: string;
  title: string;
  dateModified: datetime;
  description: string;
  content: string;
}

export interface NotesResponse {
  noteId: Key | null | undefined;
  title: ReactNode;
  results: INote[];
}

export interface NoteListProps {
  onSelectNote: (noteId: string) => void;
}
export interface FoodItem {
  food_name: string;
  // tag_id: string;
}

export interface LanguageItem {
  key: string;
  label: string;
  flag: string;
}

// Define the props for components that will use the language items
export interface LanguageDisplayProps {
  currentLanguage: string;
}

export interface BusinessLanguagesDisplayProps {
  languages: string[];
  currentLanguage: string;
}

export interface IPaymentMethod {
  id: string;
  name: string;
  icon: string;
  details: boolean;
  qr: boolean;
}

export interface IQuote {
  id: string;
  $id: string;
  title: string;
  author: string;
  ownerID: string;
  imageURL?: string;
  votesUP: number;
  votesDN: number;
}

export interface ChatBubbleProps {
  message: IMessage;
  bubblesCentered?: boolean;
  bubbleStyles?: {
    userBubble?: React.CSSProperties;
    chatbubble?: React.CSSProperties;
    text?: React.CSSProperties;
  };
}
