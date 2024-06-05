import axios from 'axios';
import { api } from './api';

interface responseObjInterface {
    message?: string,
    success: boolean
}

async function createItem(config: any, type: string, item: any): Promise<any> {
    let responseObj: responseObjInterface = { success: true, message: `${type === 'areas' ? 'Área' : 'Sub-área'} criada com sucesso` };
    switch (type) {
        case 'areas':
            config.method = 'post';
            config.url = 'https://aufbaproduz-api.dovalle.app.br/api/portal/admin/areas';
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
            config.url = 'https://aufbaproduz-api.dovalle.app.br/api/portal/admin/subareas';
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

async function updateItem({ fields, type, id }: { fields: object, type: string, id: number | undefined }) {
    let responseObj: responseObjInterface = { success: true, message: `${type === 'areas' ? 'Área' : 'Sub-área'} atualizada com sucesso` };

    await api.put(`/${type}/${id}`, fields).then(response => console.log(response))
        .catch(err => console.log(err))
        .catch((error: any) => {
            responseObj.success = false;
            if (error && error.response && error.response.data && error.response.data.message) {
                responseObj.message = error.response.data.message;
            }
        });

    return responseObj;
}

async function deleteItem(config: any, type: string, id: number | undefined): Promise<any> {
    let responseObj: responseObjInterface = { success: true, message: `${type === 'areas' ? 'Área' : 'Sub-área'} deletada com sucesso` };
    switch (type) {
        case 'areas':
            config.method = 'delete';
            config.url = `https://aufbaproduz-api.dovalle.app.br/api/portal/admin/areas/${id}`;
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
            config.url = `https://aufbaproduz-api.dovalle.app.br/api/portal/admin/subareas/${id}`;
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