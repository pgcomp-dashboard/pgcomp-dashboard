import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '@/services/api';


ChartJS.register(ArcElement, Tooltip, Legend);
//TODO: get na url 'dashboard/fields'
//TODO: mudar de nome a classe e chamar de field. criar um novo componente de subfield
//TODO: get na url 'dashboard/subfields'

function PieChart({ filter, type }) {
    const [chartData, setChartData] = useState(null);
    const [backgroundColors, setBackgroundColors] = useState(null);
    const history = useNavigate();

    {/* configurações do gráfico Chart.js*/ }
    const options = {
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
    }
//função que recebe o filtro selecionado e faz o get na API, passando o selectedFilter como paramêtro, retornando o gráfico de pizza montado com as cores definidas no newBackgroundColors
    const getData = (selectedFilter = []) => {
        api.get(`/api/dashboard/${type}`, { params: { selectedFilter } })
            .then(({ data }) => {
                const labels = data[type];
                const dataChart = data.data;
                const newBackgroundColors = ['#7CBB00','#FF6C6C','#3098DC',"#f1c232"]

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
                };

                console.log("pieData", pieData);

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

        getData(filter);
    }, [filter]);

    console.log('pieData options', options);

    return chartData ? <Pie width={300} height={300} options={options} data={chartData} /> : null;
}

export default PieChart
