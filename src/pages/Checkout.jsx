import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const Checkout = () => {
  const location = useLocation()
  
  const pelicula = location.state?.pelicula || { title: 'Película no seleccionada', poster: '' }
  const asientos = location.state?.asientos || []
  const horario = location.state?.horario || 'No especificado' // <-- ATRAPAMOS EL HORARIO
  const precioPorEntrada = 8;
  const precioCalculado = location.state?.precioTotal || location.state?.total || (asientos.length * precioPorEntrada);

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [tarjeta, setTarjeta] = useState('')
  const [fecha, setFecha] = useState('')
  const [cvc, setCvc] = useState('')
  
  const [procesando, setProcesando] = useState(false)
  const [compraExitosa, setCompraExitosa] = useState(false)

  // FUNCIÓN A PRUEBA DE FALLOS (Se mantiene intacta)
  const handleTarjetaChange = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '');
    const max16Numeros = soloNumeros.slice(0, 16);
    const grupos = max16Numeros.match(/.{1,4}/g);
    if (grupos) {
      setTarjeta(grupos.join(' '));
    } else {
      setTarjeta('');
    }
  }

  const handleCvcChange = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '');
    setCvc(soloNumeros);
  }

  const handlePagar = (e) => {
    e.preventDefault()
    setProcesando(true)

    // Agregamos el horario a la reserva local
    const nuevaReserva = {
      id: crypto.randomUUID(),
      pelicula: pelicula, 
      asientos: asientos,
      horario: horario, 
      total: precioCalculado,
      fecha: new Date().toLocaleDateString()
    }

    // Agregamos el horario a la plantilla de EmailJS
    const templateParams = {
      user_name: nombre,
      user_email: email,
      pelicula: pelicula.title,
      horario: horario,
      asientos: asientos.join(', '),
      total: precioCalculado
    }

    setTimeout(() => {
      const reservasGuardadas = JSON.parse(localStorage.getItem('misReservas')) || []
      localStorage.setItem('misReservas', JSON.stringify([...reservasGuardadas, nuevaReserva]))

      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .catch((err) => console.error('Error al enviar el correo de confirmación:', err))

      setProcesando(false)
      setCompraExitosa(true)
    }, 2000)
  }

  // PANTALLA DE ÉXITO
  if (compraExitosa) {
    return (
      <>
        <Header />
        <main className="container checkout-page">
          <div className="compact-checkout-container" style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#46d369', fontSize: '2.5rem', marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
            <h2 style={{ marginBottom: '1rem' }}>Tus entradas están listas</h2>
            <p style={{ color: '#aeb9c7', marginBottom: '2rem' }}>
              Acabamos de enviar la confirmación a <strong>{email}</strong>.
            </p>
            <Link to="/mis-reservas" className="buy-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Ver Mis Entradas
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // PANTALLA DEL FORMULARIO COMPACTO
  return (
    <>
      <Header />
      <main className="container animate-fade-in checkout-page">
        
        <div className="compact-checkout-container">
          <h2 className="title" style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Finalizar Compra
          </h2>

          <div className="checkout-summary-box">
            <h3 style={{ margin: '0 0 1rem 0' }}>Resumen</h3>
            <p><strong>Película:</strong> {pelicula.title}</p>
            <p><strong>Horario:</strong> <span style={{ color: 'var(--dynamic-primary, #ff5a5f)' }}>{horario}</span></p>
            <p><strong>Asientos:</strong> {asientos.length > 0 ? asientos.join(', ') : 'Ninguno'}</p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
            <p style={{ fontSize: '1.2rem' }}>
              <strong>Total a Pagar: </strong> 
              <span style={{ color: 'var(--dynamic-primary, #ff5a5f)' }}>€{precioCalculado}</span>
            </p>
          </div>

          <form className="compact-form" onSubmit={handlePagar} autoComplete="off">
            
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Datos Personales</h3>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Tu Nombre Completo" 
                className="checkout-input" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Tu Correo (Para enviarte las entradas)" 
                className="checkout-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Datos de Pago</h3>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Número de Tarjeta (16 dígitos)" 
                className="checkout-input" 
                value={tarjeta}
                onChange={handleTarjetaChange}
                maxLength="19"
                minLength="19"
                required 
                autoComplete="off"
              />
            </div>
            
            <div className="form-row-compact">
              <div className="form-group" style={{ flex: 1 }}>
                <input 
                  type="month" 
                  className="checkout-input" 
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required 
                  autoComplete="off"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="CVC" 
                  className="checkout-input" 
                  value={cvc}
                  onChange={handleCvcChange}
                  maxLength="3"
                  minLength="3"
                  required 
                  autoComplete="off"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="buy-button" 
              disabled={procesando || asientos.length === 0}
              style={{ width: '100%', marginTop: '1rem', opacity: procesando ? 0.7 : 1 }}
            >
              {procesando ? 'Procesando Pago...' : `Pagar €${precioCalculado}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to={`/butacas/${pelicula.id}`} state={{ pelicula, horario }} className="back-link" style={{ marginTop: 0 }}>
              ← Volver a butacas
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}