import { useContext, useEffect, useState } from "react";
import hero from "../../assets/login.svg";
import { AuthContext } from "../../providers/AuthProvider";
import React from 'react';

import styles from "./Login.module.css";

import { api } from "../../services/api";
import axios from 'axios';
function LoginPage(props: any) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { token, setToken } = useContext(AuthContext);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setEmail(newValue);
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setPassword(newValue);
    }

    const handleLogin = () => {
        api.post('https://mate85-api.litiano.dev.br/api/login', {
            email, password
        }).then((response: any) => {

            if (response.status === 200) {

                const bearer = "Bearer " + response.data;
                setToken(bearer);

                api.defaults.headers.common['Authorization'] = bearer;
             }
             document.location.href="/areas";

        }).catch(function (response: any) {
            console.log(response);
        });
    }

    return (
        <div className={styles.login_page}>
            <div className={styles.login_page__action_container}>
                <h1>Painel de Administração</h1>

                <div className={styles.login_page__form}>
                    <div className={styles.login_page__form__input_container}>
                        <span>E-mail:</span>
                        <input type="email" placeholder="fulano.beltrano@ufba.br" onChange={handleEmailChange}
                            value={email} />
                    </div>

                    <div className={styles.login_page__form__input_container}>
                        <span>Senha:</span>
                        <input type="password" placeholder="Senha" onChange={handlePasswordChange}
                            value={password} />
                    </div>

                    <button onClick={handleLogin}>Acessar</button>

                    {/*<a target="_blank" href="#!" rel="noreferrer">
                        Esqueceu a senha?
                    </a>*/}
                </div>
            </div>

            <div className={styles.login_page__divider} />

            <div className={styles.login_page__hero}>
                <img alt="Login" src={hero} />
            </div>
        </div>
    );
}

export default LoginPage;
