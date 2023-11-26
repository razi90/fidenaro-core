import { Text } from "@chakra-ui/react";

interface PnlTextProps {
    value: number;
}

const PnlText: React.FC<PnlTextProps> = ({ value }) => {
    return (
        <Text color={value >= 0 ? 'green.500' : 'red.500'} >$ {value}</Text>
    )
}

export default PnlText;