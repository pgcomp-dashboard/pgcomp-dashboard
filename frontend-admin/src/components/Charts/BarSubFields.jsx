import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Utils from '../../Utils.js'
import { useNavigate } from 'react-router';


ChartJS.register(ArcElement, Tooltip, Legend);
//TODO: get na url 'dashboard/fields'
//TODO: mudar de nome a classe e chamar de field. criar um novo componente de subfield
//TODO: get na url 'dashboard/subfields'

function PieChart({ filter, type, isMobile }) {
    const [chartData, setChartData] = useState(null);
    const [backgroundColors, setBackgroundColors] = useState(null);
    const history = useNavigate();

    {/* configurações do gráfico Chart.js*/ }
    const [options, setOptions] = useState({
        elements: {
            bar: {
                borderWidth: 2,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 110
            },
        },
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: false,
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
    })

    //função que recebe o filtro selecionado e faz o get na API, passando o selectedFilter como paramêtro, retornando o gráfico de barras montado com cores aleátorias geradas pelo newBackgroundColors
    const getData = (selectedFilter = []) => {
        axios.get(`${Utils.baseUrl}/api/dashboard/${type}`, { params: { selectedFilter } })
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
                            label: 'Alunos',
                            data: dataChart,
                            backgroundColor: !backgroundColors ? newBackgroundColors : backgroundColors,
                            borderColor: !backgroundColors ? newBackgroundColors : backgroundColors,
                            borderWidth: 1
                        }]
                }



                setChartData(pieData)

            })

            .catch((error) => {

                if(error.response.status == 500){
                    history('/erro')
                    console.log(error)
                }

                else if(error.response.status == 404){
                    history('/*')
                    console.log(error)
                }

                else{
                    console.log(error)
                }

            });
    }

    useEffect(() => {
        getData();
    }, []);



    useEffect(() => {
        if (filter == 'default') filter = [];

        if (isMobile) {
            setOptions({
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
                        color: 'white',
                        anchor: 'center',
                        align: 'center',
                        clamp: true,
                        offset: 4,
                        display: true,
                        font: {
                            weight: 'bold',
                            size: 20
                        }
                    },
                }
            });
        }

        getData(filter);
    }, [filter, isMobile]);

    return chartData ? (isMobile ? <Pie width={300} height={300} options={options} data={chartData} /> :
        <Bar width={300} height={300} options={options} data={chartData} />) : null;
}

export default PieChart
