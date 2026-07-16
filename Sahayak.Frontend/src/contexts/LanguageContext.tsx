import React, { createContext, useContext, useState } from 'react'

type Lang = 'en' | 'kn'

const translations: Record<string, { en: string; kn: string }> = {
  'brand.mark': { en: 'sa', kn: 'ಸ' },
  'brand.name': { en: 'Sahayak', kn: 'ಸಹಾಯಕ' },
  'brand.sub': { en: 'your everyday helper', kn: 'ನಿಮ್ಮ ದೈನಂದಿನ ಸಹಾಯಕ' },
  'nav.home': { en: 'Home', kn: 'ಮುಖಪುಟ' },
  'nav.services': { en: 'Services', kn: 'ಸೇವೆಗಳು' },
  'nav.register': { en: 'Register', kn: 'ರಿಜಿಸ್ಟರ್' },
  'nav.admin': { en: 'Admin', kn: 'ಅಡ್ಮಿನ್' },
  'nav.about': { en: 'About Us', kn: 'ನಮ್ಮ ಬಗ್ಗೆ' },
  'nav.menu': { en: 'menu', kn: 'ಮೆನು' },
  'footer.text': { en: 'Sahayak · doorstep help, arranged simply.', kn: 'ಸಹಾಯಕ · ದ್ವಾರಸೇವೆ, ಸರಳವಾಗಿ ವ್ಯವಸ್ಥಿತವಾಗಿದೆ.' },
  'home.tagline': { en: 'Tell Sahayak what you need. A verified helper takes it from there — while you get your time back.', kn: 'ನೀವು 무엇 ಬೇಕೆಂದು ಸಹಾಯಕರಿಗೆ ಹೇಳಿ. ಒಪ್ಪಿಗೆಯಾದ ಸಹಾಯಕ ಸೇಬಹುದು — ನೀವು ನಿಮ್ಮ ಸಮಯವನ್ನು ಹಿಂತಿರುಗಿಸಲು.' },
  'home.topline': { en: '', kn: '' },
  'home.callout': { en: 'Your time. Handled.', kn: 'ನಿಮ್ಮ ಸಮಯ. ನಿರ್ವಹಿಸಲಾಗಿದೆ.' },
  'home.servicesLabel': { en: '329 services · 20 categories', kn: '329 ಸೇವೆಗಳು · 20 ವರ್ಗಗಳು' },
  'home.btnRegister': { en: 'Register a request', kn: 'ಕೋರಿಕೆಯನ್ನು ನೋಂದಾಯಿಸಿ' },
  'home.btnBrowse': { en: 'Browse services', kn: 'ಸೇವೆಗಳನ್ನು ಬ್ರೌಜ್ ಮಾಡಿ' },
  'home.stats.requests': { en: 'requests handled', kn: 'ಕೋರಿಕೆಗಳು ನಿರ್ವಹಿಸಲಾಗಿದೆ' },
  'home.stats.helpers': { en: 'verified helpers', kn: 'ನಿರೀಕ್ಷಿತ ಸಹಾಯಕರು' },
  'home.stats.neighborhoods': { en: 'neighborhoods covered', kn: 'ಪ್ರాంతಗಳು ಒಳಗೊಂಡಿವೆ' },
  'home.categories': { en: "From queueing at the RTO to move-in planning and document support.", kn: 'RTO ನಲ್ಲಿ ಸಾಲಿನಲ್ಲಿ ನಿಂತು ಚಲಾಯಿಸಲು ಯೋಜನೆ ಮತ್ತು ಡಾಕ್ಯುಮೆಂಟ್ ಬೆಂಬಲಕ್ಕೆ.' },
  'home.hero': { en: 'Someone to handle', kn: 'ಒಬ್ಬರು ನಿರ್ವಹಿಸಲು' },
  'home.phrase1': { en: 'the RTO queue.', kn: 'RTO ಸಾಲು.' },
  'home.phrase2': { en: 'a medicine pickup.', kn: 'ಔಷಧಿ ಶೇಖರಣೆಯು.' },
  'home.phrase3': { en: 'the evening walk.', kn: 'ಸಂಜೆಯ ನಡಿಗೆ.' },
  'home.phrase4': { en: 'a deep clean.', kn: 'ಗಂಭೀರವಾಗಿ ಸ್ವಚ್ಛಗೊಳಿಸುವುದು.' },
  'home.phrase5': { en: 'moving day chaos.', kn: 'ಸಂಚಲನದ ದಿನದ ಗಲಾಟೆ.' },
  'home.coveredHeading': { en: "A taste of what's covered", kn: 'ಏನೆಲ್ಲಾ ಒಳಗೊಂಡಿದೆ ಎಂಬುದರ ಸ್ವಲ್ಪ ರುಚಿ' },
  'home.categoryHeading': { en: 'Twenty categories, three hundred twenty-nine everyday tasks', kn: 'ಯಾವುದೇನೆ ದಿನನಿತ್ಯದ ಕಾರ್ಯಗಳಿಗೆ ೨೦ ವರ್ಗಗಳು, ೩೨೯ ಕಾರ್ಯಗಳು' },
  'home.liveRequests': { en: 'Live requests', kn: 'ಸಕ್ರಿಯ ವಿನಂತಿಗಳು' },
  'home.seeAll': { en: 'See all categories & tasks →', kn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು ಮತ್ತು ಕಾರ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ →' },
  'services.heading': { en: 'Browse Services', kn: 'ಸೇವೆಗಳ ಪರಿಶೀಲನೆ' },
  'services.hero': { en: 'Find trusted and verified helpers for every task you need.', kn: 'ನಿಮ್ಮ ಅಗತ್ಯದ ಪ್ರತಿ ಕಾರ್ಯಕ್ಕೂ ವಿಶ್ವಾಸಾರ್ಹ ಮತ್ತು ದೃಢೀಕೃತ ಸಹಾಯಕರನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.' },
  'services.subheading': { en: 'Search for a service, choose a category, and book trusted help in Bengaluru.', kn: 'ಸೇವೆಯನ್ನು ಹುಡುಕಿ, ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಬೆಂಗಳೂರುದಲ್ಲಿ ವಿಶ್ವಾಸಾರ್ಹ ಸಹಾಯವನ್ನು ಬುಕ್ ಮಾಡಿ.' },
  'services.stats.services': { en: 'Services', kn: 'ಸೇವೆಗಳು' },
  'services.stats.categories': { en: 'Categories', kn: 'ವರ್ಗಗಳು' },
  'services.searchPlaceholder': { en: 'Search for services (e.g. Plumbing, AC repair...)', kn: 'ಸೇವೆಗಳಿಗಾಗಿ ಹುಡುಕಿ (ಉದಾ. ಪ್ಲಂಬಿಂಗ್, ಎಸಿ ದುರಸ್ತಿ...)' },
  'services.categories': { en: 'Categories', kn: 'ವರ್ಗಗಳು' },
  'services.allServices': { en: 'All Services', kn: 'ಎಲ್ಲಾ ಸೇವೆಗಳು' },
  'services.helpHeading': { en: 'Can’t find what you need?', kn: 'ನೀವು ಬೇಕಾದುದನ್ನು ಕಾಣಲಿಲ್ಲ?' },
  'services.helpBody': { en: 'Send a custom request and we’ll match a helper for you.', kn: 'ಕಸ್ಟಮ್ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಿ, ನಾವು ನಿಮಗಾಗಿ ಸಹಾಯಕವನ್ನು ಹೊಂದಿಸುತ್ತೇವೆ.' },
  'services.popular': { en: 'Popular Services', kn: 'ಜನಪ್ರಿಯ ಸೇವೆಗಳು' },
  'services.topCategories': { en: 'Top categories picked by customers', kn: 'ಗ್ರಾಹಕರು ಆಯ್ಕೆಮಾಡಿದ ಪ್ರಮುಖ ವರ್ಗಗಳು' },
  'services.trustedHelper': { en: 'Trusted helper at your doorstep', kn: 'ನಿಮ್ಮ ಬಾಗಿಲಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಸಹાયક' },
  'services.unit.services': { en: 'services', kn: 'ಸೇವೆಗಳು' },
  'services.selectedService': { en: 'Selected service:', kn: 'ಆಯ್ಕೆಮಾಡಿದ ಸೇವೆ:' },
  'services.selectedServiceHelp': { en: 'Click register to continue with this task.', kn: 'ಈ ಕಾರ್ಯದೊಂದಿಗೆ ಮುಂದುವರಿಯಲು ನೋಂದಾಯಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ.' },
  'services.btnRegister': { en: 'Register a request', kn: 'ವಿನಂತಿಯನ್ನು ನೋಂದಾಯಿಸಿ' },
  'about.heading': { en: 'We started this startup to help people with minimal cost and time.', kn: 'ನಮ್ಮ ಸ್ಟಾರ್ಟ್‌ಅಪ್ ಅನ್ನು ಕಡಿಮೆ ವೆಚ್ಚ ಮತ್ತು ಸಮಯದಲ್ಲಿ ಜನರಿಗೆ ಸಹಾಯ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿದೆವು.' },
  'about.body1': { en: 'If you are busy with your job or business, we will help you by providing services quickly and affordably.', kn: 'ನೀವು ನಿಮ್ಮ ಕೆಲಸ ಅಥವಾ ವ್ಯವಹಾರದಲ್ಲಿ ಬ್ಯುಸಿ ಇದ್ದರೆ, ನಾವು ಸೇವೆಗಳನ್ನು ವೇಗವಾಗಿ ಮತ್ತು ಕೈಗೆಟಿಕೊಳ್ಳುವ ರೀತಿಯಲ್ಲಿ ಒದಗಿಸುವ ಮೂಲಕ ನಿಮಗೆ ಸಹಾಯಿಸುತ್ತೇವೆ.' },
  'about.body2': { en: 'Whether it\'s errands, home support, or everyday assistance, our goal is to save you time and reduce your stress.', kn: 'ಇದು ರನ್ನಿಂಗ್, ಮನೆಯ ಬೆಂಬಲ ಅಥವಾ ದಿನನಿತ್ಯದ ಸಹಾಯವಾಗಿದ್ದರೂ, ನಮ್ಮ ಉದ್ದೇಶ ನಿಮ್ಮ ಸಮಯವನ್ನು ಉಳಿಸಲು ಮತ್ತು ನಿಮ್ಮ ಒತ್ತಡವನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು.' },
  'about.contact': { en: 'Contact no:', kn: 'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ:' },
  'about.email': { en: 'Email:', kn: 'ಇಮೇಲ್:' },
  'confirm.heading': { en: 'Request received', kn: 'ಕೋರಿಕೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ' },
  'confirm.body': { en: 'We’ve captured your details. A helper will review this request and reach out to confirm the schedule.', kn: 'ನಾವು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ತೆಗೆದುಕೊಂಡಿದ್ದೇವೆ. ಸಹಾಯಕನು ಈ ವಿನಂತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಖಚಿತಪಡಿಸಲು ಸಂಪರ್ಕಿಸಲಿಂದು.' },
  'confirm.fee': { en: 'Only a service fee was charged — no hidden fees, no extra markups.', kn: 'ಮಾತ್ರ ಸೇವಾ ಶುಲ್ಕವೇ ವಿಧಿಸಲಾಗಿದೆ — ಏನೂ ಮರುಗಲಿಸುವ ಶುಲ್ಕವಿಲ್ಲ, ಹೆಚ್ಚುವರಿ ಮಾರ್ಕಪ್ ಇಲ್ಲ.' },
  'home.fee': { en: 'Only a service fee will be charged after task completion — no hidden fees, no extra markups.', kn: 'ಕಾರ್ಯದ ಸಂದರ್ಭದಲ್ಲಿ ಮಾತ್ರ ಸೇವಾ ಶುಲ್ಕ ವಿಧಿಸಲಾಗುತ್ತದೆ — ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳು ಅಥವಾ ಹೆಚ್ಚುವರಿ ಮಾರ್ಕಪ್ ಇಲ್ಲ.' },
  'confirm.reference': { en: 'Reference', kn: 'ಉಲ್ಲೇಖ' },
  'confirm.round1': { en: 'Under review', kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' },
  'confirm.round2': { en: 'Helper assigned', kn: 'ಸಹಾಯಕ ನಿಯೋಜಿಸಲಾಗಿದೆ' },
  'confirm.round3': { en: 'Confirmation call', kn: 'ಖಚಿತಪಡಿಸುವ ಕರೆ' },
  'confirm.btnRegister': { en: 'Register another request', kn: 'ಬೇರೊಂದು ವಿನಂತಿಯನ್ನು ನೋಂದಾಯಿಸಿ' },
  'confirm.btnHome': { en: 'Back to home', kn: 'ಮರುಳು ಮನೆ' }
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  const t = (key: string) => {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang] ?? entry.en
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
