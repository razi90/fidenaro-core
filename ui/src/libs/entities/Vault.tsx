import { Asset, AssetMap } from "./Asset";
import { User } from "./User";

export interface Vault {
    id: string;
    name: string;
    description: string;
    share_token_address: string;
    total: number;
    today: number;
    activeDays: number;
    followers: string[];
    equity: number;
    profitShare: number;
    pnl: number;
    manager: User;
    followerList: string[];
    tradeHistory: Trade[];
    assets: AssetMap;
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
