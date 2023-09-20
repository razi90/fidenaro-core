import {
    Link,
    Button,
    Box,
    Text,
} from "@chakra-ui/react";
import { LeftNavigationButtonIcon } from "./LeftNavigationButtonIcon"
import {
    leftNavigationButtonStyle,
} from "./Styled";

interface FeatureProps {
    link: string;
    title: string;
    icon: any;
    navIsMinimized: boolean;

}

export const LeftNavigationButton = ({ link, title, icon, navIsMinimized }: FeatureProps) => {
    return (
        <Button
            as={Link}
            href={link}
            sx={leftNavigationButtonStyle}
            title={title}>

            <LeftNavigationButtonIcon icon={icon} />

            <Box w="100%">
                {navIsMinimized ? null : <Text pl={3}>{title}</Text>}
            </Box>
        </Button>
    );
};
