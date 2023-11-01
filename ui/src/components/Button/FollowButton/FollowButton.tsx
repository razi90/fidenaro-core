import { Button, Tooltip } from '@chakra-ui/react';
import { followButtonStyle } from './Styled';
import FollowDialog from '../../FollowDialog/FollowDialog';
import { useState } from 'react';

interface FollowButtonProps {
    vaultName: string
    vaultFee: number
}

const FollowButton: React.FC<FollowButtonProps> = ({ vaultName, vaultFee }) => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip label='Follow this trader'>
                <Button {...followButtonStyle} onClick={() => setIsOpen(true)}>
                    Follow
                </Button>
            </Tooltip>
            <FollowDialog isOpen={isOpen} setIsOpen={setIsOpen} vaultName={vaultName} vaultFee={vaultFee} />
        </>
    );
};

export default FollowButton;
