function generateColorsArray(numberOfColors) {
    const colorsArray = [];
    let r, g, b;
    for (let i = 0; i < numberOfColors; i++) {
        r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
        colorsArray.push("rgb(" + r + "," + g + "," + b + ")");
    }

    return colorsArray;
}

const universityFilter = [
    {
        label: 'Mestrados',
        value: 'mestrando'
    },
    {
        label: 'Doutorados',
        value: 'doutorando'
    },
    {
        label: 'Bolsistas',
        value: 'docente'
    },
]

const activesFilter = [
    {
        label: 'Ativos',
        value: 50
    },
    {
        label: 'Concluídos',
        value: 60
    },
    {
        label: 'Não-ativos',
        value: 70
    },
];

const universityAndActivesFilter = [...universityFilter, ...activesFilter];

export default { universityFilter, universityAndActivesFilter, generateColorsArray }