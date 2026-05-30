import { useState } from 'react'
const Timer = () => { const [running, setRunning] = useState(false); return <div className="bg-white p-6 rounded-lg shadow text-center"><h3 className="text-2xl font-bold mb-4">00:00:00</h3><button onClick={() => setRunning(!running)} className="btn-primary">{running ? 'Stop' : 'Start'}</button></div> }
export default Timer