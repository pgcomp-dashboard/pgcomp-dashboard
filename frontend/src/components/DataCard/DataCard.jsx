import styles from './DataCard.module.css';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { useState } from 'react';
import DefaultFilter from '../Filters/DefaultFilter';


function DataCard(props) {
    const [filter, setFilter] = useState('default');
    const iconStyle = { width: 50, height: 50 };

    return (
        <div className={styles.data__card}>
            <Card sx={{ minWidth: props.minWidth, minHeight: props.minHeight, height: props.height, }}>
                <CardHeader
                    avatar={
                        <props.icon color="primary" style={iconStyle} />
                    }
                    title={props.title}
                    titleTypographyProps={{ variant: 'h5' }}
                    sx={{backgroundColor: '#F5F5F5', borderRadius: '8px'}}
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