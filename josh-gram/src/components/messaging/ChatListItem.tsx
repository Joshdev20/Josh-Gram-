"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

// Define the structure for a chat session to be listed
export interface ChatSession {
  chatId: string;
  users: string[]; // UIDs of participants
  userNames: { [uid: string]: string }; // Map UID to username
  userProfilePics: { [uid: string]: string | null }; // Map UID to profile pic
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageTimestamp?: Timestamp; // Firestore Timestamp
  updatedAt: Timestamp; // For sorting chats
  // unreadCount?: number; // Unread messages for the current user in this chat
}

interface ChatListItemProps {
  chatSession: ChatSession;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chatSession }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null; // Should not happen if on messages page

  // Determine the other user in the chat
  const otherUserId = chatSession.users.find(uid => uid !== currentUser.uid);
  if (!otherUserId) return null; // Should not happen in a 1:1 chat list

  const otherUserName = chatSession.userNames[otherUserId] || "User";
  const otherUserProfilePic = chatSession.userProfilePics[otherUserId];

  const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    // Simple time or date formatting
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const lastMessagePreview = chatSession.lastMessageText
    ? (chatSession.lastMessageSenderId === currentUser.uid ? "You: " : "") +
      (chatSession.lastMessageText.length > 30
        ? chatSession.lastMessageText.substring(0, 27) + "..."
        : chatSession.lastMessageText)
    : "No messages yet";

  return (
    <Link href={`/messages/${chatSession.chatId}`} className="block hover:bg-gray-100 transition-colors duration-150">
      <div className="flex items-center p-3 sm:p-4 border-b border-gray-200">
        <div className="relative mr-3 sm:mr-4">
          {otherUserProfilePic ? (
            <Image
              src={otherUserProfilePic}
              alt={otherUserName}
              width={48}
              height={48}
              className="rounded-full object-cover w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white_alt font-semibold text-xl">
              {otherUserName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Optional: Online status indicator */}
          {/* <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white_alt"></span> */}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <p className="text-sm font-semibold text-gray-800 truncate">{otherUserName}</p>
            <p className="text-xs text-gray-500">{formatTimestamp(chatSession.lastMessageTimestamp)}</p>
          </div>
          <p className="text-xs text-gray-600 truncate">
            {lastMessagePreview}
          </p>
        </div>
        {/* Optional: Unread message badge */}
        {/* {chatSession.unreadCount && chatSession.unreadCount > 0 && (
          <div className="ml-2">
            <span className="px-2 py-0.5 bg-pink-600 text-white_alt text-xs font-bold rounded-full">
              {chatSession.unreadCount}
            </span>
          </div>
        )} */}
      </div>
    </Link>
  );
};

export default ChatListItem;
