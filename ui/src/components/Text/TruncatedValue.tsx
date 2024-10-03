import {
    Tooltip,
} from '@chakra-ui/react';

interface TruncatedNumberValueProps {
    content: string;
}

export const TruncatedNumberValue: React.FC<TruncatedNumberValueProps> = ({ content }) => {
    const delimiter = /[.,]/; // Regular expression to match period or comma
    const splitArray = content.split(delimiter);

    let displayContent;

    if (splitArray.length === 1) {
        // No delimiter found, use the entire content
        displayContent = content;
    } else {
        // Delimiter found, process to truncate
        const prevElement = splitArray[splitArray.length - 2];
        const lastElement = splitArray[splitArray.length - 1];
        const truncatedContent = lastElement.slice(0, 5);
        displayContent = `${prevElement}.${truncatedContent}`;
    }

    return (
        <Tooltip label={content}>
            {displayContent}
        </Tooltip>
    );
};
