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
import Utils from '../../Utils.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const generateValues = (numberOfValues) => {
    const values = [];
    for (let i = 0; i < numberOfValues; i++) {
        values.push(Math.floor(Math.random() * 200) + 1);
    }

    return values;
}

function ProductionPerStudentChart({ filter }) {
    const [chartData, setChartData] = useState(null);
    const [publisherType, setPublisherType] = useState(null);
    const history = useNavigate();

    {/* configurações do gráfico Chart.js*/ }
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
            },
        },
        plugins: {
            title: {
                display: false
            },
        }
    }

    const productionAreaColors = {
        'Mestrado': 'rgb(48, 152, 220)',
        'Doutorado': 'rgb(255, 108, 108)'
    }

    
    const getData = (selectedFilter = []) => {
        axios.get(`${Utils.baseUrl}/api/dashboard/students_production`, {
            params: {
                selectedFilter,
                publisher_type: publisherType
            }
        })
            .then(({ data }) => {
                const labels = data.year;

                const dataChart = data.data.map((production, index) => {
                    let type = index == 0 ? 'Mestrado' : 'Doutorado'
                    return {
                        label: type,
                        data: production.data,
                        backgroundColor: productionAreaColors[type]
                    }
                });


                const productionStudentData = {
                    labels,
                    datasets: dataChart
                }

                setChartData(productionStudentData);
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
                <Bar options={options} data={chartData} />
            </>
            : null

    )
}

export default ProductionPerStudentChart
