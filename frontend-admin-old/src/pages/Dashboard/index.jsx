import ToolbarDashboard from "../../components/ToolbarDashboard/ToolbarDashboard";
import styles from "./Dashboard.module.css"
import Title from "../../components/Title/Title";
import DataCard from "../../components/DataCard/DataCard";
import StudentsPerTeacherChart from "../../components/Charts/StudentsPerTeacherChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from '@mui/icons-material/PieChart';
import FooterDashboard from "../../components/FooterDashboard/FooterDashboard";
import QualisChart from "../../components/Charts/QualisChart";
import ProductionsAmountChart from "../../components/Charts/ProductionsAmountChart";
import Utils from '../../Utils'
import StudentsPerSubfieldChart from "../../components/Charts/StudentsPerSubfieldChart";
import StudentsPerFieldChart from "../../components/Charts/StudentsPerFieldChart";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BurgerMenu from "../../components/BurgerMenu/BurgerMenu";
import { useEffect, useState } from "react";

function Dashboard() {
    const [showBurgerMenu, setShowBurgerMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(Utils.determineIfMobile());

    const handleResize = () => {
        setIsMobile(Utils.determineIfMobile());
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    })

    return (
        <div>
            {/*rendereiza o header*/}
            <ToolbarDashboard setShowBurgerMenu={setShowBurgerMenu} />

            {/*rendereiza o menu hamburguer*/}
            <BurgerMenu showBurgerMenu={showBurgerMenu} />

            <Title />

            <div className={styles.cards__container}>

                {/*rendereiza o card com o gráfico passado via props*/}
                <DataCard title="Quantidade de produções científicas"
                    minWidth="100%"
                    minHeight="300px"
                    idSession="productions-amount"
                    icon={ShowChartIcon}
                    filterOptions={Utils.universityFilter}
                    chart={ProductionsAmountChart}
                    isMobile={isMobile} />

                {/*rendereiza o card com o gráfico passado via props*/}
                <DataCard title="Qualis"
                    minWidth="100%"
                    minHeight="300px"
                    idSession={"qualis"}
                    icon={AssessmentIcon}
                    filterOptions={Utils.universityFilter}
                    chart={QualisChart}
                    isMobile={isMobile} />

                {/*rendereiza o card com o gráfico passado via props*/}
                <DataCard title="Alunos por docente"
                    minWidth="100%"
                    minHeight="400px"
                    idSession="students-per-teacher"
                    icon={AssessmentIcon}
                    filterOptions={Utils.studentsFilter}
                    chart={StudentsPerTeacherChart}
                    isMobile={isMobile} />

                {/*rendereiza o card com o gráfico passado via props*/}
                <DataCard title="Alunos por área"
                    minWidth="100%"
                    minHeight="350px"
                    idSession="students-per-field"
                    height="450px"
                    type="fields"
                    icon={PieChartIcon}
                    filterOptions={Utils.studentsFilter}
                    chart={StudentsPerFieldChart}
                    isMobile={isMobile} />

                {/*rendereiza o card com o gráfico passado via props*/}
                <DataCard title="Alunos por subárea"
                    minWidth="100%"
                    minHeight="400px"
                    idSession="students-per-subfield"
                    height="400px"
                    type="subfields"
                    icon={AssessmentIcon}
                    filterOptions={Utils.studentsFilter}
                    chart={StudentsPerSubfieldChart}
                    isMobile={isMobile} />
            </div>
        </div>
    )
}

export default Dashboard
