import {
    chakra,
    VisuallyHidden,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { styleSocialButton } from './Styled';

export const SocialButton = ({
    children,
    label,
    href,
}: {
    children: ReactNode;
    label: string;
    href: string;
}) => {
    return (
        <chakra.button
            as={'a'}
            href={href}
            sx={styleSocialButton}
        >
            <VisuallyHidden>{label}</VisuallyHidden>
            {children}
        </chakra.button >
    );
};