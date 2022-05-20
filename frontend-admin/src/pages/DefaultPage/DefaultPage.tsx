import React, { useLayoutEffect } from 'react';
import { useContext } from "react";
import { LoginPage } from "..";
import { AuthContext } from "../../providers/AuthProvider";
import AdminPanel from "../AdminPanel/AdminPanel";
import { useCookies } from 'react-cookie';
import axios from 'axios';

const DefaultPage = () => {
    const { isLogged, setIsLogged } = useContext(AuthContext);
    const [cookies, setCookie] = useCookies<any | null>(['user']);

    useLayoutEffect(() => {
        console.log(cookies);
        let config = {
            method: 'get',
            url: `https://mate85-api.litiano.dev.br/api/user`,
            headers: {
                'Authorization': cookies.Bearer
            }
        };

        axios(config).then((response: any) => {
            if (response.status === 200){
                setIsLogged(true);
            }
        });
    }, []);

    return isLogged ? <AdminPanel /> : <LoginPage />

}

export default DefaultPage;