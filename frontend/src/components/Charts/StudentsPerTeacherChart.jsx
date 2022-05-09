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
import Utils from '../../Utils.js'

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

    const getData = (selectedFilter = []) => {
        axios.get('https://mate85-api.litiano.dev.br/api/dashboard/total_students_per_advisor', { params: { selectedFilter } }).then(({ data }) => {
            const labels = map(data, 'name');

            const teachersData = {
                labels,
                datasets: [
                    {
                        label: 'Número de alunos',
                        data: map(data, 'advisedes_count'),
                        backgroundColor: Utils.generateColorsArray(data.length)
                    }]
            };

            setChartData(teachersData);
        });
    }

    useEffect(() => {
        getData();

    }, []);

    useEffect(() => {
        if (filter == 'default') filter = [];

        getData(filter);
    }, [filter]);

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default StudentsPerTeacherChart
