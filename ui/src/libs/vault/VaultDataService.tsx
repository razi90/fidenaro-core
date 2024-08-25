import { AssetStats, Trade, TradeAction, Vault } from '../entities/Vault';
import { vaultPerformanceCandleChartData } from './VaultPerformanceData';
import { vaultProfitabilityChartData } from './VaultProfitabilityData';
import { Asset, addressToAsset } from '../entities/Asset';
import { gatewayApi } from '../radix-dapp-toolkit/rdt';
import { BLACKLIST, TRADE_VAULT_STORE } from '../fidenaro/Config';
import { fetchUserInfoById } from '../user/UserDataService';
import { fetchPriceList, PriceData } from '../price/PriceDataService';
import { Transaction } from '../transaction/TransactionDataService';

export const fetchVaultList = async (): Promise<Vault[]> => {
    try {
        let tradeVaults: Vault[] = [];

        let tradeVaultComponentAddresses: string[] = await getAllTradeVaultAddresses();
        tradeVaultComponentAddresses = tradeVaultComponentAddresses.filter(item => !BLACKLIST.includes(item));

        let vaultLedgerDataAggregated: any = await gatewayApi.state.getEntityDetailsVaultAggregated(tradeVaultComponentAddresses);

        const vaultPromises = vaultLedgerDataAggregated.map((vaultLedgerData: any) => {
            return getVaultData(vaultLedgerData)
        });

        tradeVaults = await Promise.all(vaultPromises);
        return tradeVaults;
    } catch (error) {
        console.log("fetchVaultList error.");
        throw error;
    }
}

export const getVaultDataById = async (vault_id: string): Promise<Vault> => {
    let vaultLedgerData: any = await gatewayApi.state.getEntityDetailsVaultAggregated(vault_id);

    return getVaultData(vaultLedgerData)
}

export const getVaultData = async (vaultLedgerData: any): Promise<Vault> => {

    try {

        let id = vaultLedgerData.address
        let name = getMetaData(vaultLedgerData, "name")
        let description = getMetaData(vaultLedgerData, "description")

        let vault_fields = vaultLedgerData.details.state.fields
        let shareTokenAddress = getFieldValueByKey(vault_fields, "share_token_manager")
        let manager_badge_address = getFieldValueByKey(vault_fields, "fund_manager_badge")

        let followers = getFollowerIds(vault_fields)
        let tradeHistory = getTrades(vault_fields)
        let manager_id = getFieldValueByKey(vault_fields, "manager_user_id")
        let manager = await fetchUserInfoById(manager_id)

        let deposits = getDeposits(vault_fields)
        let withdrawals = getWithdrawals(vault_fields)

        const priceList = await fetchPriceList()

        const totalAssetAmounts = getTotalAssetAmounts(vaultLedgerData.fungible_resources.items)
        const userAssetAmounts = getUserAssetAmounts(vaultLedgerData.fungible_resources.items, vault_fields)
        const managerAssetAmounts = getManagerFeeAssetAmounts(totalAssetAmounts, userAssetAmounts)

        const userAssetValues = calculateAssetValues(userAssetAmounts, priceList)
        const managerAssetValues = calculateAssetValues(managerAssetAmounts, priceList)

        const tvlInUsd = calculateTotalEquityInUSD(userAssetValues)
        const tvlInXrd = calculateTotalEquityInXRD(userAssetValues)

        const totalShareTokenAmount = parseFloat(getFieldValueByKey(vault_fields, "total_share_tokens"));

        let managerEquity = 0;
        let followerEquity = 0;
        let pricePerShare = 0;
        let roi = 0;

        if (totalShareTokenAmount !== 0) {
            const managerShareTokenAmount = getManagerShareTokenAmount(manager.assets, shareTokenAddress);
            managerEquity = tvlInXrd * (managerShareTokenAmount / totalShareTokenAmount);
            followerEquity = tvlInXrd - managerEquity;
            pricePerShare = tvlInXrd / totalShareTokenAmount
            roi = (pricePerShare - 1) * 100 || 0;
        }

        const activeDays = calculateActiveDays(vault_fields)


        let vault: Vault = {
            name,
            id,
            description,
            shareTokenAddress,
            manager_badge_address,
            roi,
            activeDays,
            followers,
            tvlInUsd,
            tvlInXrd,
            managerEquity,
            followerEquity,
            pricePerShare,
            managerFee: 0.1,
            manager,
            tradeHistory,
            userAssetValues,
            managerAssetValues,
            deposits,
            withdrawals,
            shareTokenAmount: totalShareTokenAmount,

            calculatePnL: function () {
                return (this.pricePerShare - 1) * this.shareTokenAmount;
            },

            calculateUserInvestedEquity: function (userId: string | undefined) {

                if (userId == undefined) return 0

                const totalUserDeposits: number = this.deposits.filter(transaction => transaction.userId === userId).reduce((accumulator, current) => {
                    return accumulator + current.amount;
                }, 0);

                const totalUserWithdrawals: number = this.withdrawals.filter(transaction => transaction.userId === userId).reduce((accumulator, current) => {
                    return accumulator + current.amount;
                }, 0);

                if (totalUserDeposits > totalUserWithdrawals) {
                    return totalUserDeposits - totalUserWithdrawals
                } else {
                    return totalUserDeposits
                }
            },

            calculateUserPnL: function (userId: string | undefined, userShareValue: number) {
                return userShareValue - this.calculateUserInvestedEquity(userId)
            },

            calculateUserROI: function (userId: string | undefined, userShareValue: number) {
                return (this.calculateUserPnL(userId, userShareValue) / this.calculateUserInvestedEquity(userId)) * 100 || 0;
            },

            calculateTraderFeeInXrd: function () {
                return calculateTotalEquityInXRD(managerAssetValues);
            }
        }

        return vault

    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

const getAllTradeVaultAddresses = async (): Promise<string[]> => {
    let tradeVaultKeyValueStore = await gatewayApi.state.innerClient.keyValueStoreKeys(
        {
            stateKeyValueStoreKeysRequest: {
                key_value_store_address: TRADE_VAULT_STORE
            }
        }
    );

    let componentAddresses: string[] = []
    tradeVaultKeyValueStore.items.forEach((item: any) => {
        componentAddresses.push(item.key.programmatic_json.value)
    });

    return componentAddresses
}

const getMetaData = (vaultLedgerData: any, key: string): string => {
    const item = vaultLedgerData.metadata.items.find((item: any) => item.key === key);
    return item ? item.value.programmatic_json.fields.at(0).value : 'N/A';
}

function getTrades(vault_fields: any): Trade[] {
    let trades: Trade[] = []
    vault_fields.forEach((field: any) => {
        if (field.field_name == "trades") {
            field.elements.forEach((element: any) => {

                let epoch: number = parseInt(getFieldValueByKey(element.fields, "epoch"));
                let unixTimestamp: number = parseInt(getFieldValueByKey(element.fields, "timestamp"));
                let action: TradeAction = stringToTradeAction(getFieldVariantNameByKey(element.fields, "trade_action"));
                let from: Asset = addressToAsset(getFieldValueByKey(element.fields, "from"));
                let from_amount: number = parseFloat(getFieldValueByKey(element.fields, "from_amount"));
                let to: Asset = addressToAsset(getFieldValueByKey(element.fields, "to"));
                let to_amount: number = parseFloat(getFieldValueByKey(element.fields, "to_amount"));
                let price: number = parseFloat(getFieldValueByKey(element.fields, "price"));

                let trade: Trade = {
                    epoch,
                    unixTimestamp,
                    action,
                    from,
                    from_amount,
                    to,
                    to_amount,
                    price
                }
                trades.push(trade)
            })
        }
    })
    return trades;
}


function daysSince(unixTimestamp: number): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000; // 24 hours, 60 minutes, 60 seconds, 1000 milliseconds
    const now = Date.now(); // Current time in milliseconds
    const timestampInMilliseconds = unixTimestamp * 1000; // Convert Unix timestamp from seconds to milliseconds
    const differenceInMilliseconds = now - timestampInMilliseconds;
    const daysPassed = Math.ceil(differenceInMilliseconds / millisecondsPerDay);

    return daysPassed;
}

function getTotalAssetAmounts(ledgerAssetData: any): Map<string, number> {
    let assets = new Map<string, number>()

    ledgerAssetData.forEach((item: any) => {
        let amount = 0

        item.vaults.items.forEach((vault: any) => {
            amount += parseFloat(vault.amount)
        })
        assets.set(item.resource_address, amount)
    })

    return assets
}

function getUserAssetAmounts(ledgerAssetData: any, vault_fields: any): Map<string, number> {
    let assets = new Map<string, number>()
    const userAssetVaultAddresses = getUserAssetVaultAddresses(vault_fields)

    userAssetVaultAddresses.forEach((value, key) => {
        let amount = ledgerAssetData.find((asset: any) => asset.resource_address == key).vaults.items.find((item: any) => item.vault_address === value).amount
        assets.set(key, parseFloat(amount))
    });

    return assets
}

function getManagerFeeAssetAmounts(
    totalAssets: Map<string, number>,
    userAssets: Map<string, number>
): Map<string, number> {

    const managerFeeAssets = new Map<string, number>();

    totalAssets.forEach((totalAmount, asset) => {
        const userAmount = userAssets.get(asset) || 0; // Get user amount or default to 0 if not present
        const managerAmount = totalAmount - userAmount; // Subtract user assets from total assets

        managerFeeAssets.set(asset, managerAmount); // Store the result in the new map
    });

    return managerFeeAssets;
}

function stringToTradeAction(value: string): TradeAction {
    switch (value) {
        case "Buy":
            return TradeAction.Buy;
        case "Sell":
            return TradeAction.Sell;
        default:
            return TradeAction.Default;
    }
}

function getFieldValueByKey(fields: any, key: string): any {
    let fieldValue = 'N/A'

    for (const field of fields) {
        if (field.field_name == key) {
            fieldValue = field.value
            break;
        }
    }
    return fieldValue
}

function getFieldVariantNameByKey(fields: any, key: string): string {
    let variantName = 'Default'
    fields.forEach((field: any) => {
        if (field.field_name == key) {
            variantName = field.variant_name
        }
    })
    return variantName
}

function getFollowerIds(follower_field: any): string[] {
    let followers: string[] = []
    follower_field.forEach((field: any) => {
        if (field.field_name == "followers") {
            field.entries.forEach((entry: any) => {
                followers.push(entry.key.value)
            })
        }
    })
    return followers;
}

/* Dummy Functions have to be replaced by original data */

export const fetchVaultPerformanceSeries = async () => {
    try {
        return vaultPerformanceCandleChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultFollowerChartData = async () => {

    const vaultFollowerChartData = [
        {
            name: 'X',
            data: [0, 1, 1, 1, 2, 3, 3, 3, 4, 3, 3, 4, 5, 6, 7, 7, 7, 7, 6, 7, 7, 7, 7],
        },
    ];


    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultFollowerChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultTotalChartData = async () => {

    const vaultTotalChartData = [
        {
            name: 'X',
            data: [30, 3, 40, 45, 50, 49, 60, 70, 91, 80, 50, 30, 25, 20, 17, 40],
        },
    ];


    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultTotalChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultTodayChartData = async () => {

    const vaultTodayChartData = [
        {
            name: 'X',
            data: [17, 16, 18, 20, 23, 28, 31, 37, 37, 34, 39, 39, 37, 40, 40, 40],
        },
    ];


    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultTodayChartData;
    } catch (error) {
        throw error;
    }
}

export const fetchVaultProfitabilityData = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return vaultProfitabilityChartData;
    } catch (error) {
        throw error;
    }
}

function calculateTotalEquityInUSD(assets: Map<string, AssetStats>): number {
    let equity = 0
    assets.forEach((value, _) => {
        equity += value.valueInUSD
    });
    return equity
}

function calculateTotalEquityInXRD(assets: Map<string, AssetStats>): number {
    let equity = 0
    assets.forEach((value, _) => {
        equity += value.valueInXRD
    });
    return equity
}

function getManagerShareTokenAmount(assets: Map<string, number>, shareTokenAddress: string): number {
    return assets.get(shareTokenAddress)!;
}

function getDeposits(fields: any): Transaction[] {
    return getTransactionsByKind(fields, "deposits")
}

function getWithdrawals(fields: any): Transaction[] {
    return getTransactionsByKind(fields, "withdrawals")
}

function getTransactionsByKind(fields: any, key: string): Transaction[] {
    let transactions: Transaction[] = [];

    fields.forEach((field: any) => {
        if (field.field_name === key) {
            field.elements.forEach((element: any) => {

                let userId = getFieldValueByKey(element.fields, "user_id");
                let unixTimestamp = parseInt(getFieldValueByKey(element.fields, "timestamp"));
                let action = getFieldVariantNameByKey(element.fields, "action");
                let amount = parseFloat(getFieldValueByKey(element.fields, "amount"));

                let transaction: Transaction = {
                    userId,
                    unixTimestamp,
                    action,
                    amount,
                }

                transactions.push(transaction)

            });
        }
    });

    return transactions;
}

function calculateActiveDays(vault_fields: any): number {
    return daysSince(parseInt(getFieldValueByKey(vault_fields, "creation_date")))
}

function getUserAssetVaultAddresses(vault_fields: any): Map<string, string> {
    let assetAddresses = new Map<string, string>()
    vault_fields.find((field: any) => {
        if (field.field_name === "assets") {
            return true;
        }
    }).entries.forEach((entry: any) => {
        assetAddresses.set(entry.key.value, entry.value.value)

    })
    return assetAddresses
}

function calculateAssetValues(assetAmounts: Map<string, number>, priceList: Map<string, PriceData>): Map<string, AssetStats> {
    let assetValues = new Map<string, AssetStats>();

    for (const [asset, amount] of assetAmounts) {
        // Get the price data for the current asset
        let priceData = priceList.get(asset);

        if (priceData) {
            // Calculate the value in USD and XRD
            let valueInUSD = amount * priceData.priceInUSD;
            let valueInXRD = amount * priceData.priceInXRD;

            // Create an AssetStats object
            let stats: AssetStats = {
                amount,
                valueInUSD,
                valueInXRD
            };

            // Store the stats in the result map
            assetValues.set(asset, stats);
        } else {
            console.warn(`Price data for asset ${asset} not found.`);
        }
    }

    return assetValues;
}

