import styles from './Toolbar.module.css'
import icLogo from '../../assets/ic_logo.png'
import UserMenu from '../UserMenu/UserMenu';

function Toolbar(){
    const className = styles['nav__toolbar'];
    return (
        <div className={className}>
            <div>
                <img src={icLogo} height={70} />
            </div>
            
            <UserMenu />
        </div>
    )
}

export default Toolbar