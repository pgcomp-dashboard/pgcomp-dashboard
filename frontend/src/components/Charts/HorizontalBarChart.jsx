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

function generateColorsArray(numberOfColors) {
    const colorsArray = [];
    let r, g, b;
    for (let i = 0; i < numberOfColors; i++) {
        r = Math.floor(Math.random() * 255);
        g = Math.floor(Math.random() * 255);
        b = Math.floor(Math.random() * 255);
        colorsArray.push("rgb(" + r + "," + g + "," + b + ")");
    }

    return colorsArray;
}

function HorizontalBarChart(props) {
    const [chartData, setChartData] = useState(null);
    const NUMBER_OF_ITEMS = 8;

    const options = {
        indexAxis: 'y',
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
        axios.get('http://localhost:8000/api/dashboard').then(({ data }) => {
            const slicedData = data.slice(0, NUMBER_OF_ITEMS);

            const labels = map(slicedData, 'name');

            const teachersData = {
                labels,
                datasets: [
                    {
                        label: 'Número de alunos',
                        data: map(slicedData, 'adviseees_count'),
                        backgroundColor: generateColorsArray(NUMBER_OF_ITEMS)
                    }]
            };

            setChartData(teachersData);
        });

    }, []);

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default HorizontalBarChart
