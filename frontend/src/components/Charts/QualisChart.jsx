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
import generateColorsArray from '../../Utils.js'
//TODO: get na url 'dashboard/production_per_qualis'

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
        values.push(Math.floor(Math.random() * 150) + 1);
    }

    return values;
}

function QualisChart({ filter }) {
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

        const qualisData = {
            labels,
            datasets: [
                {
                    label: 'A1',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#7CBB00'
                }, {
                    label: 'A2',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#FF6C6C'
                }, {
                    label: 'A3',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#3098DC'
                }, {
                    label: 'A4',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#868686'
                }, {
                    label: 'B1',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#E76A05'
                }, {
                    label: 'B2',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#F25AFF'
                }, {
                    label: 'B3',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#5A938F'
                }, {
                    label: 'B4',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: '#BBB400'
                },
            ]
        };

        console.log(qualisData);

        setChartData(qualisData);

    }, []);

    useEffect(() => {
        console.log('Filtro atualizado: ' + filter);
    }, [filter]);

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default QualisChart
