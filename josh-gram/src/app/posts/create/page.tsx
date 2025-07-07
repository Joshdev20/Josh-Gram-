"use client";

import CreatePostForm from '@/components/posts/CreatePostForm';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function CreatePostPage() {
  const { currentUser, loading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !currentUser) {
  //     // router.push('/login?redirect=/posts/create'); // Redirect to login if not authenticated
  //   }
  // }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-gray-700">Loading user...</p>
        {/* Add a spinner or skeleton loader here */}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
        <p className="text-xl text-gray-700 mb-4">You need to be logged in to create a post.</p>
        <Link href="/login?redirect=/posts/create" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Optional: Page Title outside the form component */}
        {/* <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Share something new
        </h1> */}
        <CreatePostForm />
         <p className="mt-8 text-center text-sm text-gray-600">
          Finished creating?{' '}
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Go to Home Feed
          </Link>
        </p>
      </div>
    </div>
  );
}
