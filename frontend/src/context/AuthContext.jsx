import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getAuthStatus,
    logoutUser,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadAuth() {
        try {
            const data = await getAuthStatus();

            if (data.authenticated) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error(error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        await logoutUser();
        setUser(null);
    }

    useEffect(() => {
        loadAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                setUser,
                logout,
                refreshAuth: loadAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}