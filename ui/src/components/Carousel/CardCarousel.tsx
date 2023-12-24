import { Box, Flex, VStack } from '@chakra-ui/react';
import React from 'react'
import { Vault } from '../../libs/entities/Vault';
import { CarouselCard } from '../Card/CarouselCard';
import { ManagerCard } from '../Card/ManagerCard';
import PnlText from '../Text/PnlText';
import { ValueCard } from '../Card/ValueCard';
import { LinkCard } from '../Card/LinkCard';
import { FollowButton } from '../Button/FollowButton/FollowButton';

interface CardCarouselProps {
    rankedVaults: Vault[] | undefined;
    isConnected: boolean;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ rankedVaults, isConnected }) => {
    return (
        <Flex>
            {rankedVaults?.slice(0, 3).map((vault, index) => (
                <CarouselCard index={index} cardWidth='100%' cardHeight='100%' isLoading={false}>
                    <VStack mt='4' spacing='0'>
                        <Box w={"100%"}>
                            <ManagerCard name={vault.manager} imageLink={vault.avatar} isLoading={false} />
                        </Box>
                        <Box w={"100%"}>
                            <LinkCard name={vault.vault} tooltip='Go to vault view' urlLink={`/vault/${vault.id}`} isLoading={false} />
                        </Box>
                        <Box w={"100%"}>
                            <ValueCard description={"Total profit and loss (PnL)"} value={<PnlText value={vault.pnl} />} isLoading={false} />
                        </Box>
                        <Flex justifyContent='flex-end' w={"100%"} mt={6} px={2}  >
                            <FollowButton vaultName={vault.vault} vaultFee={vault.profitShare} isConnected={isConnected} />
                        </Flex>
                    </VStack>
                </CarouselCard>
            ))}
        </Flex>
    );
};
