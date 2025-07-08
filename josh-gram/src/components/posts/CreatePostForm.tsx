"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import next/image

const CreatePostForm = () => {
  const { currentUser } = useAuth();
  // const router = useRouter();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null); // 'image' or 'video'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 25 * 1024 * 1024) { // Max 25MB for example
        setError("File is too large. Max size is 25MB.");
        setFile(null);
        setFilePreview(null);
        setFileType(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      setFileType(selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to create a post.");
      return;
    }
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!fileType) {
        setError("Invalid file type. Please select an image or video.");
        return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Fetch user profile to get username and profile picture
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("User profile not found. Please complete your profile setup.");
      }
      const userData = userDocSnap.data();

      const storageRef = ref(storage, `posts/${currentUser.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (uploadError) => { // Type for uploadError is StorageError from firebase/storage
          console.error("Upload error:", uploadError);
          setError(`Upload failed: ${uploadError.message || 'Unknown storage error'}`);
          setLoading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            await addDoc(collection(db, "posts"), {
              userId: currentUser.uid,
              username: userData.username || "Anonymous", // Fallback if username not set
              userProfilePic: userData.photoURL || null, // Fallback if photoURL not set
              mediaUrl: downloadURL,
              mediaType: fileType, // 'image' or 'video'
              caption: caption.trim(),
              likes: [],
              comments: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            console.log("Post created successfully!");
            setCaption('');
            setFile(null);
            setFilePreview(null);
            setFileType(null);
            setUploadProgress(0);
            // router.push('/'); // Redirect to feed or user's profile
          } catch (firestoreError) {
            console.error("Error saving post to Firestore:", firestoreError);
            if (firestoreError instanceof Error) {
              setError(`Error saving post: ${firestoreError.message}`);
            } else {
              setError("An unknown error occurred while saving the post to database.");
            }
          } finally {
            setLoading(false);
          }
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while creating the post.");
      }
      console.error("Error creating post:", err);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-lg rounded-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center text-gray-800">Create New Post</h2>

      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
          Caption
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Write a caption..."
        />
      </div>

      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Photo or Video
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        {file && <p className="mt-1 text-xs text-gray-500">Selected: {file.name} ({fileType})</p>}
      </div>

      {filePreview && (
        <div className="mt-4 border border-gray-200 rounded-md p-2">
          <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
          {fileType === 'image' &&
            <div className="relative w-full max-w-xs mx-auto aspect-square"> {/* Added container for layout */}
              <Image src={filePreview} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" />
            </div>
          }
          {fileType === 'video' && <video src={filePreview} controls className="max-h-60 w-auto rounded-md mx-auto">Your browser does not support the video tag.</video>}
        </div>
      )}

      {loading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          <p className="text-xs text-center text-gray-600 mt-1">{Math.round(uploadProgress)}%</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600 text-center py-2 bg-red-50 rounded-md">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={loading || !currentUser || !file}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating Post...' : 'Create Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;
