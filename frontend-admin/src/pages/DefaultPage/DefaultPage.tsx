import React, { useLayoutEffect } from 'react';
import { useContext } from "react";
import { LoginPage } from "..";
import { AuthContext } from "../../providers/AuthProvider";
import AdminPanel from "../AdminPanel/AdminPanel";
import { useCookies } from 'react-cookie';
import axios from 'axios';
import useToken from '../../hooks/useToken';

const DefaultPage = () => {
    const { token } = useContext(AuthContext);

    if (!token){
        return <LoginPage />
    }

    return <AdminPanel />;

}

export default DefaultPage;