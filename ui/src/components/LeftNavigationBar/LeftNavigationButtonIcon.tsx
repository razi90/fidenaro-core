import {
    Flex,
    Stack,
    Icon,
    Image,
} from "@chakra-ui/react";

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
                {
                    (typeof icon !== 'string') ? (
                        <Icon as={icon} color={"pElement.200"} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />

                    ) : (
                        <Image src={icon.toString()} color={"pElement.200"} borderRadius="50%" />
                    )
                }

            </Flex>
        </Stack>
    );
};
