import React, { createContext, useState } from "react";

interface AuthContextProps {
    children: any
}

interface ContextDefault {
    isLogged: boolean,
    setIsLogged: React.Dispatch<React.SetStateAction<boolean>>,
    token: string,
    setToken: React.Dispatch<React.SetStateAction<string>>
}

export const AuthContext = createContext<ContextDefault>({ isLogged: false, setIsLogged: () => { }, token: '', setToken: () => { } });

export const AuthProvider = (props: AuthContextProps) => {
    const [isLogged, setIsLogged] = useState(false);
    const [token, setToken] = useState('');

    return (
        <AuthContext.Provider value={{ isLogged, setIsLogged, token, setToken }}>
            {props.children}
        </AuthContext.Provider>
    )
}
