import React, { useState } from 'react'

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

// High-fidelity chart data matching the screenshot values and relationships
const chartData = [
  { month: 'Apr', sales: 142000, schoolMs: 80000, otherProducts: 62000 },
  { month: 'May', sales: 184000, schoolMs: 110000, otherProducts: 74000 },
  { month: 'Jun', sales: 166000, schoolMs: 94000, otherProducts: 72000 },
  { month: 'Jul', sales: 208000, schoolMs: 130000, otherProducts: 78000 },
  { month: 'Aug', sales: 193000, schoolMs: 115000, otherProducts: 78000 },
  { month: 'Sep', sales: 228000, schoolMs: 140000, otherProducts: 88000 },
  { month: 'Oct', sales: 173000, schoolMs: 100000, otherProducts: 73000 },
  { month: 'Nov', sales: 218000, schoolMs: 135000, otherProducts: 83000 },
  { month: 'Dec', sales: 238000, schoolMs: 150000, otherProducts: 88000 },
  { month: 'Jan', sales: 196000, schoolMs: 120000, otherProducts: 76000 },
  { month: 'Feb', sales: 213000, schoolMs: 130000, otherProducts: 83000 },
  { month: 'Mar', sales: 258000, schoolMs: 160000, otherProducts: 98000 },
]

const MAX_VAL = 300000
const yTicks = [300000, 250000, 200000, 150000, 100000, 50000, 0]

const SalesChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  // Compute smooth Bezier curve points path
  const getBezierPath = (key) => {
    const points = chartData.map((d, i) => {
      const x = (i + 0.5) * (100 / 12)
      const y = 100 - (d[key] / MAX_VAL) * 100
      return { x, y }
    })
    
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i+1]
      // Control points calculated to smooth the line out
      const cp1x = p0.x + (p1.x - p0.x) / 3
      const cp1y = p0.y
      const cp2x = p1.x - (p1.x - p0.x) / 3
      const cp2y = p1.y
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`
    }
    return path
  }

  const schoolBezierPath = getBezierPath('schoolMs')
  const otherBezierPath = getBezierPath('otherProducts')

  return (
    <div className="relative flex flex-col select-none py-2">
      {/* Chart Canvas Area */}
      <div className="flex h-[320px] relative">
        
        {/* Y Axis Ticks */}
        <div className="w-14 flex flex-col justify-between text-right pr-3.5 text-[11px] font-bold text-slate-400 font-mono py-1.5 z-10">
          {yTicks.map((val) => (
            <span key={val}>
              {val === 0 ? '₹0k' : `₹${val / 1000}k`}
            </span>
          ))}
        </div>

        {/* Chart Main Container */}
        <div className="flex-grow relative border-l border-b border-slate-200 bg-white rounded-br-lg">
          
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-1.5 pointer-events-none">
            {yTicks.map((val) => (
              <div key={val} className="w-full border-t border-slate-100" />
            ))}
          </div>

          {/* Chart Plot: Bars and SVG Lines */}
          <div className="absolute inset-0 flex items-end px-2 py-1.5">
            {/* Hover Guides */}
            <div className="absolute inset-0 flex z-30">
              {chartData.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-full cursor-pointer transition-colors hover:bg-slate-500/5"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
            </div>

            {/* The Bars */}
            <div className="w-full h-full flex items-end gap-3.5 z-10 pointer-events-none">
              {chartData.map((d, i) => {
                const heightPercent = (d.sales / MAX_VAL) * 100
                const isHovered = hoveredIdx === i
                return (
                  <div key={i} className="flex-grow flex flex-col justify-end items-center h-full">
                    {/* The light blue bar with solid outline */}
                    <div
                      className={`w-full rounded-t-lg border-2 transition-all duration-200 ${
                        isHovered 
                          ? 'border-blue-600 bg-blue-100/70 shadow-md shadow-blue-100' 
                          : 'border-blue-500 bg-blue-50/55'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                )
              })}
            </div>

            {/* SVG overlay for lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none px-6 py-1.5 z-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* School MS Line (Yellow/Orange) */}
              <path
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
                d={schoolBezierPath}
              />

              {/* Other Products Line (Green) */}
              <path
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                d={otherBezierPath}
              />
            </svg>

            {/* Dots overlay */}
            <div className="absolute inset-0 w-full h-full pointer-events-none px-6 py-1.5 z-25">
              {chartData.map((d, i) => {
                const xPercent = (i + 0.5) * (100 / 12)
                const schoolYPercent = 100 - (d.schoolMs / MAX_VAL) * 100
                const otherYPercent = 100 - (d.otherProducts / MAX_VAL) * 100
                const isHovered = hoveredIdx === i

                return (
                  <React.Fragment key={i}>
                    {/* Orange Dot */}
                    <div
                      className={`absolute w-2 h-2 rounded-full bg-amber-500 border-[1px] border-white shadow-md -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
                        isHovered ? 'scale-125 ring-2 ring-amber-500/20' : ''
                      }`}
                      style={{ left: `${xPercent}%`, top: `${schoolYPercent}%` }}
                    />
                    {/* Green Dot */}
                    <div
                      className={`absolute w-2 h-2 rounded-full bg-emerald-500 border-[1px] border-white shadow-md -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${
                        isHovered ? 'scale-125 ring-2 ring-emerald-500/20' : ''
                      }`}
                      style={{ left: `${xPercent}%`, top: `${otherYPercent}%` }}
                    />
                  </React.Fragment>
                )
              })}
            </div>

            {/* Custom Tooltip matching screenshot exactly */}
            {hoveredIdx !== null && (
              <div
                className="absolute z-40 bg-[#1e293b] text-white rounded-xl p-3.5 shadow-2xl border border-slate-700 pointer-events-none text-xs flex flex-col gap-2 transition-all duration-150 min-w-[170px]"
                style={{
                  left: `${((hoveredIdx + 0.5) * (100 / 12))}%`,
                  bottom: '65px',
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Tooltip Title */}
                <div className="font-extrabold pb-1.5 border-b border-slate-700/60 text-slate-200 text-sm">
                  {chartData[hoveredIdx].month}
                </div>

                {/* 1. Other Products (Green) */}
                <div className="flex items-center justify-between gap-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                    <span className="text-slate-300">Other Products:</span>
                  </div>
                  <span className="font-bold font-mono">₹{chartData[hoveredIdx].otherProducts.toLocaleString()}</span>
                </div>

                {/* 2. School MS (Orange) */}
                <div className="flex items-center justify-between gap-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                    <span className="text-slate-300">School MS:</span>
                  </div>
                  <span className="font-bold font-mono">₹{chartData[hoveredIdx].schoolMs.toLocaleString()}</span>
                </div>

                {/* 3. Total Sales (Blue) */}
                <div className="flex items-center justify-between gap-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                    <span className="text-slate-300">Total Sales (₹):</span>
                  </div>
                  <span className="font-bold font-mono">₹{chartData[hoveredIdx].sales.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* X Axis Months */}
      <div className="flex pl-14">
        <div className="flex-grow flex justify-between py-2.5 text-[11px] font-bold text-slate-500 font-mono text-center">
          {months.map((month) => (
            <span key={month} className="flex-1">
              {month}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SalesChart