import styles from './UserMenu.module.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function UserMenu(){
    const iconStyle = {
        'height': '42px',
        'width': '42px'
    }
    return (
        <div className={styles['UserMenu']}>
            <AccountCircleIcon color="primary" fontSize='inherit' style={iconStyle} />

            <div className={styles['user__menu__welcome']}>
                Olá, <br/>
                <span className={styles['user__menu__name']}>Fulano</span>
            </div>
                
        </div>
    )
}

export default UserMenu
