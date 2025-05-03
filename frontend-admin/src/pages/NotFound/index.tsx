import styles from './Notfound.module.css';
import imgErro from '../../assets/error.png';
import { Link } from 'react-router';
import HomeIcon from '@mui/icons-material/Home';

function NotFound() {
  return (
    <div className={styles.erro__404}>

      <section>
        <h1 className={styles.title}>Erro 404</h1>

        <div className={styles.error__content}>
          <div className={styles.text__left}>
            <h2>Opss... Página não encontrada</h2>
            <p>A página que você está procurando pode ter sido removida ou renomeada</p>

            <Link to="/" className={styles.home__link}>
              <HomeIcon />
              <span>Voltar para o início</span>
            </Link>
          </div>

          <img src={imgErro} alt="Imagem de erro"/>
        </div>

      </section>

    </div>
  );
}

export default NotFound;
