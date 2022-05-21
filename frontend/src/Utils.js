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
        label: 'Mestrandos',
        value: 'mestrando'
    },
    {
        label: 'Doutorandos',
        value: 'doutorando'
    },
    {
        label: 'Docente',
        value: 'docente'
    },
]

const studentsFilter = [
    {
        label: 'Mestrandos',
        value: 'mestrando'
    },
    {
        label: 'Doutorandos',
        value: 'doutorando'
    },
    {
        label: 'Concluídos',
        value: ''
    }
];


export default { universityFilter, studentsFilter, generateColorsArray }