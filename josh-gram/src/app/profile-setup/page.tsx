"use client"; // This page uses client-side hooks like useAuth and potentially useRouter

import ProfileSetupForm from '@/components/auth/ProfileSetupForm';
import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation'; // For App Router, if redirection is needed
import Link from 'next/link';
import React from 'react'; // Removed useEffect

export default function ProfileSetupPage() {
  const { currentUser, loading } = useAuth();
  // const router = useRouter(); // For App Router

  // useEffect(() => {
  //   // If not loading and no user, redirect to login
  //   if (!loading && !currentUser) {
  //     router.push('/login');
  //   }
  //   // Optional: If user already has a profile, redirect to home or dashboard
  //   // This would require fetching profile data and checking if it exists
  // }, [currentUser, loading, router]); // This useEffect was unused

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <p className="text-lg text-gray-700">Loading...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (!currentUser) {
    // This case should ideally be handled by the useEffect redirect,
    // but as a fallback or if useEffect is commented out:
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <p className="text-lg text-gray-700 mb-4">You need to be logged in to set up your profile.</p>
        <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="mb-8 text-center text-5xl font-extrabold text-white_alt shadow-text">
          Welcome to Josh Gram!
        </h1>
      </div>

      <div className="w-full max-w-lg">
        <ProfileSetupForm />
         <p className="mt-8 text-center text-sm text-gray-200">
            Want to do this later?{' '}
            <Link href="/" className="font-medium text-indigo-300 hover:text-indigo-100">
              Skip and go to Home
            </Link>
          </p>
      </div>
    </div>
  );
}

// Basic text shadow for the title for better readability on gradient
// Add this to your globals.css or a relevant CSS module if you want to make it more complex:
// .shadow-text {
//   text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
// }
// For simplicity, Tailwind doesn't have a direct text-shadow utility by default without plugins.
// Inline style would be an option too: style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
// However, for this example, I'm using a placeholder class `text-white_alt` which you'd define.
// Let's assume you have a white color that works well or you adjust as needed.
// For the gradient, ensure your tailwind.config.js is set up if you use custom gradients/colors often.
// For now, I'll add a simple white text color class.
// In your globals.css, you might have:
// .text-white_alt { color: white; }
// .shadow-text { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
// Let's assume text-white is sufficient from Tailwind defaults.
// The gradient classes `from-purple-600 via-pink-500 to-red-500` are standard Tailwind.
