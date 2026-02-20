import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'

const SHOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function CustomersPage() {
  const { lang, isRTL, toggleLanguage } = useLanguage()
  const [customers, setCustomers] = useState([])
  const [bookings, setBookings] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    setLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', SHOP_ID)
      .order('last_visit', { ascending: false })
    setCustomers(data || [])
    setLoading(false)
  }

  async function loadCustomerBookings(customerId) {
    const { data } = await supabase
      .from('bookings')
      .select('*, services(name_fr, name_ar), employees(full_name_fr, full_name_ar)')
      .eq('customer_id', customerId)
      .order('booking_date', { ascending: false })
      .limit(10)
    setBookings(prev => ({ ...prev, [customerId]: data || [] }))
  }

  function openCustomer(customer) {
    setSelected(customer)
    if (!bookings[customer.id]) loadCustomerBookings(customer.id)
  }

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const statusStyle = {
    confirmed: { color: '#818cf8' },
    completed: { color: '#34d399' },
    cancelled: { color: '#f87171' },
    pending: { color: '#fbbf24' },
  }

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? 'rtl' : ''}`} style={{ background: '#0f0e17' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
        .fadeUp { animation: fadeUp 0.4s ease forwards }
        .slideIn { animation: slideIn 0.3s ease forwards }
        .shimmer-text { background: linear-gradient(90deg,#667eea,#a78bfa,#667eea); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation: shimmer 3s linear infinite }
        .card-hover { transition: all 0.2s ease }
        .card-hover:hover { transform: translateY(-2px); border-color: rgba(102,126,234,0.4) !important }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #667eea, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="p-5 pt-6 relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-black text-white">
                {lang === 'fr' ? 'Clients' : 'العملاء'}
              </h1>
              <p className="text-xs mt-0.5 shimmer-text font-bold">
                ✦ BarberPro — {customers.length} {lang === 'fr' ? 'clients' : 'عميل'}
              </p>
            </div>
            <button onClick={toggleLanguage} className="border px-4 py-2 rounded-full text-sm font-bold"
              style={{ borderColor: 'rgba(102,126,234,0.5)', background: 'rgba(102,126,234,0.1)', color: '#a78bfa' }}>
              {lang === 'fr' ? 'عربي' : 'FR'}
            </button>
          </div>

          {/* Search */}
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher par nom ou téléphone...' : 'ابحث بالاسم أو الهاتف...'}
              className="flex-1 font-semibold text-sm focus:outline-none"
              style={{ background: 'transparent', color: 'white' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="slideIn w-full max-w-lg rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto"
            style={{ background: '#1a1a2e', border: '1px solid rgba(102,126,234,0.25)' }}>
            
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            <div className="px-5 pb-4">
              {/* Customer header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))', border: '1px solid rgba(102,126,234,0.4)' }}>
                  👤
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-black text-white">{selected.full_name}</h2>
                  <p className="text-sm" style={{ color: '#667eea' }}>📱 {selected.phone}</p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  ✕
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { icon: '💈', value: selected.total_visits, label: lang === 'fr' ? 'Visites' : 'زيارات', color: '#667eea' },
                  { icon: '📅', value: selected.last_visit || '—', label: lang === 'fr' ? 'Dernière visite' : 'آخر زيارة', color: '#a78bfa' },
                  { icon: '⭐', value: selected.total_visits >= 10 ? 'VIP' : selected.total_visits >= 5 ? 'Fidèle' : 'Nouveau', label: lang === 'fr' ? 'Statut' : 'الحالة', color: '#34d399' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-lg mb-1">{s.icon}</p>
                    <p className="font-black text-sm" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Booking history */}
              <p className="text-xs font-black mb-3" style={{ color: '#667eea' }}>
                ✦ {lang === 'fr' ? 'HISTORIQUE DES RÉSERVATIONS' : 'سجل الحجوزات'}
              </p>

              {!bookings[selected.id] ? (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }} />
                </div>
              ) : bookings[selected.id].length === 0 ? (
                <div className="text-center py-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {lang === 'fr' ? 'Aucun historique' : 'لا يوجد سجل'}
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings[selected.id].map(b => (
                    <div key={b.id} className="rounded-2xl p-3 flex justify-between items-center"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div>
                        <p className="font-bold text-white text-sm">
                          {lang === 'fr' ? b.services?.name_fr : b.services?.name_ar}
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          📅 {b.booking_date} · ⏰ {b.start_time?.slice(0, 5)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm" style={{ color: '#a78bfa' }}>{b.price} DZD</p>
                        <p className="text-xs font-bold" style={{ color: statusStyle[b.status]?.color }}>
                          {b.status === 'completed' ? (lang === 'fr' ? 'Terminé' : 'مكتمل') :
                           b.status === 'cancelled' ? (lang === 'fr' ? 'Annulé' : 'ملغى') :
                           b.status === 'confirmed' ? (lang === 'fr' ? 'Confirmé' : 'مؤكد') :
                           (lang === 'fr' ? 'En attente' : 'في الانتظار')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WhatsApp button */}
              <a href={`https://wa.me/213${selected.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                className="mt-4 w-full py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
                📱 {lang === 'fr' ? 'Envoyer un message WhatsApp' : 'إرسال رسالة واتساب'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="max-w-lg mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">👥</p>
            <p className="font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {search ? (lang === 'fr' ? 'Aucun résultat' : 'لا توجد نتائج') : (lang === 'fr' ? 'Aucun client encore' : 'لا يوجد عملاء بعد')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {filtered.map((c, i) => (
              <button key={c.id} onClick={() => openCustomer(c)}
                className="card-hover fadeUp w-full rounded-2xl p-4 text-left"
                style={{ animationDelay: `${i * 0.04}s`, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', border: '1px solid rgba(102,126,234,0.3)' }}>
                    {c.total_visits >= 10 ? '👑' : c.total_visits >= 5 ? '⭐' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white truncate">{c.full_name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>📱 {c.phone}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black" style={{ color: '#a78bfa' }}>{c.total_visits}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {lang === 'fr' ? 'visites' : 'زيارة'}
                    </p>
                  </div>
                </div>
                {c.last_visit && (
                  <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    📅 {lang === 'fr' ? 'Dernière visite :' : 'آخر زيارة:'} {c.last_visit}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}