import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'

export default function LoginPage({ onLogin }) {
  const { lang, isRTL, toggleLanguage } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(lang === 'fr' ? 'Email ou mot de passe incorrect.' : 'البريد أو كلمة المرور غير صحيحة.')
    } else {
      onLogin()
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isRTL ? 'rtl' : ''}`}
      style={{ background: '#0f0e17' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) }
          50% { transform: translateY(-8px) }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px) }
          to { opacity:1; transform:translateY(0) }
        }
        .shimmer-btn {
          background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
        }
        .float { animation: float 3s ease-in-out infinite }
        .fadeUp { animation: fadeUp 0.5s ease forwards }
        .fadeUp2 { animation: fadeUp 0.5s ease 0.1s both }
        .fadeUp3 { animation: fadeUp 0.5s ease 0.2s both }
        .glow { box-shadow: 0 0 30px rgba(102,126,234,0.4) }
        .input-focus:focus-within { border-color: rgba(102,126,234,0.6) !important; box-shadow: 0 0 0 3px rgba(102,126,234,0.1) }
      `}</style>

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(102,126,234,0.15), transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(118,75,162,0.15), transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="fadeUp text-center mb-8">
          <div className="float w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl glow"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            💈
          </div>
          <h1 className="text-3xl font-black text-white">BarberPro</h1>
          <p className="text-sm mt-1" style={{ color: '#667eea' }}>
            ✦ {lang === 'fr' ? 'Espace propriétaire' : 'منطقة المالك'}
          </p>
        </div>

        {/* Card */}
        <div className="fadeUp2 rounded-3xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

          {error && (
            <div className="rounded-2xl p-3 mb-4 text-center text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-3 mb-5">
            <div className="input-focus rounded-2xl p-4 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="text-xs font-black block mb-2" style={{ color: '#667eea' }}>
                {lang === 'fr' ? '✉️ EMAIL' : '✉️ البريد الإلكتروني'}
              </label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@barberpro.com"
                className="w-full font-bold text-base focus:outline-none"
                style={{ background: 'transparent', color: 'white' }} />
            </div>

            <div className="input-focus rounded-2xl p-4 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="text-xs font-black block mb-2" style={{ color: '#667eea' }}>
                {lang === 'fr' ? '🔑 MOT DE PASSE' : '🔑 كلمة المرور'}
              </label>
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full font-bold text-base focus:outline-none"
                style={{ background: 'transparent', color: 'white' }} />
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="shimmer-btn w-full py-4 rounded-2xl font-black text-white text-base glow disabled:opacity-50">
            {loading ? '⏳ ...' : (lang === 'fr' ? '🚀 Se connecter' : '🚀 تسجيل الدخول')}
          </button>
        </div>

        <div className="fadeUp3 text-center mt-4">
          <button onClick={toggleLanguage} className="text-sm font-bold"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            {lang === 'fr' ? '🌐 عربي' : '🌐 Français'}
          </button>
        </div>
      </div>
    </div>
  )
}