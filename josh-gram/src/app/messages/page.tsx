"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import ChatListItem, { ChatSession } from '@/components/messaging/ChatListItem';

// Simplified Header for Messages Page
const MessagesPageHeader = () => {
    const { currentUser } = useAuth();
    return (
        <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
            <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity">
                    Josh Gram
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-700 text-base sm:text-lg">Messages</span>
                    {currentUser && (
                        <Link href={`/profile/${currentUser.uid}`} className="text-gray-700 hover:text-pink-600 p-1 rounded-full hover:bg-pink-50 transition-colors" title="My Profile">
                            {currentUser.photoURL ? (
                                <Image src={currentUser.photoURL} alt="Profile" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};


export default function MessagesListPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      if (!authLoading) { // Only set loading to false if auth is also done loading
          setLoadingChats(false);
          // Optionally redirect to login or show a "please login" message
      }
      return;
    }

    setLoadingChats(true);
    const chatsCollectionRef = collection(db, 'chats');
    // Query chats where the current user is a participant, ordered by the last message timestamp
    const q = query(
      chatsCollectionRef,
      where('users', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc') // Assuming 'updatedAt' is updated with each new message
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessions: ChatSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          chatId: doc.id,
          users: data.users,
          userNames: data.userNames || {},
          userProfilePics: data.userProfilePics || {},
          lastMessageText: data.lastMessageText,
          lastMessageSenderId: data.lastMessageSenderId,
          lastMessageTimestamp: data.lastMessageTimestamp as Timestamp, // Cast if necessary
          updatedAt: data.updatedAt as Timestamp, // Cast if necessary
        });
      });
      setChatSessions(sessions);
      setLoadingChats(false);
    }, (err) => {
      console.error("Error fetching chat sessions:", err);
      setError("Failed to load your messages. Please try again.");
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  if (authLoading || loadingChats) {
    return (
        <>
            <MessagesPageHeader />
            <div className="text-center py-20">
                <p className="text-lg text-gray-600">Loading messages...</p>
                {/* Skeleton loaders for chat list items could go here */}
            </div>
        </>
    );
  }

  if (!currentUser) {
     return (
        <>
            <MessagesPageHeader />
            <div className="text-center py-20 max-w-md mx-auto">
                <p className="text-lg text-gray-700 mb-4">Please log in to view your messages.</p>
                <Link href="/login?redirect=/messages" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Go to Login
                </Link>
            </div>
        </>
     );
  }

  if (error) {
    return (
        <>
            <MessagesPageHeader />
            <div className="text-center py-10 text-red-500 bg-red-100 p-4 rounded max-w-md mx-auto">{error}</div>
        </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MessagesPageHeader />
      <div className="flex-grow max-w-2xl w-full mx-auto">
        {chatSessions.length === 0 ? (
          <div className="text-center py-20 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg text-gray-500 mb-2">No messages yet.</p>
            <p className="text-sm text-gray-400">Start a conversation with someone from their profile.</p>
            {/* Optionally, a button to find users to message */}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 sm:rounded-lg sm:shadow-sm overflow-hidden mt-0 sm:mt-4">
            {chatSessions.map((session) => (
              <ChatListItem key={session.chatId} chatSession={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
