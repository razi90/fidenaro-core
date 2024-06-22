import { Trade, TradeAction, Transaction, Vault } from '../entities/Vault';
import { vaultPerformanceCandleChartData } from './VaultPerformanceData';
import { vaultProfitabilityChartData } from './VaultProfitabilityData';
import { Asset, addressToAsset } from '../entities/Asset';
import { rdt } from '../radix-dapp-toolkit/rdt';
import { FidenaroComponentAddress } from '../fidenaro/Config';
import { fetchUserInfoById } from '../user/UserDataService';
import { fetchPriceList } from '../price/PriceDataService';

export const fetchVaultList = async (): Promise<Vault[]> => {
    try {
        let tradeVaults: Vault[] = []
        let fidenaroComponentLedgerData = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(FidenaroComponentAddress)
        let tradeVaultComponentAddresses: string[] = getAllTradeVaultAddresses(fidenaroComponentLedgerData)
        for (const address of tradeVaultComponentAddresses) {
            let vault = await getVaultById(address);
            tradeVaults.push(vault);
            break;
        }
        return tradeVaults;
    } catch (error) {
        console.log("fetchVaultList error.")
        throw error;
    }
}

export const getVaultById = async (address: string): Promise<Vault> => {
    try {

        // fetch data from ledged by the address
        let vaultLedgerData: any = await rdt.gatewayApi.state.getEntityDetailsVaultAggregated(address)
        let name = getMetaData(vaultLedgerData, "name")
        let description = getMetaData(vaultLedgerData, "description")

        let vault_fields = vaultLedgerData.details.state.fields
        let shareTokenAddress = getFieldValueByKey(vault_fields, "share_token_manager")
        let manager_badge_address = getFieldValueByKey(vault_fields, "fund_manager_badge")
        let fee = parseFloat(getFieldValueByKey(vault_fields, "fee"))

        let followers = getFollowerIds(vault_fields)
        let tradeHistory = getTrades(vault_fields)
        let assets = getAssets(vaultLedgerData.fungible_resources.items)
        let manager_id = getFieldValueByKey(vault_fields, "manager_user_id")
        let manager = await fetchUserInfoById(manager_id)

        let deposits = getDeposits(vault_fields)
        let withdrawals = getWithdrawals(vault_fields)

        const priceList = await fetchPriceList()
        const totalEquity = calculateTotalEquity(assets, priceList)

        const totalShareTokenAmount = parseFloat(getFieldValueByKey(vault_fields, "total_share_tokens"));

        let managerEquity = 0;
        let followerEquity = 0;
        let pricePerShare = 0;

        if (totalShareTokenAmount !== 0) {
            const managerShareTokenAmount = getManagerShareTokenAmount(vault_fields, manager_id);
            managerEquity = totalEquity * (managerShareTokenAmount / totalShareTokenAmount);
            followerEquity = totalEquity - managerEquity;
            pricePerShare = totalEquity / totalShareTokenAmount
        }

        let activeDays = calculateActiveDays(vault_fields)

        let vault: Vault = {
            name,
            id: address,
            description,
            shareTokenAddress,
            manager_badge_address,
            total: 0,
            today: 0,
            activeDays,
            followers,
            totalEquity,
            managerEquity,
            followerEquity,
            pricePerShare,
            profitShare: fee,
            manager,
            tradeHistory,
            assets,
            deposits,
            withdrawals,
            shareTokenAmount: totalShareTokenAmount,

            calculatePnL: function () {
                return (this.pricePerShare - 1) * this.shareTokenAmount;
            },

            calculateROI: function () {
                return (this.pricePerShare - 1) * 100 || 0;
            },

            calculateUserInvestedEquity: function (userId: string | undefined) {

                if (userId == undefined) return 0

                const totalUserDeposits: number = this.deposits.filter(transaction => transaction.userId === userId).reduce((accumulator, current) => {
                    return accumulator + current.amount;
                }, 0);

                const totalUserWithdrawals: number = this.withdrawals.filter(transaction => transaction.userId === userId).reduce((accumulator, current) => {
                    return accumulator + current.amount;
                }, 0);

                console.log(totalUserDeposits)
                console.log(totalUserWithdrawals)

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
            }
        }

        return vault
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

const getAllTradeVaultAddresses = (fidenaroComponentLedgerData: any): string[] => {
    let componentAddresses: string[] = []
    fidenaroComponentLedgerData.details.state.fields.forEach((field: any) => {
        if (field.field_name == "vaults") {
            field.entries.forEach((vault: any) => {
                componentAddresses.push(getVaultComponentAddress(vault))
            })
        }
    });

    return componentAddresses
}

const getMetaData = (vaultLedgerData: any, key: string): string => {
    let metaData = 'N/A'
    vaultLedgerData.metadata.items.forEach((item: any) => {
        if (item.key == key) {
            metaData = item.value.programmatic_json.fields.at(0).value;
        }
    });
    return metaData
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

function getAssets(ledgerAssetData: any): Map<string, number> {
    let assets = new Map<string, number>()

    for (const asset_item of ledgerAssetData) {
        let asset = addressToAsset(asset_item.resource_address)
        let amount = asset_item.vaults.items[0].amount
        if (amount != 0) { // Ignore entry for the share token of the vault
            assets.set(asset.address, amount)
        }
    }

    return assets
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

function getFieldValueByKey(fields: any, key: string): string {
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

function getVaultComponentAddress(vault: any) {
    return vault.key.value
}

/* Dummy Functions have to be replaced by original data */

export const fetchVaultPerformanceSeries = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        //const candleChartData: VaultCandleChart[] = vaultPerformanceCandleChartData
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

function calculateTotalEquity(assets: Map<string, number>, priceList: Map<string, number>): number {
    let equity = 0
    assets.forEach((value, key) => {
        let price = priceList.get(key);
        equity += value * price!;
    });

    return equity
}

function getManagerShareTokenAmount(fields: any, manager_id: string): number {
    let amount = 0
    fields.forEach((field: any) => {
        if (field.field_name == "followers") {
            field.entries.forEach((entry: any) => {
                if (entry.key.value == manager_id)
                    amount = entry.value.value
            })
        }
    })
    return amount;
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

