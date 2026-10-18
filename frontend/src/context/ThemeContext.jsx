import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const ThemeContext = createContext(null);


export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("dark");

    const [isTransitioning, setIsTransitioning] =
        useState(false);


    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            theme
        );
    }, [theme]);


    function toggleTheme() {
        if (isTransitioning) {
            return;
        }

        setIsTransitioning(true);


        setTimeout(() => {
            setTheme((currentTheme) =>
                currentTheme === "dark"
                    ? "light"
                    : "dark"
            );
        }, 350);


        setTimeout(() => {
            setIsTransitioning(false);
        }, 800);
    }


    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                isTransitioning,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}


export function useTheme() {
    return useContext(ThemeContext);
}