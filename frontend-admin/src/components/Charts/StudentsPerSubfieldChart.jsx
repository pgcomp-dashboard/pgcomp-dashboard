import BarSubFields from "./BarSubFields"

function StudentsPerSubfieldChart({ filter, isMobile }) {
    return <BarSubFields type={'subfields'} filter={filter} isMobile={isMobile} />
}

export default StudentsPerSubfieldChart