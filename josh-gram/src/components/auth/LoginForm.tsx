"use client";

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/firebaseConfig'; // Assuming firebaseConfig is correctly set up
import GoogleSignInButton from './GoogleSignInButton';

const auth = getAuth(app);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Handle successful login (e.g., redirect to home)
      console.log('User logged in successfully!');
      // router.push('/'); // Example redirect, ensure 'router' is available if used
    } catch (err: any) {
      setError(err.message);
      console.error("Error logging in:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">Login to Josh Gram</h2>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div>
        <GoogleSignInButton />
      </div>
    </form>
  );
};

export default LoginForm;
