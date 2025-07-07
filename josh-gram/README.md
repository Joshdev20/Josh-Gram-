# Josh Gram - Instagram Clone

Josh Gram is a full-stack social media web application modeled after Instagram, built with a modern tech stack focusing on Firebase and Vercel.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features Implemented](#features-implemented)
- [Firebase Setup](#firebase-setup)
- [Environment Variables](#environment-variables)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Deployment](#deployment)
  - [Frontend (Vercel)](#frontend-vercel)
  - [Backend/Firebase Rules](#backendfirebase-rules)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)

## Project Overview

This project aims to replicate core Instagram functionalities, providing users with a platform to share photo/video posts, interact with content, and connect with other users. The backend is powered by Firebase, and the frontend is a Next.js application hosted on Vercel.

## Tech Stack

- **Frontend**: Next.js (React framework with App Router), TypeScript, Tailwind CSS
- **Backend & Services**:
  - **Database**: Firebase Firestore
  - **Authentication**: Firebase Authentication (Email/Password, Google Sign-In)
  - **Storage**: Firebase Cloud Storage (for images, videos)
  - **Serverless Functions**: Firebase Functions (planned for notifications, background tasks - not yet implemented)
- **Hosting**:
  - **Frontend**: Vercel
  - **Backend Services**: Firebase
- **Styling**: Tailwind CSS
- **State Management**: React Context API (`AuthContext`), component state

## Features Implemented

### Core Features:
- **Authentication**:
  - User Sign-up (Email/Password, Google)
  - User Login (Email/Password, Google)
  - Password Reset
  - Persistent User Sessions
  - Profile Onboarding/Editing (username, bio, profile picture)
- **Social Features**:
  - **Post Creation**: Upload photos/videos with captions.
  - **Global Feed**: View posts from all users, sorted chronologically.
  - **Post Deletion**: Users can delete their own posts.
  - **Post Editing**: Users can edit the caption of their own posts.
- **Profile System**:
  - Dynamic User Profile Pages (`/profile/[userId]`) displaying user info and their posts.
  - Link from user's own profile to edit profile page.

### Optional Features (MVP):
- **Direct Messaging (DM)**:
  - List active chat sessions.
  - 1:1 chat rooms with real-time messaging.
  - Send and receive text messages.

## Firebase Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g., "josh-gram").
2.  **Enable Services**:
    - **Authentication**: Enable Email/Password and Google sign-in providers.
    - **Firestore**: Create a Firestore database. Start in test mode or configure security rules.
    - **Storage**: Enable Firebase Cloud Storage.
3.  **Get Config**: From your Firebase project settings, find your web app's Firebase configuration object.
4.  **Security Rules**: Deploy the `firestore.rules` and `storage.rules` files located in the project root using the Firebase CLI.
    ```bash
    firebase deploy --only firestore:rules
    firebase deploy --only storage
    ```
5.  **Indexes**: Deploy Firestore indexes if prompted by the console or if complex queries are added.
    ```bash
    firebase deploy --only firestore:indexes
    ```

## Environment Variables

The application requires Firebase configuration keys to be set as environment variables. Create a `.env.local` file in the `josh-gram` root directory for local development:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional)
```

Replace `your_...` with your actual Firebase project configuration values. For Vercel deployment, these variables must be set in the Vercel project settings.

## Getting Started (Local Development)

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd josh-gram
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Set up Environment Variables**: Create a `.env.local` file as described above.
4.  **Run the development server**:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The application will be available at `http://localhost:3000`.

## Deployment

### Frontend (Vercel)
1.  Push your code to a Git provider (GitHub, GitLab, Bitbucket).
2.  Go to [Vercel](https://vercel.com) and create a new project, linking it to your Git repository.
3.  Configure the **Environment Variables** in your Vercel project settings as listed above.
4.  Vercel will automatically build and deploy your Next.js application upon pushes to the main branch (or configured branches).

### Backend/Firebase Rules
Firebase services (Firestore rules, Storage rules, Functions) are deployed using the Firebase CLI.
```bash
# Login to Firebase (if not already)
firebase login

# Deploy specific parts or all
firebase deploy --only firestore # Deploys rules and indexes
firebase deploy --only storage   # Deploys storage rules
# firebase deploy --only functions # If Firebase Functions are added
```

## Project Structure (Simplified)

```
josh-gram/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router (pages, layouts)
│   │   ├── (auth)/         # Route groups for auth pages (login, signup) - if used
│   │   ├── profile/
│   │   │   └── [userId]/page.tsx # Dynamic profile page
│   │   ├── posts/
│   │   │   ├── create/page.tsx
│   │   │   └── [postId]/edit/page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx            # Chat list
│   │   │   └── [chatId]/page.tsx   # Individual chat room
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page (feed)
│   ├── components/         # Reusable React components
│   │   ├── auth/           # Auth-related components (SignUpForm, LoginForm)
│   │   ├── posts/          # Post-related (CreatePostForm, PostCard, EditPostForm)
│   │   ├── feed/           # Feed component
│   │   └── messaging/      # Messaging components (ChatListItem)
│   ├── context/            # React Context (AuthContext)
│   ├── firebaseConfig.ts   # Firebase initialization
│   └── globals.css         # Global styles
├── AGENTS.md               # Instructions for AI development
├── firebase.json           # Firebase deployment configuration
├── firestore.rules         # Firestore security rules
├── storage.rules           # Firebase Storage security rules
├── firestore.indexes.json  # Firestore indexes
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json
└── README.md               # This file
```

## Future Enhancements
- Real-time Likes and Comments
- Stories Feature (24h expiring content)
- Follow/Unfollow Users
- Notifications (In-app and/or Push)
- User Search & Post Search (tags, names)
- Explore Page (trending/public posts)
- Save/Bookmark Posts
- PWA Support
- Dark/Light Mode
- And many more Instagram features...

---

This README provides a comprehensive starting point for understanding, running, and deploying the Josh Gram application.
```
