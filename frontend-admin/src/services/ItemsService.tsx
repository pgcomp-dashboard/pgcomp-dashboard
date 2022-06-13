import axios from 'axios';
import { api } from './api';

interface responseObjInterface {
    message?: string,
    success: boolean
}

async function createItem (config: any, type: string, item: any): Promise<any> {
    let responseObj: responseObjInterface = { success: true, message: `${type === 'areas' ? 'Área' : 'Sub-área'} criada com sucesso` };
    switch (type) {
        case 'areas':
            config.method = 'post';
            config.url = 'https://mate85-api.litiano.dev.br/api/portal/admin/areas';
            config.data = { ...item }
            await axios(config).catch((error: any) => {
                if (error && error.response && error.response.data && error.response.data.message) {
                    responseObj.message = error.response.data.message;
                    responseObj.success = false;
                }
            });
            
            return responseObj;
        case 'subareas':
            config.method = 'post';
            config.url = 'https://mate85-api.litiano.dev.br/api/portal/admin/subareas';
            config.data = { ...item, program_id: 1 }
            await axios(config).catch((error: any) => {
                if (error && error.response && error.response.data && error.response.data.message) {
                    responseObj.message = error.response.data.message;
                    responseObj.success = false;
                }
            });

            return responseObj;
    }
}

const updateItem = ({ fields, type, id }: { fields: object, type: string, id: number | undefined }) => {
    api.put(`/${type}/${id}`, fields).then(response => console.log(response)).catch(err => console.log(err))
}

async function deleteItem(config: any, type: string, id: number | undefined): Promise<any> {
    let responseObj: responseObjInterface = { success: true, message: '' };
    switch (type) {
        case 'areas':
            config.method = 'delete';
            config.url = `https://mate85-api.litiano.dev.br/api/portal/admin/areas/${id}`;
            await axios(config)
                .catch((error: any) => {
                    if (error && error.response && error.response.data && error.response.data.message) {
                        responseObj.message = error.response.data.message;
                        responseObj.success = false;
                    }
                });
            return responseObj;
        case 'subareas':
            config.method = 'delete';
            config.url = `https://mate85-api.litiano.dev.br/api/portal/admin/subareas/${id}`;
            await axios(config)
                .catch((error: any) => {
                    if (error && error.response && error.response.data && error.response.data.message) {
                        responseObj.message = error.response.data.message;
                        responseObj.success = false;
                    }
                });
            return responseObj;
    }

    return responseObj;
}


export {
    createItem, updateItem, deleteItem
}