import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const Header = () => {
  const [usuario, setUsuario] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioActivo'))
    if (usuarioLogueado) {
      setUsuario(usuarioLogueado)
    }
  }, [])

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActivo')
    window.location.href = '/login'
  }

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {usuario && (
            <button 
              onClick={() => setMenuAbierto(true)}
              className="menu-hamburger-btn"
            >
              ☰
            </button>
          )}

          <div className="header-logo">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h2>CINEMA PROYECT</h2>
            </Link>
          </div>
        </div>

        <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {usuario ? (
            <>
              <div className="header-user-greeting">
                  👤 Hola,{' '}
                  <Link to="/perfil" style={{ color: 'var(--dynamic-primary, #ff5a5f)', textDecoration: 'none', fontWeight: 'bold' }}>
                    {usuario.nombre}
                  </Link>
                </div>
              
              <button 
                onClick={cerrarSesion} 
                className="nav-button" 
                style={{ color: '#ff5a5f', borderColor: '#ff5a5f' }}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-button">
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </header>

      {/* --- MENÚ LATERAL DESLIZANTE (DRAWER) --- */}
      {menuAbierto && (
        <div 
          className="sidebar-overlay animate-fade-in" 
          onClick={() => setMenuAbierto(false)}
        >
          <div className="side-menu-container" onClick={(e) => e.stopPropagation()}>
            
            <div className="side-menu-header">
              <h3>Menú de Navegación</h3>
              <button className="close-menu-btn" onClick={() => setMenuAbierto(false)}>✕</button>
            </div>

            <div className="side-menu-links">
              <Link to="/" onClick={() => setMenuAbierto(false)} className="side-link">
                🏠 Cartelera Principal
              </Link>
              <Link to="/mis-reservas" onClick={() => setMenuAbierto(false)} className="side-link">
                🎟️ Mis Entradas & Códigos QR
              </Link>
              <Link to="/ajustes" onClick={() => setMenuAbierto(false)} className="side-link">
                ⚙️ Ajustes de la App
              </Link>
            </div>

            <div className="side-menu-footer">
              {usuario && (
                <button onClick={cerrarSesion} className="buy-button" style={{ width: '100%', backgroundColor: '#ff5a5f' }}>
                  Cerrar Sesión
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}