import styles from './DataCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

function DataCard(props) {
    return (
        <div className={styles.data__card}>
            <Card sx={{ minWidth: props.minWidth, minHeight: props.minHeight }}>
                <CardHeader
                avatar={
                    <props.icon color="primary" />
                } 
                title={props.title}
                // action={
                //     'Filtro'
                // }
                 />
                <CardContent>
                    <props.chart />
                </CardContent>
            </Card>
        </div>
    )
}

export default DataCard