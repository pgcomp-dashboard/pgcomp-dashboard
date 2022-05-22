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
              }
        },
        elements: {
            bar: {
                borderWidth: 1,
            },
        },
        scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 50
            }
          }
    }

    const getData = (selectedFilter = []) => {
        axios.get('https://mate85-api.litiano.dev.br/api/dashboard/all_production', {
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
