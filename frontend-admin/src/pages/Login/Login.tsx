import axios from "axios";
import { useContext, useEffect, useState } from "react";
import hero from "../../assets/login.svg";
import { AuthContext } from "../../providers/AuthProvider";

import { DashboardTemplate } from "../../templates";

import styles from "./Login.module.css";

function LoginPage() {
    axios.defaults.withCredentials = true;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { isLogged, setIsLogged } = useContext(AuthContext);

    const getCsrfCookie = async () => {
        await axios.get('https://mate85-api.litiano.dev.br/api/csrf-cookie').then((response) => {
            console.log(response);
        });
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setEmail(newValue);
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setPassword(newValue);
    }

    const handleLogin = () => {
        axios.post('https://mate85-api.litiano.dev.br/api/login', {
            params: {
                email, password
            }
        }).then((response) => {
            console.log(response);
            // if respose.logged { setIsloged(true) }
        })
    }

    useEffect(() => {
        getCsrfCookie();
    }, []);

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

                    <a target="_blank" href="#!" rel="noreferrer">
                        Esqueceu a senha?
                    </a>
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
