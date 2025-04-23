import { DashboardTemplate } from '../../templates';

import styles from './ResetPassword.module.css';

function ResetPasswordPage() {
  return (
    <DashboardTemplate>
      <div className={styles.reset_password_page}>
        <h1>Alterar senha</h1>

        <p>
          Email, digite o código que você recebeu em seu email
          <br />
          para criar uma nova senha
        </p>

        <form className={styles.reset_password_page__form}>
          <div className={styles.reset_password_page__form__input_container}>
            <span>Código:</span>
            <input type="text" />
          </div>

          <button>Verificar</button>
        </form>
      </div>
    </DashboardTemplate>
  );
}

export default ResetPasswordPage;
