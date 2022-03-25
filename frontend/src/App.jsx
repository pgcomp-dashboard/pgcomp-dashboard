import Toolbar from "./components/Toolbar/Toolbar";
import styles from "./App.module.css"
import Title from "./components/Title/Title";
import DataCard from "./components/DataCard/DataCard";

export function App() {
    return (
        <div className={styles.app__global}>
            <Toolbar />
            <Title />
            <div className={styles.cards__container}>
                <DataCard title="Card 1" />
            </div>

        </div>
    )
}