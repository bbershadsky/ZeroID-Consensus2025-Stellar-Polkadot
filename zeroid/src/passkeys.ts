import { PasskeyKit, PasskeyServer } from "passkey-kit";

export const account = new PasskeyKit({
    rpcUrl: import.meta.env.VITE_RPC_URL,
    networkPassphrase: import.meta.env.VITE_NETWORK_PASSPHRASE,
    walletWasmHash: import.meta.env.VITE_WALLET_WASM_HASH,
    timeoutInSeconds: 30,
});

export const server = new PasskeyServer({
    rpcUrl: import.meta.env.VITE_RPC_URL,
    launchtubeUrl: import.meta.env.VITE_LAUNCHTUBE_URL,
    launchtubeJwt: import.meta.env.VITE_LAUNCHTUBE_JWT,
}); 