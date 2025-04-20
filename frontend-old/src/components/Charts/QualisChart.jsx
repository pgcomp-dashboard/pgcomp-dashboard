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
import ProductionTypeFilter from '../Filters/ProductionTypeFilter';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function QualisChart({ filter }) {
    const [chartData, setChartData] = useState(null);
    const [publisherType, setPublisherType] = useState(null);
    const history = useNavigate();

    const qualisCategoriesColors = {
        'A1': '#7CBB00',
        'A2': '#FF6C6C',
        'A3': '#3098DC',
        'A4': '#868686',
        'B1': '#E76A05',
        'B2': '#F25AFF',
        'B3': '#5A938F',
        'B4': '#BBB400'
    };

    const qualisFilters = {
        'mestrando': 'master',
        'doutorando': 'doctor',
        'docente': 'teacher',
    }
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
                beginAtZero: true,
                suggestedMax: 50
            },
        },
        plugins: {
            title: {
                display: false
            },
            datalabels: {
                display: false
              }
        }
    }
//função que recebe o filtro selecionado e faz o get na API, passando o selectedFilter como paramêtro, retornando o gráfico de Qualis montado com as cores definidas no qualisCategoriesColors
    const getData = (selectedFilter = []) => {
        const endpointFilter = selectedFilter && !(Array.isArray(selectedFilter)) && selectedFilter !== 'default' ? '/' + qualisFilters[selectedFilter] : '';
        const url = 'http://localhost:8000/api/dashboard/production_per_qualis'
        axios.get(url, {
            params: {
                publisher_type: publisherType,
                user_type: selectedFilter
            }
        })
            .then(({ data }) => {
                const labels = data.years;
                const dataChart = data
                    .data
                    .filter((qualis) => {
                        return qualis.label !== '-'
                    })
                    .map((qualis) => {
                        return {
                            ...qualis,
                            backgroundColor: qualisCategoriesColors[qualis.label]

                        }

                    });

                const qualisData = {
                    labels,
                    datasets: dataChart
                };

                setChartData(qualisData);
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

    const toolTipDatasetStyle= {
        display: "flex",
        justifyContent: "flex-start"

    };

    const toolTip = {
        fontSize: "14px",
        color: "#3D3D3D",
        fontWeight: "bold",
        cursor: "pointer",
    }

    return (
        chartData ?
            <>
                <ProductionTypeFilter setPublisherType={setPublisherType} />
                <div style={toolTipDatasetStyle}>
                    <p style={toolTip}>Clique em alguma categoria para filtrar: </p>
                </div>
                <Bar options={options} data={chartData} />
            </>
            : null

    )
}

export default QualisChart
