

export const routePageBoxStyle = (isMinimized: boolean) => ({
    color: "#000",
    w: "100%",
    bg: "#fff",
    p: "20px",
    ml: isMinimized ? "70px" : "210px",
    transition: "margin-left 0.5s",
});
