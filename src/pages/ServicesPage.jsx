import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'

const SHOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const emptyForm = { name_fr: '', name_ar: '', duration_minutes: 30, price: 0 }
const durations = [15, 20, 30, 45, 60, 90]
const serviceIcons = ['✂️', '🪒', '💈', '✨', '💇', '🧴']

export default function ServicesPage() {
  const { lang, isRTL, toggleLanguage } = useLanguage()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null) // holds service to delete

  useEffect(() => { loadServices() }, [])

  async function loadServices() {
    setLoading(true)
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('shop_id', SHOP_ID)
      .order('created_at')
    if (!error) setServices(data || [])
    setLoading(false)
  }

  async function saveService() {
    if (!form.name_fr || !form.name_ar) {
      setError(lang === 'fr' ? 'Remplissez les deux noms.' : 'املأ الاسمين.')
      return
    }
    setSaving(true)
    setError('')
    if (editingId) {
      await supabase.from('services').update({ ...form }).eq('id', editingId)
    } else {
      await supabase.from('services').insert({ ...form, shop_id: SHOP_ID })
    }
    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    loadServices()
  }

  async function toggleActive(svc) {
    await supabase.from('services').update({ is_active: !svc.is_active }).eq('id', svc.id)
    loadServices()
  }

  async function deleteService(svc) {
    await supabase.from('services').delete().eq('id', svc.id)
    setDeleteConfirm(null)
    loadServices()
  }

  function startEdit(svc) {
    setForm({ name_fr: svc.name_fr, name_ar: svc.name_ar, duration_minutes: svc.duration_minutes, price: svc.price })
    setEditingId(svc.id)
    setShowForm(true)
    setError('')
  }

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? 'rtl' : ''}`} style={{ background: '#0f0e17' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.4s ease forwards }
        .shimmer-btn { background: linear-gradient(90deg,#667eea,#764ba2,#667eea); background-size:200% auto; animation: shimmer 2s linear infinite }
        .shimmer-text { background: linear-gradient(90deg,#667eea,#a78bfa,#667eea); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation: shimmer 3s linear infinite }
        .card-hover { transition: all 0.2s ease }
        .card-hover:hover { transform: translateY(-2px) }
        .modal-enter { animation: slideUp 0.3s ease forwards }
      `}</style>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
          <div className="modal-enter w-full max-w-sm rounded-3xl p-6"
            style={{ background: '#1a1a2e', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🗑️</div>
              <h3 className="text-xl font-black text-white mb-2">
                {lang === 'fr' ? 'Supprimer ce service ?' : 'حذف هذه الخدمة ؟'}
              </h3>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'fr' ? deleteConfirm.name_fr : deleteConfirm.name_ar}
              </p>
              <p className="text-xs mt-2" style={{ color: '#f87171' }}>
                {lang === 'fr'
                  ? '⚠️ Cette action est irréversible.'
                  : '⚠️ هذا الإجراء لا يمكن التراجع عنه.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => deleteService(deleteConfirm)}
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                {lang === 'fr' ? '🗑️ Supprimer' : '🗑️ حذف'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl font-black text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                {lang === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #667eea, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="p-5 pt-6 relative flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white">
              {lang === 'fr' ? 'Services' : 'الخدمات'}
            </h1>
            <p className="text-xs mt-0.5 shimmer-text font-bold">
              ✦ BarberPro — {services.length} {lang === 'fr' ? 'services' : 'خدمات'}
            </p>
          </div>
          <button onClick={toggleLanguage} className="border px-4 py-2 rounded-full text-sm font-bold"
            style={{ borderColor: 'rgba(102,126,234,0.5)', background: 'rgba(102,126,234,0.1)', color: '#a78bfa' }}>
            {lang === 'fr' ? 'عربي' : 'FR'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">

        {/* Add button */}
        {!showForm && (
          <button onClick={() => { setShowForm(true); setError(''); setEditingId(null); setForm(emptyForm) }}
            className="shimmer-btn w-full py-4 rounded-2xl font-black text-white mt-4 mb-4"
            style={{ boxShadow: '0 4px 20px rgba(102,126,234,0.3)' }}>
            + {lang === 'fr' ? 'Ajouter un service' : 'إضافة خدمة'}
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="fadeUp mt-4 mb-4 rounded-3xl p-5"
            style={{ background: 'rgba(102,126,234,0.08)', border: '1px solid rgba(102,126,234,0.25)' }}>
            <h3 className="font-black text-white text-lg mb-4">
              {editingId
                ? (lang === 'fr' ? '✏️ Modifier le service' : '✏️ تعديل الخدمة')
                : (lang === 'fr' ? '➕ Nouveau service' : '➕ خدمة جديدة')}
            </h3>

            {error && (
              <div className="rounded-2xl p-3 mb-3 text-sm font-semibold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-3">
              {[
                { key: 'name_fr', label: lang === 'fr' ? 'Nom en français' : 'الاسم بالفرنسية', placeholder: 'Coupe homme' },
                { key: 'name_ar', label: lang === 'fr' ? 'Nom en arabe' : 'الاسم بالعربية', placeholder: 'قصة رجالي' },
              ].map(f => (
                <div key={f.key} className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="text-xs font-black block mb-2" style={{ color: '#667eea' }}>{f.label}</label>
                  <input type="text" value={form[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full font-bold text-base focus:outline-none"
                    style={{ background: 'transparent', color: 'white' }} />
                </div>
              ))}

              {/* Duration */}
              <div>
                <label className="text-xs font-black block mb-2" style={{ color: '#667eea' }}>
                  ⏱ {lang === 'fr' ? 'Durée' : 'المدة'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map(d => (
                    <button key={d} onClick={() => setForm(p => ({ ...p, duration_minutes: d }))}
                      className="py-2.5 rounded-xl text-sm font-black transition"
                      style={form.duration_minutes === d
                        ? { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                      {d} {lang === 'fr' ? 'min' : 'دق'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-black block mb-2" style={{ color: '#667eea' }}>
                  💰 {lang === 'fr' ? 'Prix (DZD)' : 'السعر (دج)'}
                </label>
                <div className="flex items-center rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setForm(p => ({ ...p, price: Math.max(0, p.price - 50) }))}
                    className="px-5 py-4 text-xl font-black" style={{ color: '#667eea' }}>−</button>
                  <input type="number" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                    className="flex-1 text-center font-black text-xl focus:outline-none"
                    style={{ background: 'transparent', color: 'white' }} />
                  <button onClick={() => setForm(p => ({ ...p, price: p.price + 50 }))}
                    className="px-5 py-4 text-xl font-black" style={{ color: '#667eea' }}>+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={saveService} disabled={saving}
                className="shimmer-btn flex-1 py-3 rounded-2xl font-black text-white disabled:opacity-50">
                {saving ? '...' : (lang === 'fr' ? '✅ Sauvegarder' : '✅ حفظ')}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); setError('') }}
                className="flex-1 py-3 rounded-2xl font-black"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
            </div>
          </div>
        )}

        {/* Services list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }} />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">✂️</p>
            <p className="font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'fr' ? 'Aucun service — ajoutez le premier !' : 'لا توجد خدمات — أضف أول خدمة !'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((svc, i) => (
              <div key={svc.id} className="card-hover fadeUp rounded-2xl overflow-hidden"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${svc.is_active ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  opacity: svc.is_active ? 1 : 0.6
                }}>
                {/* Color bar */}
                <div className="h-0.5"
                  style={{ background: svc.is_active ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)' }} />

                <div className="p-4">
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', border: '1px solid rgba(102,126,234,0.3)' }}>
                        {serviceIcons[i % serviceIcons.length]}
                      </div>
                      <div>
                        <p className="font-black text-white">
                          {lang === 'fr' ? svc.name_fr : svc.name_ar}
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {lang === 'fr' ? svc.name_ar : svc.name_fr}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-1 rounded-full flex-shrink-0"
                      style={{
                        background: svc.is_active ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.1)',
                        color: svc.is_active ? '#34d399' : '#f87171'
                      }}>
                      {svc.is_active
                        ? (lang === 'fr' ? 'Actif' : 'نشط')
                        : (lang === 'fr' ? 'Inactif' : 'غير نشط')}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-xl p-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        ⏱ {lang === 'fr' ? 'Durée' : 'المدة'}
                      </p>
                      <p className="font-black text-white">
                        {svc.duration_minutes} {lang === 'fr' ? 'min' : 'دق'}
                      </p>
                    </div>
                    <div className="rounded-xl p-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        💰 {lang === 'fr' ? 'Prix' : 'السعر'}
                      </p>
                      <p className="font-black" style={{ color: '#a78bfa' }}>
                        {svc.price} DZD
                      </p>
                    </div>
                  </div>

                  {/* Action buttons — 3 buttons: Edit, Toggle, Delete */}
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(svc)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black"
                      style={{ background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.2)', color: '#818cf8' }}>
                      ✏️ {lang === 'fr' ? 'Modifier' : 'تعديل'}
                    </button>
                    <button onClick={() => toggleActive(svc)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black"
                      style={svc.is_active
                        ? { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.15)', color: '#fbbf24' }
                        : { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399' }}>
                      {svc.is_active
                        ? (lang === 'fr' ? '⏸ Pause' : '⏸ إيقاف')
                        : (lang === 'fr' ? '▶ Activer' : '▶ تفعيل')}
                    </button>
                    <button onClick={() => setDeleteConfirm(svc)}
                      className="w-12 py-2.5 rounded-xl text-sm font-black flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
