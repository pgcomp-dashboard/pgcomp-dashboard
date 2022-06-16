import { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useMatch } from "react-router-dom";
import { api } from "../../services/api";
import styles from './XmlUpload.module.css';

export default function XmlUpload() {
    const [file, setFile] = useState<null | any>(null);
    const [personName, setPersonName] = useState('');

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
        setFile(file);
    }

    return (
        <div className={styles.XmlUpload}>
            <p>Carregar arquivo XML do {userType === 'professors' ? 'docente' : 'discente'} {personName}</p>
            <div className={styles['upload__session']}>

                <FileUploader multiple={false}
                    handleChange={handleChange}
                    name="file"
                    types={["XML"]} />

            </div>
            <p>{file ? file[0].name : "no file"}</p>

        </div>
    )
}