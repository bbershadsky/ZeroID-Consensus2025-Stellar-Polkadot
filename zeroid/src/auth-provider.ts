import { AuthProvider } from "@refinedev/core";
import { account, server } from "./passkeys";
import { savePasskeyId, saveContractId, clearPasskeyId, clearContractId } from "./utils/storage";

// TODO: Import passkey-kit and Launchtube SDKs when installed
// import { PasskeyKit } from "passkey-kit";
// import { Launchtube } from "launchtube";

const APP_NAME = "ZeroID"; // Replace with your app name

/**
 * Passwordless authentication using passkey-kit.
 * Wallet provisioning using Launchtube after successful authentication.
 */

export const authProvider: AuthProvider = {
  login: async () => {
    try {
      const { keyIdBase64, contractId } = await account.connectWallet();
      savePasskeyId(keyIdBase64);
      saveContractId(contractId);
      return { success: true, redirectTo: "/" };
    } catch (e: any) {
      return {
        success: false,
        error: { message: e.message || "Passkey login error", name: "PasskeyLoginError" },
      };
    }
  },
  register: async () => {
    try {
      const { keyIdBase64, contractId, signedTx } = await account.createWallet(APP_NAME, "user123");
      if (!signedTx) throw new Error("built transaction missing");
      await server.send(signedTx);
      savePasskeyId(keyIdBase64);
      saveContractId(contractId);
      return { success: true, redirectTo: "/" };
    } catch (e: any) {
      return {
        success: false,
        error: { message: e.message || "Passkey registration error", name: "PasskeyRegisterError" },
      };
    }
  },
  logout: async () => {
    clearPasskeyId();
    clearContractId();
    return { success: true, redirectTo: "/login" };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    if (localStorage.getItem("contractId") && localStorage.getItem("passkeyId")) {
      return { authenticated: true };
    }
    return {
      authenticated: false,
      error: { message: "Check failed", name: "Session not found" },
      logout: true,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => null,
};

// TODO: Implement wallet provisioning with Launchtube after authentication
// async function provisionWalletIfNeeded() {
//   // Check if wallet exists for user in Launchtube
//   // If not, create one automatically (invisible to user)
//   // Optionally, store public key in backend
// }
