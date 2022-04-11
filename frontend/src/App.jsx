import Toolbar from "./components/Toolbar/Toolbar";
import styles from "./App.module.css"
import Title from "./components/Title/Title";
import DataCard from "./components/DataCard/DataCard";
import StudentsPerTeacherChart from "./components/Charts/StudentsPerTeacherChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from '@mui/icons-material/PieChart';
import Footer from "./components/Footer/Footer";
import PieChart from "./components/Charts/PieChart";
import QualisChart from "./components/Charts/QualisChart";
import ProductionPerStudentChart from "./components/Charts/ProductionPerStudentChart";
import ProductionsAmountChart from "./components/Charts/ProductionsAmountChart";
import Utils from './Utils'

export function App() {
    return (
        <div className={styles.app__global}>

            <Toolbar />

            <Title />

            <div className={styles.cards__container}>
                <DataCard title="Quantidade de produções"
                    minWidth="1000px"
                    minHeight="300px"
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityFilter}
                    chart={ProductionsAmountChart} />

                <DataCard title="Qualis"
                    minWidth="1000px"
                    minHeight="300px"
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityFilter}
                    chart={QualisChart} />

                <DataCard title="Produção por discentes"
                    minWidth="1000px"
                    minHeight="300px"
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityFilter}
                    chart={ProductionPerStudentChart} />

                <DataCard title="Alunos por docente"
                    minWidth="1000px"
                    minHeight="300px"
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityAndActivesFilter}
                    chart={StudentsPerTeacherChart} />

                <DataCard title="Alunos por área"
                    minWidth="1000px"
                    minHeight="300px"
                    height="250px"
                    icon={PieChartIcon}
                    filterOptions={Utils.universityAndActivesFilter}
                    chart={PieChart} />
            </div>

            <Footer />
        </div>
    )
}