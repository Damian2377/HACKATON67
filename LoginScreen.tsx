import React, { useState } from 'react';
import {
  Shield,
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  Sparkles,
  Building2,
  KeyRound,
  Info,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { DEMO_STUDENT_USER, DEMO_LIDERMAN_USER } from '../data/authData';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  onContinueAsGuest?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId) {
      setErrorMessage('Por favor ingresa tu correo institucional o usuario.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Solo se permite el ingreso con correo institucional @pucp.edu.pe
      // y la contraseña arbitraria temporal 12345678.
      if (cleanId.endsWith('@pucp.edu.pe') && password === '12345678') {
        setIsLoading(false);
        onLoginSuccess({
          ...DEMO_STUDENT_USER,
          email: cleanId,
          name: cleanId.split('@')[0],
        });
        return;
      }

      setIsLoading(false);
      setErrorMessage('Acceso solo con correo @pucp.edu.pe y la contraseña asignada.');
    }, 450);
  };

  const handleQuickLogin = (role: UserRole) => {
    setErrorMessage(null);
    if (role === 'student') {
      setIdentifier(DEMO_STUDENT_USER.email);
      setPassword('pucp2024');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(DEMO_STUDENT_USER);
      }, 300);
    } else {
      setIdentifier(DEMO_LIDERMAN_USER.email);
      setPassword('liderman123');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(DEMO_LIDERMAN_USER);
      }, 300);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Background ambient glow matching PUCP colors */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <span className="font-display tracking-tight text-lg">A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black tracking-tight text-white text-lg sm:text-xl">
                AFORO<span className="text-cyan-400">PUCP</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                SISTEMA ACTIVO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Pontificia Universidad Católica del Perú
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-slate-300 block">Campus San Miguel</span>
          <span className="text-[10px] text-cyan-400 font-mono">Disponibilidad en Tiempo Real</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Card Title & Instructions */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Acceso Institucional</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-400">
              Ingresa con tu cuenta PUCP o credencial de Liderman
            </p>
          </div>

          {/* Quick Demo Access Switchers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Accesos Rápidos Demo</span>
              <span className="text-cyan-400 font-mono">1-Clic</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-demo-student"
                onClick={() => handleQuickLogin('student')}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    ESTUDIANTE
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-white block group-hover:text-cyan-200">
                    Herny Vargas
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">
                    a20214589@pucp
                  </span>
                </div>
              </button>

              <button
                type="button"
                id="btn-demo-liderman"
                onClick={() => handleQuickLogin('liderman')}
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-blue-500/30 hover:border-blue-400 text-left transition-all group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    LIDERMAN
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-white block group-hover:text-blue-200">
                    Oficial Huamán
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">
                    Zona Centro PUCP
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-700 w-full"></div>
            <span className="bg-slate-800 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
              O ingresa tus datos
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Email / Username field */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-identifier"
                className="text-xs font-bold text-slate-300 flex items-center justify-between"
              >
                <span>Correo institucional o código</span>
                <span className="text-[10px] font-mono text-slate-400">@pucp.edu.pe / @liderman</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="ej. a20214589@pucp.edu.pe o lid-4089"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 font-medium transition-all focus:outline-none"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-password"
                  className="text-xs font-bold text-slate-300"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 font-medium transition-all focus:outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verificando credenciales...</span>
                </div>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Role Routing explanation note */}
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Redirección automática según perfil:</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              • <strong>Estudiante:</strong> Consultas de aforo, cubículos, mapa y recomendador IA.
              <br />
              • <strong>Liderman:</strong> Panel de rondas y registro oficial de aforo para supervisión.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>© 2026 AforoPUCP • Dirección de Tecnologías y Seguridad Campus PUCP</p>
      </footer>

      {/* Modal: ¿Olvidaste tu contraseña? */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base font-display">Recuperar Acceso</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm text-white">Instrucciones enviadas</h4>
                <p className="text-xs text-slate-300">
                  Si la cuenta existe en el directorio institucional, recibirás un enlace de restablecimiento.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ingresa tu correo institucional PUCP o tu código de oficial Liderman para restablecer tu contraseña.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ej. a20214589@pucp.edu.pe"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold rounded-xl"
                  >
                    Enviar enlace
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
