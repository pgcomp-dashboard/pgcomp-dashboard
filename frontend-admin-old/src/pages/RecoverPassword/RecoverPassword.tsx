import { DashboardTemplate } from "../../templates";

import styles from "./RecoverPassword.module.css";

function RecoverPasswordPage() {
  return (
    <DashboardTemplate>
      <div className={styles.recover_password_page}>
        <h1>Alterar senha</h1>

        <p>
          Para redefinir sua senha, insira o seu email cadastrado
          <br />
          na sua conta e lhe enviaremos um código.
        </p>

        <form className={styles.recover_password_page__form}>
          <div className={styles.recover_password_page__form__input_container}>
            <span>E-mail:</span>
            <input type="email" placeholder="fulano.beltrano@ufba.br" />
          </div>

          <button>Receber código</button>
        </form>
      </div>
    </DashboardTemplate>
  );
}

export default RecoverPasswordPage;
