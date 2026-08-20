import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const Ajustes = () => {
  // 1. Estados existentes
  const [tema, setTema] = useState(localStorage.getItem('theme') || 'dark')
  const [audioMode, setAudioMode] = useState(localStorage.getItem('audioMode') || 'Dolby Atmos')
  const [notificaciones, setNotificaciones] = useState(true)

  // 2. NUEVOS ESTADOS: Memoria para los datos de la cuenta
  const [nombre, setNombre] = useState(localStorage.getItem('userName') || 'Luis Casas')
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || 'luiscasas866@gmail.com')

  useEffect(() => {
    if (tema === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    }
  }, [tema])

  const handleGuardar = (e) => {
    e.preventDefault()
    
    // 3. Guardamos TODO en el disco duro del navegador
    localStorage.setItem('audioMode', audioMode)
    localStorage.setItem('userName', nombre)
    localStorage.setItem('userEmail', email)
    
    alert('¡Preferencias de ajustes y perfil guardados con éxito!')
  }

  return (
    <>
      <Header />
      <main className="container settings-page">
        <div className="settings-card">
          <h1 className="title">Ajustes de la App</h1>
          
          <form onSubmit={handleGuardar} className="settings-form">
            
            {/* --- SECCIÓN: GESTIÓN DE CUENTA --- */}
            <h2 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
              Datos del Perfil
            </h2>

            <div className="setting-item">
              <label>Nombre visible</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', marginTop: '0.5rem' }}
              />
            </div>

            <div className="setting-item">
              <label>Correo electrónico</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', marginTop: '0.5rem' }}
              />
            </div>

            {/* --- SECCIÓN: PREFERENCIAS --- */}
            <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
              Preferencias
            </h2>
            
            {/* Selector de Tema Claro / Oscuro */}
            <div className="setting-item">
              <label>Tema de la Interfaz</label>
              <select 
                value={tema} 
                onChange={(e) => setTema(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', marginTop: '0.5rem' }}
              >
                <option value="dark">Oscuro (Dark Mode)</option>
                <option value="light">Claro (Light Mode)</option>
              </select>
            </div>

            {/* Configuración de Audio para la experiencia de cine */}
            <div className="setting-item">
              <label>Perfil de Audio (Tráilers y Sala)</label>
              <select 
                value={audioMode} 
                onChange={(e) => setAudioMode(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', marginTop: '0.5rem' }}
              >
                <option value="Estéreo">Estéreo Estándar</option>
                <option value="Dolby Atmos">Dolby Atmos (Inmersivo)</option>
                <option value="7.1 Surround">7.1 Surround Pro</option>
              </select>
            </div>

            <div className="setting-item checkbox-item" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notificaciones} 
                  onChange={(e) => setNotificaciones(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                Recibir alertas de estrenos y ofertas
              </label>
            </div>

            <button type="submit" className="buy-button" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              Guardar Cambios
            </button>
          </form>
        </div>

        <Link to="/" className="back-link" style={{ display: 'block', textAlign: 'center', marginTop: '2rem', color: '#aaa', textDecoration: 'none' }}>
          ← Volver a la cartelera
        </Link>
      </main>
      <Footer />
    </>
  )
}