import {
    Link,
    Button,
    Box,
    Text,
} from "@chakra-ui/react";
import { LeftNavigationButtonIcon } from "./LeftNavigationButtonIcon";
import {
    leftNavigationButtonStyle,
} from "./Styled";

interface FeatureProps {
    link: string;
    title: string;
    icon: any;
    navIsMinimized: boolean;
    isExternal?: boolean; // Optional prop to indicate external link
}

export const LeftNavigationButton: React.FC<FeatureProps> = ({
    link,
    title,
    icon,
    navIsMinimized,
    isExternal = false,
}) => {
    return (
        <Button
            as={Link}
            href={link}
            target={isExternal ? "_blank" : undefined} // Opens in new tab if isExternal is true
            rel={isExternal ? "noopener noreferrer" : undefined} // Enhances security
            sx={leftNavigationButtonStyle}
            title={title}
            _hover={{ textDecoration: "none" }}
        >
            <LeftNavigationButtonIcon icon={icon} />

            <Box w="100%">
                {!navIsMinimized && <Text pl={3}>{title}</Text>}
            </Box>
        </Button>
    );
};

export default LeftNavigationButton;
