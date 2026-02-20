import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'

const SHOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const emptyForm = { full_name_fr: '', full_name_ar: '', phone: '', role: 'barber' }

export default function EmployeesPage() {
  const { lang, isRTL, toggleLanguage } = useLanguage()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadEmployees() }, [])

  async function loadEmployees() {
    setLoading(true)
    const { data } = await supabase.from('employees').select('*').eq('shop_id', SHOP_ID).order('created_at')
    setEmployees(data || [])
    setLoading(false)
  }

  async function saveEmployee() {
    if (!form.full_name_fr || !form.full_name_ar) {
      setError(lang === 'fr' ? 'Remplissez les deux noms.' : 'املأ الاسمين.')
      return
    }
    setSaving(true)
    setError('')
    if (editingId) {
      await supabase.from('employees').update({ ...form }).eq('id', editingId)
    } else {
      await supabase.from('employees').insert({ ...form, shop_id: SHOP_ID })
    }
    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    loadEmployees()
  }

  async function toggleActive(emp) {
    await supabase.from('employees').update({ is_active: !emp.is_active }).eq('id', emp.id)
    loadEmployees()
  }

  function startEdit(emp) {
    setForm({ full_name_fr: emp.full_name_fr, full_name_ar: emp.full_name_ar, phone: emp.phone || '', role: emp.role })
    setEditingId(emp.id)
    setShowForm(true)
    setError('')
  }

  return (
    <div className={`min-h-screen pb-24 ${isRTL ? 'rtl' : ''}`} style={{ background: '#0f0e17' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
        .fadeUp { animation: fadeUp 0.4s ease forwards }
        .shimmer-btn { background: linear-gradient(90deg,#667eea,#764ba2,#667eea); background-size:200% auto; animation: shimmer 2s linear infinite }
        .shimmer-text { background: linear-gradient(90deg,#667eea,#a78bfa,#667eea); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation: shimmer 3s linear infinite }
        .card-hover { transition: all 0.2s ease }
        .card-hover:hover { transform: translateY(-2px) }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #667eea, transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="p-5 pt-6 relative">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-white">{lang === 'fr' ? 'Équipe' : 'الفريق'}</h1>
              <p className="text-xs mt-0.5 shimmer-text font-bold">✦ BarberPro — {employees.length} {lang === 'fr' ? 'employés' : 'موظفين'}</p>
            </div>
            <button onClick={toggleLanguage} className="border px-4 py-2 rounded-full text-sm font-bold"
              style={{ borderColor: 'rgba(102,126,234,0.5)', background: 'rgba(102,126,234,0.1)', color: '#a78bfa' }}>
              {lang === 'fr' ? 'عربي' : 'FR'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {!showForm && (
          <button onClick={() => { setShowForm(true); setError('') }}
            className="shimmer-btn w-full py-4 rounded-2xl font-black text-white text-base mt-4 mb-4"
            style={{ boxShadow: '0 4px 20px rgba(102,126,234,0.3)' }}>
            + {lang === 'fr' ? 'Ajouter un employé' : 'إضافة موظف'}
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="fadeUp mt-4 mb-4 rounded-3xl p-5"
            style={{ background: 'rgba(102,126,234,0.08)', border: '1px solid rgba(102,126,234,0.25)' }}>
            <h3 className="font-black text-white text-lg mb-4">
              {editingId ? (lang === 'fr' ? '✏️ Modifier' : '✏️ تعديل') : (lang === 'fr' ? '➕ Nouvel employé' : '➕ موظف جديد')}
            </h3>
            {error && (
              <div className="rounded-2xl p-3 mb-3 text-sm font-semibold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                ⚠️ {error}
              </div>
            )}
            <div className="space-y-3">
              {[
                { key: 'full_name_fr', label: lang === 'fr' ? 'Nom en français' : 'الاسم بالفرنسية', placeholder: 'Mohamed Benali' },
                { key: 'full_name_ar', label: lang === 'fr' ? 'Nom en arabe' : 'الاسم بالعربية', placeholder: 'محمد بن علي' },
                { key: 'phone', label: lang === 'fr' ? 'Téléphone' : 'الهاتف', placeholder: '0550 123 456' },
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
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label className="text-xs font-black block mb-2" style={{ color: '#667eea' }}>{lang === 'fr' ? 'Rôle' : 'الدور'}</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full font-bold text-base focus:outline-none"
                  style={{ background: 'transparent', color: 'white' }}>
                  <option value="barber" style={{ background: '#1a1a2e' }}>{lang === 'fr' ? 'Coiffeur' : 'حلاق'}</option>
                  <option value="manager" style={{ background: '#1a1a2e' }}>{lang === 'fr' ? 'Manager' : 'مدير'}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveEmployee} disabled={saving}
                className="shimmer-btn flex-1 py-3 rounded-2xl font-black text-white disabled:opacity-50">
                {saving ? '...' : (lang === 'fr' ? '✅ Sauvegarder' : '✅ حفظ')}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); setError('') }}
                className="flex-1 py-3 rounded-2xl font-black transition"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }} />
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((emp, i) => (
              <div key={emp.id} className="card-hover fadeUp rounded-2xl overflow-hidden"
                style={{ animationDelay: `${i * 0.05}s`, background: 'rgba(255,255,255,0.04)', border: `1px solid ${emp.is_active ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.05)'}`, opacity: emp.is_active ? 1 : 0.5 }}>
                <div className="h-0.5" style={{ background: emp.is_active ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)' }} />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', border: '1px solid rgba(102,126,234,0.3)' }}>
                      💈
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white">{lang === 'fr' ? emp.full_name_fr : emp.full_name_ar}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{lang === 'fr' ? emp.full_name_ar : emp.full_name_fr}</p>
                      {emp.phone && <p className="text-xs mt-0.5" style={{ color: '#667eea' }}>📱 {emp.phone}</p>}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-xs font-black px-2 py-1 rounded-full"
                        style={{ background: emp.role === 'manager' ? 'rgba(167,139,250,0.15)' : 'rgba(102,126,234,0.15)', color: emp.role === 'manager' ? '#a78bfa' : '#818cf8' }}>
                        {emp.role === 'manager' ? (lang === 'fr' ? 'Manager' : 'مدير') : (lang === 'fr' ? 'Coiffeur' : 'حلاق')}
                      </span>
                      <span className="text-xs font-black px-2 py-1 rounded-full"
                        style={{ background: emp.is_active ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.1)', color: emp.is_active ? '#34d399' : '#f87171' }}>
                        {emp.is_active ? (lang === 'fr' ? 'Actif' : 'نشط') : (lang === 'fr' ? 'Inactif' : 'غير نشط')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(emp)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black transition"
                      style={{ background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.2)', color: '#818cf8' }}>
                      ✏️ {lang === 'fr' ? 'Modifier' : 'تعديل'}
                    </button>
                    <button onClick={() => toggleActive(emp)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black transition"
                      style={emp.is_active
                        ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }
                        : { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399' }}>
                      {emp.is_active ? (lang === 'fr' ? '⛔ Désactiver' : '⛔ تعطيل') : (lang === 'fr' ? '✅ Activer' : '✅ تفعيل')}
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