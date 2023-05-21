import { useState, useEffect, useRef } from "react";

export function useViewportScroll() {
    const [scrollPosition, setScrollPosition] = useState({
        x: 0,
        y: 0,
    });


    const handleScroll = useRef(() => { });

    useEffect(() => {
        handleScroll.current = () => {
            setScrollPosition({ x: window.scrollX, y: window.scrollY });
        };
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll.current);

        return () => {
            window.removeEventListener("scroll", handleScroll.current);
        };
    }, []);

    return scrollPosition;
}