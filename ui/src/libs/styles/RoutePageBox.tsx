import { LayoutMode } from "../../Layout";

export const routePageBoxStyle = (layoutMode: LayoutMode) => {
    let marginLeft;

    switch (layoutMode) {
        case LayoutMode.Mobile:
            marginLeft = "0px";
            break;
        case LayoutMode.DesktopMinimized:
            marginLeft = "60px";
            break;
        case LayoutMode.DesktopExpanded:
            marginLeft = "200px";
            break;
    }

    return {
        color: "#000",
        w: "100vw",
        p: "20px",
        ml: marginLeft,
        transition: "margin-left 0.5s",
    };
};