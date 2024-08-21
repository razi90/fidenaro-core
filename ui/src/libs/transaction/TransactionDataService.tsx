import { addressToAsset, Asset } from "../entities/Asset";
import { gatewayApi } from "../radix-dapp-toolkit/rdt"

export interface Transaction {
    userId: string;
    unixTimestamp: number;
    action: string;
    amount: number;
}

export type TradeEventData = {
    epoch: number;
    round_timestamp: string;
    trade_details: {
        from: Asset;
        from_amount: string;
        to: Asset;
        to_amount: string;
        price: number;
    };
};


export const fetchTradeHistory = async (id: string): Promise<TradeEventData[]> => {
    const tradeEvents: TradeEventData[] = [];
    const transactionData = await gatewayApi.stream.innerClient.streamTransactions(
        {
            streamTransactionsRequest: {
                affected_global_entities_filter: [id],
                opt_ins: {
                    receipt_events: true
                }
            }
        }
    )

    transactionData.items.forEach((item: any) => {
        // Check if the receipt has events
        if (item.receipt && item.receipt.events) {
            // Filter for TradeEvent within the events
            item.receipt.events.forEach((event: any) => {
                if (event.name === 'TradeEvent') {
                    const tradeDetail = {
                        from: addressToAsset(event.data.fields.find((field: any) => field.field_name === 'from')?.value || ''),
                        from_amount: event.data.fields.find((field: any) => field.field_name === 'from_amount')?.value || '',
                        to: addressToAsset(event.data.fields.find((field: any) => field.field_name === 'to')?.value || ''),
                        to_amount: event.data.fields.find((field: any) => field.field_name === 'to_amount')?.value || '',
                        price: event.data.fields.find((field: any) => field.field_name === 'price')?.value || 0,
                    };

                    // Create a TradeEventData object
                    const tradeEventData: TradeEventData = {
                        epoch: item.epoch,
                        round_timestamp: item.round_timestamp,
                        trade_details: tradeDetail
                    };

                    // Add it to the list of trade events
                    tradeEvents.push(tradeEventData);
                }
            });
        }
    });

    return tradeEvents;
}
