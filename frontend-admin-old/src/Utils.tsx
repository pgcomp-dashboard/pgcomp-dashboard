
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
const baseUrl = 'http://localhost:8000';

export default { nameTypes, baseUrl }