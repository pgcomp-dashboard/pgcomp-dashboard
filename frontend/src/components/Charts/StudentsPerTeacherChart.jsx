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

function StudentsPerTeacherChart({ filter }) {
    const [chartData, setChartData] = useState(null);
    const NUMBER_OF_ITEMS = 8;

    const options = {
        elements: {
            bar: {
                borderWidth: 2,
            },
        },
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false
            },
        }
    }

    useEffect(() => {
        axios.get('http://localhost:8000/api/dashboard/total_students_per_advisor').then(({ data }) => {
            const slicedData = data.slice(0, NUMBER_OF_ITEMS);

            console.log(data);

            const labels = map(slicedData, 'name');

            const teachersData = {
                labels,
                datasets: [
                    {
                        label: 'Número de alunos',
                        data: map(slicedData, 'advisedes_count'),
                        backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                    }]
            };

            setChartData(teachersData);
        });

    }, []);

    useEffect(() => {
        console.log('Filtro atualizado: ' + filter);
    }, [filter]);

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default StudentsPerTeacherChart
