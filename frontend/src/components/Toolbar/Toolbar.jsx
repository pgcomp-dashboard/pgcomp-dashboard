import styles from './Toolbar.module.css'
import icLogo from '../../assets/ic_logo.png'

function Toolbar(props) {
    return (
        <div className={styles.nav__toolbar}>
            <div>
                <img src={icLogo} height={70} />
            </div>
        </div>
    )
}

export default Toolbar