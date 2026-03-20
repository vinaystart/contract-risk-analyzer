import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement,Tooltip,Legend)

function RiskChart({summary}){

const data = {

labels:["Low","Medium","High"],

datasets:[{

data:[
summary.low,
summary.medium,
summary.high
],

backgroundColor:[
"#198754",
"#ffc107",
"#dc3545"
]

}]

}

return <Pie data={data}/>

}

export default RiskChart