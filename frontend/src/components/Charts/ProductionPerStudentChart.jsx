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

function ProductionPerStudentChart({ filter }) {
    const [chartData, setChartData] = useState(null);

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

    const productionAreaColors = {
        'Mestrado': 'rgb(48, 152, 220)',
        'Doutorado': 'rgb(255, 108, 108)'
    }

    const getData = (selectedFilter = []) => {
        axios.get('http://localhost:8000/api/dashboard/students_production', { params: { selectedFilter } })
            .then(({ data }) => {
                const labels = data.year;

                const dataChart = data.data.map((production) => {
                    return {
                        ...production,
                        backgroundColor: productionAreaColors[production.label]
                    }
                });

                const productionStudentData = {
                    labels, 
                    datasets: dataChart
                }

                setChartData(productionStudentData);
            });
    }

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        console.log('Filtro atualizado: ' + filter);
    }, [filter]);

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default ProductionPerStudentChart
