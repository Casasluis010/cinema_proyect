import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const Login = ({ setIsAuth }) => {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Traemos los usuarios guardados o creamos un array vacío
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuariosCine')) || [];

    if (esRegistro) {
      // LÓGICA DE REGISTRO
      const existeUsuario = usuariosGuardados.find(u => u.email === email);
      if (existeUsuario) {
        setError('Ese correo ya está registrado.');
        return;
      }
      
      const nuevoUsuario = { nombre, email, password };
      localStorage.setItem('usuariosCine', JSON.stringify([...usuariosGuardados, nuevoUsuario]));
      
      // Iniciamos sesión automáticamente al registrar
      localStorage.setItem('usuarioActivo', JSON.stringify(nuevoUsuario));
      setIsAuth(true);
      navigate('/');
      
    } else {
      // LÓGICA DE LOGIN
      const usuarioEncontrado = usuariosGuardados.find(u => u.email === email && u.password === password);
      if (usuarioEncontrado) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        setIsAuth(true);
        navigate('/');
      } else {
        setError('Correo o contraseña incorrectos.');
      }
    }
  };

  return (
    <>
      <Header />
      <main className="container auth-page">
        <div className="auth-card animate-fade-in">
          <h2 className="title" style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>

          {error && <p style={{ color: '#ff5a5f', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {esRegistro && (
              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  required 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
            )}

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            <button type="submit" className="buy-button" style={{ marginTop: '1rem' }}>
              {esRegistro ? 'Registrarme' : 'Entrar'}
            </button>
          </form>

          <p className="auth-footer-text">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button 
              onClick={() => { setEsRegistro(!esRegistro); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--dynamic-primary, #ff5a5f)', fontWeight: 'bold', marginLeft: '0.5rem', cursor: 'pointer' }}
            >
              {esRegistro ? 'Inicia Sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};