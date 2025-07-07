# Josh Gram - Agent Instructions

This document contains instructions and conventions for AI agents working on the Josh Gram project.

## Project Overview

Josh Gram is a social media web application, similar to Instagram, built with Next.js, Tailwind CSS, and Firebase.

## Development Guidelines

1.  **Firebase Configuration**:
    *   The Firebase configuration is located in `src/firebaseConfig.ts`.
    *   Ensure that placeholder values are replaced with actual Firebase project credentials before deployment or testing features that require Firebase services.
2.  **UI Preservation**:
    *   The existing UI design and the app name "Josh Gram" must be preserved. No redesigns unless explicitly requested.
3.  **Modularity and Scalability**:
    *   Write code that is modular and can be easily extended for future features.
4.  **Security**:
    *   Implement and test Firestore security rules thoroughly.
5.  **Commits**:
    *   Follow conventional commit message formats.
6.  **Dependencies**:
    *   Install any new dependencies within the `josh-gram` directory.

## Tech Stack

*   **Frontend**: Next.js (with TypeScript, App Router), Tailwind CSS
*   **Backend/Services**: Firebase (Firestore, Firebase Auth, Cloud Storage, Firebase Functions)
*   **Hosting/Deployment**: Vercel (frontend), Firebase Hosting/Functions (backend)

## Key Features (High-Level)

*   Authentication (Google, Email/Password)
*   Photo/Video Uploads
*   Feeds (Global & User-Specific)
*   Stories
*   Comments & Likes
*   Follow/Unfollow
*   Notifications
*   Search
*   User Profiles
*   Direct Messaging (Optional)
*   Admin Dashboard (Optional)

Remember to update this file if new conventions or important project-specific information arises.
