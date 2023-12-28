import {
    Text, Tooltip,
} from '@chakra-ui/react';

interface TruncatedNumberValueProps {
    content: string;
}

export const TruncatedNumberValue: React.FC<TruncatedNumberValueProps> = ({ content }) => {
    //const truncatedContent = content.substring(0, 8) + (content.length > 8 ? '...' : '');

    const delimiter = /[.,]/; // Regular expression to match period or comma
    const splitArray = content.split(delimiter);
    const prevElement = splitArray[splitArray.length - 2];
    const lastElement = splitArray[splitArray.length - 1];
    const truncatedContent = lastElement.slice(0, 2);

    return (
        <>
            <Tooltip label={content}>
                {prevElement + "." + truncatedContent}
            </Tooltip>
        </>
    );
};