import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'

const SHOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function BookingPage() {
  const { lang, isRTL, toggleLanguage } = useLanguage()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [employees, setEmployees] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookingDone, setBookingDone] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState({
    service: null, employee: null,
    date: '', time: null,
    customerName: '', customerPhone: ''
  })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadServices() }, [])
  useEffect(() => {
    if (selected.date && selected.employee) loadSlots()
  }, [selected.date, selected.employee])

  async function loadServices() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').eq('shop_id', SHOP_ID).eq('is_active', true)
    setServices(data || [])
    setLoading(false)
  }

  async function loadEmployees() {
    setLoading(true)
    const { data } = await supabase.from('employees').select('*').eq('shop_id', SHOP_ID).eq('is_active', true)
    setEmployees(data || [])
    setLoading(false)
  }

  async function loadSlots() {
    setLoading(true)
    const { data: booked } = await supabase.from('bookings').select('start_time, end_time')
      .eq('employee_id', selected.employee.id).eq('booking_date', selected.date).neq('status', 'cancelled')
    const duration = selected.service.duration_minutes
    const slots = []
    let cur = 9 * 60
    while (cur + duration <= 18 * 60) {
      const isBooked = (booked || []).some(b => {
        const bs = timeToMin(b.start_time), be = timeToMin(b.end_time)
        return cur < be && cur + duration > bs
      })
      if (!isBooked) slots.push({ start: minToTime(cur), end: minToTime(cur + duration) })
      cur += duration
    }
    setAvailableSlots(slots)
    setLoading(false)
  }

  const timeToMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const minToTime = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

  async function confirmBooking() {
    setLoading(true)
    setError('')
    try {
      let customerId
      const { data: existing } = await supabase.from('customers').select('id, total_visits')
        .eq('phone', selected.customerPhone).eq('shop_id', SHOP_ID).single()
      if (existing) {
        customerId = existing.id
        await supabase.from('customers').update({ total_visits: existing.total_visits + 1, last_visit: today }).eq('id', customerId)
      } else {
        const { data: newC } = await supabase.from('customers').insert({
          shop_id: SHOP_ID, full_name: selected.customerName,
          phone: selected.customerPhone, total_visits: 1, last_visit: today
        }).select().single()
        customerId = newC.id
      }
      await supabase.from('bookings').insert({
        shop_id: SHOP_ID, customer_id: customerId,
        employee_id: selected.employee.id, service_id: selected.service.id,
        booking_date: selected.date, start_time: selected.time.start,
        end_time: selected.time.end, price: selected.service.price, status: 'confirmed'
      })
      setBookingDone(true)
    } catch {
      setError(lang === 'fr' ? 'Erreur, veuillez réessayer.' : 'خطأ، حاول مرة أخرى.')
    }
    setLoading(false)
  }

  const serviceIcons = ['✂️', '🪒', '💈', '✨', '💇', '🧴']

  // ── SUCCESS SCREEN ──
  if (bookingDone) return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isRTL ? 'rtl' : ''}`}
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <style>{`
        @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .pop { animation: pop 0.5s cubic-bezier(.36,.07,.19,.97) forwards }
        .fadeUp { animation: fadeUp 0.5s ease forwards }
        .fadeUp2 { animation: fadeUp 0.5s ease 0.1s both }
        .fadeUp3 { animation: fadeUp 0.5s ease 0.2s both }
      `}</style>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
          <div className="pop w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            ✅
          </div>
          <h2 className="fadeUp text-3xl font-black text-gray-900 mb-1">
            {lang === 'fr' ? 'C\'est réservé !' : 'تم الحجز !'}
          </h2>
          <p className="fadeUp2 text-gray-400 text-sm mb-6">
            {lang === 'fr' ? 'On vous attend avec impatience 💈' : 'نحن في انتظارك بفارغ الصبر 💈'}
          </p>
          <div className="fadeUp3 rounded-2xl p-4 text-left space-y-3 mb-6"
            style={{ background: 'linear-gradient(135deg, #f8f9ff, #f0f2ff)' }}>
            {[
              { icon: '💈', label: lang === 'fr' ? 'Service' : 'الخدمة', value: lang === 'fr' ? selected.service.name_fr : selected.service.name_ar },
              { icon: '👤', label: lang === 'fr' ? 'Coiffeur' : 'الحلاق', value: lang === 'fr' ? selected.employee.full_name_fr : selected.employee.full_name_ar },
              { icon: '📅', label: lang === 'fr' ? 'Date' : 'التاريخ', value: selected.date },
              { icon: '⏰', label: lang === 'fr' ? 'Heure' : 'الوقت', value: selected.time.start },
            ].map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400">{r.icon} {r.label}</span>
                <span className="font-bold text-gray-900">{r.value}</span>
              </div>
            ))}
            <div className="border-t border-purple-100 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-500">💰 {lang === 'fr' ? 'Total' : 'المجموع'}</span>
              <span className="font-black text-2xl" style={{ color: '#667eea' }}>{selected.service.price} <span className="text-sm">DZD</span></span>
            </div>
          </div>
          <button onClick={() => { setBookingDone(false); setStep(1); setSelected({ service: null, employee: null, date: '', time: null, customerName: '', customerPhone: '' }) }}
            className="w-full py-4 rounded-2xl font-black text-white text-base"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            {lang === 'fr' ? '+ Nouvelle réservation' : '+ حجز جديد'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : ''}`} style={{ background: '#0f0e17' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) }
          50% { transform: translateY(-8px) }
        }
        @keyframes fadeSlide {
          from { opacity:0; transform:translateX(20px) }
          to { opacity:1; transform:translateX(0) }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1 }
          100% { transform: scale(1.5); opacity: 0 }
        }
        .fadeSlide { animation: fadeSlide 0.35s ease forwards }
        .float { animation: float 3s ease-in-out infinite }
        .card-hover { transition: all 0.25s cubic-bezier(.4,0,.2,1) }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(102,126,234,0.25) }
        .slot-hover { transition: all 0.2s ease }
        .slot-hover:hover { transform: scale(1.05) }
        .shimmer-btn {
          background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
        }
        .glow { box-shadow: 0 0 20px rgba(102,126,234,0.4) }
      `}</style>

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #667eea, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #764ba2, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative p-5 pt-6">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="float w-11 h-11 rounded-2xl flex items-center justify-center text-2xl glow"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                💈
              </div>
              <div>
                <h1 className="text-white font-black text-lg leading-tight">BarberPro</h1>
                <p className="text-xs" style={{ color: '#667eea' }}>✦ Salon Mohamed — Oran</p>
              </div>
            </div>
            <button onClick={toggleLanguage}
              className="border text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm transition"
              style={{ borderColor: 'rgba(102,126,234,0.5)', background: 'rgba(102,126,234,0.1)', color: '#a78bfa' }}>
              {lang === 'fr' ? 'عربي' : 'FR'}
            </button>
          </div>

          {/* Hero text */}
          <div className="mb-5">
            <h2 className="text-3xl font-black text-white leading-tight mb-1">
              {lang === 'fr' ? 'Réservez en' : 'احجز في'}
              <span className="block" style={{
                background: 'linear-gradient(90deg, #667eea, #a78bfa, #667eea)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite'
              }}>
                {lang === 'fr' ? '30 secondes ⚡' : '30 ثانية ⚡'}
              </span>
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {lang === 'fr' ? 'Sans appel · Sans attente · 100% en ligne' : 'بدون اتصال · بدون انتظار · أونلاين'}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {['💈', '👤', '📅', '📝', '✅'].map((icon, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center w-10">
                  {step === i + 1 && (
                    <div className="absolute w-10 h-10 rounded-full"
                      style={{ background: 'rgba(102,126,234,0.3)', animation: 'pulse-ring 1.5s ease-out infinite' }} />
                  )}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${step > i + 1 ? 'scale-95' : step === i + 1 ? 'scale-110' : 'scale-90'}`}
                    style={{
                      background: step > i + 1 ? 'linear-gradient(135deg, #667eea, #764ba2)' : step === i + 1 ? 'white' : 'rgba(255,255,255,0.05)',
                      color: step === i + 1 ? '#667eea' : step > i + 1 ? 'white' : 'rgba(255,255,255,0.2)',
                      boxShadow: step === i + 1 ? '0 0 20px rgba(102,126,234,0.6)' : 'none'
                    }}>
                    {step > i + 1 ? '✓' : icon}
                  </div>
                </div>
                {i < 4 && (
                  <div className="flex-1 h-0.5 mx-1 transition-all duration-500 rounded-full"
                    style={{ background: step > i + 1 ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.05)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-lg mx-auto p-4 fadeSlide" key={step}>

        {error && (
          <div className="mt-3 rounded-2xl p-3 text-center text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1 — Service */}
        {step === 1 && (
          <div className="mt-4 space-y-3">
            <SectionTitle lang={lang} fr="Choisissez votre service" ar="اختر خدمتك" />
            {loading ? <Spinner /> : services.map((s, idx) => (
              <button key={s.id} onClick={() => { setSelected(p => ({ ...p, service: s })); loadEmployees(); setStep(2) }}
                className="card-hover w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', border: '1px solid rgba(102,126,234,0.3)' }}>
                  {serviceIcons[idx % serviceIcons.length]}
                </div>
                <div className="flex-1">
                  <p className="font-black text-white text-base">{lang === 'fr' ? s.name_fr : s.name_ar}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    ⏱ {s.duration_minutes} {lang === 'fr' ? 'min' : 'دقيقة'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl" style={{ color: '#a78bfa' }}>{s.price}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>DZD</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — Barber */}
        {step === 2 && (
          <div className="mt-4">
            <SectionTitle lang={lang} fr="Choisissez votre coiffeur" ar="اختر حلاقك" />
            {loading ? <Spinner /> : (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {employees.map(e => (
                  <button key={e.id} onClick={() => { setSelected(p => ({ ...p, employee: e, time: null })); setStep(3) }}
                    className="card-hover rounded-2xl p-5 text-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
                      style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', border: '2px solid rgba(102,126,234,0.3)' }}>
                      💈
                    </div>
                    <p className="font-black text-white text-sm">{lang === 'fr' ? e.full_name_fr : e.full_name_ar}</p>
                    <p className="text-xs mt-1" style={{ color: '#667eea' }}>
                      {e.role === 'manager' ? (lang === 'fr' ? 'Manager' : 'مدير') : (lang === 'fr' ? 'Coiffeur' : 'حلاق')}
                    </p>
                  </button>
                ))}
              </div>
            )}
            <Back onClick={() => setStep(1)} lang={lang} />
          </div>
        )}

        {/* STEP 3 — Date & Time */}
        {step === 3 && (
          <div className="mt-4">
            <SectionTitle lang={lang} fr="Choisissez la date" ar="اختر التاريخ" />
            <div className="mt-3 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input type="date" min={today} value={selected.date}
                onChange={e => setSelected(p => ({ ...p, date: e.target.value, time: null }))}
                className="w-full text-center text-xl font-black focus:outline-none cursor-pointer"
                style={{ background: 'transparent', color: 'white', colorScheme: 'dark' }} />
            </div>

            {selected.date && (
              <>
                <SectionTitle lang={lang} fr="Créneaux disponibles" ar="الأوقات المتاحة" className="mt-4" />
                {loading ? <Spinner /> : availableSlots.length === 0 ? (
                  <div className="mt-3 rounded-2xl p-6 text-center"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <p className="text-3xl mb-2">😔</p>
                    <p className="font-bold text-sm" style={{ color: '#fbbf24' }}>
                      {lang === 'fr' ? 'Complet ce jour — choisissez une autre date' : 'هذا اليوم ممتلئ، اختر يوماً آخر'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {availableSlots.map(slot => (
                      <button key={slot.start} onClick={() => { setSelected(p => ({ ...p, time: slot })); setStep(4) }}
                        className="slot-hover py-3 rounded-xl text-sm font-black"
                        style={{ background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)', color: '#a78bfa' }}>
                        {slot.start}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <Back onClick={() => setStep(2)} lang={lang} />
          </div>
        )}

        {/* STEP 4 — Info */}
        {step === 4 && (
          <div className="mt-4">
            <SectionTitle lang={lang} fr="Vos informations" ar="معلوماتك" />
            <div className="mt-3 space-y-3">
              {[
                { key: 'customerName', label: lang === 'fr' ? 'Nom complet' : 'الاسم الكامل', placeholder: lang === 'fr' ? 'Mohamed Benali' : 'محمد بن علي', type: 'text' },
                { key: 'customerPhone', label: lang === 'fr' ? 'Téléphone' : 'الهاتف', placeholder: '0550 123 456', type: 'tel' },
              ].map(field => (
                <div key={field.key} className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="text-xs font-bold mb-2 block" style={{ color: '#667eea' }}>{field.label}</label>
                  <input type={field.type} value={selected[field.key]}
                    onChange={e => setSelected(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full font-bold text-lg focus:outline-none"
                    style={{ background: 'transparent', color: 'white' }} />
                </div>
              ))}
            </div>
            <button onClick={() => {
              if (!selected.customerName || !selected.customerPhone) {
                setError(lang === 'fr' ? 'Veuillez remplir tous les champs.' : 'يرجى ملء جميع الحقول.')
                return
              }
              setError(''); setStep(5)
            }} className="shimmer-btn w-full py-4 rounded-2xl font-black text-white text-base mt-4 glow">
              {lang === 'fr' ? 'Continuer →' : 'متابعة →'}
            </button>
            <Back onClick={() => setStep(3)} lang={lang} />
          </div>
        )}

        {/* STEP 5 — Confirm */}
        {step === 5 && (
          <div className="mt-4">
            <SectionTitle lang={lang} fr="Récapitulatif final" ar="ملخص الحجز" />
            <div className="mt-3 rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(102,126,234,0.3)' }}>
              <div className="p-4 space-y-3"
                style={{ background: 'rgba(102,126,234,0.05)' }}>
                {[
                  { icon: '💈', label: lang === 'fr' ? 'Service' : 'الخدمة', value: lang === 'fr' ? selected.service.name_fr : selected.service.name_ar },
                  { icon: '👤', label: lang === 'fr' ? 'Coiffeur' : 'الحلاق', value: lang === 'fr' ? selected.employee.full_name_fr : selected.employee.full_name_ar },
                  { icon: '📅', label: lang === 'fr' ? 'Date' : 'التاريخ', value: selected.date },
                  { icon: '⏰', label: lang === 'fr' ? 'Heure' : 'الوقت', value: selected.time.start },
                  { icon: '📱', label: lang === 'fr' ? 'Téléphone' : 'الهاتف', value: selected.customerPhone },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.icon} {r.label}</span>
                    <span className="font-bold text-white text-sm">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 flex justify-between items-center"
                style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))', borderTop: '1px solid rgba(102,126,234,0.2)' }}>
                <span className="font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {lang === 'fr' ? 'Total à payer' : 'المجموع'}
                </span>
                <span className="font-black text-3xl" style={{ color: '#a78bfa' }}>
                  {selected.service.price} <span className="text-sm">DZD</span>
                </span>
              </div>
            </div>

            <button onClick={confirmBooking} disabled={loading}
              className="shimmer-btn w-full py-4 rounded-2xl font-black text-white text-base mt-4 glow disabled:opacity-50">
              {loading ? '⏳ ...' : (lang === 'fr' ? '✅ Confirmer la réservation' : '✅ تأكيد الحجز')}
            </button>
            <Back onClick={() => setStep(4)} lang={lang} />
          </div>
        )}

        <div className="h-24" />
      </div>
    </div>
  )
}

const serviceIcons = ['✂️', '🪒', '💈', '✨', '💇', '🧴']

const SectionTitle = ({ lang, fr, ar }) => (
  <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#667eea' }}>
    ✦ {lang === 'fr' ? fr : ar}
  </p>
)

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
      style={{ borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }} />
  </div>
)

const Back = ({ onClick, lang }) => (
  <button onClick={onClick}
    className="w-full mt-3 py-3 rounded-2xl font-bold text-sm transition"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
    {lang === 'fr' ? '← Retour' : 'رجوع →'}
  </button>
)