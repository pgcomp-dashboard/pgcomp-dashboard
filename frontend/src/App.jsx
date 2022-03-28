import Toolbar from "./components/Toolbar/Toolbar";
import styles from "./App.module.css"
import Title from "./components/Title/Title";
import DataCard from "./components/DataCard/DataCard";
import HorizontalBarChart from "./components/Charts/HorizontalBarChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Footer from "./components/Footer/Footer";

export function App() {
    return (
        <div className={styles.app__global}>
            
            <Toolbar />

            <Title />

            <div className={styles.cards__container}>

                <DataCard title="Alunos por docente"
                    minWidth="400"
                    minHeight="200"
                    icon={AssessmentIcon}
                    chart={HorizontalBarChart} />

            </div>

            <Footer />
        </div>
    )
}