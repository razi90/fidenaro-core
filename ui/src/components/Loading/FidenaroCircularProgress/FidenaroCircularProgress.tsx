import {
    CircularProgress,
    CircularProgressLabel,
    Image,
} from "@chakra-ui/react";
import { FidenaroCircularProgressImageStyle } from "./Styled";

interface FidenaroCircularProgressProps {
    circleSize: string;
    circleBorderThickness: string;
    circleImageSize: string;

}

export const FidenaroCircularProgress: React.FC<FidenaroCircularProgressProps> = ({ circleSize, circleBorderThickness, circleImageSize }) => {

    return (
        <>
            <CircularProgress isIndeterminate
                color='pElement.200'
                size={circleSize}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                thickness={circleBorderThickness} >
                <CircularProgressLabel>
                    <Image
                        sx={FidenaroCircularProgressImageStyle(circleImageSize)} // sx={FidenaroCircularProgressStyle(circleSize)}
                        src="/images/LogoFidenaro.png"
                        alt="Fidenaro Logo"
                    />
                </CircularProgressLabel>
            </CircularProgress>
        </>
    );
}
