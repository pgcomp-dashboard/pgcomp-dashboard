import { Button, Card, CardContent, CardHeader } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import styles from './PersonInfo.module.css';
import UploadIcon from '@mui/icons-material/Upload';


function PersonInfo(props: any) {
    const navigate = useNavigate();
    const match = useMatch("/admin/:sessionType/:id");
    const sessionType = match?.params.sessionType;
    const id = match?.params.id;

    let defaultObj: any = {};
    const [personData, setPersonData] = useState(defaultObj);
    const [subArea, setSubArea] = useState('');
    
    const sessionTypes: any = {
        'professors': 'docente',
        'students': 'discente'
    }

    const buttonText: any = {
        'professors': 'professor',
        'students': 'estudante'
    }

    useEffect(() => {
        async function fetchData() {
            const { data } = await api.get(`${sessionType}/${id}`);
            setPersonData(data);
            if (data.subarea_id) {
                const responseSubArea = await api.get(`subareas/${data.subarea_id}`);
                setSubArea(responseSubArea.data?.subarea_name);
            }
        };
        fetchData();
    }, []);

    if (sessionType !== undefined && personData !== {}) {
        return <div className={styles['PersonInfo']}>
            <div className={styles['person__info']}>
                <Card sx={{ width: '100%', height: '50%', backgroundColor: 'white' }}>
                    <CardHeader title={`Informações do ${sessionTypes[sessionType]} ${personData.name}`}
                        sx={{ color: 'white' }}
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
            </div>
            {/* <div className={styles['upload__section']}>
                <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => { navigate(`/admin/${sessionType}/${id}/xml-upload`) }}>
                    Carregar XML do Lattes do {buttonText[sessionType]}
                </Button>
            </div> */}
        </div>;

    }

    return <></>;
}

export default PersonInfo