"use client";

import React, { useEffect, useState, useRef, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebaseConfig';
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  setDoc,
  arrayUnion
} from 'firebase/firestore';

// Define structure for a single message
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null; // Null for pending messages
  imageUrl?: string;
}

// Define structure for Chat Room data (mostly for participant info)
interface ChatRoom {
    id: string;
    users: string[];
    userNames: { [uid: string]: string };
    userProfilePics: { [uid: string]: string | null };
}

// Simplified Header for Chat Room
const ChatRoomHeader = ({ chatRoom, otherUserId }: { chatRoom: ChatRoom | null, otherUserId: string | null }) => {
    const router = useRouter();
    if (!chatRoom || !otherUserId) {
        return ( // Fallback header
            <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200 h-16 flex items-center px-4">
                 <button onClick={() => router.back()} className="p-2 mr-2 text-gray-600 hover:text-pink-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="font-semibold text-gray-700">Chat</span>
            </header>
        );
    }

    const otherUserName = chatRoom.userNames[otherUserId] || "User";
    const otherUserProfilePic = chatRoom.userProfilePics[otherUserId];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200 h-16 flex items-center px-4">
            <button onClick={() => router.push('/messages')} className="p-2 mr-1 text-gray-600 hover:text-pink-600 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {otherUserProfilePic ? (
                <Image src={otherUserProfilePic} alt={otherUserName} width={36} height={36} className="h-9 w-9 rounded-full object-cover mr-3" />
            ) : (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white_alt font-semibold text-lg mr-3">
                    {otherUserName.charAt(0).toUpperCase()}
                </div>
            )}
            <Link href={`/profile/${otherUserId}`} className="font-semibold text-gray-800 hover:underline">
                {otherUserName}
            </Link>
            {/* Future: Add options like view profile, block user etc. */}
        </header>
    );
};


export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const chatId = params.chatId as string;

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const otherUserId = chatRoom?.users.find(uid => uid !== currentUser?.uid) || null;

  useEffect(() => {
    if (!chatId || !currentUser) {
        if(!authLoading) setLoadingRoom(false);
        return;
    }

    setLoadingRoom(true);
    // Fetch chat room details
    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribeChatRoom = onSnapshot(chatDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (!data.users.includes(currentUser.uid)) {
                setError("You are not a participant in this chat.");
                setChatRoom(null);
                setLoadingRoom(false);
                return;
            }
            setChatRoom({
                id: docSnap.id,
                users: data.users,
                userNames: data.userNames || {},
                userProfilePics: data.userProfilePics || {},
            });
        } else {
            setError("Chat room not found.");
            setChatRoom(null);
        }
        setLoadingRoom(false);
    }, err => {
        console.error("Error fetching chat room:", err);
        setError("Failed to load chat details.");
        setLoadingRoom(false);
    });

    // Fetch messages
    const messagesCollectionRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp as Timestamp,
          imageUrl: data.imageUrl,
        });
      });
      setMessages(msgs);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages."); // This might overwrite chat room error
    });

    return () => {
        unsubscribeChatRoom();
        unsubscribeMessages();
    };
  }, [chatId, currentUser, authLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !chatId || newMessage.trim() === '' || !otherUserId) return;

    setSending(true);
    try {
      const messageData = {
        senderId: currentUser.uid,
        receiverId: otherUserId, // Store receiver for potential notifications or specific queries
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        // imageUrl: null, // For future image support
      };

      // Add message to subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Update the parent chat document with last message info
      const chatDocRef = doc(db, 'chats', chatId);
      await setDoc(chatDocRef, {
          lastMessageText: newMessage.trim(),
          lastMessageSenderId: currentUser.uid,
          lastMessageTimestamp: serverTimestamp(), // Firestore server timestamp
          updatedAt: serverTimestamp(),
          // Ensure users, userNames, userProfilePics are preserved or updated if needed
          // This is important if this is the first message and the chat doc was just created
          users: arrayUnion(currentUser.uid, otherUserId), // Ensures both users are in the array
          // userNames, userProfilePics should be set when chat is initiated
      }, { merge: true });


      setNewMessage('');
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // Function to initiate a chat (could be called from a user profile page)
  // This is more of a utility function that would live elsewhere or be triggered by UI
  const startChat = async (targetUserId: string) => {
    if (!currentUser || currentUser.uid === targetUserId) return null;

    const sortedUserIds = [currentUser.uid, targetUserId].sort();
    const generatedChatId = sortedUserIds.join('_');

    const chatDocRef = doc(db, "chats", generatedChatId);
    const chatDocSnap = await getDoc(chatDocRef);

    if (!chatDocSnap.exists()) {
        // Fetch user profiles to store names and pics
        const currentUserProfileSnap = await getDoc(doc(db, "users", currentUser.uid));
        const targetUserProfileSnap = await getDoc(doc(db, "users", targetUserId));

        if (!currentUserProfileSnap.exists() || !targetUserProfileSnap.exists()) {
            console.error("One or both user profiles not found for creating chat.");
            return null;
        }
        const currentUserData = currentUserProfileSnap.data();
        const targetUserData = targetUserProfileSnap.data();

        await setDoc(chatDocRef, {
            users: sortedUserIds,
            userNames: {
                [currentUser.uid]: currentUserData.username || "User",
                [targetUserId]: targetUserData.username || "User",
            },
            userProfilePics: {
                [currentUser.uid]: currentUserData.photoURL || null,
                [targetUserId]: targetUserData.photoURL || null,
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
    router.push(`/messages/${generatedChatId}`);
    return generatedChatId;
  };


  if (authLoading || loadingRoom) {
    return (
      <div className="h-screen flex flex-col">
        <ChatRoomHeader chatRoom={null} otherUserId={null} />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error && !chatRoom) { // If error and chatRoom couldn't be loaded at all
    return (
      <div className="h-screen flex flex-col">
        <ChatRoomHeader chatRoom={null} otherUserId={null} />
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/messages" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  if (!currentUser) { // Should be caught by authLoading or redirect from messages list
      router.push('/login?redirect=/messages');
      return <p>Redirecting to login...</p>;
  }


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ChatRoomHeader chatRoom={chatRoom} otherUserId={otherUserId} />

      {/* Display error related to messages if chatRoom itself loaded */}
      {error && chatRoom && <p className="p-2 text-center text-red-500 bg-red-100">{error}</p>}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${
                msg.senderId === currentUser.uid
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-800 shadow-sm border border-gray-200'
            }`}>
              <p className="text-sm">{msg.text}</p>
              {msg.timestamp && (
                <p className={`text-xs mt-1 ${
                    msg.senderId === currentUser.uid ? 'text-pink-100' : 'text-gray-400'
                } text-right`}>
                  {msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-3 sm:p-4 flex items-center sticky bottom-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 text-sm focus:ring-pink-500 focus:border-pink-500 outline-none"
          disabled={sending || !chatRoom}
        />
        <button
            type="submit"
            disabled={sending || newMessage.trim() === '' || !chatRoom}
            className="ml-2 sm:ml-3 p-2.5 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:opacity-50 transition-colors"
        >
          {sending ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
