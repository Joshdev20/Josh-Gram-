"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import PostCard, { Post } from '@/components/posts/PostCard'; // Ensure PostCard and Post type are correctly imported

// Extending the Post type from PostCard to include Firestore specific fields if necessary for transformation
interface FirestorePostData {
    userId: string;
    username: string;
    userProfilePic?: string | null;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    likes: string[];
    comments: Array<{ userId: string; comment: string; createdAt: Timestamp }>; // Assuming createdAt in comment is Firestore Timestamp
    createdAt: Timestamp; // Firestore Timestamp
    updatedAt: Timestamp;
    // any other fields from Firestore
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const postsCollectionRef = collection(db, 'posts');
    // Query posts, ordered by creation date in descending order
    const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestorePostData;
        // Transform Firestore data to the Post type expected by PostCard
        // This includes converting Firestore Timestamps to a serializable format if needed,
        // but for direct use in components, Date objects are fine.
        // The PostCard already handles Date conversion for display.
        postsData.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          userProfilePic: data.userProfilePic,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          caption: data.caption,
          likes: data.likes || [], // Ensure likes is always an array
          comments: data.comments || [], // Ensure comments is always an array
          createdAt: data.createdAt, // Keep as Firestore Timestamp or convert as needed
        });
      });
      setPosts(postsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">Loading posts...</p>
        {/* You could add a spinner or skeleton loaders for posts here */}
        {/* Example: Array(3).fill(0).map((_, index) => <PostSkeleton key={index} />) */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-500">No posts yet. Be the first to share!</p>
        {/* Optionally, link to the create post page */}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

// Optional: Skeleton component for loading state
// const PostSkeleton = () => (
//   <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6 animate-pulse">
//     <div className="p-4 flex items-center space-x-3">
//       <div className="w-10 h-10 rounded-full bg-gray-300"></div>
//       <div>
//         <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
//         <div className="h-3 bg-gray-300 rounded w-16"></div>
//       </div>
//     </div>
//     <div className="w-full h-96 bg-gray-300"></div> {/* Media placeholder */}
//     <div className="p-4">
//       <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
//       <div className="h-4 bg-gray-300 rounded w-1/2"></div>
//     </div>
//   </div>
// );

export default Feed;
