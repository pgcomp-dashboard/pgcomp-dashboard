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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function HorizontalBarChart(props) {
    const options = {
        indexAxis: 'y',
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
                display: false,
                text: 'Chart.js Horizontal Bar Chart',
            },
        }
    }

    axios.get('http://localhost:8000/api/dashboard').then(({data}) => {
        console.log(data);
        console.log(map(data, 'name'));
        console.log(map(data, 'adviseees_count'));
    })

    const labels = [
        //'Antonio Lopes Apolinario Junior',
        'Cassio V. S. Prazeres',
        'Christina V. F. G. Chavez',
        'Claudio N. Sant\'Anna',
        'Frederico Araujo Durao',
        // 'Daniela Barreiro Claro', 'Danilo Barbosa Coimbra', 'Ecivaldo De Souza Matos', 'Eduardo Santana De Almeida', 'Fabiola Goncalves Pereira Greve', 'Frederico Araujo Durao', 'Gecynalda Soares Da Silva Gomes', 'George Marconi De Araujo Lima', 'Gustavo Bittencourt Figueiredo', 'Ivan Do Carmo Machado', 'Lais Do Nascimento Salvador', 'Leobino Nascimento Sampaio', 'Luciano Reboucas De Oliveira', 'Manoel Gomes De Mendonca Neto', 'Marcos Ennes Barreto', 'Marlo Vieira Dos Santos E Souza', 'Maycon Leone Maciel Peixoto', 'Rafael Augusto De Melo', 'Ricardo Araujo Rios', 'Rita Suzana Pitangueira Maciel', 'Steffen Lewitzka', 'Tatiane Nogueira Rios', 'Tiago De Oliveira Januario', 'Vaninha Vieira Dos Santos', 'Vinicius Tavares Petrucci', 'Mauricio Pamplona Segundo', 'Marcelo Magalhaes Taddeo', 'Aline Maria Santos Andrade', 'Karl Philips Apaza Aguero', 'Rodrigo Rocha Gomes E Souza', 'Michelle Larissa Luciano Carvalho', 'Debora Abdalla Santos', 'Raimundo Jose De Araujo Macedo', 'Patricia Ramos Cury', 'Lynn Rosalina Gama Alves', 'Veronica Maria Cadena Lima'
    ];

    const data = {
        labels,
        datasets: [
            {
                label: 'Dataset teste',
                data: [
                    // 4,
                    10,
                    11,
                    5,
                    //  8, 6, 5, 8, 11, 9, 3, 3, 13, 9, 9, 12, 3, 14, 11, 2, 13, 2, 5, 17, 1, 3, 2, 10, 5, 2, 0, 3, 1, 3, 0, 2, 2, 0, 0, 0
                    9, //Fred - duplicado - remover
                ],
                backgroundColor: [
                    'rgba(53, 162, 235, 0.5)',
                    'rgb(255, 137, 0)',
                    'rgb(142, 137, 0)',
                    'rgb(186, 217, 187)',
                ]
            }]
    }

    return (
        <Bar options={options} data={data}/>
    )
}

export default HorizontalBarChart
