import { extendTheme } from "@chakra-ui/react";

const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

const styles = {
    global: (props: { colorMode: string; }) => ({
        body: {
            bg: props.colorMode === 'dark' ? '#211F34' : '#F8F8F8',
            color: props.colorMode === 'dark' ? '#F8F8F8' : 'black',
        },
    }),
};

const colors = {
    back: {
        900: "#161616",
        800: "#19191E",
        700: "#1C1B25",
        600: "#211F34",
        500: "#2C2851",
    },
    pElement: {
        300: "#413A8B",
        200: "#6B5EFF",
    },
    sElement: {
        200: "#8EC1FF",
    },
    font: {
        900: "grey.900",
        800: "grey.800",
        700: "grey.700",
        600: "grey.600",
        500: "grey.500",
        400: "grey.400",
        300: "gray.300",
        200: "gray.200",
        100: "gray.100",
        50: "gray.50",
    },
    backTransparent: {
        900: "rgba(22, 22, 22, 0.97)",
        910: "rgba(22, 22, 22, 0.9)",
        920: "rgba(22, 22, 22, 0.8)",
        930: "rgba(22, 22, 22, 0.7)",
        800: "rgba(25, 25, 30, 0.97)",
        810: "rgba(25, 25, 30, 0.9)",
        820: "rgba(25, 25, 30, 0.8)",
        830: "rgba(25, 25, 30, 0.7)",
        700: "rgba(28, 27, 37, 0.97)",
        710: "rgba(28, 27, 37, 0.9)",
        720: "rgba(28, 27, 37, 0.8)",
        730: "rgba(28, 27, 37, 0.7)",
        600: "rgba(33, 31, 52, 0.97)",
        610: "rgba(33, 31, 52, 0.9)",
        620: "rgba(33, 31, 52, 0.8)",
        630: "rgba(33, 31, 52, 0.7)",
        500: "rgba(44, 40, 81, 0.97)",
        510: "rgba(44, 40, 81, 0.9)",
        520: "rgba(44, 40, 81, 0.8)",
        530: "rgba(44, 40, 81, 0.7)",

    },
    pElementTransparent: {
        900: "rgba(65, 58, 139, 0.97)",
        910: "rgba(65, 58, 139, 0.9)",
        920: "rgba(65, 58, 139, 0.8)",
        930: "rgba(65, 58, 139, 0.7)",
        800: "rgba(107, 94, 255, 0.97)",
        810: "rgba(107, 94, 255, 0.9)",
        820: "rgba(107, 94, 255, 0.8)",
        830: "rgba(107, 94, 255, 0.7)",
        840: "rgba(107, 94, 255, 0.6)",
        850: "rgba(107, 94, 255, 0.5)",
        860: "rgba(107, 94, 255, 0.4)",
        870: "rgba(107, 94, 255, 0.3)",
        880: "rgba(107, 94, 255, 0.2)",
        890: "rgba(107, 94, 255, 0.1)",
        895: "rgba(107, 94, 255, 0.05)",
    },
    sElementTransparent: {
        900: "rgba(142, 193, 255, 0.97)",
        910: "rgba(142, 193, 255, 0.9)",
        920: "rgba(142, 193, 255, 0.8)",
        930: "rgba(142, 193, 255, 0.7)",
    },
    whiteTransparent: {
        900: "WhiteAlpha.900",
        800: "WhiteAlpha.800",
        700: "WhiteAlpha.700",
        600: "WhiteAlpha.600",
        500: "WhiteAlpha.500",
        400: "WhiteAlpha.400",
        300: "WhiteAlpha.300",
        200: "WhiteAlpha.200",
        100: "WhiteAlpha.100",
        50: "WhiteAlpha.50",
        0: "rgba(255, 255, 255, 0.0)",
    },
    blackTransparent: {
        900: "BlackAlpha.900",
        800: "BlackAlpha.800",
        700: "BlackAlpha.700",
        600: "BlackAlpha.600",
        500: "BlackAlpha.500",
        400: "BlackAlpha.400",
        300: "BlackAlpha.300",
        200: "BlackAlpha.200",
        100: "BlackAlpha.100",
        50: "BlackAlpha.50",
    }, //boxShadow: "0 0 10px 0px #413A8B"
    pElementShadow: {
        300: "0 0 0 1px #413A8B",
        301: "0 0 5px 1px #413A8B",
        302: "0 0 10px 1px #413A8B",
        303: "0 0 15px 1px #413A8B",
        304: "0 0 20px 1px #413A8B",
        310: "0 0 0 2px #413A8B",
        320: "0 0 0 3px #413A8B",
        330: "0 0 0 4px #413A8B",
        340: "0 0 0 5px #413A8B",
        200: "0 0 0 1px #6B5EFF",
        201: "0 0 5px 1px #6B5EFF",
        202: "0 0 10px 1px #6B5EFF",
        203: "0 0 15px 1px #6B5EFF",
        204: "0 0 20px 1px #6B5EFF",
        205: "0 0 25px 1px #6B5EFF",
        210: "0 0 0 2px #6B5EFF",
        220: "0 0 0 3px #6B5EFF",
        230: "0 0 0 4px #6B5EFF",
        240: "0 0 0 5px #6B5EFF",
    },
    sElementShadow: {
        300: "0 0 0 1px #413A8B",
        301: "0 0 1px 1px #413A8B",
        310: "0 0 0 2px #413A8B",
        320: "0 0 0 3px #413A8B",
        330: "0 0 0 4px #413A8B",
        340: "0 0 0 5px #413A8B",
        200: "0 0 0 1px #8EC1FF",
        201: "0 0 1px 1px #8EC1FF",
        210: "0 0 0 2px #8EC1FF",
        220: "0 0 0 3px #8EC1FF",
        230: "0 0 0 4px #8EC1FF",
        240: "0 0 0 5px #8EC1FF",
    },
};


const fonts = {
    heading: "Roboto",
    body: "Roboto", // 'Segoe UI', 'Roboto', 'Oxygen'
};

const breakpoints = {
    sm: '321px',
    lsm: '480px',
    md: '768px',
    lg: '992px',
    xl: '1280px',
    '2xl': '1536px',
}

const theme = extendTheme({ config, styles, colors, fonts, breakpoints });

export default theme;
