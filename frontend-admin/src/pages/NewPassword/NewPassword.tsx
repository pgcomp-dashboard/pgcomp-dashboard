import { DashboardTemplate } from '../../templates';

import styles from './NewPassword.module.css';

function NewPasswordPage() {
  return (
    <DashboardTemplate>
      <div className={styles.new_password_page}>
        <h1>Alterar senha</h1>

        <p>
          Email, digite o código que você recebeu em seu email
          <br />
          para criar uma nova senha
        </p>

        <form className={styles.new_password_page__form}>
          <div className={styles.new_password_page__form__input_container}>
            <span>Nova Senha:</span>
            <input type="password" placeholder="Senha" />
          </div>
          <div className={styles.new_password_page__form__input_container}>
            <span>Confirmar Senha:</span>
            <input type="password" placeholder="Senha" />
          </div>

          <button>Nova Senha</button>
        </form>
      </div>
    </DashboardTemplate>
  );
}

export default NewPasswordPage;
