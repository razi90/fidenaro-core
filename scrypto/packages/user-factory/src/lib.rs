use scrypto::prelude::*;

#[derive(ScryptoSbor, NonFungibleData)]
pub struct User {
    #[mutable]
    pub user_name: String,
    #[mutable]
    pub bio: String,
    #[mutable]
    pub pfp_url: Url,
    #[mutable]
    pub twitter: String,
    #[mutable]
    pub telegram: String,
    #[mutable]
    pub discord: String,
}

#[blueprint]
mod user_factory {
    struct UserFactory {
        user_token_manager: ResourceManager,
        user_count: u64,
    }

    impl UserFactory {
        pub fn instantiate() -> Global<UserFactory> {
            let (address_reservation, component_address) =
                Runtime::allocate_component_address(UserFactory::blueprint_id());

            let user_token_manager = ResourceBuilder::new_integer_non_fungible::<User>(
                OwnerRole::None,
            )
            .metadata(metadata!(
                init {
                    "name" => "Fidenaro User", updatable;
                    "description" => "A user NFT for Fidenaro users", updatable;
                }
            ))
            .mint_roles(mint_roles! (
                minter => rule!(require(global_caller(component_address)));
                minter_updater => rule!(deny_all);
            ))
            .burn_roles(burn_roles! {
                burner => rule!(require(global_caller(component_address)));
                burner_updater => rule!(deny_all);
            })
            .non_fungible_data_update_roles(non_fungible_data_update_roles! {
                non_fungible_data_updater => rule!(require(global_caller(component_address)));
                non_fungible_data_updater_updater => rule!(deny_all);
            })
            .create_with_no_initial_supply();

            // Instantiate a Hello component, populating its vault with our supply of 1000 HelloToken
            Self {
                user_token_manager,
                user_count: u64::zero(),
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .with_address(address_reservation)
            .globalize()
        }

        pub fn create_new_user(
            &mut self,
            user_name: String,
            bio: String,
            pfp_url: String,
            twitter: String,
            telegram: String,
            discord: String,
        ) -> NonFungibleBucket {
            let new_user = User {
                user_name,
                bio,
                pfp_url: Url::of(pfp_url),
                twitter,
                telegram,
                discord,
            };
            let user_token = self.user_token_manager.mint_non_fungible(
                &NonFungibleLocalId::Integer(self.user_count.into()),
                new_user,
            );

            self.user_count += 1;

            user_token.as_non_fungible()
        }

        pub fn update_user_data(
            &mut self,
            user_token: NonFungibleBucket,
            data_map: HashMap<String, String>,
        ) -> NonFungibleBucket {
            let non_fungible_local_id = user_token.non_fungible_local_id();

            for (field_name, new_data) in data_map.iter() {
                self.user_token_manager.update_non_fungible_data(
                    &non_fungible_local_id,
                    field_name,
                    new_data,
                );
            }
            user_token
        }

        pub fn get_user_token_resource_address(&self) -> ResourceAddress {
            self.user_token_manager.address()
        }
    }
}
