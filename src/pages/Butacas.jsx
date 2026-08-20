import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { FastAverageColor } from 'fast-average-color'
import { obtenerDetallePelicula } from '../services/tmdb'

// --- 1. BUTACA 3D INTERACTIVA ---
const Seat3D = ({ position, seatId, isSelected, onSelect }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(seatId)
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.4, 0.4, 1.4]} />
        <meshStandardMaterial 
          color={isSelected ? "var(--dynamic-primary, #e50914)" : hovered ? "#ffffff" : "#222222"} 
        />
      </mesh>
      <mesh position={[0, 1, -0.6]}>
        <boxGeometry args={[1.4, 1.4, 0.2]} />
        <meshStandardMaterial 
          color={isSelected ? "var(--dynamic-primary, #ff3b45)" : hovered ? "#dddddd" : "#1a1a1a"} 
        />
      </mesh>
    </group>
  )
}

// --- 2. CÁMARA ---
const CameraController = ({ targetSeat }) => {
  useFrame((state) => {
    let targetPosition = new THREE.Vector3(0, 12, 18)

    if (targetSeat) {
      const fila = targetSeat.charAt(0)
      const col = parseInt(targetSeat.substring(1))
      const filaIndex = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(fila)

      const xPos = (col - 4.5) * 2.5 
      const yPos = 2.5 + (filaIndex * 1.2) 
      const zPos = -7.5 + (filaIndex * 3)

      targetPosition.set(xPos, yPos, zPos)
    }

    state.camera.position.lerp(targetPosition, 0.05)
    state.camera.lookAt(0, 7, -22)
  })
  return null
}

// --- 3. ESCENARIO 3D ---
const CinemaScene = ({ targetSeat, asientosSeleccionados, onSelectSeat }) => {
  const filas = ['A', 'B', 'C', 'D', 'E', 'F']
  const columnas = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <>
      <CameraController targetSeat={targetSeat} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 15, -10]} intensity={1.5} color="#ffffff" />

      <mesh position={[0, 8, -22]}>
        <planeGeometry args={[36, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={1.2} 
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {filas.map((fila, filaIndex) => 
        columnas.map((col) => {
          const seatId = `${fila}${col}`
          const isSelected = asientosSeleccionados.includes(seatId)
          const xPos = (col - 4.5) * 2.5 
          const yPos = 0 + (filaIndex * 1.2)
          const zPos = -8 + (filaIndex * 3)

          return (
            <Seat3D 
              key={seatId} 
              seatId={seatId}
              position={[xPos, yPos, zPos]} 
              isSelected={isSelected} 
              onSelect={onSelectSeat}
            />
          )
        })
      )}

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 60]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      <Environment preset="city" />
    </>
  )
}

// --- 4. PÁGINA PRINCIPAL ---
export const Butacas = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation() 
  
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [asientosSeleccionados, setAsientosSeleccionados] = useState([])
  const [ultimoAsiento, setUltimoAsiento] = useState(null)
  const [mostrar3D, setMostrar3D] = useState(false)
  const [panelAbierto, setPanelAbierto] = useState(true)

  const [horario, setHorario] = useState(location.state?.horario || null)

  // --- NUEVOS ESTADOS PARA RESEÑAS ---
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [resenas, setResenas] = useState([])
  const [nuevaResena, setNuevaResena] = useState('')
  const [calificacion, setCalificacion] = useState(5)

  useEffect(() => {
    const cargarInfo = async () => {
      setCargando(true)
      const data = await obtenerDetallePelicula(id)
      if (data) {
        setPeliculaSeleccionada(data)
        if (!location.state?.horario && data.horarios && data.horarios.length > 0) {
          setHorario(data.horarios[0])
        }
      }
      setCargando(false)
    }
    cargarInfo()

    // Cargar usuario logueado
    const user = JSON.parse(localStorage.getItem('usuarioActivo'))
    setUsuarioActual(user)

    // Cargar reseñas guardadas para esta película específica
    const reseñasGuardadas = JSON.parse(localStorage.getItem(`reseñas_${id}`)) || []
    setResenas(reseñasGuardadas)
  }, [id, location.state?.horario])

  useEffect(() => {
    if (peliculaSeleccionada?.poster) {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = peliculaSeleccionada.poster + '?bypassCache=' + new Date().getTime() 

      img.onload = () => {
        const fac = new FastAverageColor()
        fac.getColorAsync(img)
          .then(color => {
            document.documentElement.style.setProperty('--dynamic-primary', color.hex)
          })
          .catch(e => console.warn('No se pudo extraer el color:', e))
      }
    }

    return () => {
      document.documentElement.style.setProperty('--dynamic-primary', '#ff5a5f')
    }
  }, [peliculaSeleccionada])

  // --- LÓGICA PARA ENVIAR RESEÑA ---
  const enviarResena = (e) => {
    e.preventDefault()
    if (!nuevaResena.trim()) return

    const review = {
      id: Date.now(),
      usuario: usuarioActual.nombre,
      texto: nuevaResena,
      estrellas: calificacion,
      fecha: new Date().toLocaleDateString()
    }

    const nuevasResenas = [review, ...resenas]
    setResenas(nuevasResenas)
    localStorage.setItem(`reseñas_${id}`, JSON.stringify(nuevasResenas))
    
    // Limpiar formulario
    setNuevaResena('')
    setCalificacion(5)
  }

  if (cargando) {
    return (
      <div className="butacas-page">
        <Header />
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: 'var(--dynamic-primary, #ff5a5f)' }}>Preparando la sala 3D... 🍿</h2>
        </div>
        <Footer />
      </div>
    )
  }

  if (!peliculaSeleccionada) {
    return (
      <div className="butacas-page">
        <Header />
        <h2 style={{textAlign: 'center', color: 'white', marginTop: '5rem'}}>Película no encontrada</h2>
        <Footer />
      </div>
    )
  }

  const filas = ['A', 'B', 'C', 'D', 'E', 'F']
  const columnas = [1, 2, 3, 4, 5, 6, 7, 8]

  const toggleAsiento = (asientoId) => {
    if (asientosSeleccionados.includes(asientoId)) {
      const nuevosAsientos = asientosSeleccionados.filter(id => id !== asientoId)
      setAsientosSeleccionados(nuevosAsientos)
      setUltimoAsiento(nuevosAsientos.length > 0 ? nuevosAsientos[nuevosAsientos.length - 1] : null)
    } else {
      setAsientosSeleccionados([...asientosSeleccionados, asientoId])
      setUltimoAsiento(asientoId)
    }
  }

  const irAlCheckout = () => {
    navigate('/checkout', { 
      state: { 
        pelicula: peliculaSeleccionada, 
        asientos: asientosSeleccionados,
        horario: horario 
      } 
    })
  }

  return (
    <div className="butacas-page">
      {mostrar3D && (
        <div className="pov-fullscreen-overlay animate-fade-in">
          <div className="pov-header">
            <h3>Simulación 3D: {peliculaSeleccionada.titulo}</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="toggle-sidebar-btn" onClick={() => setPanelAbierto(!panelAbierto)}>
                {panelAbierto ? 'Ocultar Panel 🎦' : 'Elegir Asientos 💺'}
              </button>
              <button className="close-pov-btn" onClick={() => setMostrar3D(false)}>
                ❌ Salir
              </button>
            </div>
          </div>

          <div className="pov-canvas-wrapper">
            <Canvas camera={{ position: [0, 12, 18], fov: 60 }}>
              <CinemaScene 
                targetSeat={ultimoAsiento} 
                asientosSeleccionados={asientosSeleccionados} 
                onSelectSeat={toggleAsiento}
              />
            </Canvas>
          </div>

          <div className={`pov-side-panel ${panelAbierto ? 'open' : 'closed'}`}>
            <h3>Selecciona Butacas</h3>
            <p className="panel-subtitle">Haz clic en el 3D o aquí abajo:</p>

            <div className="seats-grid mini-grid">
              {filas.map((fila) => (
                <div key={fila} className="seat-row">
                  <span className="row-label">{fila}</span>
                  {columnas.map((columna) => {
                    const asientoId = `${fila}${columna}`
                    const estaSeleccionado = asientosSeleccionados.includes(asientoId)
                    
                    return (
                      <div 
                        key={asientoId}
                        className={`seat mini-seat ${estaSeleccionado ? 'selected' : ''}`}
                        onClick={() => toggleAsiento(asientoId)}
                      >
                        <div className="seat-top"></div>
                      </div>
                    )
                  })}
                  <span className="row-label">{fila}</span>
                </div>
              ))}
            </div>

            <div className="panel-summary">
              <p>Horario: <strong>{horario}</strong></p>
              <p>Asientos: <strong>{asientosSeleccionados.length > 0 ? asientosSeleccionados.join(', ') : 'Ninguno'}</strong></p>
              <p>Total: <strong>€{asientosSeleccionados.length * 8}</strong></p>
              <button 
                className="buy-button small-button" 
                disabled={asientosSeleccionados.length === 0}
                onClick={irAlCheckout}
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />
      <main className="container">
        
        <section className="movie-details-section">
          <div className="movie-poster-container">
            <img 
              src={peliculaSeleccionada.poster} 
              alt={peliculaSeleccionada.titulo} 
              className="movie-detail-poster" 
            />
          </div>

          <div className="movie-info-text">
            <h1 className="movie-big-title" style={{ color: '#ffffff' }}>
              {peliculaSeleccionada.titulo}
            </h1>
            <div className="movie-badges">
              <span className="badge">{peliculaSeleccionada.genero}</span>
              <span className="badge">⏳ {peliculaSeleccionada.duracion}</span>
            </div>
            
            <p className="movie-synopsis">{peliculaSeleccionada.sinopsis}</p>

            <div className="schedule-selector" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' }}>
              <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                🎬 Elegiste este horario: <span style={{ color: 'var(--dynamic-primary, #ff5a5f)' }}>{horario}</span>
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                ¿Prefieres cambiar de horario? Selecciona otro a continuación:
              </p>
              
              <div className="showtimes" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {peliculaSeleccionada.horarios.map(hora => (
                  <span 
                    key={hora} 
                    className={`time-badge ${horario === hora ? 'selected' : ''}`}
                    onClick={() => setHorario(hora)}
                    style={horario === hora ? { backgroundColor: 'var(--dynamic-primary, #ff5a5f)', boxShadow: '0 0 10px var(--dynamic-primary, #ff5a5f)' } : {}}
                  >
                    {hora}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {peliculaSeleccionada.trailer && (
            <div className="movie-trailer-container">
              <iframe 
                src={peliculaSeleccionada.trailer} 
                title={`Tráiler de ${peliculaSeleccionada.titulo}`} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
          )}
        </section>

        <hr className="divider" />

        <div className="cinema-room">
          <h2 className="section-title">Selecciona tus Asientos</h2>
          
          <div className="seats-grid">
            {filas.map((fila) => (
              <div key={fila} className="seat-row">
                <span className="row-label">{fila}</span>
                {columnas.map((columna) => {
                  const asientoId = `${fila}${columna}`
                  const estaSeleccionado = asientosSeleccionados.includes(asientoId)
                  
                  return (
                    <div 
                      key={asientoId}
                      className={`seat ${estaSeleccionado ? 'selected' : ''}`}
                      onClick={() => toggleAsiento(asientoId)}
                    >
                      <div className="seat-top"></div>
                    </div>
                  )
                })}
                <span className="row-label">{fila}</span>
              </div>
            ))}
          </div>

          <div className="pov-toggle-container">
            <button 
              className="pov-toggle-btn"
              onClick={() => setMostrar3D(true)}
            >
              ¿Quieres saber como se ve en tu asiento? Adéntrate a este modelado 3D
            </button>
          </div>

          {asientosSeleccionados.length > 0 && (
            <div className="booking-summary">
              <p>Horario: <strong>{horario}</strong></p>
              <p>Asientos: <strong>{asientosSeleccionados.join(', ')}</strong></p>
              <p>Total: <strong>€{asientosSeleccionados.length * 8}</strong></p>
              <button className="buy-button small-button" onClick={irAlCheckout}>Confirmar</button>
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* --- NUEVA SECCIÓN DE RESEÑAS --- */}
        <section className="reviews-section">
          <h2 className="section-title">Críticas y Reseñas</h2>
          
          {usuarioActual ? (
            <form onSubmit={enviarResena} className="review-form">
              <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Deja tu opinión, {usuarioActual.nombre}</h3>
              
              <div className="stars-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => setCalificacion(star)}
                    style={{ color: star <= calificacion ? '#ffd700' : '#4f617a' }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea 
                className="review-textarea" 
                placeholder="¿Qué te pareció la película? Escribe tu crítica aquí..."
                value={nuevaResena}
                onChange={(e) => setNuevaResena(e.target.value)}
                required
              />
              
              <button type="submit" className="buy-button small-button" style={{ alignSelf: 'flex-start' }}>
                Publicar Reseña
              </button>
            </form>
          ) : (
            <div className="review-form" style={{ textAlign: 'center' }}>
              <p style={{ color: '#aeb9c7', marginBottom: '1rem' }}>Debes iniciar sesión para dejar una crítica.</p>
              <Link to="/login">
                <button className="buy-button small-button">Iniciar Sesión</button>
              </Link>
            </div>
          )}

          <div className="reviews-list">
            {resenas.length === 0 ? (
              <p style={{ color: '#aeb9c7', textAlign: 'center', fontStyle: 'italic' }}>
                Aún no hay reseñas. ¡Sé el primero en opinar!
              </p>
            ) : (
              resenas.map((resena) => (
                <div key={resena.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">👤 {resena.usuario}</span>
                    <span className="review-date">{resena.fecha}</span>
                  </div>
                  <div style={{ color: '#ffd700', marginBottom: '0.8rem', fontSize: '1.2rem' }}>
                    {'★'.repeat(resena.estrellas)}{'☆'.repeat(5 - resena.estrellas)}
                  </div>
                  <p className="review-text">{resena.texto}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <Link to="/" className="back-link">
          ← Volver a la cartelera
        </Link>
      </main>
      <Footer />
    </div>
  )
}