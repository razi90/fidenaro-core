import React from 'react';
import { Box } from '@chakra-ui/react';

import { NavigationItems } from './NavigationItems';
import { leftNavigationMainBoxStyle } from "./Styled";
import { fetchLeftNavigationStatus } from '../../libs/navigation/LeftNavigationBarDataService';
import { useColorModeValue } from "@chakra-ui/react";

interface LeftNavigationBarProps {
    isMinimized: boolean;
    setIsMinimized: (value: boolean) => void;
}

const LeftNavigationBar: React.FC<LeftNavigationBarProps> = ({ isMinimized, setIsMinimized }) => {
    const bgColor = useColorModeValue("white", "#161616");
    const boxShadow = useColorModeValue("0 0 10px 0px #ccc", "0 0 10px 0px #211F34");
    const toggleMinimize = () => {
        const navi = fetchLeftNavigationStatus(); // queryClient.getQueryData(['left_navi_status']) ?? false
        localStorage.setItem('leftNavigationBarIsMinimized', JSON.stringify(!navi));
        setIsMinimized(!navi);
    };

    return (
        <Box
            sx={leftNavigationMainBoxStyle(bgColor, boxShadow)}
            width={isMinimized ? "60px" : "200px"}
        >
            <NavigationItems isMinimized={isMinimized} toggleMinimize={toggleMinimize} />
        </Box>
    );
};

export default LeftNavigationBar;
