import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
//TODO: get na url 'dashboard/all_production'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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

function ProductionsAmountChart({ filter }) {
    const [chartData, setChartData] = useState(null);

    const options = {
        type: 'line',
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
                text: 'Chart.js Line Chart'
            }
        },
        elements: {
            bar: {
                borderWidth: 1,
            },
        },
        responsive: true, //TODO: Porque duas vezes essa variavel?
    }

    useEffect(() => {
        const labels = ['2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];

        const data = {
            labels,
            datasets: [

                {
                    label: 'Dataset 1',
                    data: generateValues(19),
                    borderColor: '#66ff99',
                    backgroundColor: '#66ff99',
                },

            ]
        };

        console.log(data);

        setChartData(data);

    }, []);

    useEffect(() => {
        console.log('Filtro atualizado: ' + filter);
    }, [filter]);

    return (
        chartData ? <Line options={options} data={chartData} /> : null

    )
}

export default ProductionsAmountChart
