# Firebase Security Rules Setup

## IMPORTANT: Apply These Firestore Security Rules

Go to **Firebase Console → Firestore Database → Rules** and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can only read/update their own profile
    // Role field is NOT stored here for security
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['uid', 'email']);
    }
    
    // User roles collection - READ ONLY for authenticated users
    // Only Cloud Functions or admin tools can write roles
    match /user_roles/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Prevents privilege escalation attacks
    }
    
    // Default deny all other collections until specific rules are added
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Collections Structure

### `users` collection
Stores user profile data (NO role field for security):
```
{
  uid: "user_uid",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  department: "Computer Science",
  year: "2024"
}
```

### `user_roles` collection
Stores roles separately (document ID = user UID):
```
{
  userId: "user_uid",
  role: "student" | "tutor" | "trainer" | "librarian" | "super_admin",
  assignedAt: timestamp,
  assignedBy: "system" | "admin_uid"
}
```

## Optional: Firebase Cloud Functions for Role Management

To restrict role assignment to super_admin only, deploy this Cloud Function:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Admin-only function to assign roles
exports.assignRole = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Verify super_admin permission
  const callerRole = await admin.firestore()
    .collection('user_roles')
    .doc(context.auth.uid)
    .get();
    
  if (!callerRole.exists || callerRole.data().role !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'Only super_admin can assign roles'
    );
  }
  
  const { userId, role } = data;
  
  // Assign the role
  await admin.firestore()
    .collection('user_roles')
    .doc(userId)
    .set({
      userId,
      role,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedBy: context.auth.uid
    });
  
  return { success: true };
});
```

## Testing

1. Sign up a new user - they will automatically get the 'student' role
2. To create a super_admin, manually add a document in the `user_roles` collection:
   - Document ID: the user's UID
   - Fields: 
     - `userId`: user's UID
     - `role`: "super_admin"
     - `assignedAt`: current timestamp
     - `assignedBy`: "manual"
3. The super_admin can then use the Cloud Function to assign other roles

## Security Benefits

✅ Roles are stored separately from user profiles  
✅ Client-side code cannot modify roles (write: false rule)  
✅ Prevents privilege escalation attacks  
✅ Only Cloud Functions or Firebase Console can assign roles  
✅ Clear audit trail (assignedAt, assignedBy)
