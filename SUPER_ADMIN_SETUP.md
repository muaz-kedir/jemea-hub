# Super Admin Setup Instructions

## Current Status
✅ Super admin user account created in Firebase Authentication
- **Email:** kedirmuaz955@gmail.com
- **Password:** mk12@mk12
- **Name:** Muaz Kedir
- **UID:** 8H1oSFQGvCOWdJh0Ov97ma8PgM73

❌ Super admin role NOT yet assigned (due to Firestore security rules)

## What You Need to Do

### Option 1: Update Firestore Rules (Recommended)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: **humsj-academic-sector**

2. **Navigate to Firestore Database:**
   - Click **Firestore Database** in the left sidebar
   - Click on the **Rules** tab

3. **Update the Rules:**
   Find this section in the rules:
   ```
   match /user_roles/{userId} {
     allow read: if request.auth != null;
     allow create, update: if isSuperAdmin();
     allow delete: if false;
   }
   ```
   
   Replace it with:
   ```
   match /user_roles/{userId} {
     allow read: if request.auth != null;
     allow create: if request.auth != null && request.auth.uid == userId;
     allow update: if isSuperAdmin();
     allow delete: if false;
   }
   ```

4. **Publish the Rules:**
   - Click the **Publish** button
   - Wait for confirmation

5. **Run the Role Assignment Script:**
   ```bash
   npm run assign-super-admin-role
   ```

### Option 2: Manual Firestore Entry (Alternative)

If you prefer not to change the rules, you can manually add the role document:

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: **humsj-academic-sector**

2. **Navigate to Firestore Database:**
   - Click **Firestore Database** in the left sidebar
   - Click on the **Data** tab

3. **Create the Role Document:**
   - Click **Start collection**
   - Collection ID: `user_roles`
   - Document ID: `8H1oSFQGvCOWdJh0Ov97ma8PgM73` (the UID from above)
   - Add fields:
     - `userId` (string): `8H1oSFQGvCOWdJh0Ov97ma8PgM73`
     - `role` (string): `super_admin`
     - `assignedAt` (timestamp): Click "Add field" → Select "timestamp" → Use current time
     - `assignedBy` (string): `system`
   - Click **Save**

## Testing the Super Admin

After completing either option above:

1. **Login to the application:**
   - Email: kedirmuaz955@gmail.com
   - Password: mk12@mk12

2. **Verify Redirect:**
   - You should be automatically redirected to `/admin-dashboard`
   - This is the super admin dashboard

3. **Verify Permissions:**
   - You should have access to all dashboards
   - You should be able to manage user roles
   - You should see the User Management section

## Security Note

⚠️ **IMPORTANT:** If you used Option 1 (updating Firestore rules), consider reverting the rule change after creating the super admin to maintain security:

Change back from:
```
allow create: if request.auth != null && request.auth.uid == userId;
```

To:
```
allow create, update: if isSuperAdmin();
```

This ensures only super admins can assign roles going forward.

## Troubleshooting

### "Email already in use" error
- The user account already exists. Proceed to assign the role using one of the options above.

### "Permission denied" error
- Make sure you've updated the Firestore rules as described in Option 1
- OR manually create the role document as described in Option 2

### User doesn't redirect to admin dashboard
- Check that the role document exists in Firestore
- Verify the role field is set to `super_admin` (not `super-admin` or any other variation)
- Try logging out and logging back in
