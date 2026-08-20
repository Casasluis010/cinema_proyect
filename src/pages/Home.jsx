import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { obtenerPeliculasEnCartelera, obtenerTrailer } from '../services/tmdb'

// --- COMPONENTE NUEVO: Tarjeta Inteligente con Efecto Hover ---
const TarjetaPelicula = ({ pelicula }) => {
  const [hover, setHover] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const hoverTimeout = useRef(null)

  const manejarEntradaMouse = () => {
    // Si el usuario deja el mouse 800ms, activamos el tráiler
    hoverTimeout.current = setTimeout(async () => {
      setHover(true)
      // Solo hacemos la petición a la API si aún no tenemos el tráiler guardado
      if (!trailerKey) {
        const key = await obtenerTrailer(pelicula.id)
        setTrailerKey(key)
      }
    }, 800)
  }

  const manejarSalidaMouse = () => {
    // Si saca el mouse antes de los 800ms, cancelamos la acción
    clearTimeout(hoverTimeout.current)
    setHover(false)
  }

  return (
    <div 
      className="movie-card" 
      onMouseEnter={manejarEntradaMouse} 
      onMouseLeave={manejarSalidaMouse}
    >
      {/* Lógica condicional: Si está en hover y tenemos el tráiler, mostramos YouTube. Si no, el póster. */}
      {hover && trailerKey ? (
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
          title="Trailer"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          style={{ width: '100%', height: '320px', objectFit: 'cover', pointerEvents: 'none' }}
        ></iframe>
      ) : (
        <img 
          src={pelicula.poster} 
          alt={`Póster de ${pelicula.titulo}`} 
          className="movie-poster animate-fade-in" 
        />
      )}

      <div className="movie-info">
        <h2>{pelicula.titulo}</h2>
        <p className="genre">{pelicula.genero} • {pelicula.duracion}</p>
        
        <div className="showtimes">
          {pelicula.horarios.map((horario, index) => (
            <Link 
              key={index} 
              to={`/reserva/${pelicula.id}`} 
              state={{ horario: horario }} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="time-badge">{horario}</span>
            </Link>
          ))}
        </div>

        <Link to={`/reserva/${pelicula.id}`} style={{ textDecoration: 'none', marginTop: 'auto' }}>
          <button className="buy-button small-button" style={{ width: '100%' }}>
            Ver Detalles
          </button>
        </Link>
      </div>
    </div>
  )
}

// --- PÁGINA PRINCIPAL ---
export const Home = () => {
  const [peliculas, setPeliculas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')

  useEffect(() => {
    const traerEstrenos = async () => {
      setCargando(true)
      const cartelera = await obtenerPeliculasEnCartelera()
      setPeliculas(cartelera)
      setCargando(false)
    }

    traerEstrenos()
  }, [])

  const peliculasFiltradas = peliculas.filter(pelicula => {
    const coincideBusqueda = pelicula.titulo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoria === 'Todas' || pelicula.genero.includes(categoria)
    return coincideBusqueda && coincideCategoria
  })

  return (
    <>
      <Header />
      <main className="container animate-fade-in">
        <h1 className="title" style={{ marginTop: '2rem' }}>EN CARTELERA</h1>

        <div className="search-filter-container">
          <input 
            type="text" 
            placeholder="🔍 Buscar película por título..." 
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select 
            className="category-select"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="Todas">Todas las categorías</option>
            <option value="Acción">Acción</option>
            <option value="Aventura">Aventura</option>
            <option value="Comedia">Comedia</option>
            <option value="Drama">Drama</option>
            <option value="Ciencia Ficción">Ciencia Ficción</option>
            <option value="Terror">Terror</option>
            <option value="Animación">Animación</option>
          </select>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', color: '#aeb9c7', padding: '4rem 0', fontSize: '1.2rem' }}>
            Cargando estrenos exclusivos... 🍿
          </div>
        ) : peliculasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#ff5a5f', padding: '4rem 0', fontSize: '1.2rem' }}>
            No encontramos películas que coincidan con tu búsqueda.
          </div>
        ) : (
          <div className="carousel-wrapper">
            <div className="movies-carousel">
              {/* Aquí usamos el nuevo componente que creamos arriba */}
              {peliculasFiltradas.map((pelicula) => (
                <TarjetaPelicula key={pelicula.id} pelicula={pelicula} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}