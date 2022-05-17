import axios from 'axios';


const createItem = (config: any, type: string, name: string) => {
    switch (type) {
        case 'areas':
            config.method = 'post';
            config.url = 'https://mate85-api.litiano.dev.br/api/portal/admin/areas';
            config.data = { area_name: name, program_id: 1 }
            axios(config);
    }
}

const updateItem = (config: any, type: string, name: string, id: number | undefined) => {
    switch (type) {
        case 'areas':
            config.method = 'put';
            config.url = `https://mate85-api.litiano.dev.br/api/portal/admin/areas/${id}`;
            config.data = { area_name: name, id: id, program_id: 1 }
            axios(config);
    }
}

const deleteItem = (config: any, type: string, id: number | undefined) => {
    switch (type) {
        case 'areas':
            config.method = 'delete';
            config.url = `https://mate85-api.litiano.dev.br/api/portal/admin/areas/${id}`;
            axios(config);
    }
}


export {
    createItem, updateItem, deleteItem
}