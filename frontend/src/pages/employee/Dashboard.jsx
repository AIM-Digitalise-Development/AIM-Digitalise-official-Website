import { useState, useEffect } from 'react'

/* ─── Recharts-free mini bar via CSS ─── */
const MiniBar = ({ val, max, color }) => (
  <div className="flex-1 flex flex-col justify-end h-10">
    <div className="rounded-sm transition-all duration-700" style={{ height: `${Math.round((val / max) * 40)}px`, background: color, minHeight: 4 }} />
  </div>
)

/* ─── Stat Card ─── */
const StatCard = ({ label, value, sub, icon, gradient, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-2xl p-5 text-left w-full transition-all duration-200 hover:scale-[1.02] active:scale-100 cursor-pointer"
    style={{ background: 'linear-gradient(135deg,#1a1d2b,#1e2235)', border: '1px solid rgba(255,255,255,0.06)' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: gradient }}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">{sub}</span>
    </div>
    <p className="text-[28px] font-black text-white leading-none">{value}</p>
    <p className="text-[12px] text-gray-500 mt-1 font-semibold">{label}</p>
  </button>
)

/* ─── Demo Data ─── */
const monthlyRevenue = [42, 55, 38, 72, 65, 88, 94, 70, 83, 101, 78, 112]
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const recentClients = [
  { name: 'Greenwood Public School', plan: 'Annual', students: 420, status: 'Active', joined: 'Jun 2026' },
  { name: 'Bright Minds Academy', plan: 'Quarterly', students: 310, status: 'Active', joined: 'May 2026' },
  { name: 'St. Xavier High School', plan: 'Annual', students: 580, status: 'Active', joined: 'Apr 2026' },
  { name: 'Sunrise International', plan: 'Monthly', students: 190, status: 'Trial', joined: 'Jun 2026' },
  { name: 'Pioneer Learning Hub', plan: 'Annual', students: 260, status: 'Active', joined: 'Mar 2026' },
]

const activities = [
  { type: 'order', label: '📦 New Order', desc: 'Greenwood Public School purchased Annual Plan', time: '2h ago' },
  { type: 'partner', label: '🤝 New Partner', desc: 'Rajesh Verma joined the partner network', time: '5h ago' },
  { type: 'order', label: '📦 New Order', desc: 'Bright Minds Academy renewed Quarterly Plan', time: '1d ago' },
  { type: 'support', label: '🎫 Support', desc: 'Ticket #1042 resolved for Pioneer Learning Hub', time: '1d ago' },
  { type: 'partner', label: '🤝 New Partner', desc: 'Meena Sharma joined the partner network', time: '2d ago' },
]

const todos = [
  { id: 1, task: 'Follow up with Greenwood for subscription AMC signature', priority: 'High', done: false },
  { id: 2, task: 'Complete custom offline node backup verification for Bright Minds', priority: 'Medium', done: false },
  { id: 3, task: 'Publish updated play store app for St. Xavier High School', priority: 'Low', done: true },
]

const EmployeeDashboard = () => {
  const [taskList, setTaskList] = useState(todos)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ task: '', priority: 'Medium' })
  const maxRev = Math.max(...monthlyRevenue)

  const toggleTask = (id) => setTaskList(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTask = (id) => setTaskList(prev => prev.filter(t => t.id !== id))
  const addTask = () => {
    if (!newTask.task.trim()) return
    setTaskList(prev => [{ id: Date.now(), ...newTask, done: false }, ...prev])
    setNewTask({ task: '', priority: 'Medium' })
    setShowAddTask(false)
  }

  const priorityColor = (p) => p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : '#22d3ee'

  return (
    <div className="space-y-6 select-none animate-fade-in text-gray-400">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 text-left">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">AIM Digitalise Pvt. Ltd. · FY 2026-2027 · <span className="text-emerald-450 font-semibold">Employee Portal</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-3 py-1.5 rounded-full font-bold" style={{ background: 'rgba(56,179,74,0.12)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.25)' }}>🟢 All systems operational</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value="142" sub="+8 this month" icon="🏫" gradient="linear-gradient(135deg,#3b82f6,#6366f1)" />
        <StatCard label="Total Revenue" value="₹7.2L" sub="+12% vs last yr" icon="💰" gradient="linear-gradient(135deg,#38b34a,#22d3ee)" />
        <StatCard label="Total Partners" value="38" sub="+3 this month" icon="🤝" gradient="linear-gradient(135deg,#f97316,#f59e0b)" />
        <StatCard label="Active Partners" value="31" sub="82% active" icon="⚡" gradient="linear-gradient(135deg,#ec4899,#8b5cf6)" />
      </div>

      {/* Revenue Chart + Payment Collection */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-black text-white text-left">Revenue Analytics — FY 2025-26</h3>
            <span className="text-[11px] font-bold text-gray-550">₹ in thousands</span>
          </div>
          <div className="flex items-end gap-1 h-32">
            {monthlyRevenue.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <MiniBar val={v} max={maxRev} color={i === 11 ? '#38b34a' : 'rgba(56,179,74,0.35)'} />
                <span className="text-[8px] text-gray-600 font-bold">{months[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-left">
              <p className="text-[10px] text-gray-500 font-semibold">Total Revenue</p>
              <p className="text-[16px] font-black text-white">₹7,28,000</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-500 font-semibold">Avg Monthly</p>
              <p className="text-[16px] font-black text-[#38b34a]">₹60,667</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-500 font-semibold">Growth</p>
              <p className="text-[16px] font-black text-cyan-400">+18.4%</p>
            </div>
          </div>
        </div>

        {/* Payment Collection */}
        <div className="rounded-2xl p-5 text-left" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[14px] font-black text-white mb-4">Payment Collection</h3>
          <div className="space-y-3">
            {[
              { label: 'Cash Received', value: '₹16,860', color: '#38b34a' },
              { label: 'Online Received', value: '₹4,200', color: '#22d3ee' },
              { label: 'Total Received', value: '₹21,060', color: '#8b5cf6' },
              { label: 'This Year Due', value: '₹7,10,699', color: '#f97316' },
            ].map((p) => (
              <div key={p.label} className="flex items-center justify-between py-2 rounded-lg px-3" style={{ background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${p.color}` }}>
                <p className="text-[11px] font-semibold text-gray-400">{p.label}</p>
                <p className="text-[13px] font-black text-white">{p.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">As on Jun 2026</p>
          </div>
        </div>
      </div>

      {/* Recent Clients + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="rounded-2xl p-5" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[14px] font-black text-white flex items-center gap-2 mb-4 text-left">
            <span>🏫</span> Recent Clients
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {recentClients.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors hover:bg-white/5">
                <div className="flex items-center gap-3 min-w-0 text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>{c.name[0]}</div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-500">{c.plan} · {c.students} students</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2 ${c.status === 'Active' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-2xl p-5" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[14px] font-black text-white flex items-center gap-2 mb-4 text-left">
            <span>⏱</span> Recent Activities
          </h3>
          <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                <div>
                  <p className="text-[12px] font-bold text-white">{a.label}</p>
                  <p className="text-[11px] text-gray-500">{a.desc}</p>
                </div>
                <span className="text-[10px] text-gray-600 font-bold shrink-0 mt-0.5">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="rounded-2xl p-5 text-left" style={{ background: '#1a1d2b', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-black text-white flex items-center gap-2">
            <span>✅</span> Task Checklist
          </h3>
          <button onClick={() => setShowAddTask(true)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer" style={{ background: 'rgba(56,179,74,0.15)', color: '#38b34a', border: '1px solid rgba(56,179,74,0.3)' }}>
            + Add Task
          </button>
        </div>
        {showAddTask && (
          <div className="mb-4 flex gap-2 flex-wrap">
            <input value={newTask.task} onChange={e => setNewTask(p => ({ ...p, task: e.target.value }))} placeholder="Task description..." className="flex-1 min-w-40 px-3 py-2 rounded-lg text-[12px] font-medium bg-white/5 text-white border border-white/10 focus:border-[#38b34a] outline-none" />
            <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} className="px-3 py-2 rounded-lg text-[12px] font-bold bg-white/5 text-white border border-white/10 cursor-pointer">
              <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
            </select>
            <button onClick={addTask} className="px-4 py-2 rounded-lg text-[12px] font-bold cursor-pointer bg-[#38b34a] text-black">Add</button>
            <button onClick={() => setShowAddTask(false)} className="px-3 py-2 rounded-lg text-[12px] font-bold cursor-pointer text-gray-400 hover:text-white">Cancel</button>
          </div>
        )}
        <div className="space-y-2">
          {taskList.map(t => (
            <div key={t.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors group">
              <button onClick={() => toggleTask(t.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${t.done ? 'border-[#38b34a] bg-[#38b34a]' : 'border-white/20 hover:border-[#38b34a]'}`}>
                {t.done && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </button>
              <span className={`flex-1 text-[12px] font-semibold ${t.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>{t.task}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0" style={{ color: priorityColor(t.priority), background: priorityColor(t.priority) + '18' }}>{t.priority}</span>
              <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 cursor-pointer transition-all shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard