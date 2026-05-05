import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import zh from './locales/zh.json'

const saved = localStorage.getItem('lang') || 'es'

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en }, fr: { translation: fr }, zh: { translation: zh } },
  lng: saved,
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
