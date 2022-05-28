import styles from './SessionItem.module.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Collapse, ListItem } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';
import Utils from '../../Utils'
import SessionItemDialog from '../SessionItemDialog/SessionItemDialog';
import React from 'react';
import DeleteItemDialog from '../DeleteItemDialog/DeleteItemDialog';

interface SessionItemProps {
    name?: string,
    area_name?: string,
    type: string,
    children?: any,
    isChildren?: boolean
}

interface namePropertyProps {
    areas: string
}

function SessionItem(props: any) {
    console.log(props);
    const iconsStyle = {
        height: '30px',
        width: '35px',
        cursor: 'pointer'
    }

    const nameProperty: any = {
        'areas': props.area_name,
        'qualis': `${props.code} = ${props.score}`,
        'professors': props.name,
        'students': props.name
    }

    const editProperties: any = {
        'areas': props.isChildren ? ['subarea_name'] : ['area_name'],
        'qualis': ["score", "code"],
        'professors': ["name"],
        'students': ["name"]
    }

    const showEdit = props.type === 'areas' || props.type === 'qualis';
    const showDelete = props.type === 'areas';
    const showChildrens = props.type === 'areas';

    const [expandChildren, setExpandChildren] = useState(false);

    const [modalOpened, setModalOpened] = useState(false);

    const [deleteModalOpened, setDeleteModalOpened] = useState(false);

    const handleModalOpen = () => {
        setModalOpened(true);
    }

    const handleModalClose = () => {
        setModalOpened(false);
    }

    const handleDeleteModalClose = () => {
        setDeleteModalOpened(false);
    }

    console.log(editProperties);

    const childrenStyle = props.isChildren ? { marginLeft: '15px' } : {};

    return (
        <>
            <ListItem disablePadding style={childrenStyle}>
                <div className={styles['SessionItem']}>
                    <div>{props.isChildren ? props.subarea_name : nameProperty[props.type]}</div>
                    <div>

                        {showEdit ? <EditIcon style={iconsStyle} onClick={() => setModalOpened(true)} /> : null}

                        {showDelete ? <DeleteIcon style={iconsStyle} onClick={() => setDeleteModalOpened(true)} /> : null}

                        {showChildrens ? (props.isChildren ? null : expandChildren ?
                            <ExpandLessIcon style={iconsStyle} onClick={() => setExpandChildren(!expandChildren)} /> :
                            <ExpandMoreIcon style={iconsStyle} onClick={() => setExpandChildren(!expandChildren)} />) : null}
                    </div>
                </div>
            </ListItem>

            <SessionItemDialog
                type={Utils.nameTypes[props.type]}
                typeAttr={props.type}
                open={modalOpened}
                handleClose={handleModalClose}
                id={props.id}
                isEdit={true} />

            <DeleteItemDialog type={Utils.nameTypes[props.type]} typeAttr={props.type} open={deleteModalOpened} handleClose={handleDeleteModalClose}
                id={props.id} />



            <Collapse in={expandChildren} timeout="auto" unmountOnExit>
                {props.children ? props.children.map((item: SessionItemProps) => {
                    return <SessionItem name={item.name} isChildren={true} {...item} type={item.type} />
                }) : null}
            </Collapse>


        </>
    )
}

export default SessionItem;