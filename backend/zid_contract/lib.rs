#[ink::contract]
mod zeroid {
    #[ink(storage)]
    pub struct Zeroid {
        last_hash: [u8; 32],
    }

    impl Zeroid {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                last_hash: [0u8; 32],
            }
        }

        #[ink(message)]
        pub fn store_verified_resume_data(&mut self, hash: [u8; 32]) {
            self.last_hash = hash;
        }

        #[ink(message)]
        pub fn get_verified_resume_data(&self) -> [u8; 32] {
            self.last_hash
        }
    }
}
