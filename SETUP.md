# DocHub Setup Guide

## Issue: Can't Add Sections

**Root Cause**: Missing Firebase environment variables

## Solution Steps:

### 1. Set up Firebase (if not already done)
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project or select existing project
- Enable Authentication (Email/Password provider)
- Create Firestore database

### 2. Get Firebase Configuration
- In Firebase Console, go to Project Settings (gear icon)
- Scroll down to "Your apps" section
- Click on the web app icon `</>` or select your existing web app
- Copy the configuration object

### 3. Set up Environment Variables
- Copy `.env.local.example` to `.env.local`
- Replace the placeholder values with your actual Firebase config
- Example:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... etc
```

### 4. Set up Firestore Security Rules
In Firebase Console > Firestore Database > Rules, update to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Restart Development Server
```bash
npm run dev
```

## Current App Status
- ✅ Code structure is correct
- ✅ Component logic works for editing/adding resources
- ❌ Firebase environment variables missing
- ❌ Can't connect to Firestore database

## Quick Test
After setting up `.env.local`, you should be able to:
1. Sign up/Login
2. Add new sections
3. Add resources to sections
4. Edit existing sections and resources
