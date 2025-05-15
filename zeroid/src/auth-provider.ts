import { AuthProvider } from "@refinedev/core";

import { account } from "./utility";
import { AppwriteException, ID } from "@refinedev/appwrite";

/**
 * We'll use the `account` instance to handle authentication.
 * This will be in sync with our appwrite client.
 */

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      await account.createSession(email, password);
      return {
        success: true,
        redirectTo: "/users/new",
      };
    } catch (e) {
      const { type, message, code } = e as AppwriteException;
      return {
        success: false,
        error: {
          message,
          name: `${code} - ${type}`,
        },
      };
    }
  },
  register: async ({ email, password }) => {
    try {
      const result = await account.create(ID.unique(), email, password);
      // console.log("register", result);
      return {
        success: true,
        // message: "Successfully registered",
        redirectTo: "/login",
      };
    } catch (e) {
      const { type, message, code } = e as AppwriteException;
      return {
        success: false,
        error: {
          message,
          name: `${code} - ${type}`,
        },
      };
    }
  },
  logout: async () => {
    try {
      await account.deleteSession("current");
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    try {
      const session = await account.get();

      if (session) {
        return {
          authenticated: true,
        };
      }
    } catch (error: any) {
      return {
        authenticated: false,
        error: error,
        logout: true,
        redirectTo: "/login",
      };
    }

    return {
      authenticated: false,
      error: {
        message: "Check failed",
        name: "Session not found",
      },
      logout: true,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const user = await account.get();

    if (user) {
      return user;
    }

    return null;
  },
};
