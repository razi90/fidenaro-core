export const topNavigationBoxStyle = (bgColor: string, boxShadow: string) => ({
    bg: bgColor,
    textShadow: "sm",
    as: "header",
    position: "fixed",
    zIndex: "10",
    w: "100%",
    px: "4",
    boxShadow: boxShadow,
});

export const topNavigationHiddenBoxStyle = {
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

export const topNavigationHamburgerMenuStyle = {
    boxSize: 30,
    color: "font.300",
    borderRadius: "md",
    mr: "0",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.880",
    },
};
