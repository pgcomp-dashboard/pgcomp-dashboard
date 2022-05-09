import styles from './BurgerMenu.module.css';
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';

function BurgerMenu({ showBurgerMenu }) {
    const styleIn = {
        transform: "translateX(100%)",
        transition: "transform 0.5s ease-in"
    }
    const styleOut = {
        transform: "translateX(0%)",
        transition: "transform 0.5s ease-in"
    }

    const iconStyle = {
        marginRight: '15px'
    }
    return (
        <nav className={styles['nav--toolbar']}>
            <ul className={styles['toolbar--links']} style={showBurgerMenu ? styleIn : styleOut}>
                <li><a href='#productions-amount'><ShowChartIcon style={iconStyle} /> Quantidade de produções científicas</a></li>
                <li><a href='#qualis'><AssessmentIcon style={iconStyle} /> Qualis</a></li>
                <li><a href='#productions-per-student'><AssessmentIcon style={iconStyle} /> Quantidade de produções por discentes</a></li>
                <li><a href='#students-per-teacher'><AssessmentIcon style={iconStyle} /> Alunos por docente</a></li>
                <li><a href='#students-per-field'><PieChartIcon style={iconStyle} /> Alunos por área</a></li>
                <li><a href='#students-per-subfield'><PieChartIcon style={iconStyle} /> Alunos por sub-área</a></li>
            </ul>
        </nav>
    )
}

export default BurgerMenu;