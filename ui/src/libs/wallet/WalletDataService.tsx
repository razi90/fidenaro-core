import { WalletDataState } from "@radixdlt/radix-dapp-toolkit";
import { rdt } from "../radix-dapp-toolkit/rdt";

export const fetchConnectedWallet = async () => {
    try {
        const walletData: WalletDataState = rdt.walletApi.getWalletData()!;

        return walletData;
    } catch (error) {
        throw error;
    }
}
