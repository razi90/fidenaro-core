import { Box, Flex, VStack, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
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
    // Determine whether to use a vertical or horizontal layout based on screen size
    const flexDirection = useBreakpointValue<any>({ base: 'column', md: 'row' });

    return (
        <Flex
            direction={flexDirection}
            wrap="wrap"
            justifyContent={flexDirection === 'column' ? 'center' : 'space-between'}
            gap={0}
            alignItems="center"
        >
            {rankedVaults?.slice(0, 3).map((vault, index) => (
                <Box key={index} w={flexDirection === 'column' ? '100%' : '30%'} mb={4}>
                    <CarouselCard index={index} cardWidth='100%' cardHeight='100%' isLoading={false}>
                        <VStack mt='4' spacing={0}>
                            <Box w={"100%"}>
                                <ManagerCard name={vault.manager.name} imageLink={vault.manager.avatar} profileID={vault?.manager.id} isLoading={false} />
                            </Box>
                            <Box w={"100%"}>
                                <LinkCard name={vault.name} tooltip='Go to vault view' urlLink={`/vault/${vault.id}`} isLoading={false} />
                            </Box>
                            <Box w={"100%"}>
                                <ValueCard description={"Total profit and loss (PnL)"} value={<PnlText value={vault.calculatePnL()} />} isLoading={false} />
                            </Box>
                            <Flex justifyContent='center' w={"100%"} px={2}>
                                <FollowButton vault={vault} isConnected={isConnected} />
                            </Flex>
                        </VStack>
                    </CarouselCard>
                </Box>
            ))}
        </Flex>
    );
};
