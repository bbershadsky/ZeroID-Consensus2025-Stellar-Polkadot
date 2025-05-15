export function savePasskeyId(id: string) {
  localStorage.setItem("passkeyId", id);
}

export function saveContractId(id: string) {
  localStorage.setItem("contractId", id);
}

export function clearPasskeyId() {
  localStorage.removeItem("passkeyId");
}

export function clearContractId() {
  localStorage.removeItem("contractId");
} 