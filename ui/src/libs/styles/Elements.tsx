import {
    chakra,
    Link,
} from '@chakra-ui/react';

// Top Nav Bar
export const boxNavBar = {
    bg: "back.900",//"backTransparent.900",
    textShadow: "sm",
    as: "header",
    position: "fixed",
    zIndex: "9999",
    w: "100%",
    px: "4",
    color: "font.300",

    // let's also provide dark mode alternatives
    _dark: {
        bg: "back.900",
        color: "font.300",
    },
};

// Logo
export const fidenaorLogo = {
    borderRadius: "full",
    boxSize: "55px",
    padding: "5px",
    //bg: "pElementTransparent.890",
};

// Top Nav Bar Button as Link
export const buttonLinkTobNavBar = {
    color: "font.300",
    size: "md",
    borderRadius: "md",
    bg: "",
    mr: "0",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.880",
    },
};
export const buttonMenuTobNavBar = {
    color: "font.300",
    size: "md",
    borderRadius: "md",
    bg: "",
    mr: "4",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.880",
    },
    //transition: "all 0.2s",
    _expanded: { bg: "pElementTransparent.860" },
    transition: "background 0.3s ease",
};

export const menuListTobNavBar = {
    bg: "back.700",
    borderWidth: "0px",
    boxShadow: "0 0 10px 0px #6B5EFF;",

};

export const specialButton = {
    //variant={"solid"}
    //colorScheme: "orange",

    size: "sm",
    color: "font.100",
    borderRadius: "md",
    mr: "4",
    bg: "pElement.200",
    boxShadow: "0 0 15px 2px #6B5EFF",
    //boxShadow: "0px 0px 15px 2px #EC7A01", // B45F04
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.830",
    },
};

export const normalButton = {
    //variant={"solid"}
    //colorScheme: "orange",
    size: "sm",
    color: "font.100",
    borderRadius: "md",
    mr: "4",
    bg: "back.900",
    border: "2px solid",
    borderColor: "pElement.200",
    //boxShadow: "0px 0px 15px 2px #EC7A01", // B45F04
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.830",
    },
};

export const hamburgerMenu = {
    //variant={"solid"}
    bg: "",
    //size: "xl",
    boxSize: 30,
    color: "font.300",
    borderRadius: "md",
    mr: "0",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.880",
    },
};

export const hamburgerMenuLinks = {
    //variant={"solid"}
    bg: "",
    size: "1xl",
    color: "font.300",
    borderRadius: "md",
    mr: "0",
    p: "0",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.880",
    },
};

//variant={"solid"}
//colorScheme={"gray"}
////size={"md"}
//borderRadius={"md"}
//mr={8}
//bg={`sfdn.900`}


export const styleSocialButton = {
    bg: "pElementTransparent.880",
    rounded: "full",
    w: "8",
    h: "8",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s ease",
    _hover: {
        bg: "pElementTransparent.860",
    },

};

export const StyledLink = chakra(Link, {
    baseStyle: {
        textDecoration: "none",
        _hover: {
            textDecoration: "none",
        },
    },
});


export const styleGlassMorphism = chakra(Link, {
    bg: "whiteAlpha.50",
    borderRadius: "md",
    boxShadow: "inset 0px 0px 25px rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(20px)",
});

