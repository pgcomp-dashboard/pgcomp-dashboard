import { List } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton'
import SessionItemDialog from '../SessionItemDialog/SessionItemDialog';
import SessionItem from '../SessionItem/SessionItem';
import styles from './Session.module.css'
import Utils from '../../Utils'
import { AuthContext } from '../../providers/AuthProvider';
import axios from 'axios';
import React from 'react';

interface SessionProps {
    type: string;
}

function Session(props: SessionProps) {
    const [modalOpened, setModalOpened] = useState(false);
    const { token, change } = useContext(AuthContext);

    const [sessionItems, setSessionItems] = useState([]);

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

    let config = {
        method: 'get',
        url: `https://mate85-api.litiano.dev.br/api/portal/admin/${props.type}`,
        headers: {
            'Authorization': token
        }
    }

    const getData = () => {
        if (config.headers.Authorization) {
            axios(config).then((response: any) => {
                console.log(response.data.data);
                if (response && response.status === 200 && response.data.data){
                    setSessionItems(response.data.data);
                    console.log(sessionItems);
                }
            });
        }
    }

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        config.headers.Authorization = token;
        getData();
    }, [token]);

    useEffect(() => {
        setTimeout(() => {
            getData();
        }, 1000);
    }, [change]);

    console.log(sessionItems);

    return (
        <div className={styles['Session']}>
            <AddSessionItemButton type={Utils.nameTypes[props.type]} handleOpen={handleModalOpen} />
            <List disablePadding>
            { sessionItems && sessionItems.length ? 
                sessionItems.map((sessionItem: any) => {
                    return <SessionItem {...sessionItem} type={props.type} children={mockedChilds} key={sessionItem.id} />
                }) : null }
            </List>

            <SessionItemDialog type={Utils.nameTypes[props.type]} typeAttr={props.type} open={modalOpened} handleClose={handleModalClose} />
        </div>
    )
}

export default Session
