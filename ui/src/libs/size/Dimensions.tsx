import { useState, useEffect, useRef } from "react";

export function useDimensions() {
    const [pageDimension, setPageDimension] = useState({
        width: 0,
        height: 0,
    });

    const windowSize = useRef([window.innerWidth, window.innerHeight]);

    useEffect(() => {
        setPageDimension({ width: windowSize.current[0], height: windowSize.current[1] });
    }, []);

    return pageDimension;
}