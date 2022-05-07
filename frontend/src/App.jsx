import Toolbar from "./components/Toolbar/Toolbar";
import styles from "./App.module.css"
import Title from "./components/Title/Title";
import DataCard from "./components/DataCard/DataCard";
import StudentsPerTeacherChart from "./components/Charts/StudentsPerTeacherChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from '@mui/icons-material/PieChart';
import Footer from "./components/Footer/Footer";
import QualisChart from "./components/Charts/QualisChart";
import ProductionPerStudentChart from "./components/Charts/ProductionPerStudentChart";
import ProductionsAmountChart from "./components/Charts/ProductionsAmountChart";
import Utils from './Utils'
import StudentsPerSubfieldChart from "./components/Charts/StudentsPerSubfieldChart";
import StudentsPerFieldChart from "./components/Charts/StudentsPerFieldChart";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BurgerMenu from "./components/BurgerMenu/BurgerMenu";
import { useState } from "react";

export function App() {
    const [showBurgerMenu, setShowBurgerMenu] = useState(false);

    return (
        <div className={styles.app__global}>

            <Toolbar setShowBurgerMenu={setShowBurgerMenu} />

            <BurgerMenu showBurgerMenu={showBurgerMenu} />

            <Title />

            <div className={styles.cards__container}>
                <DataCard title="Quantidade de produções científicas"
                    minWidth="1200px"
                    minHeight="300px"
                    idSession="productions-amount"
                    icon={ShowChartIcon}
                    filterOptions={Utils.universityFilter}
                    chart={ProductionsAmountChart} />

                <DataCard title="Qualis"
                    minWidth="1200px"
                    minHeight="300px"
                    idSession={"qualis"}
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityFilter}
                    chart={QualisChart} />

                <DataCard title="Produção por discentes"
                    minWidth="1200px"
                    minHeight="300px"
                    idSession="productions-per-student"
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityFilter}
                    chart={ProductionPerStudentChart} />

                <DataCard title="Alunos por docente"
                    minWidth="1200px"
                    minHeight="400px"
                    idSession="students-per-teacher"
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityAndActivesFilter}
                    chart={StudentsPerTeacherChart} />

                <DataCard title="Alunos por área"
                    minWidth="1200px"
                    minHeight="350px"
                    idSession="students-per-field"
                    height="250px"
                    type="fields"
                    icon={PieChartIcon}
                    filterOptions={Utils.universityAndActivesFilter}
                    chart={StudentsPerFieldChart} />

                <DataCard title="Alunos por subárea"
                    minWidth="1200px"
                    minHeight="350px"
                    idSession="students-per-subfield"
                    height="250px"
                    type="subfields"
                    icon={PieChartIcon}
                    filterOptions={Utils.universityAndActivesFilter}
                    chart={StudentsPerSubfieldChart} />
            </div>

            <Footer />
        </div>
    )
}