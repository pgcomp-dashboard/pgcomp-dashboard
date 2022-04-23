import hero from "../../assets/login.svg";

import { DashboardTemplate } from "../../templates";

import styles from "./Login.module.css";

function LoginPage() {
  return (
    <DashboardTemplate>
      <div className={styles.login_page}>
        <div className={styles.login_page__action_container}>
          <h1>Painel de Administração</h1>

          <form className={styles.login_page__form}>
            <div className={styles.login_page__form__input_container}>
              <span>E-mail:</span>
              <input type="email" placeholder="fulano.beltrano@ufba.br" />
            </div>

            <div className={styles.login_page__form__input_container}>
              <span>Senha:</span>
              <input type="password" placeholder="Senha" />
            </div>

            <button>Acessar</button>

            <a target="_blank" href="#!" rel="noreferrer">
              Esqueceu a senha?
            </a>
          </form>
        </div>

        <div className={styles.login_page__divider} />

        <div className={styles.login_page__hero}>
          <img alt="Login" src={hero} />
        </div>
      </div>
    </DashboardTemplate>
  );
}

export default LoginPage;
