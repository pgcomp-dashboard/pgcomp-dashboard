import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import axios from 'axios';
import { map } from 'lodash';
import { useEffect, useState } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const generateValues = (numberOfValues) => {
    const values = [];
    for (let i = 0; i < numberOfValues; i++) {
        values.push(Math.floor(Math.random() * 200) + 1);
    }

    return values;
}

function ProductionPerStudentChart(props) {
    const [chartData, setChartData] = useState(null);
    const NUMBER_OF_ITEMS = 19;

    const options = {
        elements: {
            bar: {
                borderWidth: 1,
            },
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
        plugins: {
            title: {
                display: false
            },
        }
    }

    useEffect(() => {
        const labels = ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];

        const productionStudentData = {
            labels,
            datasets: [
                {
                    label: 'Mestrado',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: 'rgb(48, 152, 220)'
                },
                {
                    label: 'Doutorado',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: 'rgb(255, 108, 108)'
                }
            ]
        };

        setChartData(productionStudentData);

    }, []);

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default ProductionPerStudentChart
