import styles from './DataCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

function DataCard(props) {
    return (
        <div className={styles.data__card}>
            <Card sx={{ minWidth: props.minWidth, minHeight: props.minHeight, height: props.height, }}>
                <CardHeader
                avatar={
                    <props.icon color="primary" />
                } 
                title={props.title} />
                <CardContent>
                    <props.chart />
                </CardContent>
            </Card>
        </div>
    )
}

export default DataCard