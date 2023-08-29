// InvestButton.tsx
import React, { useState } from 'react';
import { Button, Drawer, DrawerOverlay, DrawerContent, DrawerBody, Input } from '@chakra-ui/react';

interface InvestButtonProps {
    onInvest: (investmentAmount: number) => void;
}

const InvestButton: React.FC<InvestButtonProps> = ({ onInvest }) => {
    const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [investmentAmount, setInvestmentAmount] = useState<number | undefined>();

    const handleInvestAmount = () => {
        if (investmentAmount !== undefined) {
            onInvest(investmentAmount);
            setDrawerOpen(false);
        }
    };

    return (
        <>
            <Button colorScheme='purple' size='sm' onClick={() => setDrawerOpen(true)}>
                Invest
            </Button>
            <Drawer isOpen={isDrawerOpen} placement='right' onClose={() => setDrawerOpen(false)}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerBody>
                        <p>Wallet Balance in RUSD: 1000</p>
                        <p>Deposit RUSD</p>
                        <Input
                            type='number'
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(parseInt(e.target.value))}
                            placeholder='Enter investment amount...'
                            style={{ border: '1px solid black', marginRight: '10px', padding: '8px' }}
                        />
                        <Button colorScheme='purple' size='sm' ml={2} onClick={handleInvestAmount}>
                            Deposit
                        </Button>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default InvestButton;
