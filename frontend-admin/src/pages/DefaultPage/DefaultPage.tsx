import React from 'react';
import { useContext } from "react";
import { LoginPage } from "..";
import { AuthContext } from "../../providers/AuthProvider";
import AdminPanel from "../AdminPanel/AdminPanel";
import { api } from '../../services/api';

const DefaultPage = () => {
    const { token } = useContext(AuthContext);

    if (!token){
        return <LoginPage />
    } else {
        api.defaults.headers.common['Authorization'] = token;
    }

    return <AdminPanel />;

}

export default DefaultPage;