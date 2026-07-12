import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import RegisterPage from './pages/RegisterPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminPage from './pages/AdminPage'
import Footer from './components/Footer'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentPage])

  const navigateTo = (page: string, payload?: { service?: string; category?: string }) => {
    if (page === 'register') {
      setSelectedService(payload?.service ?? null)
      setSelectedServiceCategory(payload?.category ?? null)
    }
    if (page === 'services') {
      setSelectedService(null)
      setSelectedServiceCategory(null)
    }
    setCurrentPage(page)
  }

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main>
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'services' && <ServicesPage onNavigate={navigateTo} />}
        {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} onConfirm={setConfirmationData} initialService={selectedService} initialCategory={selectedServiceCategory} />}
        {currentPage === 'confirm' && <ConfirmationPage data={confirmationData} onNavigate={setCurrentPage} />}
        {currentPage === 'admin' && <AdminPage onNavigate={setCurrentPage} />}
      </main>

      <Footer />
    </div>
  )
}

export default App
