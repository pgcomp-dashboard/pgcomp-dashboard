import React, { createContext, useState } from "react";

interface AuthContextProps {
    children: any
}

interface ContextDefault {
    isLogged: boolean,
    setIsLogged: React.Dispatch<React.SetStateAction<boolean>>
}

export const AuthContext = createContext<ContextDefault>({ isLogged: false, setIsLogged: () => { } });

export const AuthProvider = (props: AuthContextProps) => {
    const [isLogged, setIsLogged] = useState(false);

    return (
        <AuthContext.Provider value={{ isLogged, setIsLogged }}>
            {props.children}
        </AuthContext.Provider>
    )
}
