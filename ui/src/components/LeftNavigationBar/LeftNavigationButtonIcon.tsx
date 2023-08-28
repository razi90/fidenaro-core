import {
    Flex,
    Stack,
    Icon,
} from "@chakra-ui/react";
import { ReactElement } from "react";


interface FeatureProps {
    icon: any;
}

export const LeftNavigationButtonIcon = ({ icon }: FeatureProps) => {
    return (
        <Stack color={"gray.200"} align={"left"}>
            <Flex
                w={{ base: 10, sm: 10 }}
                h={{ base: 10, sm: 10 }}
                align={"center"}
                justify={"center"}
                rounded={"full"}
                bg={"pElementTransparent.890"}
            >
                <Icon as={icon} color={"pElement.200"} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />

            </Flex>
        </Stack>
    );
};
