import styles from './Toolbar.module.css'
import icLogo from '../../assets/ic_logo.png'
import UserMenu from '../UserMenu/UserMenu';
import React from 'react';

function Toolbar(){
    const className = styles['nav__toolbar'];
    return (
        <div className={className}>
            <div>
                <a href='http://localhost:3000'>
                    <img src={icLogo} height={70} />
                </a>
            </div>

            <UserMenu />
        </div>
    )
}

export default Toolbar
