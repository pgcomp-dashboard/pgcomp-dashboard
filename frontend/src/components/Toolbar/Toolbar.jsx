import styles from './Toolbar.module.css'
import icLogo from '../../assets/ic_logo.png'
import { useState } from 'react'


function Toolbar({ setShowBurgerMenu }) {
    const [toggleClass, setToggleClass] = useState('');

    const onToggleBurger = () => {
        if (!toggleClass) {
            setToggleClass(styles['toggle']);
            setShowBurgerMenu(true);
        } else {
            setToggleClass('');
            setShowBurgerMenu(false);
        }
    }


    return (
        <div className={styles.nav__toolbar}>
            <div className={styles['burger--toolbar'] + ' ' + toggleClass} onClick={onToggleBurger}>
                <div className={styles['burger--line--1']}></div>
                <div className={styles['burger--line--2']}></div>
                <div className={styles['burger--line--3']}></div>
            </div>
            <div>
                <img src={icLogo} height={70} alt="Logo dashboard pgcomp"/>
            </div>
            <div>
                <button className={styles.button__login}>
                    Login
                </button>
            </div>
        </div>
    )
}

export default Toolbar