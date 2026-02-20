import { useState, useEffect } from 'react'

const fr = {
  app_name: "BarberPro", choose_service: "Choisir un service",
  choose_barber: "Choisir un coiffeur", confirm: "Confirmer",
  name: "Nom complet", phone: "Numéro de téléphone"
}
const ar = {
  app_name: "باربر برو", choose_service: "اختر الخدمة",
  choose_barber: "اختر الحلاق", confirm: "تأكيد",
  name: "الاسم الكامل", phone: "رقم الهاتف"
}

export function useLanguage() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr')
  const isRTL = lang === 'ar'

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [lang])

  const t = (key) => (lang === 'ar' ? ar : fr)[key] || key
  const toggleLanguage = () => setLang(prev => prev === 'fr' ? 'ar' : 'fr')

  return { lang, t, isRTL, toggleLanguage }
}