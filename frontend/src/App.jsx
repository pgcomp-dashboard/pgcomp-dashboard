import Toolbar from "./components/Toolbar/Toolbar";
import styles from "./App.module.css"
import Title from "./components/Title/Title";
import DataCard from "./components/DataCard/DataCard";
import StudentsPerTeacherChart from "./components/Charts/StudentsPerTeacherChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Footer from "./components/Footer/Footer";
import QualisChart from "./components/Charts/QualisChart";

export function App() {
    return (
        <div className={styles.app__global}>

            <Toolbar />

            <Title />

            <div className={styles.cards__container}>
                <DataCard title="Qualis"
                    minWidth="1000px"
                    minHeight="300px"
                    icon={AssessmentIcon}
                    chart={QualisChart} />

                <DataCard title="Alunos por docente"
                    minWidth="1000px"
                    minHeight="300px"
                     icon={AssessmentIcon}
                    chart={StudentsPerTeacherChart} />
            </div>

            <Footer />
        </div>
    )
}