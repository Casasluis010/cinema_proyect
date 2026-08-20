import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { obtenerDetallePelicula } from '../services/tmdb'

export const Perfil = () => {
  const [usuario, setUsuario] = useState(null)
  const [misResenas, setMisResenas] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const cargarPerfil = async () => {
      const userLogueado = JSON.parse(localStorage.getItem('usuarioActivo'))
      
      // Si no hay usuario, lo pateamos al login
      if (!userLogueado) {
        navigate('/login')
        return
      }
      
      setUsuario(userLogueado)

      // 1. Recorremos todo el localStorage buscando reseñas
      const reseñasEncontradas = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        
        if (key && key.startsWith('reseñas_')) {
          const peliId = key.split('_')[1]
          const reseñasDeEstaPeli = JSON.parse(localStorage.getItem(key)) || []
          
          // Filtramos solo las que escribió este usuario
          const misReseñasAqui = reseñasDeEstaPeli.filter(r => r.usuario === userLogueado.nombre)
          
          if (misReseñasAqui.length > 0) {
            // Guardamos temporalmente la reseña junto con el ID de la peli
            misReseñasAqui.forEach(r => {
              reseñasEncontradas.push({ ...r, peliId })
            })
          }
        }
      }

      // 2. Buscamos los pósters y títulos en la API para esas reseñas
      if (reseñasEncontradas.length > 0) {
        const resenasConPelicula = await Promise.all(
          reseñasEncontradas.map(async (resena) => {
            const detalle = await obtenerDetallePelicula(resena.peliId)
            return {
              ...resena,
              peliculaTitulo: detalle ? detalle.titulo : 'Película Desconocida',
              peliculaPoster: detalle ? detalle.poster : 'https://via.placeholder.com/150x225/1b222b/ffffff?text=Sin+Poster'
            }
          })
        )
        
        // Las ordenamos de más reciente a más antigua
        resenasConPelicula.sort((a, b) => b.id - a.id)
        setMisResenas(resenasConPelicula)
      }

      setCargando(false)
    }

    cargarPerfil()
  }, [navigate])

  if (cargando) {
    return (
      <div className="perfil-page">
        <Header />
        <main className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: 'var(--dynamic-primary, #ff5a5f)' }}>Cargando tu diario cinéfilo... 🎞️</h2>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="perfil-page animate-fade-in">
      <Header />
      <main className="container profile-container">
        
        {/* Cabecera del Perfil */}
        <div className="profile-header">
          <div className="profile-avatar">
            {usuario?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{usuario?.nombre}</h1>
            <p className="profile-email">{usuario?.email}</p>
            <div className="profile-stats">
              <span className="stat-badge">🎥 {misResenas.length} Críticas escritas</span>
              <span className="stat-badge">🍿 Cinéfilo Nivel 1</span>
            </div>
          </div>
        </div>

        <hr className="divider" style={{ margin: '3rem 0' }} />

        {/* Diario de Reseñas */}
        <section className="profile-diary">
          <h2 className="section-title">Mi Diario Cinéfilo</h2>
          
          {misResenas.length === 0 ? (
            <div className="empty-diary">
              <p>Aún no has escrito ninguna reseña.</p>
              <Link to="/">
                <button className="buy-button small-button">Explorar Cartelera</button>
              </Link>
            </div>
          ) : (
            <div className="diary-grid">
              {misResenas.map((resena) => (
                <div key={resena.id} className="diary-card">
                  <div className="diary-poster-container">
                    <img src={resena.peliculaPoster} alt={resena.peliculaTitulo} className="diary-poster" />
                  </div>
                  <div className="diary-content">
                    <Link to={`/reserva/${resena.peliId}`} style={{ textDecoration: 'none' }}>
                      <h3 className="diary-movie-title">{resena.peliculaTitulo}</h3>
                    </Link>
                    <p className="diary-date">Escrito el {resena.fecha}</p>
                    <div style={{ color: '#ffd700', margin: '0.5rem 0', fontSize: '1.2rem' }}>
                      {'★'.repeat(resena.estrellas)}{'☆'.repeat(5 - resena.estrellas)}
                    </div>
                    <p className="diary-text">"{resena.texto}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  )
}