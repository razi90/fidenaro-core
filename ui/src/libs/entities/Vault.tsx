import { Asset } from "./Asset";
import { User } from "./User";

export interface Vault {
    id: string;
    name: string;
    description: string;
    shareTokenAddress: string;
    manager_badge_address: string;
    total: number;
    today: number;
    activeDays: number;
    followers: string[];
    totalEquity: number;
    managerEquity: number;
    followerEquity: number;
    pricePerShare: number;
    profitShare: number;
    manager: User;
    tradeHistory: Trade[];
    assets: Map<string, number>;
    deposits: Transaction[];
    withdrawals: Transaction[];
    shareTokenAmount: number,

    calculatePnL: () => number;
    calculateROI: () => number;
    calculateUserInvestedEquity: (userId: string | undefined) => number;
    calculateUserPnL: (userId: string | undefined, userShareAmount: number) => number;
    calculateUserROI: (userId: string | undefined, userShareAmount: number) => number;
}

export interface VaultPerformance {
    x: Date;
    y: number[];
}

export interface VaultCandleChart {
    name: string;
    data: VaultPerformance[];
}

export interface VaultHistory {
    symbol: string;
    call: string;
    open: string;
    openDate: string;
    close: string;
    closeDate: string;
    amount: string;
    totalUSD: string;
    transaction: string;
}
export interface Trade {
    epoch: number;
    unixTimestamp: number;
    action: TradeAction;
    from: Asset;
    from_amount: number;
    to: Asset;
    to_amount: number;
    price: number;
}

export enum TradeAction {
    Buy = "Buy",
    Sell = "Sell",
    Default = "Default"
}

export interface Transaction {
    userId: string;
    unixTimestamp: number;
    action: string;
    amount: number;
}
