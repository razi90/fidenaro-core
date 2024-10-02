import { WalletDataState } from "@radixdlt/radix-dapp-toolkit";
import { rdt } from "../radix-dapp-toolkit/rdt";

export const fetchConnectedWallet = async () => {
    const walletData: WalletDataState = rdt.walletApi.getWalletData()!;
    return walletData;
}
