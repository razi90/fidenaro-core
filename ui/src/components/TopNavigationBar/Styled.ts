
export const topNavigationBoxStyle = {
    bg: "white",
    textShadow: "sm",
    as: "header",
    position: "fixed",
    zIndex: "1500",
    w: "100%",
    px: "4",
    color: "black",
    boxShadow: "0 0 10px 0px #ccc;",

    // let's also provide dark mode alternatives
    _dark: {
        bg: "white",
        color: "font.900",
    },
};

export const topNavigationHiddenBoxStyle = {
    bg: "white",
    as: "header",
    w: "100%",
    h: "16",
};

export const topNavigationMainFlexStyle = {
    w: "100vw",
    h: "16",
    alignItems: "center",
    align: "center",
    justifyContent: "space-between",
};

export const topNavigationLogoStyle = {
    borderRadius: "full",
    boxSize: "55px",
    py: "5px",
    px: "3px",
};

export const topNavigationButtonStyle = {
    color: "black",
    size: "md",
    borderRadius: "md",
    bg: "white",
    mr: "0",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.880",
    },
};

export const topNavigationHamburgerMenuStyle = {
    bg: "",
    boxSize: 30,
    color: "font.300",
    borderRadius: "md",
    mr: "0",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.880",
    },
};
