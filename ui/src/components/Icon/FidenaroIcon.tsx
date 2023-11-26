import {
    Flex,
    Stack,
    Icon,
} from "@chakra-ui/react";

interface FidenaroIconProps {
    icon: any;
    color: string;
}

export const FidenaroIcon = ({ icon, color }: FidenaroIconProps) => {
    return (
        <Stack align={"left"}>
            <Flex
                w={{ base: 10, sm: 10 }}
                h={{ base: 10, sm: 10 }}
                align={"center"}
                justify={"center"}
                rounded={"full"}
                bg={"pElementTransparent.890"}
            >
                <Icon as={icon} color={color} w={{ base: 6, sm: 6 }} h={{ base: 6, sm: 6 }} />

            </Flex>
        </Stack>
    );
};
