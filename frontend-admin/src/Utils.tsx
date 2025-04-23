import MobileDetect from 'mobile-detect';

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

function generateColorsArray(numberOfColors: number) {
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
    label: 'Docentes',
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
    value: 'completed'
  }
];

function determineIfMobile(width = 992) {
  let mobileDetect = new MobileDetect(window.navigator.userAgent);

  if (mobileDetect.mobile() !== null) {
    return true;
  }

  if (window.innerWidth <= width) {
    return true;
  }

  return false;
}

export default { universityFilter, studentsFilter, generateColorsArray, nameTypes, determineIfMobile }
