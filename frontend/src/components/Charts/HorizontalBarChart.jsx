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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function HorizontalBarChart(props) {
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
                display: false,
                text: 'Chart.js Horizontal Bar Chart',
            },
        }
    }

    const labels = ['Docente 1', 'Docente 2', 'Docente 3', 'Docente 4'];

    const data = {
        labels,
        datasets: [
            {
                label: 'Dataset teste',
                data: [10, 32, 23, 54],
                backgroundColor: ['rgba(53, 162, 235, 0.5)',
                    'rgb(255, 137, 0)',
                    'rgb(142, 137, 0)',
                    'rgb(186, 217, 187)']
            }]
    }

    return (
        <Bar options={options} data={data} />
    )
}

export default HorizontalBarChart