export interface User {
    account: string;
    avatar: string;
    assets: {
        XRD: number;
        BTC: number;
        USD: number;
    };
}

export class AppUser implements User {
    account: string;
    avatar: string;
    assets: {
        XRD: number;
        BTC: number;
        USD: number;
    };

    constructor(data: User) {
        this.account = data.account;
        this.avatar = data.avatar;
        this.assets = data.assets;
    }

    get totalAssets(): number {
        return this.assets.XRD + this.assets.BTC + this.assets.USD;
    }

}