import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

// Recibimos setIsAuth para poder loguear al usuario automáticamente al registrarse
export const Registro = ({ setIsAuth }) => {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Estado para manejar los errores visualmente en lugar de usar un alert()
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleRegistro = (e) => {
    e.preventDefault() 
    setError('') // Limpiamos errores previos
    
    // Validación de contraseñas
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, revísalas.')
      return 
    }

    // Traemos la lista de usuarios o creamos una nueva si está vacía
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuariosCine')) || []
    
    // Verificamos que el correo no esté registrado ya
    const existeUsuario = usuariosGuardados.find(u => u.email === email)
    if (existeUsuario) {
      setError('Este correo ya está registrado. Por favor, inicia sesión.')
      return
    }

    // Creamos el objeto del nuevo usuario
    const nuevoUsuario = { nombre, email, password }
    
    // Guardamos el nuevo usuario en la lista general
    localStorage.setItem('usuariosCine', JSON.stringify([...usuariosGuardados, nuevoUsuario]))
    
    // Lo marcamos como el usuario activo (Iniciamos sesión)
    localStorage.setItem('usuarioActivo', JSON.stringify(nuevoUsuario))
    
    // Actualizamos el estado global de la app
    if(setIsAuth) setIsAuth(true)
    
    // Lo enviamos directo a la cartelera ya logueado
    navigate('/') 
  }

  return (
    <>
      <Header />
      <main className="container auth-page animate-fade-in">
        <div className="auth-card">
          <h1 className="title" style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Crear Cuenta
          </h1>
          
          {/* Mensaje de error dinámico */}
          {error && (
            <p style={{ color: 'var(--dynamic-primary, #ff5a5f)', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              {error}
            </p>
          )}
          
          <form onSubmit={handleRegistro} className="auth-form">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required 
                placeholder="Ej. Luis Casas"
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="tu@correo.com"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                placeholder="Repite tu contraseña"
                minLength="6"
              />
            </div>

            <button type="submit" className="buy-button" style={{ marginTop: '1rem', width: '100%' }}>
              Registrarse
            </button>
          </form>

          <p className="auth-footer-text">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--dynamic-primary, #ff5a5f)', textDecoration: 'none', fontWeight: 'bold' }}>
              Inicia Sesión aquí
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}