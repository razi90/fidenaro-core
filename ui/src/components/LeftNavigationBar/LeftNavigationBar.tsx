import React, { useState } from 'react';
import {
    Box,
    Button,
    Text,
    VStack,
    Icon,

} from '@chakra-ui/react';
import { ChevronDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { FaMedal, FaQuestion, FaBookOpen, FaChartPie, FaChartBar, FaUserCircle } from "react-icons/fa";

import { LeftNavigationButton } from "./LeftNavigationButton"

import {
    leftNavigationToggleButtonStyle,
    leftNavigationToggleIconStyle,
    leftNavigationMainVStackStyle,
    leftNavigationMainBoxStyle,
    leftNavigationDividerBoxStyle,
} from "./Styled";

const LeftNavigationBar: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(false);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <Box sx={leftNavigationMainBoxStyle} width={isMinimized ? "60px" : "200px"} >
            <VStack align="stretch" sx={leftNavigationMainVStackStyle}>
                <LeftNavigationButton link="/profile" title="Profile" icon={FaUserCircle} navIsMinimized={isMinimized} />

                <Box sx={leftNavigationDividerBoxStyle(isMinimized)}>
                    {isMinimized ? null : <Text as='b'>Trade</Text>}
                </Box>

                <LeftNavigationButton link="/" title="Explore" icon={FaChartBar} navIsMinimized={isMinimized} />
                <LeftNavigationButton link="/portfolio" title="Portfolio" icon={FaChartPie} navIsMinimized={isMinimized} />
                <LeftNavigationButton link="/walloffame" title="Wall of Fame" icon={FaMedal} navIsMinimized={isMinimized} />

                <Box sx={leftNavigationDividerBoxStyle(isMinimized)}>
                    {isMinimized ? null : <Text as='b'>More</Text>}
                </Box>

                <LeftNavigationButton link="/faq" title="FAQ" icon={FaQuestion} navIsMinimized={isMinimized} />
                <LeftNavigationButton link="https://docs.fidenaro.com/" title="Documentation" icon={FaBookOpen} navIsMinimized={isMinimized} />

            </VStack >
            <Box>
                <Button
                    onClick={toggleMinimize}
                    sx={leftNavigationToggleButtonStyle(isMinimized)}
                >
                    {isMinimized ?
                        <Icon as={ArrowRightIcon} sx={leftNavigationToggleIconStyle} />
                        :
                        <Icon as={ArrowLeftIcon} sx={leftNavigationToggleIconStyle} />
                    }
                </Button>
            </Box>
        </Box >
    );
};

export default LeftNavigationBar;