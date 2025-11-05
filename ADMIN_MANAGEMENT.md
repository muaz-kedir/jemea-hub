# Admin Management System

## Overview
The Super Admin can now manage user roles directly from the Admin Dashboard, allowing them to assign multiple admins for each sector (Library, Tutorial, Training).

## Features

### 1. **User Management Dashboard**
- View all registered users
- See role statistics (Librarians, Tutors, Trainers, Admins, Students)
- Assign roles to any user
- Real-time role updates

### 2. **Available Roles**
- **Student**: Default role for new signups
- **Librarian**: Access to library management features (can have multiple)
- **Tutor**: Access to tutorial management features (can have multiple)
- **Trainer**: Access to training management features (can have multiple)
- **Super Admin**: Full access to all dashboards and user management

### 3. **How to Use**

#### Step 1: Create Your First Super Admin
1. Sign up a new user in the app
2. Go to Firebase Console → Firestore Database → Data tab
3. Find the `user_roles` collection
4. Locate the document with your user's UID
5. Change the `role` field from "student" to "super_admin"
6. Log out and log back in

#### Step 2: Access User Management
1. Log in as super_admin
2. You'll be redirected to the Admin Dashboard
3. Click on the **"User Management"** tab
4. You'll see:
   - Role statistics cards showing counts for each role
   - List of all users with their current roles

#### Step 3: Assign Roles
1. Find the user you want to assign a role to
2. Click on the dropdown next to their name
3. Select the new role:
   - **Librarian** - for library sector admins
   - **Tutor** - for tutorial sector admins
   - **Trainer** - for training sector admins
   - **Super Admin** - for additional super admins
4. The role is updated immediately
5. The user will see the new dashboard on their next login

### 4. **Multiple Admins Per Sector**
You can assign **multiple users** to the same role:
- ✅ 2 Librarians for library management
- ✅ 2 Tutors for tutorial management
- ✅ 2 Trainers for training management
- ✅ Multiple Super Admins if needed

Each admin will have access to their respective dashboard.

## Security

### Updated Firestore Rules
The new security rules allow:
- ✅ Super admins can read all user profiles
- ✅ Super admins can create/update roles in `user_roles` collection
- ✅ Regular users can only read/update their own profile
- ✅ Role deletion is prevented
- ✅ Users cannot modify their own roles

### Deploying Updated Rules
**IMPORTANT**: You must update your Firestore security rules in Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace the existing rules with the content from `firestore.rules`
3. Click **Publish**

The updated rules include:
```javascript
// Helper function to check if user is super_admin
function isSuperAdmin() {
  return request.auth != null && 
         exists(/databases/$(database)/documents/user_roles/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'super_admin';
}

// User roles collection - WRITE only for super_admin
match /user_roles/{userId} {
  allow read: if request.auth != null;
  allow create, update: if isSuperAdmin();
  allow delete: if false;
}
```

## Role-Based Dashboard Access

After assigning roles, users will be automatically redirected to their appropriate dashboard:

| Role | Dashboard Path | Access |
|------|---------------|--------|
| Student | `/dashboard` | Student features |
| Librarian | `/library-dashboard` | Library management |
| Tutor | `/tutor-dashboard` | Tutorial management |
| Trainer | `/trainer-dashboard` | Training management |
| Super Admin | `/admin-dashboard` | All dashboards + User management |

## Best Practices

1. **Create at least 2 super admins** for redundancy
2. **Assign 2 admins per sector** as requested (Library, Tutorial, Training)
3. **Test role changes** with a test user before assigning to real users
4. **Monitor role statistics** regularly from the User Management dashboard
5. **Don't delete the super_admin role** from your own account

## Troubleshooting

### "Only super_admin can assign roles" error
- Make sure you're logged in as a super_admin
- Check Firebase Console to verify your role is set correctly
- Log out and log back in to refresh your session

### "Failed to update role" error
- Ensure Firestore security rules are updated and published
- Check Firebase Console for any rule errors
- Verify the user exists in both `users` and `user_roles` collections

### User doesn't see new dashboard after role change
- User needs to log out and log back in
- Clear browser cache if issue persists
- Check that the role was actually updated in Firestore

## Technical Details

### AuthContext Functions
- `assignRole(userId, role)` - Assigns a role to a user (super_admin only)
- `getAllUsers()` - Fetches all users with their roles (super_admin only)

### Components
- `UserManagement.tsx` - Main user management interface
- `AdminDashboard.tsx` - Super admin dashboard with tabs

### Data Structure
```typescript
// user_roles collection
{
  userId: string,
  role: "student" | "tutor" | "trainer" | "librarian" | "super_admin",
  assignedAt: Date,
  assignedBy: string // UID of the admin who assigned the role
}
```
