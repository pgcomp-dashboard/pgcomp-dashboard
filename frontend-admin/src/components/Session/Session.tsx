import { List } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton'
import SessionItemDialog from '../SessionItemDialog/SessionItemDialog';
import SessionItem from '../SessionItem/SessionItem';
import styles from './Session.module.css'
import Utils from '../../Utils'
import { AuthContext } from '../../providers/AuthProvider';
import React from 'react';
import { api } from '../../services/api';
import { useMatch } from 'react-router-dom';

// interface SessionProps {
//     type?: string;
// }

function Session() {
    const [modalOpened, setModalOpened] = useState(false);
    const { token, change } = useContext(AuthContext);

    const [sessionItems, setSessionItems] = useState([]);

    const match = useMatch(":sessionType/*")
    const sessionType = match?.params.sessionType || "areas"

    const handleModalOpen = () => {
        setModalOpened(true);
    }

    const handleModalClose = () => {
        setModalOpened(false);
    }

    const mockedChilds = [
        { name: 'child 1', type: 'qualis' },
        { name: 'child 2', type: 'qualis' },
    ]

    const getData = () => {
            api.get(sessionType).then((response: any) => {
                if (response && response.status === 200 && response.data.data){
                    setSessionItems(response.data.data);
                }
            });
    }

    useEffect(() => {
        getData();
    }, [sessionType, change]);

    console.log(sessionItems);

    return (
        <div className={styles['Session']}>
            <AddSessionItemButton type={Utils.nameTypes[sessionType]} handleOpen={handleModalOpen} />
            <List disablePadding>
                {sessionItems && sessionItems.length ?
                    sessionItems.map((sessionItem: any) => {
                        return <SessionItem {...sessionItem} type={sessionType} children={mockedChilds} key={sessionItem.id} />
                    }) : null}
            </List>

            <SessionItemDialog type={Utils.nameTypes[sessionType]} typeAttr={sessionType} open={modalOpened} handleClose={handleModalClose} />
        </div>
    )
}

export default Session
