import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);
//TODO: get na url 'dashboard/fields'
//TODO: mudar de nome a classe e chamar de field. criar um novo componente de subfield
//TODO: get na url 'dashboard/subfields'

function PieChart({ filter }) {
    const [chartData, setChartData] = useState(null)

    const options = {
        labels: {
            render: 'label'
        },
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: false,
                text: 'Chart.js Pie Chart',
            },
        }
    }

    const getData = (selectedFilter = []) => {
        axios.get('http://localhost:8000/api/dashboard/fields', { params: { selectedFilter } })
            .then(({ data }) => {
                console.log('areas', data);
            });
    }

    useEffect(() => {
        setChartData({
            labels: ['CG', 'Análise de Dados', 'I.A',],
            datasets: [
                {
                    label: '# of Votes',
                    data: [12, 3, 5,],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        });

        getData();
    }, []);



    useEffect(() => {
        if (filter == 'default') filter = [];
        
        getData(filter);
    }, [filter]);

    return chartData ? <Pie options={options} data={chartData} /> : null;
}

export default PieChart