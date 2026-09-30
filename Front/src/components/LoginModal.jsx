import React, { useState } from 'react';
import './LoginModal.css';
import { api } from '../services/api';

export default function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await api.login(username, password);
      
      if (response.success === false) {
        setErrorMsg(response.message || 'Error al iniciar sesión');
        return;
      }

      // Detectar errores del backend (por ej. FastAPI devuelve "detail" en 401/404)
      if (response.detail) {
        setErrorMsg(typeof response.detail === 'string' ? response.detail : 'Credenciales inválidas');
        return;
      }

      const token = response.access_token || response.token || response.Token;
      
      // Solo iniciar sesión si realmente recibimos un token
      if (token) {
        localStorage.setItem('Token', token);
        setErrorMsg('');
        setIsSubmitted(true);

        if (onLoginSuccess) {
          setTimeout(() => {
            onLoginSuccess();
          }, 1500);
        }
      } else {
        setErrorMsg('Error al iniciar sesión: credenciales incorrectas o usuario no encontrado');
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor');
    }
  };

  return (
    <div className="meditrack-page-container">
      <div className="meditrack-card">
        
        {/* Left Brand Panel */}
        <div className="meditrack-left-panel">
          <div className="meditrack-glow"></div>

          <div>
            {/* White logo container */}
            <div className="meditrack-logo-box">
              <div className="meditrack-logo-content">
                <span className="meditrack-logo-mt">MT</span>
                <div className="meditrack-logo-divider"></div>
                <div className="meditrack-logo-text-group">
                  <span className="meditrack-logo-title">MEDITRACK</span>
                  <span className="meditrack-logo-subtitle">Ministerio de Salud</span>
                </div>
              </div>
            </div>

            {/* Title and description */}
            <h1 className="meditrack-left-heading">
              Sistema Nacional de Monitoreo de Medicinas
            </h1>
            <p className="meditrack-left-desc">
              Controlando de forma transparente y eficiente la distribución de insumos médicos críticos en toda Guatemala.
            </p>
          </div>

          {/* Footer Official Ministry badge */}
          <div className="meditrack-left-footer">
            <div className="meditrack-shield-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="meditrack-footer-text">
              Plataforma no oficial del Ministerio de Salud
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="meditrack-right-panel">
          <div>
            {/* Header copy */}
            <div className="meditrack-form-header">
              <h2 className="meditrack-form-title">
                Bienvenido a MEDITRACK
              </h2>
              <p className="meditrack-form-subtitle">
                Ingrese sus credenciales autorizadas para comenzar.
              </p>
            </div>

            {/* Success or error message alerts */}
            {isSubmitted ? (
              <div className="meditrack-success-box">
                <svg className="meditrack-suc cess-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3 className="meditrack-success-title">¡Sesión iniciada con éxito!</h3>
                <p className="meditrack-success-desc">Redirigiendo al panel de control de MEDITRACK...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="meditrack-form">
                {errorMsg && (
                  <div className="meditrack-error-alert">
                    {errorMsg}
                  </div>
                )}

                {/* Email input field */}
                <div className="meditrack-input-group">
                  <label className="meditrack-label">
                    Nombre de usuario
                  </label>
                  <div className="meditrack-input-wrapper">
                    <span className="meditrack-input-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="usuario123"
                      className="meditrack-input"
                    />
                  </div>
                </div>

                {/* Password input field */}
                <div className="meditrack-input-group">
                  <label className="meditrack-label">
                    Contraseña
                  </label>
                  <div className="meditrack-input-wrapper">
                    <span className="meditrack-input-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="meditrack-input meditrack-input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="meditrack-eye-btn"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Password */}
                <div className="meditrack-options-row">
                  <label className="meditrack-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="meditrack-checkbox"
                    />
                    <span>Recordar sesión</span>
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); console.log('Recuperación solicitada'); }}
                    className="meditrack-forgot-link"
                  >
                    ¿Olvidó su contraseña?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="meditrack-submit-btn"
                >
                  Iniciar Sesión
                </button>
              </form>
            )}
          </div>

          {/* Copyright Footer */}
          <div className="meditrack-card-footer">
            <p className="meditrack-copyright">
              © 2026 MEDITRACK Guatemala. Todos los derechos reservados.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}