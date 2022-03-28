import Toolbar from "./components/Toolbar/Toolbar";
import styles from "./App.module.css"
import Title from "./components/Title/Title";
import DataCard from "./components/DataCard/DataCard";
import HorizontalBarChart from "./components/Charts/HorizontalBarChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from '@mui/icons-material/PieChart';
import Footer from "./components/Footer/Footer";
import PieChart from "./components/Charts/PieChart";

export function App() {
    return (
        <div className={styles.app__global}>

            <Toolbar />

            <Title />

            <div className={styles.cards__container}>

                <div className={styles.cards__container__horizontal}>
                    <DataCard title="Alunos por docente"
                        minWidth="400"
                        minHeight="200"
                        height="250px"
                        icon={AssessmentIcon}
                        chart={HorizontalBarChart} />

                    <DataCard title="Alunos por área"
                        minWidth="400"
                        minHeight="200"
                        height="250px"
                        icon={PieChartIcon}
                        chart={PieChart} />
                </div>

            </div>

            <Footer />
        </div>
    )
}