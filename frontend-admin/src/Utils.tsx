
interface nameTypesLayout {
    [key: string]: string
}

const nameTypes: nameTypesLayout = {
    areas: 'Área de estudo',
    subareas: 'Sub-área',
    qualis: 'Nota qualis',
    professors: 'Docente',
    students: 'Discente'
}
const baseUrl = 'https://aufbaproduz-api.dovalle.app.br';

export default { nameTypes, baseUrl }