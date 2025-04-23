import React, { createContext, useState } from 'react';
import useToken from '../hooks/useToken';
interface AuthContextProps {
  children: any
}

interface ContextDefault {
  isLogged: boolean,
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>,
  token: string,
  setToken: React.Dispatch<React.SetStateAction<string>>,
  change: number,
  setChange: React.Dispatch<React.SetStateAction<number>>
}

export const AuthContext = createContext<ContextDefault>({ isLogged: false, setIsLogged: () => { }, token: '', setToken: () => { },
  change: 0, setChange: () => { } });

export const AuthProvider = (props: AuthContextProps) => {
  const [ isLogged, setIsLogged ] = useState(false);
  const { token, setToken } = useToken();
  const [ change, setChange ] = useState(0);

  return (
    <AuthContext.Provider value={{ isLogged, setIsLogged, token, setToken, change, setChange }}>
      {props.children}
    </AuthContext.Provider>
  );
};
