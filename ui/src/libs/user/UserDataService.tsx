import UserToken from './UserTokenResponse.json';
import { User } from '../entities/User';
import { rdt } from '../radix-dapp-toolkit/rdt';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import UserAccountResponse from './UserAccountResponse.json';

interface NonFungibleData {
    data: {
        programmatic_json: {
            fields: {
                value: string,
                kind: string,
                field_name: string,
            };
        };
    };
}

export const USER_NFT_RESOURCE_ADDRESS = "resource_tdx_2_1n2tw2nl3hjak8kyxv5reslrahrdqdu2qhhn839stjgtlrh40utt0zp"

export const fetchUserInfo = async (): Promise<User> => {
    try {
        const walletData: WalletDataState = rdt.walletApi.getWalletData();
        if (walletData.accounts.length === 0) {
            throw new Error("Wallet not connected.");
        }

        let account = walletData.accounts[0].address;
        let persona = walletData.persona?.label

        // let userLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(account);
        let userLedgerData = UserAccountResponse
        let id = getId(userLedgerData)

        // let userTokenLedgerData = await rdt.gatewayApi.state.getNonFungibleData(USER_NFT_RESOURCE_ADDRESS, id)
        let userTokenLedgerData = UserToken

        if (!userTokenLedgerData || !userTokenLedgerData.data) {
            throw new Error('User has no token. User default.');
        }

        let user = getUserFromNft(account, persona!, id)

        return user;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

export const fetchUserInfoById = async (userId: string): Promise<User> => {
    try {
        let account = "N/A";
        let persona = "N/A"
        let user = getUserFromNft(account, persona, userId)
        return user;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

function getUserFromNft(account: string, persona: string, id: string): User {
    // let userTokenLedgerData = await rdt.gatewayApi.state.getNonFungibleData(USER_NFT_RESOURCE_ADDRESS, id)
    let userTokenLedgerData = UserToken

    const typedLedgerData = userTokenLedgerData as unknown as NonFungibleData;

    let userTokenData = typedLedgerData.data.programmatic_json.fields
    let name = getMetaData(userTokenData, "user_name")
    let bio = getMetaData(userTokenData, "bio")
    let avatar = getMetaData(userTokenData, "pfp_url")
    let twitter = getMetaData(userTokenData, "twitter")
    let telegram = getMetaData(userTokenData, "telegram")
    let discord = getMetaData(userTokenData, "discord")

    let user: User = {
        account,
        persona,
        id,
        name,
        bio,
        avatar,
        twitter,
        telegram,
        discord
    }

    return user;
}


function getId(userLedgerData: any): string {
    let id = "N/A"

    userLedgerData.non_fungible_resources.items.forEach((item: any) => {
        if (item.resource_address === USER_NFT_RESOURCE_ADDRESS) {
            id = item.vaults.items.at(0).items.at(0)
        }
    });

    return id;
}

function getMetaData(userTokenData: any, key: string): string {
    let metaData = 'N/A'
    userTokenData.forEach((field: any) => {
        if (field.field_name === key) {
            metaData = field.value;
        }
    });
    return metaData
}