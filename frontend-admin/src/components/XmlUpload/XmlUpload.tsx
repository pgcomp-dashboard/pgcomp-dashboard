import { Backdrop, CircularProgress } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useMatch } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../services/api";
import styles from './XmlUpload.module.css';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export default function XmlUpload() {
    const [file, setFile] = useState<null | any>(null);
    const [personName, setPersonName] = useState('');
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const match = useMatch(":userType/:id/*");

    const userType = match?.params.userType;
    const personId = match?.params.id;

    useEffect(() => {
        async function fetchData() {
            const { data } = await api.get(`${userType}/${personId}`);
            setPersonName(data?.name);
        };
        fetchData();
    }, []);

    const handleChange = (file: any) => {
        setLoading(true);
        setFile(file);
        
        let formData = new FormData();

        formData.append('file', file);
        axios.post('https://mate85-api.litiano.dev.br/api/portal/user/lattes-update', formData, {
            headers: {
                'Authorization': token
            }
        }).then((response) => {
            setLoading(false);
        })
    }

    return (
        <>
            {loading ? <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop> : null}
            <div className={styles.XmlUpload}>
                <p>Carregar arquivo XML do {userType === 'professors' ? 'docente' : 'discente'} {personName}</p>
                <div className={styles['upload__session']}>

                    <FileUploader multiple={false}
                        handleChange={handleChange}
                        name="file"
                        types={["XML"]} />

                </div>
                <p> {file && !loading ? <InsertDriveFileIcon/> : null} {file && !loading ? (file.name) : ""}</p>

            </div>
        </>

    )
}