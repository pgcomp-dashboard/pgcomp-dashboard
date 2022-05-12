import PieChart from "./PieChart"

function StudentsPerSubfieldChart({ filter }) {
    return <PieChart type={'subfields'} filter={filter} />
}

export default StudentsPerSubfieldChart