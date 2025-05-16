# ✅ ZeroID: Instant blockchain-powered background checks.

<div>
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="next.js" />
    <img src="https://img.shields.io/badge/-Appwrite-black?style=for-the-badge&logoColor=white&logo=appwrite&color=FD366E" alt="appwrite" />
    <img src="https://img.shields.io/badge/-Typescript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Refine-black?style=for-the-badge&logoColor=white&logo=refine&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Polkadot-black?style=for-the-badge&logoColor=white&logo=polkadot&color=FD366E" alt="polkadot" />
    <img src="https://img.shields.io/badge/-stellar-black?style=for-the-badge&logoColor=white&logo=stellar&color=blue" alt="polkadot" />
  </div>

ZeroID is a decentralized identity verification platform that provides instant, secure, and tamper-proof background checks using blockchain technologies such as Stellar and Polkadot. 

Video Explanation Below:
  [![Instant Background Checks on the Blockchain](http://img.youtube.com/vi/d9nJv8kOYUs/0.jpg)](http://www.youtube.com/watch?v=d9nJv8kOYUs "ZeroID")

![Sign Up Page](https://i.imgur.com/k9DcuQB.png)
![Dashboard](https://i.imgur.com/ltd8LbX.png)
![Candidate View](https://i.imgur.com/PwIuMN1.png)
![Verification View](https://i.imgur.com/ilv8k9a.png)

---

## 🛠 Component 1: `VerifiedResumeDataManager.contract` [🔗](https://contracts.onpop.io/contract/16Agz1dvcmvExp63zoSVaPF3iZrdpAeTs8epZhhcKkjt4H9F)

### Purpose:
Manages hashed resume data (e.g., company, bullet points) for instant, secure, tamper-proof verification.

### Key Functions:
- `pub fn store_verified_resume_data(&mut self, hash: [u8; 32]) `:  
  Adds a new event secret and links it to an IPFS metadata URI. Enables infinite event expansion without redeployments.

- `pub fn get_verified_resume_data(&self) -> [u8; 32]`:  
  Verifies if the secret is valid, ensures the wallet has not used it yet, marks it as used, and returns the metadata URI for minting.

### Security:
- Resume data (e.g., company, bullet points) are **hashed off-chain** (SHA-256 or similar) before storage.
- No plain-text secrets are stored on-chain, preventing scanning/cheating.

---

## 🛠 Component 2: `StellarSmartContract` [🔗]()

### Purpose:
TODO:

### Key Functions:
- TODO
- TODO

### Security:
- TODO

---
## 🛠 Component 3: `Stellar Soroban NFT` [🔗]()

### Purpose:
TODO:

### Key Features:
- TODO
- TODO

---

## 🛠 Component 4: `Stellar Passkey`

### Purpose:
Manages the creation and handling of passkeys for secure access and digital identity verification.

## 🔒 Key Features

### **Secure Authentication**
- Stellar Passkeys provide a robust mechanism for user authentication by replacing traditional passwords with secure cryptographic keys, making it more resistant to phishing, brute-force attacks, and credential stuffing.

### **Private Key Storage**
   - The private keys associated with Stellar Passkeys are never exposed or stored on centralized servers, reducing the risk of data breaches. They are securely stored on the user's device or wallet.

### **Cryptographic Signature Validation**
   - Each passkey transaction is validated using strong cryptographic signatures, ensuring the authenticity of the request and confirming that only the rightful user can authorize actions tied to the passkey.

### **Decentralized Control**
   - The management of passkeys is decentralized, with the authority to generate or update passkeys being transferred to an authorized manager (e.g., Router contract) after deployment, preventing centralized control and reducing the risk of single points of failure.

### **Access Control**
   - Passkey generation and management are tightly controlled, with minting rights and management authority being limited to designated entities, ensuring only authorized users can interact with the system.

---
## ✈️ Current Industry User Journey

1. Employer signs ups using Stellar passkey.
2. Employer adds candidate into dashboard.
3. Employer adds candidate work history.
4. Employer clicks Verify Experience button.
5. ZeroID sends email to candidate's old employer.
6. Old employers verifies candidate employment.
7. ZeroID updates work experience as verified.

## 🚀 Future User Journey
1. Employer signs ups using Stellar passkey.
2. Employer adds candidate into dashboard.
3. Employer clicks Verify Experience button.
4. ZeroID pulls verified credentials from the blockchain.
---

## ✅ Final Summary

This on-chain technical architecture ensures that:
- Employment verifications are tamper-proof with Polkadot's ink! smart contracts. 
- User logins are seamless and secure with Stellar's passkeys.

---
## Relevant Links

- Blocklink: https://contracts.onpop.io/contract/16Agz1dvcmvExp63zoSVaPF3iZrdpAeTs8epZhhcKkjt4H9F
- Website has been published at: https://zeroid.me
- Presentation slides: https://www.canva.com/design/DAGnbbh2j_Y/4tWMviu-4QS9i_HYJP3JXg/edit
- Stellar Expert Links contract ID: https://stellar.expert/explorer/testnet/contract/CC6PHJZKHTPSSTXPXAGZQTUXK7U4KQTS7WSNJ5JETYCFEYNVQAJ4YN77
- Stellar Technical Docs: https://whimsical.com/stellar-technical-documentation-9t7f8gdRDDASdwe6QAB2nE
- Stellar "Why" Narrative: https://docs.google.com/document/d/1KeO1i8kVB-cE7L-3h2MlHyE9ueY-iDe2OcsCPnkubE8/edit?usp=sharing
