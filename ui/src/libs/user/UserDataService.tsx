import { User } from '../entities/User';
import { rdt } from '../radix-dapp-toolkit/rdt';
import { WalletDataState } from '@radixdlt/radix-dapp-toolkit';
import { AssetMap } from '../entities/Asset';

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

export const USER_NFT_RESOURCE_ADDRESS = "resource_tdx_2_1ntkcndzy2rujh6jyp2rgsn5fhuhp8t6ffp3pgv02hlwdegpngtr373"

export const fetchUserInfo = async (): Promise<User> => {
    try {
        const walletData: WalletDataState = rdt.walletApi.getWalletData();
        let user: User = {
            account: undefined,
            persona: undefined,
            id: '',
            name: '',
            bio: '',
            avatar: '',
            twitter: '',
            telegram: '',
            discord: '',
            assets: {},
        }

        if (walletData.accounts.length === 0) {
            return user
        }

        user.account = walletData.accounts[0].address;
        user.persona = walletData.persona?.label

        let userLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(user.account);

        user.id = getId(userLedgerData)

        if (user.id === '') {
            return user;
        }

        user = await getUserDataFromNft(user)

        user.assets = getUserAssets(userLedgerData)

        return user;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

export const fetchUserInfoById = async (userId: string): Promise<User> => {
    try {
        let user: User = {
            account: undefined,
            persona: undefined,
            id: userId,
            name: '',
            bio: '',
            avatar: '',
            twitter: '',
            telegram: '',
            discord: '',
            assets: {},
        }

        user = await getUserDataFromNft(user)

        return user;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

async function getUserDataFromNft(user: User): Promise<User> {
    let userTokenLedgerData = await rdt.gatewayApi.state.getNonFungibleData(USER_NFT_RESOURCE_ADDRESS, user.id)

    const typedLedgerData = userTokenLedgerData as unknown as NonFungibleData;

    let userTokenData = typedLedgerData.data.programmatic_json.fields
    user.name = getMetaData(userTokenData, "user_name")
    user.bio = getMetaData(userTokenData, "bio")
    user.avatar = getMetaData(userTokenData, "pfp_url")
    user.twitter = getMetaData(userTokenData, "twitter")
    user.telegram = getMetaData(userTokenData, "telegram")
    user.discord = getMetaData(userTokenData, "discord")

    return user;
}


function getId(userLedgerData: any): string {
    let id = ''

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

function getUserAssets(userLedgerData: any) {
    let assets: AssetMap = {}
    for (const item of userLedgerData.fungible_resources.items) {
        let address = item.resource_address
        let amount = item.vaults.items[0].amount;
        assets[address] = amount
    }
    return assets;
}