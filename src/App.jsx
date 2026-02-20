import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import BookingPage from './pages/BookingPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import EmployeesPage from './pages/EmployeesPage'
import ServicesPage from './pages/ServicesPage'

export default function App() {
  const [page, setPage] = useState('booking')
  const [session, setSession] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_e, session) => setSession(session))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setPage('booking')
  }

  if (showLogin && !session) {
    return <LoginPage onLogin={() => { setShowLogin(false); setPage('dashboard') }} />
  }

  return (
    <div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white shadow-lg rounded-full px-3 py-2 z-50">
        <button onClick={() => setPage('booking')}
          className={`px-3 py-2 rounded-full text-sm font-semibold transition ${page === 'booking' ? 'bg-black text-white' : 'text-gray-500'}`}>
          💈
        </button>

        {session ? (
          <>
            <button onClick={() => setPage('dashboard')}
              className={`px-3 py-2 rounded-full text-sm font-semibold transition ${page === 'dashboard' ? 'bg-black text-white' : 'text-gray-500'}`}>
              📊
            </button>
            <button onClick={() => setPage('employees')}
              className={`px-3 py-2 rounded-full text-sm font-semibold transition ${page === 'employees' ? 'bg-black text-white' : 'text-gray-500'}`}>
              👥
            </button>
            <button onClick={() => setPage('services')}
              className={`px-3 py-2 rounded-full text-sm font-semibold transition ${page === 'services' ? 'bg-black text-white' : 'text-gray-500'}`}>
              ✂️
            </button>
            <button onClick={handleLogout}
              className="px-3 py-2 rounded-full text-sm font-semibold text-red-500">
              🚪
            </button>
          </>
        ) : (
          <button onClick={() => setShowLogin(true)}
            className="px-3 py-2 rounded-full text-sm font-semibold text-gray-500">
            🔐
          </button>
        )}
      </div>

     {page === 'booking' && <BookingPage />}
{page === 'dashboard' && (session ? <DashboardPage /> : <LoginPage onLogin={() => setPage('dashboard')} />)}
{page === 'employees' && (session ? <EmployeesPage /> : <LoginPage onLogin={() => setPage('employees')} />)}
{page === 'services' && (session ? <ServicesPage /> : <LoginPage onLogin={() => setPage('services')} />)}
    </div>
  )
}