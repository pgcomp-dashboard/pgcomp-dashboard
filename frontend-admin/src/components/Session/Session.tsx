import { List, Pagination } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import AddSessionItemButton from '../AddSessionItemButton/AddSessionItemButton'
import SessionItemDialog from '../SessionItemDialog/SessionItemDialog';
import SessionItem from '../SessionItem/SessionItem';
import styles from './Session.module.css'
import Utils from '../../Utils'
import { AuthContext } from '../../providers/AuthProvider';
import React from 'react';
import { api } from '../../services/api';
import { useMatch, useSearchParams } from 'react-router-dom';

// interface SessionProps {
//     type?: string;
// }

function Session() {
    const [modalOpened, setModalOpened] = useState(false);
    const { token, change } = useContext(AuthContext);
    const [totalPages, setTotalPage] = useState(0)
    const [searchParams, setSearchParams] = useSearchParams();


    const [sessionItems, setSessionItems] = useState([]);

    const match = useMatch(":sessionType/*");
    const sessionType = match?.params.sessionType || "areas";

    const showAdd = sessionType === 'areas';

    const handleModalOpen = () => {
        setModalOpened(true);
    }

    const handleModalClose = () => {
        setModalOpened(false);
    }

    const getData = () => {
        api.get((sessionType === 'areas' ? 'all_subareas_per_area' : sessionType), { params: { page: searchParams.get('page') } }).then((response: any) => {
            if (response && response.status === 200) {
                setSessionItems(response.data.data ? response.data.data : response.data);
                setTotalPage(response.data.last_page)
            }
        });
    }

    useEffect(() => {
        getData();
    }, [sessionType, searchParams]);


    useEffect(() => {
        setTimeout(() => {
            getData();
        }, 1000);
    }, [change]);
    
    return (
        <div className={styles['Session']}>
            {showAdd ? <AddSessionItemButton type={Utils.nameTypes[sessionType]} handleOpen={handleModalOpen} /> : null}
            <List disablePadding>
                {sessionItems && sessionItems.length ?
                    sessionItems.map((sessionItem: any) => {
                        return <SessionItem {...sessionItem} type={sessionType} children={sessionType === 'areas' ? sessionItem.subarea : []} key={sessionItem.id} />
                    }) : null}
            </List>
            <Pagination
                className={styles['pagination']}
                count={totalPages}
                defaultPage={1}
                page={Number(searchParams.get("page")) || 1}
                onChange={(_, v) => setSearchParams({ page: `${v}` })}
            />



            <SessionItemDialog type={Utils.nameTypes[sessionType]} typeAttr={sessionType} open={modalOpened} handleClose={handleModalClose} />
        </div>
    )
}

export default Session
