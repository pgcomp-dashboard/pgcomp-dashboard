import PieChart from "./PieChart"

function StudentsPerFieldChart({ filter }) {
    return <PieChart type={'fields'} filter={filter} />
}

export default StudentsPerFieldChart