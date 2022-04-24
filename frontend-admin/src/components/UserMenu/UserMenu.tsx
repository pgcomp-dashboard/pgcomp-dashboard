import styles from './UserMenu.module.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Button, Menu } from '@mui/material';
import React from 'react';
function UserMenu() {
    const iconStyle = {
        'height': '42px',
        'width': '42px'
    }

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={styles['UserMenu']}>
            <Button
                onClick={handleClick}
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}>
                <AccountCircleIcon color="primary" fontSize='inherit' style={iconStyle} />

                <div className={styles['user__menu__welcome']}>
                    <span>Olá,</span>
                    <span className={styles['user__menu__name']}>Fulano</span>
                </div>
            </Button>

            <Menu id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}>
                <MenuItem onClick={handleClose}>Editar perfil</MenuItem>
                <MenuItem onClick={handleClose}>Sair</MenuItem>
            </Menu>
        </div>
    )
}

export default UserMenu
