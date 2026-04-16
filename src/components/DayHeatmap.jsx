import { DAYS_SHORT, COMPETITORS, COMPETITOR_MAP } from '../data/competitors'

const HOURS = [
  { label: '6–9 AM',   hours: [6,7,8] },
  { label: '9–12 PM',  hours: [9,10,11] },
  { label: '12–3 PM',  hours: [12,13,14] },
  { label: '3–6 PM',   hours: [15,16,17] },
  { label: '6–10 PM',  hours: [18,19,20,21] },
]

function getHourBucket(isoString) {
  const h = new Date(isoString).getHours()
  for (const bucket of HOURS) {
    if (bucket.hours.includes(h)) return bucket.label
  }
  return 'Other'
}

function getDayShort(isoString) {
  const d = new Date(isoString)
  return DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

function getIntensityColor(count, max) {
  if (count === 0) return '#F1F5F9'
  const ratio = count / max
  if (ratio < 0.25) return '#C7D2FE'
  if (ratio < 0.5)  return '#818CF8'
  if (ratio < 0.75) return '#6366F1'
  return '#4338CA'
}

export default function DayHeatmap({ messages }) {
  // Build grid: rows = time buckets, cols = days
  const grid = {}
  HOURS.forEach(b => {
    grid[b.label] = {}
    DAYS_SHORT.forEach(d => { grid[b.label][d] = 0 })
  })

  messages.forEach(m => {
    const bucket = getHourBucket(m.receivedAt)
    const day = getDayShort(m.receivedAt)
    if (grid[bucket] && grid[bucket][day] !== undefined) {
      grid[bucket][day]++
    }
  })

  const max = Math.max(1, ...Object.values(grid).flatMap(row => Object.values(row)))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Send Time Heatmap
        <span className="font-normal text-slate-400 ml-2">— when do competitors send?</span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-normal pr-4 pb-2 w-24">Time</th>
              {DAYS_SHORT.map(d => (
                <th key={d} className="text-center text-slate-500 font-semibold pb-2 px-1 w-12">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(bucket => (
              <tr key={bucket.label}>
                <td className="text-slate-400 pr-4 py-1 text-xs whitespace-nowrap">{bucket.label}</td>
                {DAYS_SHORT.map(day => {
                  const count = grid[bucket.label][day]
                  const bg = getIntensityColor(count, max)
                  return (
                    <td key={day} className="px-1 py-1">
                      <div
                        className="heatmap-cell w-full h-8 rounded flex items-center justify-center cursor-default"
                        style={{ backgroundColor: bg }}
                        title={`${day} ${bucket.label}: ${count} message${count !== 1 ? 's' : ''}`}
                      >
                        {count > 0 && (
                          <span style={{ color: count / max > 0.4 ? 'white' : '#4338CA', fontWeight: 700 }}>
                            {count}
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400">Less</span>
        {['#F1F5F9','#C7D2FE','#818CF8','#6366F1','#4338CA'].map(c => (
          <div key={c} className="w-5 h-4 rounded" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-slate-400">More</span>
      </div>
    </div>
  )
}
