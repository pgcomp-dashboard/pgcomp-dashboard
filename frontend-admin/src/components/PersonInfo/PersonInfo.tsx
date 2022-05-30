import React from "react";
import { useMatch } from "react-router-dom";

function PersonInfo(props: any) {
    const match = useMatch(":sessionType/:id");
    const sessionType = match?.params.sessionType;
    const id = match?.params.id;
    return <>
        <h1>Session type: {sessionType} Id: {id}</h1>
    </>;
}

export default PersonInfo