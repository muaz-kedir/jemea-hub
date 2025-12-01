/**
 * Admin Account Setup Script
 * 
 * This script creates the admin accounts in Firebase Authentication
 * and sets up their roles in Firestore.
 * 
 * Run this script once to set up the admin accounts:
 * node scripts/setup-admin-accounts.cjs
 * 
 * Prerequisites:
 * - Firebase Admin SDK service account key (serviceAccountKey.json in server folder)
 * - Node.js installed
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../server/serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Admin accounts to create
const adminAccounts = [
  {
    email: 'libraryHUMSJ@gmail.com',
    password: 'libreryHUMSJ123',
    role: 'library_admin',
    displayName: 'Library Admin'
  },
  {
    email: 'tutorialHUMSJ@gmail.com',
    password: 'tutorialHUMSJ123',
    role: 'tutorial_admin',
    displayName: 'Tutorial Admin'
  },
  {
    email: 'trainingHUMSJ@gmail.com',
    password: 'trainingHUMSJ123',
    role: 'training_admin',
    displayName: 'Training Admin'
  }
];

async function createAdminAccount(account) {
  try {
    // Check if user already exists
    let user;
    try {
      user = await auth.getUserByEmail(account.email);
      console.log(`User ${account.email} already exists with UID: ${user.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await auth.createUser({
          email: account.email,
          password: account.password,
          displayName: account.displayName,
          emailVerified: true
        });
        console.log(`Created user ${account.email} with UID: ${user.uid}`);
      } else {
        throw error;
      }
    }

    // Set up user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: account.email,
      firstName: account.displayName.split(' ')[0],
      lastName: account.displayName.split(' ')[1] || 'Admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Set up role in user_roles collection
    await db.collection('user_roles').doc(user.uid).set({
      userId: user.uid,
      role: account.role,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedBy: 'system_setup'
    }, { merge: true });

    console.log(`Set role '${account.role}' for ${account.email}`);
    return { success: true, email: account.email, uid: user.uid };
  } catch (error) {
    console.error(`Error creating account ${account.email}:`, error.message);
    return { success: false, email: account.email, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('HUMSJ Admin Account Setup');
  console.log('='.repeat(50));
  console.log('');

  const results = [];
  
  for (const account of adminAccounts) {
    const result = await createAdminAccount(account);
    results.push(result);
    console.log('');
  }

  console.log('='.repeat(50));
  console.log('Setup Complete!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Admin Accounts:');
  console.log('');
  
  adminAccounts.forEach((account, index) => {
    const result = results[index];
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${account.role}:`);
    console.log(`  Email: ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log(`  Route: /admin/${account.role.replace('_admin', '')}`);
    console.log('');
  });

  process.exit(0);
}

main().catch(console.error);
