import { Card, CardContent, CardHeader } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useMatch } from "react-router-dom";
import { api } from "../../services/api";
import styles from './PersonInfo.module.css';


function PersonInfo(props: any) {
    const match = useMatch(":sessionType/:id");
    const sessionType = match?.params.sessionType;
    const id = match?.params.id;

    let defaultObj: any = {};
    const [personData, setPersonData] = useState(defaultObj);
    const [subArea, setSubArea] = useState('');
    const sessionTypes: any = {
        'professors': 'docente',
        'students': 'discente'
    }

    useEffect(() => {
        async function fetchData() {
            const { data } = await api.get(`${sessionType}/${id}`);
            setPersonData(data);
            if (data.subarea_id){
                const responseSubArea = await api.get(`subareas/${data.subarea_id}`);
                setSubArea(responseSubArea.data?.subarea_name);
            }
        };
        fetchData();
    }, []);

    if (sessionType !== undefined && personData !== {}) {
        return <>
            <Card sx={{ width: '100%', height: '50%' }}>
                <CardHeader title={`Informações do ${sessionTypes[sessionType]} ${personData.name}`}
                    sx={{ backgroundColor: '#292929', color: 'white' }}
                    titleTypographyProps={{ variant: 'h5' }}>
                </CardHeader>
                <CardContent>
                    <div className={styles['person__info']}>
                        <p> <strong>Nome</strong>: {personData.name}</p>
                        <p> <strong>Email</strong>: {personData.email}</p>
                        <p> <strong>Siape</strong>: {personData.siape}</p>
                        <p> <strong>Período que está no PGCOMP</strong>: </p>
                        <p> <strong>Área de pesquisa</strong>: {subArea}</p>
                    </div>
                </CardContent>
            </Card>
        </>;

    }

    return <></>;
}

export default PersonInfo