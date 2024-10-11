use crate::prelude::*;

pub trait EnvironmentSpecifier {
    // Environment
    type Environment;

    // Components
    type Fidenaro;
    type UserFactory;
    type TradeVault;
    type SimpleOracle;
    type Ociswap;
    type OciswapV2Adapter;

    // Badges
    type Badge;

    // Users
    type User;
}

pub struct Environment<S>
where
    S: EnvironmentSpecifier,
{
    /* Test Environment */
    pub environment: S::Environment,
    /* Various entities */
    pub resources: ResourceInformation<ResourceAddress>,
    pub protocol: ProtocolEntities<S>,
    /* Supported Dexes */
    pub ociswap: DexEntities<S::Ociswap, S::OciswapV2Adapter>,
}

impl<S> Environment<S>
where
    S: EnvironmentSpecifier,
{
    pub const PACKAGE_NAMES: [&'static str; 7] = [
        "../packages/fidenaro",
        "../packages/user-factory",
        "../packages/simple-oracle",
        "../packages/ociswap-v2-adapter",
        "../libraries/precision-pool",
        "../libraries/precision-pool/registry",
        "../bootstrapping-helper/trade-engine",
    ];

    pub const RESOURCE_DIVISIBILITIES: ResourceInformation<u8> =
        ResourceInformation::<u8> {
            bitcoin: 8,
            ethereum: 18,
            usdc: 6,
            usdt: 6,
        };
}

#[derive(Debug)]
pub struct ProtocolEntities<S>
where
    S: EnvironmentSpecifier,
{
    /* Fidenaro */
    pub fidenaro_package_address: PackageAddress,
    pub fidenaro: S::Fidenaro,
    /* User Factory */
    pub user_factory_package_address: PackageAddress,
    pub user_factory: S::UserFactory,
    /* Trade Vault */
    pub trade_vault_package_address: PackageAddress,
    pub trade_vault: S::TradeVault,
    pub trade_vault_admin_badge: S::Badge,
    pub trade_vault_share_token: ResourceAddress,
    /* Oracle */
    pub oracle_package_address: PackageAddress,
    pub oracle: S::SimpleOracle,
    /* Badges */
    pub protocol_owner_badge: S::Badge,
    pub protocol_manager_badge: S::Badge,
    pub trader: S::User,
    pub follower: S::User,
}

/// A struct that defines the entities that belong to a Decentralized Exchange.
/// it contains the package address as well as generic items [`T`] which are
/// the stubs used to call the pools.
#[derive(Copy, Clone, Debug)]
pub struct DexEntities<P, A> {
    /* Packages */
    pub package: PackageAddress,
    /* Pools */
    pub pools: ResourceInformation<P>,
    /* Adapter */
    pub adapter_package: PackageAddress,
    pub adapter: A,
}

#[derive(Clone, Debug, Copy)]
pub struct ResourceInformation<T> {
    pub bitcoin: T,
    pub ethereum: T,
    pub usdc: T,
    pub usdt: T,
}

impl<T> ResourceInformation<T> {
    pub fn map<F, O>(&self, mut map: F) -> ResourceInformation<O>
    where
        F: FnMut(&T) -> O,
    {
        ResourceInformation::<O> {
            bitcoin: map(&self.bitcoin),
            ethereum: map(&self.ethereum),
            usdc: map(&self.usdc),
            usdt: map(&self.usdt),
        }
    }

    pub fn try_map<F, O, E>(
        &self,
        mut map: F,
    ) -> Result<ResourceInformation<O>, E>
    where
        F: FnMut(&T) -> Result<O, E>,
    {
        Ok(ResourceInformation::<O> {
            bitcoin: map(&self.bitcoin)?,
            ethereum: map(&self.ethereum)?,
            usdc: map(&self.usdc)?,
            usdt: map(&self.usdt)?,
        })
    }

    pub fn iter(self) -> impl Iterator<Item = T> {
        [self.bitcoin, self.ethereum, self.usdc, self.usdt].into_iter()
    }

    pub fn zip<O>(
        self,
        other: ResourceInformation<O>,
    ) -> ResourceInformation<(T, O)> {
        ResourceInformation {
            bitcoin: (self.bitcoin, other.bitcoin),
            ethereum: (self.ethereum, other.ethereum),
            usdc: (self.usdc, other.usdc),
            usdt: (self.usdt, other.usdt),
        }
    }
}
