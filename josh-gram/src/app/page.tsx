"use client"; // Required if using client-side hooks like useAuth or useEffect for auth checks

import Link from 'next/link';
import Image from 'next/image'; // For profile picture in header
import Feed from '@/components/feed/Feed';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { currentUser, loading } = useAuth();

  // Basic header component (can be moved to a layout file later)
  const AppHeader = () => (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity">
          Josh Gram
        </Link>
        <div className="flex items-center space-x-3 sm:space-x-4">
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          ) : currentUser ? (
            <>
              <Link href="/posts/create" className="text-gray-700 hover:text-pink-600 p-2 rounded-full hover:bg-pink-50 transition-colors" title="Create Post">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
              <Link href={`/profile/${currentUser.uid}`} className="text-gray-700 hover:text-pink-600 p-1 rounded-full hover:bg-pink-50 transition-colors" title="My Profile">
                {currentUser.photoURL ? (
                    <Image src={currentUser.photoURL} alt="Profile" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
              </Link>
              {/* Example Sign Out Button - Functionality to be added in AuthContext or here */}
              {/* <button onClick={() => getAuth().signOut()} className="text-sm text-gray-600 hover:text-pink-600">Sign Out</button> */}
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                Log In
              </Link>
              <Link
                href="/signup"
                className="ml-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-md hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="pt-2 pb-12"> {/* Reduced padding top slightly */}
        <Feed />
      </main>
      {/* <footer className="bg-white border-t border-gray-200 py-6 text-center mt-auto">
        <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Josh Gram. Built with Next.js & Firebase.</p>
      </footer> */}
    </div>
  );
}
