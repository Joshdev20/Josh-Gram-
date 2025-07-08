import React from 'react';
import Image from 'next/image'; // Using Next.js Image for optimization
import Link from 'next/link'; // Import Link
import { Timestamp } from 'firebase/firestore'; // For typing createdAt fields

// Define a type for the Post data
export interface Post {
  id: string;
  userId: string;
  username: string;
  userProfilePic?: string | null;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  likes: string[]; // Array of user IDs who liked the post
  comments: Array<{ userId: string; comment: string; createdAt: Timestamp | null }>; // Define comment structure
  createdAt: Timestamp | null; // Firestore Timestamp or serverTimestamp() can be null before server sets it
  // Add any other fields like location, tags, etc.
}

import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useState } from 'react'; // For loading/error states on delete

interface PostCardProps {
  post: Post;
  // Add functions for like, comment, share, etc. as props if actions are handled by parent
  // onLike: (postId: string) => void;
  // onComment: (postId: string, commentText: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { currentUser } = useAuth();
  const { id: postId, userId, username, userProfilePic, mediaUrl, mediaType, caption, likes, createdAt } = post;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Format timestamp (basic example, consider using a library like date-fns for more complex formatting)
  const formattedDate = createdAt?.toDate ? new Date(createdAt.toDate()).toLocaleDateString() : 'Just now';

  const handleDeletePost = async () => {
    if (!currentUser || currentUser.uid !== userId) {
      setDeleteError("You can only delete your own posts.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 1. Delete media from Firebase Storage
      // Ensure mediaUrl is a valid URL. If it's from Firebase Storage, we can derive the path.
      // This is a simplified way; robust parsing might be needed if URLs vary.
      if (mediaUrl.includes("firebasestorage.googleapis.com")) {
        const storageRef = ref(storage, mediaUrl); // This works if mediaUrl is the full gs:// or https:// URL
        await deleteObject(storageRef).catch(storageError => {
          // Log storage error but attempt to delete Firestore doc anyway, or handle more gracefully
          console.warn("Could not delete media from storage or already deleted:", storageError);
        });
      }

      // 2. Delete post document from Firestore
      await deleteDoc(doc(db, "posts", postId));

      console.log("Post deleted successfully");
      // Optionally, trigger a state update in the parent component (Feed) to remove the post from UI immediately
      // This might not be necessary if the Feed component re-fetches or listens to real-time updates that reflect the deletion.
    } catch (error) {
      console.error("Error deleting post: ", error);
      if (error instanceof Error) {
        setDeleteError(`Failed to delete post: ${error.message}`);
      } else {
        setDeleteError("An unknown error occurred while deleting the post.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Post Header */}
      <div className="p-4 flex items-center space-x-3">
        {userProfilePic ? (
          <Image
            src={userProfilePic}
            alt={`${username}'s profile`}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white_alt font-semibold">
            {username?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-gray-800">{username}</p>
          {/* Optional: Add post location or other info here */}
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        {/* More options icon (three dots) - now includes Delete button */}
        {currentUser && currentUser.uid === userId && (
          <div className="ml-auto relative">
            {/* Basic button for now, can be styled as three dots icon */}
            <button
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 disabled:opacity-50"
              aria-label="Delete post"
            >
              {isDeleting ? (
                <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                // Delete Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
            <Link href={`/posts/${postId}/edit`} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600" title="Edit post">
              {/* Edit Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>
            {/* This simple layout places buttons side-by-side. A dropdown would be better for more options. */}
          </div>
        )}
      </div>

      {deleteError && <p className="px-4 pb-2 text-xs text-red-500 text-right">{deleteError}</p>}

      {/* Post Media */}
      <div className="w-full">
        {mediaType === 'image' && (
          <div className="relative w-full" style={{ paddingTop: '100%' /* Aspect ratio 1:1 */ }}>
            <Image
              src={mediaUrl}
              alt={caption || `Post by ${username}`}
              layout="fill"
              objectFit="cover"
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        )}
        {mediaType === 'video' && (
          <video
            src={mediaUrl}
            controls
            className="w-full h-auto max-h-[70vh]" // Max height for videos
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Post Actions (Like, Comment, Share) - Basic Placeholders */}
      <div className="p-4">
        <div className="flex space-x-4 mb-2">
          <button aria-label="Like post" className="flex items-center space-x-1 text-gray-700 hover:text-red-500">
            {/* SVG Icon for Like (Heart) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {/* <span className="text-sm">{likes.length}</span> */}
          </button>
          <button aria-label="Comment on post" className="flex items-center space-x-1 text-gray-700 hover:text-indigo-500">
            {/* SVG Icon for Comment */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" />
            </svg>
          </button>
          {/* Optional: Share Button */}
        </div>
        {likes.length > 0 && (
            <p className="text-sm font-semibold text-gray-800 mb-1">{likes.length} like{likes.length !== 1 && 's'}</p>
        )}

        {/* Caption */}
        {caption && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold mr-1">{username}</span>
            {caption}
          </p>
        )}

        {/* View Comments Link - Placeholder */}
        {/* {post.comments.length > 0 && (
          <button className="text-sm text-gray-500 mt-1 hover:underline">
            View all {post.comments.length} comments
          </button>
        )} */}

        {/* Add Comment Input - Placeholder */}
        {/* <div className="mt-3">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full text-sm border-none p-0 focus:ring-0"
          />
        </div> */}
      </div>
    </div>
  );
};

export default PostCard;
