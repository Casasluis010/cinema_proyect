import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Tus importaciones
import { Home } from './pages/Home'
import { Butacas } from './pages/Butacas'
import { Ajustes } from './pages/Ajustes'
import { Login } from './pages/Login'
import { Checkout } from './pages/Checkout'
import { MisReservas } from './pages/MisReservas'
import { Registro } from './pages/Registro'
import { Perfil } from './pages/Perfil'
import './App.css'

// COMPONENTE GUARDIÁN: Si no está logueado, lo envía al Login
const ProtectedRoute = ({ isAuth, children }) => {
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  // Estados para controlar la sesión
  const [isAuth, setIsAuth] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Al abrir la app, revisamos si ya hay una sesión guardada
  useEffect(() => {
    const usuarioLogueado = localStorage.getItem('usuarioActivo')
    if (usuarioLogueado) {
      setIsAuth(true)
    }
    setCargando(false)
  }, [])

  // Evita un parpadeo mientras React lee el localStorage
  if (cargando) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>Cargando aplicación...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        
        {/* =========================================
            RUTAS PÚBLICAS (No requieren cuenta)
        ========================================= */}
        {/* Pasamos setIsAuth para que puedan cambiar el estado al iniciar/registrar */}
        <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login setIsAuth={setIsAuth} />} />
        <Route path="/registro" element={isAuth ? <Navigate to="/" /> : <Registro setIsAuth={setIsAuth} />} />


        {/* =========================================
            RUTAS PROTEGIDAS (Requieren iniciar sesión)
        ========================================= */}
        <Route 
          path="/" 
          element={<ProtectedRoute isAuth={isAuth}><Home /></ProtectedRoute>} 
        />
        
        <Route 
          path="/reserva/:id" 
          element={<ProtectedRoute isAuth={isAuth}><Butacas /></ProtectedRoute>} 
        />
        
        <Route 
          path="/butacas/:id" 
          element={<ProtectedRoute isAuth={isAuth}><Butacas /></ProtectedRoute>} 
        />
        
        <Route 
          path="/ajustes" 
          element={<ProtectedRoute isAuth={isAuth}><Ajustes /></ProtectedRoute>} 
        />
        
        <Route 
          path="/Checkout" 
          element={<ProtectedRoute isAuth={isAuth}><Checkout /></ProtectedRoute>} 
        />
        
        <Route 
          path="/mis-reservas" 
          element={<ProtectedRoute isAuth={isAuth}><MisReservas /></ProtectedRoute>} 
        />

        <Route 
          path="/perfil" 
          element={<ProtectedRoute isAuth={isAuth}><Perfil /></ProtectedRoute>} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App