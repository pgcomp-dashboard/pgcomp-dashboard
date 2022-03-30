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
    for (let i = 0; i < numberOfValues; i++){
        values.push(Math.floor(Math.random() * 200) + 1);
    }

    return values;
}

function QualisChart(props) {
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
        const labels = ['2004','2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014','2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];

        const qualisData = {
            labels,
            datasets: [
                {
                    label: 'A1',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },{
                    label: 'A2',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },{
                    label: 'A3',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },{
                    label: 'A4',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },{
                    label: 'B1',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },{
                    label: 'B2',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },{
                    label: 'B3',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },{
                    label: 'B4',
                    data: generateValues(NUMBER_OF_ITEMS),
                    backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                },
            ]
        };

        console.log(qualisData);

        setChartData(qualisData);

    }, []);

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default QualisChart
