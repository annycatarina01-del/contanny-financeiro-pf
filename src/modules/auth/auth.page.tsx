import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Banknote, Lock, Mail, ArrowRight, User, UserPlus } from 'lucide-react';
import { AuthService } from './auth.service';

interface AuthPageProps {
  onLogin: () => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await AuthService.signIn(email, password);
      } else {
        await AuthService.signUp(email, password, name);
      }
      onLogin();
    } catch (error: any) {
      alert(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Cont. Anny Logo"
                className="w-24 h-24 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300 object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="text-zinc-500 text-sm mt-2 text-center">
              {isLogin
                ? 'Faça login para acessar o painel financeiro Cont. Anny'
                : 'Cadastre-se para começar a gerenciar suas finanças'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand-navy outline-none bg-zinc-50 transition-all"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand-navy outline-none bg-zinc-50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand-navy outline-none bg-zinc-50 transition-all"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="confirmPassword"
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand-navy outline-none bg-zinc-50 transition-all"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-zinc-600">Lembrar-me</span>
                </label>
                <a href="#" className="text-emerald-600 font-medium hover:text-emerald-700">
                  Esqueceu a senha?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-navy text-white px-6 py-3.5 rounded-xl font-bold hover:bg-brand-navy/90 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar no Painel' : 'Criar Conta'}
                  {isLogin ? <ArrowRight size={18} /> : <UserPlus size={18} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            {isLogin ? (
              <p>
                Ainda não tem uma conta?{' '}
                <button
                  onClick={toggleMode}
                  className="text-brand-navy font-bold hover:text-brand-navy/80 underline underline-offset-4"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{' '}
                <button
                  onClick={toggleMode}
                  className="text-brand-navy font-bold hover:text-brand-navy/80 underline underline-offset-4"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>
        </motion.div>

        <p className="text-center text-zinc-400 text-sm mt-8">
          &copy; {new Date().getFullYear()} Cont. Anny. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
