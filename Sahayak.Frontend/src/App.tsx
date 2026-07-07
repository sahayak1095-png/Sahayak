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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentPage])

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main>
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'services' && <ServicesPage onNavigate={setCurrentPage} />}
        {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} onConfirm={setConfirmationData} />}
        {currentPage === 'confirm' && <ConfirmationPage data={confirmationData} onNavigate={setCurrentPage} />}
        {currentPage === 'admin' && <AdminPage onNavigate={setCurrentPage} />}
      </main>

      <Footer />
    </div>
  )
}

export default App
