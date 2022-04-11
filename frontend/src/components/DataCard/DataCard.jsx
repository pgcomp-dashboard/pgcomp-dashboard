import styles from './DataCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import DefaultFilter from '../Filters/DefaultFilter';


function DataCard(props) {
    const [filter, setFilter] = useState(10);

    return (
        <div className={styles.data__card}>
            <Card sx={{ minWidth: props.minWidth, minHeight: props.minHeight, height: props.height, }}>
                <CardHeader
                    avatar={
                        <props.icon color="primary" />
                    }
                    title={props.title}
                    action={
                        <DefaultFilter filter={filter} setFilter={setFilter} options={props.filterOptions} />
                    }
                />
                <CardContent>
                    <props.chart filter={filter} />
                </CardContent>
            </Card>
        </div>
    )
}

export default DataCard