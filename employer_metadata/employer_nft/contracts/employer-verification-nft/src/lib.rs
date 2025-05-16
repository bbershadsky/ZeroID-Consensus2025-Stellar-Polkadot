#![no_std]

use soroban_sdk::{
    contract, contractimpl, Address, Env, String,
    symbol_short as symbol,
};

/// A non-transferable NFT contract for employer verification.
/// Once minted to an address, the NFT cannot be transferred to another address.
/// Minting is restricted to the contract issuer, but viewing NFT data is public.
#[contract]
pub struct EmployerVerificationNFT;

#[contractimpl]
impl EmployerVerificationNFT {
    /// Verify that the caller is the contract issuer
    fn check_issuer(env: &Env) -> Address {
        let issuer: Address = env.storage().instance().get(&symbol!("issuer")).unwrap();
        issuer.require_auth();
        issuer
    }

    /// Initialize the contract with the issuer address.
    pub fn initialize(env: Env, issuer: Address) {
        let storage = env.storage().instance();
        if storage.has(&symbol!("issuer")) {
            panic!("already initialized");
        }
        storage.set(&symbol!("issuer"), &issuer);
    }

    /// Mint a non-transferable NFT to a recipient with associated metadata URI.
    /// Can only be called by the contract issuer.
    pub fn mint(env: Env, recipient: Address, metadata_uri: String) -> u64 {
        // Verify caller is the issuer
        Self::check_issuer(&env);

        let persistent = env.storage().persistent();
        let mut token_id: u64 = persistent
            .get(&symbol!("count"))
            .unwrap_or(0);
        token_id += 1;

        // Store token data separately with permanent binding to recipient
        persistent.set(&symbol!("o"), &(token_id, recipient));  // owner
        persistent.set(&symbol!("m"), &(token_id, metadata_uri));  // metadata
        persistent.set(&symbol!("count"), &token_id);

        token_id
    }

    /// Get the owner of a token. This is publicly viewable.
    pub fn owner_of(env: Env, token_id: u64) -> Address {
        let (stored_id, owner): (u64, Address) = env.storage()
            .persistent()
            .get(&symbol!("o"))
            .unwrap();
        
        if stored_id != token_id {
            panic!("token not found");
        }
        owner
    }

    /// Get the metadata URI of a token. This is publicly viewable.
    pub fn metadata_of(env: Env, token_id: u64) -> String {
        let (stored_id, metadata): (u64, String) = env.storage()
            .persistent()
            .get(&symbol!("m"))
            .unwrap();
            
        if stored_id != token_id {
            panic!("token not found");
        }
        metadata
    }

    /// Get the total number of tokens minted. This is publicly viewable.
    pub fn total_supply(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&symbol!("count"))
            .unwrap_or(0)
    }

    /// Explicitly prevent transfer functionality.
    /// This function will always panic, as transfers are not allowed.
    pub fn transfer(_env: Env, _token_id: u64, _to: Address) {
        panic!("this NFT cannot be transferred - it is permanently bound to the original recipient");
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Env as _};

    #[test]
    fn test_mint_and_public_view() {
        let env = Env::default();
        let contract_id = env.register_contract(None, EmployerVerificationNFT);
        let client = EmployerVerificationNFTClient::new(&env, &contract_id);

        let issuer = Address::random(&env);
        let recipient = Address::random(&env);
        
        // Initialize and mint as issuer
        client.initialize(&issuer);
        env.mock_all_auths();
        
        let token_id = client.mint(
            &recipient,
            &String::from_slice(&env, "ipfs://metadata-uri"),
        );
        
        // Verify minting
        assert_eq!(token_id, 1);
        
        // Test public visibility - should work with any caller
        let non_issuer = Address::random(&env);
        env.set_source_account(&non_issuer);
        
        // These calls should succeed even from non-issuer
        let owner = client.owner_of(&token_id);
        assert_eq!(owner, recipient);
        
        let metadata = client.metadata_of(&token_id);
        assert_eq!(metadata, String::from_slice(&env, "ipfs://metadata-uri"));
        
        let supply = client.total_supply();
        assert_eq!(supply, 1);

        // Verify minting is still restricted
        let result = std::panic::catch_unwind(|| {
            client.mint(
                &non_issuer,
                &String::from_slice(&env, "ipfs://should-fail"),
            );
        });
        assert!(result.is_err(), "non-issuer should not be able to mint");
    }
}
