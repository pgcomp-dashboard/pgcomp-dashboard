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
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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
    }

    const getData = (selectedFilter = []) => {
        axios.get('http://localhost:8000/api/dashboard/all_production', { params: { selectedFilter } })
            .then(({ data }) => {
                const labels = data.years;

                const dataChart = [
                    {
                        label: 'Produções',
                        data: data.data,
                        borderColor: '#66ff99',
                        backgroundColor: '#66ff99',
                    }
                ];

                const productionsData = {
                    labels,
                    datasets: dataChart
                }

                setChartData(productionsData);
            });
    }

    useEffect(() => {
        getData();

    }, []);

    useEffect(() => {
        console.log('Filtro atualizado: ' + filter);
    }, [filter]);

    return (
        chartData ? <Line options={options} data={chartData} /> : null

    )
}

export default ProductionsAmountChart
