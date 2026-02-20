import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'

const SHOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function DashboardPage() {
  const { lang, isRTL, toggleLanguage } = useLanguage()
  const [tab, setTab] = useState('today')
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({ today: 0, revenue: 0, customers: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadData() }, [tab])

  async function loadData() {
    setLoading(true)
    let query = supabase.from('bookings').select(`*, customers(full_name, phone), employees(full_name_fr, full_name_ar), services(name_fr, name_ar, price)`)
      .eq('shop_id', SHOP_ID).order('start_time')
    if (tab === 'today') query = query.eq('booking_date', today)
    const { data } = await query
    setBookings(data || [])

    const { data: todayB } = await supabase.from('bookings').select('price, status').eq('shop_id', SHOP_ID).eq('booking_date', today)
    const revenue = (todayB || []).filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0)
    const pending = (todayB || []).filter(b => b.status === 'confirmed' || b.status === 'pending').length
    const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('shop_id', SHOP_ID)
    setStats({ today: (todayB || []).length, revenue, customers: count || 0, pending })
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    loadData()
  }

  const statusStyle = {
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: { fr: 'En attente', ar: 'في الانتظار' } },
    confirmed: { bg: 'rgba(102,126,234,0.15)', color: '#818cf8', label: { fr: 'Confirmé', ar: 'مؤكد' } },
    completed: { bg: 'rgba(52,211,153,0.15)', color: '#34d399', label: { fr: 'Terminé', ar: 'مكتمل' } },
    cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: { fr: 'Annulé', ar: 'ملغى' } },
  }

  const now = new Date()
  const hour = now.getHours()
  const greeting = lang === 'fr'
    ? (hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir')
    : (hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور')

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? 'rtl' : ''}`} style={{ background: '#0f0e17' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.4s ease forwards }
        .card-in { animation: fadeUp 0.4s ease forwards }
        .shimmer-text {
          background: linear-gradient(90deg, #667eea, #a78bfa, #667eea);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #667eea, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="p-5 pt-6 relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{greeting} 👋</p>
              <h1 className="text-2xl font-black text-white">
                {lang === 'fr' ? 'Tableau de bord' : 'لوحة التحكم'}
              </h1>
              <p className="text-xs mt-0.5 shimmer-text font-bold">✦ BarberPro — Salon Mohamed</p>
            </div>
            <button onClick={toggleLanguage}
              className="border text-white px-4 py-2 rounded-full text-sm font-bold"
              style={{ borderColor: 'rgba(102,126,234,0.5)', background: 'rgba(102,126,234,0.1)', color: '#a78bfa' }}>
              {lang === 'fr' ? 'عربي' : 'FR'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pb-5">
            {[
              { icon: '📅', value: stats.today, label: lang === 'fr' ? "Aujourd'hui" : 'اليوم', color: '#667eea' },
              { icon: '⏳', value: stats.pending, label: lang === 'fr' ? 'En attente' : 'في الانتظار', color: '#fbbf24' },
              { icon: '💰', value: `${stats.revenue} DZD`, label: lang === 'fr' ? 'Revenu' : 'الإيراد', color: '#34d399' },
              { icon: '👥', value: stats.customers, label: lang === 'fr' ? 'Clients' : 'العملاء', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex rounded-2xl p-1 mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { key: 'today', fr: "Aujourd'hui", ar: 'اليوم' },
            { key: 'all', fr: 'Tous', ar: 'الكل' }
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
              style={tab === t.key ? {
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
              } : { color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'fr' ? t.fr : t.ar}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'fr' ? 'Aucune réservation' : 'لا توجد حجوزات'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => {
              const ss = statusStyle[b.status] || statusStyle.pending
              return (
                <div key={b.id} className="card-in rounded-2xl overflow-hidden"
                  style={{ animationDelay: `${i * 0.05}s`, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

                  {/* Status bar */}
                  <div className="h-1" style={{ background: ss.color }} />

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-white text-base">{b.customers?.full_name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>📱 {b.customers?.phone}</p>
                      </div>
                      <span className="text-xs font-black px-3 py-1.5 rounded-full"
                        style={{ background: ss.bg, color: ss.color }}>
                        {ss.label[lang]}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: lang === 'fr' ? 'Service' : 'الخدمة', value: lang === 'fr' ? b.services?.name_fr : b.services?.name_ar },
                        { label: lang === 'fr' ? 'Heure' : 'الوقت', value: b.start_time?.slice(0, 5) },
                        { label: lang === 'fr' ? 'Prix' : 'السعر', value: `${b.price} DZD` },
                      ].map((item, j) => (
                        <div key={j} className="rounded-xl p-2 text-center"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</p>
                          <p className="text-xs font-black text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      👤 {lang === 'fr' ? b.employees?.full_name_fr : b.employees?.full_name_ar} · 📅 {b.booking_date}
                    </p>

                    {b.status !== 'completed' && b.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(b.id, 'completed')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-black transition"
                          style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                          ✅ {lang === 'fr' ? 'Terminé' : 'مكتمل'}
                        </button>
                        <button onClick={() => updateStatus(b.id, 'cancelled')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-black transition"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                          ❌ {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}