export default function StatsCard({ label, value, icon: Icon, color = '#ed7979', sub }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-start gap-4 shadow-sm" style={{ border: '1px solid #e8e4dc' }}>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '22' }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ fontFamily: 'Oswald', color: '#2d2520' }}>{value}</p>
        <p className="text-sm mt-0.5" style={{ fontFamily: 'Josefin Sans', color: '#7C7C7C' }}>{label}</p>
        {sub && <p className="text-xs mt-1" style={{ fontFamily: 'Josefin Sans', color: '#929799' }}>{sub}</p>}
      </div>
    </div>
  )
}
