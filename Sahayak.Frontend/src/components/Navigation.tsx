interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <div className="nav">
      <button className="brand" onClick={() => onPageChange('home')}>
        <div className="brand-mark">ಸ</div>
        <div>
          <span className="brand-name">Sahayak</span>
          <span className="brand-sub">your everyday helper</span>
        </div>
      </button>
      <div className="nav-links">
        <button 
          className={`navlink ${currentPage === 'home' ? 'on' : ''}`}
          onClick={() => onPageChange('home')}
        >
          Home
        </button>
        <button 
          className={`navlink ${currentPage === 'services' ? 'on' : ''}`}
          onClick={() => onPageChange('services')}
        >
          Services
        </button>
        <button 
          className={`navlink ${currentPage === 'register' ? 'on' : ''}`}
          onClick={() => onPageChange('register')}
        >
          Register
        </button>
        <button 
          className="nav-admin"
          onClick={() => onPageChange('admin')}
        >
          Admin
        </button>
      </div>
      <button className="nav-cta" onClick={() => onPageChange('about')}>
        About Us
      </button>
    </div>
  )
}
