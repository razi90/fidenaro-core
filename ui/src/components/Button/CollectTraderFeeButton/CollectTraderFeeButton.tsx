import {
    Button,
    Tooltip,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { collectTraderFeeButtonStyle } from './Styled';
import { Vault } from '../../../libs/entities/Vault';
import { address, decimal, enumeration, expression, ManifestBuilder, NetworkId, RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { enqueueSnackbar } from 'notistack';
import { rdt } from '../../../libs/radix-dapp-toolkit/rdt';
import { User } from '../../../libs/entities/User';

interface CollectTraderFeeButtonProps {
    vault: Vault | undefined;
    user: User | undefined;
    isConnected: boolean;
}

export const CollectTraderFeeButton: React.FC<CollectTraderFeeButtonProps> = ({ vault, user, isConnected }) => {

    const [isLoading, setIsLoading] = useState(false);

    // Define the collectFee function
    const collectFee = async () => {
        setIsLoading(true);

        const positiveEntries = Array.from(vault?.managerAssetValues?.entries() || []).filter(([key, assetStats]) =>
            assetStats.amount > 0 || assetStats.valueInUSD > 0 || assetStats.valueInXRD > 0
        );

        if (positiveEntries.length === 0) {
            enqueueSnackbar("No fees collected yet.", { variant: 'error' });
        } else {
            enqueueSnackbar("Confirm on your mobile wallet!", { variant: 'info' });
            let manifestBuilder = new ManifestBuilder()
                .callMethod(
                    user?.account!,
                    "create_proof_of_amount",
                    [
                        address(
                            vault?.manager_badge_address!
                        ),
                        decimal(1),
                    ]
                );

            // Iterate over each positive entry and add a callMethod for each
            positiveEntries.forEach(([key, assetStats]) => {
                manifestBuilder = manifestBuilder.callMethod(
                    vault?.id!,
                    "withdraw_collected_trader_fee",
                    [
                        address(key)
                    ]
                );
            });

            manifestBuilder = manifestBuilder.callMethod(
                user?.account!,
                "try_deposit_batch_or_abort",
                [
                    expression("EntireWorktop"),
                    enumeration(0)
                ]
            );

            let transactionManifest = manifestBuilder.build();

            let convertedInstructions = await RadixEngineToolkit.Instructions.convert(
                transactionManifest.instructions,
                NetworkId.Stokenet,
                "String"
            );

            console.log('collect fees manifest: ', convertedInstructions.value)

            // send manifest to extension for signing
            const result = await rdt.walletApi
                .sendTransaction({
                    transactionManifest: convertedInstructions.value.toString(),
                    version: 1,
                })

            if (result.isOk()) {
                enqueueSnackbar(`Successfully collected fee from vault "${vault?.name}".`, { variant: 'success' });
                console.log(`Successfully collected fee from vault "${vault?.name}". Value ${result.value}`)
            }

            if (result.isErr()) {
                enqueueSnackbar(`Failed to withdraw from vault "${vault?.name}"`, { variant: 'error' });
                console.log("Failed to withdraw: ", result.error)
            }
        }

        setIsLoading(false);
    };

    return (
        <>
            {isConnected ? (
                <Tooltip label='Collect Your Earned Fee'>
                    <Button
                        onClick={collectFee} // No need to set isOpen
                        sx={collectTraderFeeButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Collect Your Earned Fee"
                        isLoading={isLoading} // Show loading state
                        isDisabled={isLoading} // Disable button while loading
                    >
                        Collect Fee
                    </Button>
                </Tooltip>
            ) : (
                <Tooltip label='Collect Your Earned Fee'>
                    <Button
                        sx={collectTraderFeeButtonStyle}
                        size={{ base: 'sm', sm: 'sm', lsm: 'md', md: 'md' }}
                        title="Collect Your Earned Fee"
                        isDisabled={true}
                    >
                        Collect Fee
                    </Button>
                </Tooltip>
            )}
        </>
    );
};
