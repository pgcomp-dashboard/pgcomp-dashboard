import axios from 'axios';
import { api } from './api';


const createItem = async(config: any, type: string, item: any) => {
    let result;
    switch (type) {
        case 'areas':
            config.method = 'post';
            config.url = 'https://mate85-api.litiano.dev.br/api/portal/admin/areas';
            config.data = {...item}
            result = await axios(config);
            break;
        case 'subareas':
            config.method = 'post';
            config.url = 'https://mate85-api.litiano.dev.br/api/portal/admin/subareas';
            config.data = {...item, program_id: 1}
            result = await axios(config);
    }
}

const updateItem = ({fields, type, id}: {fields: object, type: string, id: number | undefined}) => {
    api.put(`/${type}/${id}`, fields).then(response => console.log(response)).catch(err => console.log(err))
}

const deleteItem = (config: any, type: string, id: number | undefined) => {
    switch (type) {
        case 'areas':
            config.method = 'delete';
            config.url = `https://mate85-api.litiano.dev.br/api/portal/admin/areas/${id}`;
            axios(config);
            break;
        case 'subareas':
            config.method = 'delete';
            config.url = `https://mate85-api.litiano.dev.br/api/portal/admin/subareas/${id}`;
            axios(config);
    }
}


export {
    createItem, updateItem, deleteItem
}