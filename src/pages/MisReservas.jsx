import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const MisReservas = () => {
  const [reservas, setReservas] = useState([])
  const [qrSeleccionado, setQrSeleccionado] = useState(null) // Guardará el ID para el modal

  useEffect(() => {
    const reservasGuardadas = JSON.parse(localStorage.getItem('misReservas')) || []
    setReservas(reservasGuardadas.reverse())
  }, [])

  return (
    <>
      <Header />
      <main className="container" style={{ minHeight: '70vh', padding: '2rem 1rem', position: 'relative' }}>
        <h1 className="movie-big-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Mis Entradas
        </h1>

        {reservas.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Aún no tienes entradas compradas.
            </p>
            <Link to="/" className="buy-button" style={{ display: 'inline-block', padding: '0.8rem 2rem', textDecoration: 'none' }}>
              Ver Cartelera
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            {reservas.map((reserva) => (
              <div key={reserva.id} className="checkout-summary-box" style={{ flexDirection: 'row', gap: '1.5rem', alignItems: 'center' }}>
                <img 
                  src={reserva.pelicula.poster} 
                  alt={reserva.pelicula.title} 
                  style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.4rem' }}>{reserva.pelicula.title}</h3>
                  <p>Asientos: <strong>{reserva.asientos.join(', ')}</strong></p>
                  <p>Fecha de compra: <strong>{reserva.fecha}</strong></p>
                  <p>Total pagado: <strong style={{ color: '#46d369' }}>€{reserva.total}</strong></p>
                </div>
                <button 
                  className="buy-button small-button" 
                  style={{ backgroundColor: '#222', backgroundImage: 'none' }}
                  onClick={() => setQrSeleccionado(reserva.id)}
                >
                  Ver QR
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal del Código QR */}
        {qrSeleccionado && (
          <div className="pov-fullscreen-overlay animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="auth-card" style={{ textAlign: 'center', padding: '3rem', position: 'relative' }}>
              <button 
                onClick={() => setQrSeleccionado(null)}
                style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ❌
              </button>
              <h2 style={{ marginBottom: '1.5rem' }}>Tu Pase de Acceso</h2>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
                {/* Aquí renderizamos el QR dinámico */}
                <QRCode value={`TICKET-CINE-${qrSeleccionado}`} size={200} />
              </div>
              <p style={{ marginTop: '1.5rem', color: '#aaa', fontSize: '0.9rem' }}>
                Presenta este código al ingresar a la sala.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}