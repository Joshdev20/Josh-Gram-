"use client";

import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/firebaseConfig';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const GoogleSignInButton = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;
      // The signed-in user info.
      // const user = result.user;
      console.log('User signed in with Google successfully!', result.user);
      // Handle successful sign-in (e.g., redirect to profile setup or home)
      // router.push('/'); // Example redirect
    } catch (err: any) {
      setError(err.message);
      console.error("Error with Google Sign-In:", err);
      // Handle specific errors like popup closed by user, etc.
      // if (err.code === 'auth/popup-closed-by-user') { ... }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
          <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
        </svg>
        <span>Sign in with Google</span>
      </button>
      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
    </div>
  );
};

export default GoogleSignInButton;
