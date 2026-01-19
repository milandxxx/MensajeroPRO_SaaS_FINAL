import axios from 'axios'
export default function Dashboard(){
 const pagar=async()=>{
  const r=await axios.post('http://127.0.0.1:8000/api/payments/create/')
  window.location=r.data.links[1].href
 }
 return (
  <div>
   <h1>MensajeroPRO Dashboard</h1>
   <button onClick={pagar}>Pagar licencia</button>
  </div>
 )
}
