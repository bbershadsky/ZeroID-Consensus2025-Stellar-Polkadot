#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Address, String, Symbol};

#[contract]
pub struct EmployerVerificationNFT;

#[contractimpl]
impl EmployerVerificationNFT {
    // Mint an NFT to a recipient with a metadata URI.
    pub fn mint(env: Env, recipient: Address, metadata_uri: String) -> u64 {
        let issuer = env.invoker();
        let stored_issuer: Address = env.storage().get_unchecked(Symbol::short("issuer")).unwrap_or(issuer.clone());

        if issuer != stored_issuer {
            panic!("Only the contract issuer can mint");
        }

        let mut token_id: u64 = env.storage().get_unchecked(Symbol::short("token_id_counter")).unwrap_or(0);
        token_id += 1;

        env.storage().set(Symbol::short(&format!("owner_{}", token_id)), recipient.clone());
        env.storage().set(Symbol::short(&format!("meta_{}", token_id)), metadata_uri);
        env.storage().set(Symbol::short("token_id_counter"), token_id);

        token_id
    }

    // Read the owner of a token ID.
    pub fn owner_of(env: Env, token_id: u64) -> Address {
        env.storage().get_unchecked(Symbol::short(&format!("owner_{}", token_id))).unwrap()
    }

    // Read the metadata URI of a token ID.
    pub fn metadata_of(env: Env, token_id: u64) -> String {
        env.storage().get_unchecked(Symbol::short(&format!("meta_{}", token_id))).unwrap()
    }
}
