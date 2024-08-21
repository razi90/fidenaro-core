import {
    Flex,
    Stack,
    Icon,
    Image
} from "@chakra-ui/react";

interface FidenaroIconProps {
    icon: any;
    color: string;
}

interface FidenaroImageIconProps {
    imageSrc: any;
    altText: string;
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

export const FidenaroImageIcon = ({ imageSrc, altText }: FidenaroImageIconProps) => {
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
                <Image
                    src={imageSrc}
                    alt={altText}
                    w={{ base: 6, sm: 6 }}
                    h={{ base: 6, sm: 6 }}
                    borderRadius={"full"}
                />

            </Flex>
        </Stack>
    );
};
