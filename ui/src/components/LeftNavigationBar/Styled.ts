export const leftNavigationToggleButtonStyle = (isMinimized: any) => ({
    title: "Toogle",
    w: isMinimized ? "60px" : "200px",
    transition: "width 0.3s",
    position: "absolute",
    bottom: "20",

    color: "backTransparent.900",
    size: "md",
    borderRadius: "sm",
    bg: "pElementTransparent.895",
    mr: "0",
    _hover: {
        textDecoration: "none",
        bg: "pElementTransparent.870",
    },
});

export const leftNavigationToggleIconStyle = {

    alignSelf: "center",
    color: "pElement.200",
    w: { base: 6, sm: 6 },
    h: { base: 6, sm: 6 },
};


export const leftNavigationButtonStyle = {
    size: "md",
    borderRadius: "sm",
    bg: "pElementTransparent.895",
    py: "6",

    position: "relative",
    overflow: "hidden",
    ":after": {
        content: '""',
        position: "absolute",
        //top: 0,
        right: "-100%",
        bottom: "-100%",
        width: "100%",
        height: "100%",
        //transform: "rotate(60deg)",
        backgroundColor: "pElementTransparent.890",
        transition: "all 0.3s ease-out",
    },
    ":hover::after": {
        right: 0,
        bottom: 0,
    },
    ":hover": {
        textDecoration: "none",
        bg: "pElementTransparent.895",
    },
};

export const leftNavigationMainBoxStyle = (bgColor: string, boxShadow: string) => ({
    boxShadow: boxShadow,
    bg: bgColor,
    transition: "width 0.3s",
    height: '100%',
    position: "fixed"
});

export const leftNavigationMainVStackStyle = {
    spacing: "1",
    pt: "4",
};

export const leftNavigationDividerBoxStyle = (isMinimized: any) => ({
    px: "4",
    align: "center",
    w: "100%", borderColor: 'gray.200',
    borderBottom: "1px solid #ddd",
});
