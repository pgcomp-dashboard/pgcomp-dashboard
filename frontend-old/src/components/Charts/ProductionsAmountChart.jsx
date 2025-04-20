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
import ProductionTypeFilter from '../Filters/ProductionTypeFilter';
import { useNavigate } from 'react-router-dom';

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
    const [publisherType, setPublisherType] = useState(null);
    const history = useNavigate();

    {/*Configurações do chartjs*/}
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
            },
            datalabels: {
                display: false
              },
              datalabels: {
                color: 'grey',
                anchor: 'end',
                align: 'top',
                offset: 6,
                display: true,
                font: {
                    weight: 'bold'
                }
            },
        },
        elements: {
            bar: {
                borderWidth: 1,
            },
        },
        scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 105
            }
          }
    }

    //função que recebe o filtro selecionado e faz o get na API, passando o selectedFilter como paramêtro, retornando o gráfico de linha com o filtro selecionado
    const getData = (selectedFilter = []) => {
        axios.get('http://localhost:80/api/dashboard/all_production', {
            params: {
                user_type: selectedFilter,
                publisher_type: publisherType
            }
        })
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
    }, [filter, publisherType]);

    return (
        chartData ?
            <>
                <ProductionTypeFilter setPublisherType={setPublisherType} />
                <Line options={options} data={chartData} />
            </>
            : null

    )
}

export default ProductionsAmountChart
