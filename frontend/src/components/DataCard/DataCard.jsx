import styles from './DataCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import AssessmentIcon from '@mui/icons-material/Assessment';

function DataCard(props) {
    return (
        <div className={styles.data__card}>
            <Card sx={{ minWidth: 900 }}>
                <CardHeader
                avatar={
                    <AssessmentIcon color='primary' />
                } 
                title={props.title} />
                <CardContent>
                    <Typography sx={{ fontSize: 30 }}>
                        Teremos aqui o gráfico!
                    </Typography>
                </CardContent>
            </Card>
        </div>
    )
}

export default DataCard