import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import Utils from '../../Utils.js'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useNavigate } from 'react-router';
import api from '@/services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartDataLabels,
    Title,
    Tooltip,
    Legend
);

function StudentsPerTeacherChart({ filter, isMobile }) {
    const [chartData, setChartData] = useState(null);
    const history = useNavigate();
    console.log('isMobile', isMobile);

    const [options, setOptions] =  useState({
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
            datalabels: {
                color: 'grey',
                anchor: 'end',
                align: 'top',
                display: true,
                clamp: true,
                font: {
                    weight: 'bold'
                }
            },
        },
        scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 17
            }
          },
    })

    //função que recebe o filtro selecionado e faz o get na API, passando o selectedFilter como paramêtro, retornando o gráfico de barras montado com cores aleátorias
    const getData = (selectedFilter = []) => {
        api.get(`/api/dashboard/total_students_per_advisor`, { params: { user_type: selectedFilter } })
        .then(({ data }) => {
            const aggregateData = (data, threshold = 5, withOthers = true) => {
                const aggregated = data.reduce((acc, item) => {
                    if (item.advisedes_count <= threshold) {
                        acc.others += item.advisedes_count;
                    } else {
                        acc.labels.push(item.name);
                        acc.values.push(item.advisedes_count);
                    }
                    return acc;
                }, { labels: [], values: [], others: 0 });

                if (aggregated.others > 0 && withOthers) {
                    aggregated.labels.push('Outros');
                    aggregated.values.push(aggregated.others);
                }

                return aggregated;
            };

            const { labels, values } = aggregateData(data, (isMobile ? 15 : 0), true);
            const teachersData = {
                labels,
                datasets: [
                    {
                        label: 'Número de alunos',
                        data: values,
                        backgroundColor: Utils.generateColorsArray(labels.length),
                    },
                ],
            };

            setChartData(teachersData);
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

    console.log('SPT data', chartData);
    console.log('SPT options', options);

    return (
        chartData ? (isMobile ? <Pie width={300} height={300} options={options} data={chartData} /> :
            <Bar options={options} data={chartData} />) : null

    )
}

export default StudentsPerTeacherChart
