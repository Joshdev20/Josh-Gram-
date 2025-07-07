"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useRouter for navigation if needed
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import PostCard, { Post as PostType } from '@/components/posts/PostCard'; // Re-using PostCard

// Define a type for User Profile data from Firestore
interface UserProfile {
  uid: string;
  username: string;
  email?: string; // Optional, depending on your privacy settings
  bio?: string;
  photoURL?: string | null;
  createdAt: Timestamp; // Or appropriate type if you transform it
  followers: string[];
  following: string[];
}

// Extending the Post type from PostCard to include Firestore specific fields if necessary for transformation
interface FirestorePostData {
    userId: string;
    username: string;
    userProfilePic?: string | null;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    likes: string[];
    comments: Array<{ userId: string; comment: string; createdAt: Timestamp }>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// A simplified header for profile pages, can be expanded or merged with main AppHeader
const ProfilePageHeader = () => {
    const { currentUser } = useAuth();
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
            <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity">
                Josh Gram
            </Link>
            <div className="flex items-center space-x-3 sm:space-x-4">
                {currentUser && (
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
                </>
                )}
            </div>
            </nav>
        </header>
    );
};


export default function UserProfilePage() {
  const params = useParams();
  const { currentUser: loggedInUser } = useAuth(); // Logged-in user
  const userId = params.userId as string; // User whose profile is being viewed

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement Follow/Unfollow state and logic
  // const [isFollowing, setIsFollowing] = useState(false);
  // const [followersCount, setFollowersCount] = useState(0);
  // const [followingCount, setFollowingCount] = useState(0);


  useEffect(() => {
    if (!userId) return;

    setLoadingProfile(true);
    setError(null);

    const userDocRef = doc(db, 'users', userId);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profileData = docSnap.data() as UserProfile;
        setUserProfile(profileData);
        // setFollowersCount(profileData.followers?.length || 0);
        // setFollowingCount(profileData.following?.length || 0);
        // if (loggedInUser) {
        //   setIsFollowing(profileData.followers?.includes(loggedInUser.uid) || false);
        // }
      } else {
        setError(`Profile not found for user ID: ${userId}. It's possible the user doesn't exist or hasn't completed their profile setup.`);
        setUserProfile(null);
      }
      setLoadingProfile(false);
    }, (err) => {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile.");
      setLoadingProfile(false);
    });

    return () => unsubscribeUser();
  }, [userId, loggedInUser]);

  useEffect(() => {
    if (!userId) return;

    setLoadingPosts(true);
    const postsCollectionRef = collection(db, 'posts');
    const q = query(postsCollectionRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const userPosts: PostType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestorePostData;
        userPosts.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          userProfilePic: data.userProfilePic,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          caption: data.caption,
          likes: data.likes || [],
          comments: data.comments || [],
          createdAt: data.createdAt,
        });
      });
      setPosts(userPosts);
      setLoadingPosts(false);
    }, (err) => {
      console.error("Error fetching user posts:", err);
      // setError("Failed to load posts."); // Avoid overwriting profile error
      setLoadingPosts(false);
    });

    return () => unsubscribePosts();
  }, [userId]);

  // const handleFollow = async () => { /* ... */ };
  // const handleUnfollow = async () => { /* ... */ };
  // const handleEditProfile = () => { /* router.push(`/profile/${userId}/edit`) */ };


  if (loadingProfile) {
    return (
      <>
        <ProfilePageHeader />
        <div className="text-center py-20">
          <p className="text-lg text-gray-600">Loading profile...</p>
          {/* Add skeleton loader for profile header */}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProfilePageHeader />
        <div className="text-center py-10 max-w-md mx-auto">
          <p className="text-lg text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
          <Link href="/" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Go to Home
          </Link>
        </div>
      </>
    );
  }

  if (!userProfile) {
    // This case might be covered by the error state if profile isn't found after loading.
    return (
        <>
            <ProfilePageHeader />
            <div className="text-center py-20"><p>User profile not available.</p></div>
        </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfilePageHeader />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Profile Header Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8 pb-8 border-b border-gray-200">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mr-0 sm:mr-8 mb-4 sm:mb-0 flex-shrink-0">
            {userProfile.photoURL ? (
              <Image src={userProfile.photoURL} alt={userProfile.username} layout="fill" objectFit="cover" />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white_alt text-4xl font-semibold">
                {userProfile.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{userProfile.username}</h1>
            {/* Stats: Posts, Followers, Following - Placeholder values */}
            <div className="flex justify-center sm:justify-start space-x-6 text-gray-600 mb-3">
              <span><span className="font-semibold">{posts.length}</span> posts</span>
              <span><span className="font-semibold">{userProfile.followers?.length || 0}</span> followers</span>
              <span><span className="font-semibold">{userProfile.following?.length || 0}</span> following</span>
            </div>
            <p className="text-sm text-gray-700 mb-4 max-w-md">{userProfile.bio || "No bio yet."}</p>

            {/* Action Buttons */}
            {loggedInUser && loggedInUser.uid === userId ? (
              <Link href={`/profile-setup`} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                Edit Profile
              </Link>
            ) : loggedInUser ? (
              // TODO: Follow/Unfollow Button based on `isFollowing` state
              <button
                // onClick={isFollowing ? handleUnfollow : handleFollow}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                //   isFollowing
                //   ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                //   : 'bg-blue-500 text-white_alt hover:bg-blue-600'
                'bg-blue-500 text-white hover:bg-blue-600' // Default to Follow
                }`}
              >
                {/* {isFollowing ? 'Unfollow' : 'Follow'} */}
                Follow {/* Placeholder */}
              </button>
            ) : null}
          </div>
        </div>

        {/* User's Posts Grid/List */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center sm:text-left">Posts</h2>
        {loadingPosts ? (
          <p className="text-gray-600 text-center">Loading posts...</p>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-4">
            {/* Using a simplified post display for profile grid, or reuse PostCard with adjustments */}
            {posts.map((post) => (
              post.mediaType === 'image' ? (
                <div key={post.id} className="aspect-square relative overflow-hidden rounded group">
                  <Image src={post.mediaUrl} alt={post.caption || 'User post'} layout="fill" objectFit="cover" />
                  {/* Optional: Overlay on hover to show likes/comments count */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    {/* <div className="text-white_alt text-sm">
                      <span>❤️ {post.likes.length}</span> <span>💬 {post.comments.length}</span>
                    </div> */}
                  </div>
                </div>
              ) : ( // Basic display for videos in grid, could be improved
                <div key={post.id} className="aspect-square relative overflow-hidden rounded group bg-black">
                   <video src={post.mediaUrl} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    {/* <div className="text-white_alt text-sm">
                      <span>▶️</span>
                    </div> */}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">This user hasn&apos;t posted anything yet.</p>
        )}
      </main>
    </div>
  );
}
