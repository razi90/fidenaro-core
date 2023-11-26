

export const routePageBoxStyle = (isMinimized: boolean) => ({
    color: "#000",
    w: "100vw",
    //bg: "#444",
    bg: "#F8F8F8",
    p: "20px",
    ml: isMinimized ? "60px" : "200px",
    transition: "margin-left 0.5s",
});
