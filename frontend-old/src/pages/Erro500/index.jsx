import styles from './Erro.module.css';
import Logo from '../../assets/ic_logo.png';
import imgErro from '../../assets/error.png';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

function Erro500() {
    return (
        <div className={styles.erro__500}>

            <header className={styles.header}>
                <img src={Logo} alt="Logo Dashboard"></img>
            </header>

            <section>
                <h1 className={styles.title}>Erro 500</h1>

                <div className={styles.error__content}>
                    <div className={styles.text__left}>
                        <h2>Desculpe... Erro de servidor interno</h2>
                        <p>A página não pode ser exibida, pois ocorreu algum erro de execução no servidor ou em scripts do site.</p>

                        <Link to="/" className={styles.home__link}>
                            <HomeIcon />
                            <span>Voltar para o início</span>
                        </Link>
                    </div>
                    
                    <img src={imgErro} alt="Imagem de erro"/>
                </div>

            </section>
        
        </div>
    )
}

export default Erro500