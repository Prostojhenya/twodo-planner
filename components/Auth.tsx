import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Input } from './UI';

interface AuthProps {
  onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned');

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: name,
            initials: name.charAt(0).toUpperCase(),
            avatar_color: 'indigo'
          });

        if (profileError) throw profileError;

        // Create default spaces
        const { data: personalSpace } = await supabase
          .from('spaces')
          .insert({
            title: 'Личное',
            icon: '👤',
            type: 'personal',
            owner_id: authData.user.id
          })
          .select()
          .single();

        const { data: sharedSpace } = await supabase
          .from('spaces')
          .insert({
            title: 'Пара',
            icon: '💑',
            type: 'shared',
            owner_id: authData.user.id
          })
          .select()
          .single();

        alert('Регистрация успешна! Проверьте email для подтверждения.');
        onAuthSuccess();
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">TwoDo</h1>
            <p className="text-slate-500">Планировщик для пар</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <Input
                label="Имя"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-full font-black text-lg shadow-xl disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-600 hover:text-black transition-colors"
            >
              {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
