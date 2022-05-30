
import { useState } from 'react';
import React from 'react';

export default function useToken() {
  const getToken = () => {
    const tokenString: any = localStorage.getItem('token');
    return tokenString
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken: any) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
  };

  return {
    setToken: saveToken,
    token
  }
}