import React from 'react';
import { useContext } from "react";
import { LoginPage } from "..";
import { AuthContext } from "../../providers/AuthProvider";
import AdminPanel from "../AdminPanel/AdminPanel";

const DefaultPage = () => {
    const { isLogged } = useContext(AuthContext);

    return isLogged ? <AdminPanel /> : <LoginPage />

}

export default DefaultPage;