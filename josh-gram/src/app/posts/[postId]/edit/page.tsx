"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import EditPostForm from '@/components/posts/EditPostForm';
import { useAuth } from '@/context/AuthContext';

// Simplified Header for this page
const EditPageHeader = () => {
    const { currentUser } = useAuth();
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
            <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity">
                Josh Gram
            </Link>
            {currentUser && (
                <Link href={`/profile/${currentUser.uid}`} className="text-gray-700 hover:text-pink-600 p-1 rounded-full hover:bg-pink-50 transition-colors" title="My Profile">
                    {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </Link>
            )}
            </nav>
        </header>
    );
};


export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const postId = params.postId as string;

  if (authLoading) {
    return (
      <>
        <EditPageHeader />
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col justify-center items-center">
          <p className="text-gray-700">Loading user information...</p>
        </div>
      </>
    );
  }

  if (!currentUser) {
    // User is not logged in, redirect them.
    // It's better to do this with a useEffect in a real app to avoid flash of content.
    // router.push(`/login?redirect=/posts/${postId}/edit`);
    return (
      <>
        <EditPageHeader />
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
          <p className="text-xl text-gray-700 mb-4">You need to be logged in to edit posts.</p>
          <button onClick={() => router.push(`/login?redirect=/posts/${postId}/edit`)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go to Login
          </button>
        </div>
      </>
    );
  }

  if (!postId) {
    return (
        <>
            <EditPageHeader />
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
                <p className="text-xl text-red-600 mb-4">No post ID specified.</p>
                <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Go to Home
                </Link>
            </div>
        </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
        <EditPageHeader />
        <main className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <EditPostForm postId={postId} />
            </div>
        </main>
    </div>
  );
}
