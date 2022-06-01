import axios from "axios";
import React, { useEffect, useState } from "react";
import { useMatch } from "react-router-dom";
import { api } from "../../services/api";

function PersonInfo(props: any) {
    const match = useMatch(":sessionType/:id");
    const sessionType = match?.params.sessionType;
    const id = match?.params.id;
    const [personData, setPersonData] = useState({});

    useEffect(() => {
        async function fetchData() {
            const { data } = await api.get(`${sessionType}/${id}`);
            setPersonData(data);
        };
        fetchData();
    }, []);

    return <>
        <p><small>{JSON.stringify(personData)}</small></p>
    </>;
}

export default PersonInfo