import styles from './UserMenu.module.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import { Button, Menu } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { api } from '../../services/api';
function UserMenu() {
  const iconStyle = {
    'height': '42px',
    'width': '42px',
  };

  const [ anchorEl, setAnchorEl ] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { token, setToken } = useContext(AuthContext);
  const [ userName, setUsername ] = useState();

  useEffect(() => {
    api.get('https://aufbaproduz-api.dovalle.app.br/api/user').then(response => {
      setUsername(response.data.name.split(' ')[0]);
    });
  }, [ token ]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <div className={styles['UserMenu']}>
      <Button
        onClick={handleClick}
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}>
        <AccountCircleIcon color="primary" fontSize='inherit' style={iconStyle} />

        {!token ?
          <div><a href="/">Entrar</a></div>
          :
          <div className={styles['user__menu__welcome']}>
            <span>Olá,</span>
            <span className={styles['user__menu__name']}>{userName}</span>
          </div>
        }

      </Button>

      <Menu id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}>
        <MenuItem onClick={e => {
          handleClose(); logout(); 
        }}>Sair</MenuItem>
      </Menu>
    </div>
  );
}

export default UserMenu;
