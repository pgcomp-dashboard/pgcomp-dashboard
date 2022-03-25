import styles from './Footer.module.css'

function Footer() {
    return (
        <div className={styles.footer__ufba}>
            <div className={styles.footer__left}>
                <h2>Universidade Federal da Bahia</h2>
                <h5>Rua Augusto Viana, s\n - Palácio da Reitoria, Canela, Salvador - CEP: 40110-909</h5>
                <h3>Site Oficial | Contato | Sobre a UFBA</h3>
            </div>

            <div className={styles.footer__right}>
                <h2>Instagram - Facebook - Twitter</h2>
            </div>

        </div>
    )
}

export default Footer