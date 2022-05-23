import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Utils from '../../Utils.js'


ChartJS.register(ArcElement, Tooltip, Legend);
//TODO: get na url 'dashboard/fields'
//TODO: mudar de nome a classe e chamar de field. criar um novo componente de subfield
//TODO: get na url 'dashboard/subfields'

function PieChart({ filter, type }) {
    const [chartData, setChartData] = useState(null);
    const [backgroundColors, setBackgroundColors] = useState(null);

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
            datalabels: {
                color: 'grey',
                anchor: 'end',
                align: 'end',
                clamp: true,
                offset: 4,
                display: true,
                font: {
                    weight: 'bold'
                }
            },
        }
    }

    const getData = (selectedFilter = []) => {
        axios.get(`https://mate85-api.litiano.dev.br/api/dashboard/${type}`, { params: { selectedFilter } })
            .then(({ data }) => {
                const labels = data[type];
                const dataChart = data.data;
                const newBackgroundColors = Utils.generateColorsArray(data.data.length);

                if (!backgroundColors){
                    setBackgroundColors(newBackgroundColors);
                }


                const pieData = {
                    labels,
                    datasets:
                        [{
                            label: 'Students',
                            data: dataChart,
                            backgroundColor: !backgroundColors ? newBackgroundColors : backgroundColors,
                            borderColor: !backgroundColors ? newBackgroundColors : backgroundColors,
                            borderWidth: 1
                        }]
                };

                setChartData(pieData)

            });
    }

    useEffect(() => {
        getData();
    }, []);



    useEffect(() => {
        if (filter == 'default') filter = [];

        getData(filter);
    }, [filter]);

    return chartData ? <Pie width={300} height={300} options={options} data={chartData} /> : null;
}

export default PieChart