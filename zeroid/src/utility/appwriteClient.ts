import { Account, Appwrite, Storage } from "@refinedev/appwrite";

const APPWRITE_URL = import.meta.env.VITE_NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT = import.meta.env.VITE_APPWRITE_BUSINESS_PROJECT_ID;
const resources = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  employers: import.meta.env.VITE_APPWRITE_EMPLOYERS_ID,
  candidates: import.meta.env.VITE_APPWRITE_CANDIDATES_ID,
  jobHistory: import.meta.env.VITE_APPWRITE_JOB_HISTORY_ID,
  bucketFiles: import.meta.env.VITE_APPWRITE_BUCKET_FILES_ID,
} as const;
const appwriteClient = new Appwrite();


appwriteClient.setEndpoint(APPWRITE_URL).setProject(APPWRITE_PROJECT);
const account = new Account(appwriteClient);
const storage = new Storage(appwriteClient);

const getPrefs = async (id: string) => {
  try {
    const response = await account.getPrefs();
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};
const updatePrefs = async (prefs: Record<string, any>) => {
  try {
    const response = await account.updatePrefs(prefs);
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};
const updateName = async (name: string) => {
  try {
    const response = await account.updateName(name);
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error updating name:", error);
    throw error;
  }
};
const updateEmail = async (email: string, password: string) => {
  try {
    const response = await account.updateEmail(email, password);
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
};

export {
  appwriteClient,
  account,
  storage,
  resources,
  getPrefs,
  updatePrefs,
  updateName,
  updateEmail,
};
