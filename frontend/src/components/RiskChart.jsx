import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

function RiskChart(){

const data = {

labels:["Low Risk","Medium Risk","High Risk"],

datasets:[
{
data:[10,5,2],
backgroundColor:[
"#198754",
"#ffc107",
"#dc3545"
]
}
]

}

return(

<div className="card p-4 shadow">

<h5 className="mb-3">Risk Summary</h5>

<Pie data={data}/>

</div>

)

}

export default RiskChart