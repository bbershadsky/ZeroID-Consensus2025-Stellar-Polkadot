import { AuthProvider } from "@refinedev/core";
import { account, server } from "./passkeys";
import { savePasskeyId, saveContractId, clearPasskeyId, clearContractId } from "./utils/storage";

// TODO: Import passkey-kit and Launchtube SDKs when installed
// import { PasskeyKit } from "passkey-kit";
// import { Launchtube } from "launchtube";

const APP_NAME = "ZeroID";
/**
 * Passwordless authentication using passkey-kit.
 * Wallet provisioning using Launchtube after successful authentication.
 */

// Utility to generate a random username: color-animal-number
const COLORS = [
  "red", "blue", "green", "yellow", "purple", "orange", "pink", "black", "white", "gray", "teal", "cyan", "magenta", "lime", "indigo", "violet"
];
const ANIMALS = [
  "lion", "tiger", "bear", "wolf", "fox", "eagle", "shark", "panda", "koala", "zebra", "giraffe", "leopard", "otter", "owl", "rabbit", "falcon", "goose"
];
function generateRandomUsername() {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${color}-${animal}-${number}`;
}

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
  // contractId is wallet address
  // store contract id and walletid
  register: async () => {
    try {
      const username = generateRandomUsername();
      const { keyIdBase64, contractId, signedTx } = await account.createWallet(APP_NAME, username);
      if (!signedTx) throw new Error("built transaction missing");
      const sendResult = await server.send(signedTx);
      console.log('server.send result:', sendResult);
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
