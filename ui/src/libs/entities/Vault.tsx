export interface Vault {
    id: string;
    vault: string;
    avatar: string;
    total: number;
    today: number;
    activeDays: number;
    followers: number;
    equity: number;
    profitShare: number;
    pnl: number;
    manager: string;
    followerList: string[];
    tradeHistory: number[];
    trades: Trade[];
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

}