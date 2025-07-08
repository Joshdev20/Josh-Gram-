"use client";

import React, { useState, useEffect } from 'react'; // Added useEffect back just in case, will re-lint later
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, serverTimestamp, getDoc, FieldValue } from 'firebase/firestore'; // Added getDoc back and FieldValue
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebaseConfig';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Correctly placed import for Next.js Image

const ProfileSetupForm = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        setLoading(true);
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsername(userData.username || '');
          setBio(userData.bio || '');
          setIsEditing(true);
        } else {
          setIsEditing(false);
        }
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [currentUser]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("No user logged in.");
      return;
    }
    if (!username.trim()) {
        setError("Username is required.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      let photoURL = currentUser.photoURL || '';
      if (photo) {
        const photoRef = ref(storage, `profilePictures/${currentUser.uid}/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      interface UserProfileUpdateData {
        uid: string;
        email?: string | null;
        username: string;
        bio: string;
        photoURL: string;
        updatedAt: FieldValue;
        createdAt?: FieldValue;
        followers?: string[];
        following?: string[];
      }

      const userProfileData: UserProfileUpdateData = {
        uid: currentUser.uid,
        email: currentUser.email,
        username: username.trim(),
        bio: bio.trim(),
        photoURL,
        updatedAt: serverTimestamp(),
      };

      if (!isEditing) {
        userProfileData.createdAt = serverTimestamp();
        userProfileData.followers = [];
        userProfileData.following = [];
      }

      await setDoc(doc(db, "users", currentUser.uid), userProfileData, { merge: true });

      console.log(isEditing ? "Profile updated successfully!" : "Profile created successfully!");
      router.push(`/profile/${currentUser.uid}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while saving the profile.");
      }
      console.error("Error setting up profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold text-center text-gray-900">Setup Your Profile</h2>

      <div className="flex flex-col items-center space-y-2">
        {photoPreview ? (
          <Image src={photoPreview} alt="Profile Preview" width={128} height={128} className="w-32 h-32 rounded-full object-cover" />
        ) : currentUser?.photoURL ? (
            <Image src={currentUser.photoURL} alt="Current Profile" width={128} height={128} className="w-32 h-32 rounded-full object-cover" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Photo
          </div>
        )}
        <label htmlFor="photo-upload" className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          Upload Profile Photo
        </label>
        <input
          id="photo-upload"
          name="photo-upload"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="sr-only"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., joshua_g"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Tell us a little about yourself"
        />
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={loading || !currentUser}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
        >
          {loading ? 'Saving Profile...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileSetupForm;
