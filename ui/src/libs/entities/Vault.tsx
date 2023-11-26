export interface Vault {
    id: string,
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
}