"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // For redirecting after edit
import { Post as PostType } from './PostCard'; // Assuming PostType is exported from PostCard

interface EditPostFormProps {
  postId: string;
}

const EditPostForm: React.FC<EditPostFormProps> = ({ postId }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [originalCaption, setOriginalCaption] = useState('');
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || !currentUser) {
      setError("Post ID is missing or user not authenticated.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      try {
        const postRef = doc(db, "posts", postId);
        const docSnap = await getDoc(postRef);

        if (docSnap.exists()) {
          const postData = docSnap.data() as PostType;
          if (postData.userId !== currentUser.uid) {
            setError("You are not authorized to edit this post.");
            setPost(null);
          } else {
            setPost(postData);
            setCaption(postData.caption || '');
            setOriginalCaption(postData.caption || '');
          }
        } else {
          setError("Post not found.");
          setPost(null);
        }
      } catch (err: any) {
        console.error("Error fetching post for editing:", err);
        setError("Failed to load post data for editing.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !post || post.userId !== currentUser.uid) {
      setError("Cannot save. User not authorized or post not loaded.");
      return;
    }

    if (caption.trim() === originalCaption.trim()) {
        setError("No changes made to the caption.");
        // Optionally, allow "saving" even if no change, or disable button
        return;
    }

    setSaving(true);
    setError(null);

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        caption: caption.trim(),
        updatedAt: serverTimestamp(),
      });
      console.log("Post caption updated successfully!");
      router.push(`/profile/${currentUser.uid}`); // Or router.back() or router.push(`/posts/${postId}`)
    } catch (err: any) {
      console.error("Error updating post:", err);
      setError(`Failed to update post: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10"><p>Loading post for editing...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 bg-red-100 p-4 rounded max-w-md mx-auto">{error}</div>;
  }

  if (!post) {
    return <div className="text-center py-10"><p>Post data could not be loaded.</p></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-lg rounded-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Edit Post</h2>

      {/* Display media (non-editable for now) */}
      {post.mediaUrl && (
        <div className="mt-4 border border-gray-200 rounded-md p-2">
          <p className="text-sm font-medium text-gray-700 mb-1">Media (cannot be changed):</p>
          {post.mediaType === 'image' && <img src={post.mediaUrl} alt="Post media" className="max-h-60 w-auto rounded-md mx-auto" />}
          {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="max-h-60 w-auto rounded-md mx-auto">Your browser does not support the video tag.</video>}
        </div>
      )}

      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
          Caption
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Write a caption..."
        />
      </div>

      {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>} {/* Display submit error */}

      <div className="flex items-center justify-end space-x-3">
        <button
            type="button"
            onClick={() => router.back()} // Or specific path like `/profile/${currentUser?.uid}`
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={saving}
        >
            Cancel
        </button>
        <button
          type="submit"
          disabled={saving || loading || caption.trim() === originalCaption.trim()}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditPostForm;
