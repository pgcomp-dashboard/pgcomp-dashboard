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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ChartDataLabels,
    Title,
    Tooltip,
    Legend
);

function StudentsPerTeacherChart({ filter }) {
    const [chartData, setChartData] = useState(null);
    const history = useNavigate();

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
        scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 17
            }
          }
    }

    //função que recebe o filtro selecionado e faz o get na API, passando o selectedFilter como paramêtro, retornando o gráfico de barras montado com cores aleátorias
    const getData = (selectedFilter = []) => {
        axios.get('https://mate85-api.litiano.dev.br/api/dashboard/total_students_per_advisor', { params: { user_type: selectedFilter } })
        .then(({ data }) => {
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

    return (
        chartData ? <Bar options={options} data={chartData} /> : null

    )
}

export default StudentsPerTeacherChart
