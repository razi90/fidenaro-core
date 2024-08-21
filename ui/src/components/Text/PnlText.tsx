import { Text } from "@chakra-ui/react";
import { TruncatedNumberValue } from "./TruncatedValue";

interface PnlTextProps {
    value: number;
}

const PnlText: React.FC<PnlTextProps> = ({ value }) => {
    return (
        <Text color={value >= 0 ? 'green.500' : 'red.500'} >XRD <TruncatedNumberValue content={value + ""} /></Text>
    )
}

export default PnlText;